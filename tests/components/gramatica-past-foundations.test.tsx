import {afterEach,expect,it} from "vitest";
import {fireEvent,render,screen} from "@testing-library/react";
import {GrammarCourse} from "@/features/learning/gramatica/GrammarCourse";
import {pastFoundationLessons} from "@/features/content/gramatica-past-foundations";
import {grammarTasks,gramaticaLessons} from "@/features/content/gramatica-ativa";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {GrammarWordBatch} from "@/features/learning/gramatica/GrammarWordBatch";
import {gramaticaVocabulary} from "@/features/content/gramatica-vocabulary";
let release:(()=>void)|undefined;
afterEach(()=>{release?.();release=undefined;});
function setup(){let data=emptyLocalLearning();const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};const api=createLocalLearningApi(store);release=activateLocalTransport(api);return {store,api};}
it.each(pastFoundationLessons)("opens $slug explanation without creating progress",async lesson=>{
  const {store}=setup();render(<GrammarCourse slug={`${lesson.slug}/explanation`}/>);
  expect(screen.getByRole("heading",{name:lesson.title})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));
  expect(screen.getByText(lesson.rule)).toBeVisible();
  expect(screen.getByRole("link",{name:"К проверке и практике →"})).toHaveAttribute("href",`/learning/gramatica-ativa/${lesson.slug}`);
  expect((await store.read()).progress).toEqual([]);
});
it.each([12,13,14,15,16,17])("word batch U%s links to its own explanation and check",async unit=>{
  render(<GrammarWordBatch unit={unit} practiceOnly/>);
  expect(screen.getByRole("link",{name:new RegExp(`^К объяснению и практике:`)})).toHaveAttribute("href",`/learning/gramatica-ativa/${pastFoundationLessons.find(l=>l.unit===unit)!.slug}/explanation`);
  expect(screen.getByRole("link",{name:`Проверить себя по уроку ${unit} →`})).toBeVisible();
});
it("resumes a checked reflexive answer, completes guided practice and preserves old progress and SRS",async()=>{
  const {store,api}=setup(),lesson=pastFoundationLessons.find(l=>l.unit===15)!;
  const old={lessonId:gramaticaLessons[0].id,flowRevision:1,status:"finished" as const,canDoResult:"demonstrated" as const,snapshot:{completed:true},updatedAt:100};
  await store.update(data=>({...data,progress:[old]}));
  const id=gramaticaVocabulary.find(e=>e.lemma==="pôr")!.studyItemId;
  const save=(unit:number)=>api("/api/study-items",{method:"POST",body:JSON.stringify({studyItemId:id,sourceType:"topic",sourceId:"course:ga1:pt-pt",sourceContextId:`unit:ga1:u${String(unit).padStart(2,"0")}`,clientEventId:`card:${crypto.randomUUID()}`})});
  await save(7);await api("/api/study-reviews",{method:"POST",body:JSON.stringify({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0})});
  const review=(await store.read()).reviews[0];await save(14);
  expect((await store.read()).reviews[0]).toEqual(review);
  const diagnostic=grammarTasks(lesson,"diagnostic");
  let view=render(<GrammarCourse slug={lesson.slug}/>);
  for(const [index,task] of diagnostic.entries()){
    await screen.findByText(task.prompt);
    const answer=index===1?"wrong":task.answers[0];
    if(task.options)fireEvent.click(screen.getByRole("radio",{name:answer}));else fireEvent.change(screen.getByRole("textbox"),{target:{value:answer}});
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));await screen.findByText(index===1?"Нужно повторить":"Верно",{exact:true});
    if(index===1){view.unmount();view=render(<GrammarCourse slug={lesson.slug}/>);await screen.findByText("Нужно повторить",{exact:true});}
    fireEvent.click(screen.getByRole("button",{name:"Дальше"}));
  }
  await screen.findByRole("heading",{name:"Разберёмся по шагам"});fireEvent.click(screen.getByRole("button",{name:"Перейти к практике"}));
  for(const stage of ["guided","exit"] as const){
    const tasks=grammarTasks(lesson,stage);
    for(const [index,task] of tasks.entries()){
      await screen.findByText(task.prompt);fireEvent.change(screen.getByRole("textbox"),{target:{value:task.answers[0]}});fireEvent.click(screen.getByRole("button",{name:"Проверить"}));await screen.findByText("Верно",{exact:true});fireEvent.click(screen.getByRole("button",{name:stage==="exit"&&index===4?"Посмотреть итог":"Дальше"}));
    }
  }
  await screen.findByRole("heading",{name:"Получилось!"});
  expect((await store.read()).progress.find(p=>p.lessonId===old.lessonId)).toEqual(old);
  expect((await store.read()).reviews[0]).toEqual(review);
  expect((await store.read()).sources.filter(s=>s.studyItemId===id)).toHaveLength(2);
  view.unmount();render(<GrammarCourse slug={lesson.slug}/>);await screen.findByRole("heading",{name:"Получилось!"});
},20000);
