import { beforeEach, expect, it, vi } from "vitest";
import { createLocalLearningApi } from "@/github-pages/local-learning-api";
import { emptyLocalLearning, localLearningSchema, mergeLocalLearning, type LearningStore, type LocalLearning } from "@/github-pages/local-learning-store";
import { exportProfile, importProfile, parseBackup, recoverImport } from "@/github-pages/local-backup";
import { createProfile, profileDataKey } from "@/github-pages/profiles";
import { studyReviewCardById } from "@/features/cards/study-review/catalog";
import { allGramaticaLessons, grammarTasks } from "@/features/content/gramatica-ativa";
import { grammarStart, nextGrammarStep } from "@/features/learning/gramatica/session";
import { studyReviewListSchema, studyReviewResponseSchema } from "@/features/cards/study-review/contracts";
import { savedItemsResponseSchema } from "@/features/cards/api/saved-items-dto";
import { progressListSchema, progressResponseSchema } from "@/features/learning/progress/dto";
import { verbCards } from "@/features/cards/data/verb-cards";
import {render,screen} from "@testing-library/react";
import {LocalLearningBoundary} from "@/github-pages/LocalLearningBoundary";

function memoryStore():LearningStore {
  let data=emptyLocalLearning();
  return {read:async()=>structuredClone(data),update:async change=>{const next=localLearningSchema.parse(change(structuredClone(data)));data=next;return structuredClone(next);},close(){}};
}
const firstId=[...studyReviewCardById.keys()][0];
const save=(id=firstId,sourceId="lesson:ga1:present-ter")=>({studyItemId:id,sourceType:"lesson",sourceId,clientEventId:`card:${crypto.randomUUID()}`});
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
beforeEach(()=>localStorage.clear());

