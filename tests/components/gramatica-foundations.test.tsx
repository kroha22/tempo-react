import { afterEach, expect, it } from "vitest";
import { fireEvent,render,screen,within } from "@testing-library/react";
import { GrammarCourse } from "@/features/learning/gramatica/GrammarCourse";
import { mixedGrammarReview } from "@/features/content/gramatica-mixed-review";
import { gramaticaLessons } from "@/features/content/gramatica-ativa";
import { grammarStart } from "@/features/learning/gramatica/session";
import { createLocalLearningApi } from "@/github-pages/local-learning-api";
import { emptyLocalLearning,localLearningSchema,type LearningStore } from "@/github-pages/local-learning-store";
import { activateLocalTransport } from "@/shared/http/local-transport";
import { exportProfile,parseBackup } from "@/github-pages/local-backup";
import { createProfile } from "@/github-pages/profiles";
let release:(()=>void)|undefined;
afterEach(()=>{release?.();release=undefined;});
function setup(){
  let data=emptyLocalLearning();
  const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};
  const api=createLocalLearningApi(store);release=activateLocalTransport(api);return {store,api};
}
it("persists 22 answers and skill results, restores the summary, and preserves earlier progress",async()=>{
  const {store,api}=setup();
  const old={lessonId:gramaticaLessons[0].id,flowRevision:1,status:"finished" as const,canDoResult:"demonstrated" as const,snapshot:{completed:true},updatedAt:100};
  await store.update(data=>({...data,progress:[old]}));
  const view=render(<GrammarCourse slug={mixedGrammarReview.slug}/>);
  for(const [index,task] of mixedGrammarReview.tasks.entries()){
    await screen.findByText(task.prompt);
    const answer=index===0?task.options![1]:task.answers[0];
    if(task.options)fireEvent.click(screen.getByRole("radio",{name:answer}));
    else fireEvent.change(screen.getByRole("textbox"),{target:{value:answer}});
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
    await screen.findByText(index===0?"Нужно повторить":"Верно",{exact:true});
    fireEvent.click(screen.getByRole("button",{name:index===21?"Посмотреть итог":"Дальше"}));
  }
  await screen.findByRole("heading",{name:"Проверка завершена — есть что повторить"});
  expect(screen.getAllByText("2/2 · Получилось в этой проверке")).toHaveLength(10);
  expect(screen.getByText("1/2 · Стоит повторить")).toBeVisible();
  expect(screen.getAllByRole("link",{name:"Потренировать навык →"})).toHaveLength(11);
  const data=await store.read();
  expect(data.progress.find(p=>p.lessonId===old.lessonId)).toEqual(old);
  expect(Object.keys(data.progress.find(p=>p.lessonId===mixedGrammarReview.id)!.snapshot!.checkpointAnswers!)).toHaveLength(22);
  view.unmount();render(<GrammarCourse slug={mixedGrammarReview.slug}/>);
  await screen.findByRole("heading",{name:"Проверка завершена — есть что повторить"});
  expect(screen.getByText("1/2 · Стоит повторить")).toBeVisible();
  localStorage.clear();const profile=createProfile("QA",false,false);
  const backup=parseBackup(JSON.stringify(await exportProfile(profile,store)));
  expect(backup.learning.progress.find(p=>p.lessonId===mixedGrammarReview.id)?.snapshot?.checkpointAnswers).toEqual(data.progress.find(p=>p.lessonId===mixedGrammarReview.id)?.snapshot?.checkpointAnswers);
  await expect(api("/api/learning/complete",{method:"POST",body:JSON.stringify({lessonId:mixedGrammarReview.id,flowRevision:1,sessionId:`session:${crypto.randomUUID()}`,clientEventId:`complete:${crypto.randomUUID()}`,completedAt:Date.now()})})).rejects.toMatchObject({status:409});
},20000);
it("resumes a mixed check at item 13 with earlier answers intact",async()=>{
  const {store}=setup(),snapshot={...grammarStart(mixedGrammarReview),index:12,answers:Object.fromEntries(mixedGrammarReview.tasks.slice(0,12).map(t=>[t.id,t.answers[0]]))};
  await store.update(data=>({...data,progress:[{lessonId:mixedGrammarReview.id,flowRevision:1,status:"active",snapshot:{grammar:snapshot},canDoResult:null,updatedAt:Date.now()}]}));
  render(<GrammarCourse slug={mixedGrammarReview.slug}/>);
  await screen.findByText(mixedGrammarReview.tasks[12].prompt);
  expect(within(screen.getByRole("article")).getByText("13 / 22")).toBeVisible();
});
it("keeps historical demonstrated while restoring the latest weaker checkpoint attempt",async()=>{
  const {api,store}=setup();
  for(const wrong of [false,true]){
    const sessionId=`session:${crypto.randomUUID()}`;
    for(const [index,task] of mixedGrammarReview.tasks.entries()){
      await api("/api/learning/events",{method:"POST",body:JSON.stringify({sessionId,clientEventId:`${sessionId}:${task.id}`,lessonId:mixedGrammarReview.id,entityId:task.id,eventType:"exercise_attempt",contentRevision:1,payload:{answer:wrong&&index===0?task.options![1]:task.answers[0]},occurredAt:Date.now()})});
    }
    await api("/api/learning/complete",{method:"POST",body:JSON.stringify({sessionId,clientEventId:`complete:${sessionId}`,lessonId:mixedGrammarReview.id,flowRevision:1,completedAt:Date.now()})});
  }
  expect((await store.read()).progress[0].canDoResult).toBe("demonstrated");
  expect((await store.read()).progress[0].snapshot?.canDoResult).toBe("partial");
  render(<GrammarCourse slug={mixedGrammarReview.slug}/>);
  await screen.findByRole("heading",{name:"Проверка завершена — есть что повторить"});
  expect(screen.getByText("1/2 · Стоит повторить")).toBeVisible();
});
