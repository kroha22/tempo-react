import {afterEach,expect,it} from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {GrammarCourse} from "@/features/learning/gramatica/GrammarCourse";
import {futureAndMoodLessons} from "@/features/content/gramatica-future-and-mood";
import {grammarTasks,gramaticaLessons} from "@/features/content/gramatica-ativa";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {gramaticaVocabulary} from "@/features/content/gramatica-vocabulary";
let deactivate:(()=>void)|undefined;
afterEach(()=>{cleanup();deactivate?.();});
function setup(){let data=emptyLocalLearning();const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};const api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
for(const lesson of futureAndMoodLessons)it(`U${lesson.unit}: Portuguese explanation, Russian mode and word-batch navigation do not complete the lesson`,async()=>{
  const {store}=setup();render(<GrammarCourse slug={`${lesson.slug}/explanation`}/>);
  expect(screen.getByRole("heading",{name:lesson.title})).toBeInTheDocument();
  expect(screen.queryByText(lesson.rule)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));expect(screen.getByText(lesson.rule)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Читать по-португальски"}));expect(screen.queryByText(lesson.rule)).not.toBeInTheDocument();
  expect((await store.read()).progress).toEqual([]);cleanup();
  render(<GrammarCourse slug={`words/u${lesson.unit}`}/>);
  expect(screen.getByRole("link",{name:/К объяснению и практике:/})).toHaveAttribute("href",`/learning/gramatica-ativa/${lesson.slug}/explanation`);
  expect(screen.getByRole("link",{name:`Проверить себя по уроку ${lesson.unit} →`})).toHaveAttribute("href",`/learning/gramatica-ativa/${lesson.slug}`);
});
it("resumes a checked U27 answer, completes practice and preserves earlier progress and reviewed cards",async()=>{
  const {store,api}=setup(),lesson=futureAndMoodLessons.find(l=>l.unit===27)!;
  const old={lessonId:gramaticaLessons[0].id,flowRevision:1,status:"finished" as const,canDoResult:"demonstrated" as const,snapshot:{completed:true},updatedAt:100};
  await store.update(data=>({...data,progress:[old]}));
  const id=gramaticaVocabulary.find(e=>e.lemma==="ser")!.studyItemId;
  const save=(unit:number)=>api("/api/study-items",{method:"POST",body:JSON.stringify({studyItemId:id,sourceType:"topic",sourceId:"course:ga1:pt-pt",sourceContextId:`unit:ga1:u${unit}`,clientEventId:`card:${crypto.randomUUID()}`})});
  await save(12);await api("/api/study-reviews",{method:"POST",body:JSON.stringify({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0})});
  const review=(await store.read()).reviews[0];await save(27);expect((await store.read()).reviews[0]).toEqual(review);
  let view=render(<GrammarCourse slug={lesson.slug}/>);
  for(const [index,task]of grammarTasks(lesson,"diagnostic").entries()){
    await screen.findByText(task.prompt);const answer=index===0?"wrong":task.answers[0];
    if(task.options)fireEvent.click(screen.getByRole("radio",{name:answer}));else fireEvent.change(screen.getByRole("textbox"),{target:{value:answer}});
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));await screen.findByText(index===0?"Нужно повторить":"Верно",{exact:true});
    if(index===0){view.unmount();view=render(<GrammarCourse slug={lesson.slug}/>);await screen.findByText("Нужно повторить",{exact:true});}
    fireEvent.click(screen.getByRole("button",{name:"Дальше"}));
  }
  await screen.findByRole("heading",{name:"Разберёмся по шагам"});fireEvent.click(screen.getByRole("button",{name:"Перейти к практике"}));
  for(const stage of ["guided","exit"] as const)for(const [index,task]of grammarTasks(lesson,stage).entries()){
    await screen.findByText(task.prompt);if(task.options)fireEvent.click(screen.getByRole("radio",{name:task.answers[0]}));else fireEvent.change(screen.getByRole("textbox"),{target:{value:task.answers[0]}});
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));await screen.findByText("Верно",{exact:true});fireEvent.click(screen.getByRole("button",{name:stage==="exit"&&index===4?"Посмотреть итог":"Дальше"}));
  }
  await screen.findByRole("heading",{name:"Получилось!"});expect((await store.read()).progress.find(p=>p.lessonId===old.lessonId)).toEqual(old);expect((await store.read()).reviews[0]).toEqual(review);
  view.unmount();render(<GrammarCourse slug={lesson.slug}/>);await screen.findByRole("heading",{name:"Получилось!"});
},20000);