it("keeps IDs, all sources and exact SRS receipts across retries; rejects stale grades",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store);
  await api("/api/study-items",post(save()));
  await api("/api/study-items",post(save(firstId,"lesson:ga1:present-fazer")));
  await api("/api/study-items",post(save()));
  const saved=savedItemsResponseSchema.parse(await api("/api/study-items"));
  expect(saved.items).toHaveLength(1);expect(saved.sources).toHaveLength(2);
  const initial=studyReviewListSchema.parse(await api("/api/study-reviews")).cards[0];
  expect(initial.reviewItemId).toBe(`saved:${firstId}`);
  const command={studyItemId:firstId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0};
  const once=studyReviewResponseSchema.parse(await api("/api/study-reviews",post(command)));
  const retry=studyReviewResponseSchema.parse(await api("/api/study-reviews",post(command)));
  expect(retry.card).toEqual(once.card);expect(retry.duplicate).toBe(true);
  await expect(api("/api/study-reviews",post({...command,clientEventId:`review:${crypto.randomUUID()}`}))).rejects.toMatchObject({status:409});
  await expect(api("/api/study-reviews",post({...command,grade:0}))).rejects.toMatchObject({status:409});
  expect((await store.read()).reviews[0].version).toBe(1);
});
it("resumes grammar boundaries and completes only after required answers",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store),lesson=allGramaticaLessons[0];
  let snapshot=grammarStart();
  const complete={lessonId:lesson.id,flowRevision:1,sessionId:snapshot.sessionId,clientEventId:`complete:${snapshot.sessionId}`,completedAt:Date.now()};
  await expect(api("/api/learning/complete",post(complete))).rejects.toMatchObject({status:409});
  const all=[...grammarTasks(lesson,"diagnostic"),...grammarTasks(lesson,"guided"),...grammarTasks(lesson,"exit")];
  for(const task of all){
    const answer=task.answers[0];
    await api("/api/learning/events",post({clientEventId:`${snapshot.sessionId}:${task.id}`,sessionId:snapshot.sessionId,lessonId:lesson.id,eventType:"exercise_attempt",entityId:task.id,contentRevision:1,payload:{answer},occurredAt:Date.now()}));
  }
  const task=grammarTasks(lesson,"diagnostic")[0];
  snapshot={...snapshot,answers:{[task.id]:task.answers[0]}};
  await api("/api/learning/progress",post({lessonId:lesson.id,flowRevision:1,status:"active",sessionId:snapshot.sessionId,snapshot:{grammar:snapshot},updatedAt:Date.now()}));
  expect(progressListSchema.parse(await createLocalLearningApi(store)("/api/learning/progress")).progress[0].snapshot?.grammar).toEqual(snapshot);
  const result=progressResponseSchema.parse(await api("/api/learning/complete",post(complete)));
  expect(result.progress.status).toBe("finished");expect(result.attemptCanDoResult).toBe("demonstrated");
  expect(nextGrammarStep(lesson,grammarStart())).toBeTruthy();
});
it("round trips a profile and merges older copies without losing newer SRS or legacy schedules",async()=>{
  const profile=createProfile("Взрослый",false,false),store=memoryStore(),api=createLocalLearningApi(store);
  const key=profileDataKey(profile.id),legacyBefore=localStorage.getItem(key);
  await api("/api/study-items",post(save()));
  const backup=await exportProfile(profile,store),copy=parseBackup(JSON.stringify(backup));
  expect(localStorage.getItem(key)).toBe(legacyBefore);
  const command={studyItemId:firstId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0};
  await api("/api/study-reviews",post(command));
  const rated=(await store.read()).reviews[0];
  await importProfile(profile.id,store,copy);
  expect((await store.read()).reviews[0]).toEqual(rated);
  expect((await store.read()).items).toHaveLength(1);
  const other=createProfile("Другой",false,false),otherStore=memoryStore();
  expect((await otherStore.read()).items).toHaveLength(0);
  await importProfile(other.id,otherStore,copy);
  expect((await otherStore.read()).items[0].studyItemId).toBe(firstId);
  const current=JSON.parse(localStorage.getItem(key)!);
  const card={cardId:verbCards[0].id,due:500,interval:2,ease:2.5,repetitions:2,lapses:0,lastGrade:2};
  localStorage.setItem(key,JSON.stringify({...current,cards:[card]}));
  copy.browser.cards=[{...card,due:100}];
  await importProfile(profile.id,store,copy);
  expect(JSON.parse(localStorage.getItem(key)!).cards).toEqual([card]);
});
it("rejects broken/foreign-format files before writing and recovers an interrupted import",async()=>{
  const profile=createProfile("QA",false,false),store=memoryStore();
  const backup=await exportProfile(profile,store);
  expect(()=>parseBackup('{"version":42}')).toThrow();
  expect(()=>parseBackup(JSON.stringify({...backup,learning:{...backup.learning,reviews:[{studyItemId:"bad"}]}}))).toThrow();
  const set=vi.spyOn(Storage.prototype,"setItem"),key=profileDataKey(profile.id);
  set.mockImplementation(function(this:Storage,k:string,v:string){if(k===key)throw new Error("quota");Storage.prototype.getItem.call(this,k);originalSet.call(this,k,v);});
  await expect(importProfile(profile.id,store,backup)).rejects.toThrow("quota");
  set.mockRestore();await recoverImport(profile.id,store);
  expect(localStorage.getItem(`tempo-react:pending-import:${profile.id}:v1`)).toBeNull();
});
const originalSet=Storage.prototype.setItem;
it("does not open an empty learning session when browser storage fails",async()=>{
  const profile=createProfile("QA",false,false),before=localStorage.getItem(profileDataKey(profile.id));
  vi.stubGlobal("indexedDB",{open:()=>{throw new Error("denied");}});
  render(<LocalLearningBoundary profile={profile}><p>Секретный курс</p></LocalLearningBoundary>);
  await screen.findByRole("heading",{name:"Не удалось открыть сохранения"});
  expect(screen.queryByText("Секретный курс")).toBeNull();
  expect(localStorage.getItem(profileDataKey(profile.id))).toBe(before);
});
it("invalidates an older tab's grade after importing a newer schedule",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store);
  await api("/api/study-items",post(save()));
  const command={studyItemId:firstId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0};
  await api("/api/study-reviews",post(command));
  const newer=await store.read();newer.reviews[0].reviewedAt!+=1000;
  await store.update(data=>mergeLocalLearning(data,newer));
  await expect(api("/api/study-reviews",post({...command,clientEventId:`review:${crypto.randomUUID()}`,expectedVersion:1}))).rejects.toMatchObject({status:409});
});
it("keeps demonstrated completion when merging a newer unfinished attempt",()=>{
  const a=emptyLocalLearning(),b=emptyLocalLearning();
  a.progress=[{lessonId:"lesson:test",flowRevision:1,status:"finished",snapshot:{completed:true},canDoResult:"demonstrated",updatedAt:100}];
  b.progress=[{...a.progress[0],status:"active",canDoResult:null,updatedAt:200}];
  const merged:LocalLearning=mergeLocalLearning(a,b);
  expect(merged.progress[0].status).toBe("finished");expect(merged.progress[0].canDoResult).toBe("demonstrated");
});
