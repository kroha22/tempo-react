import {afterEach,beforeEach,expect,it} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import plan from "@/plans/LEGACY-SRS-A02-A05.json";
import {legacySrsIds} from "@/features/content/legacy-srs";
import {firstVerticalSliceContentPack as pack} from "@/features/content/manifest";
import {studyReviewCardById} from "@/features/cards/study-review/catalog";
import {SavedStudyItemLibrary} from "@/features/cards/saved-items/SavedStudyItemLibrary";
import {StudyReview} from "@/features/cards/study-review/StudyReview";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {createProfile,profileStores} from "@/github-pages/profiles";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {scheduleReview} from "@/features/cards/scheduler";
import {verbCards} from "@/features/cards/data/verb-cards";
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
const sourceFor=(id:string)=>plan.targets.find(x=>x.studyItemId===id)?.sourceId??"lesson:a1-1:name-familiar-objects";
const save=(id:string)=>({studyItemId:id,sourceType:"lesson",sourceId:sourceFor(id),clientEventId:`card:${crypto.randomUUID()}`});
function memoryStore():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
let deactivate:(()=>void)|undefined;
beforeEach(()=>localStorage.clear());afterEach(()=>deactivate?.());
it("leaves 17 legacy saved items untouched on GET/import and adds only missing reviews on explicit same-source Save",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store),profile=createProfile("Legacy 17",false,false);
  await store.update(data=>({...data,items:legacySrsIds.map(studyItemId=>({studyItemId,savedAt:123})),sources:legacySrsIds.map(studyItemId=>({studyItemId,sourceType:"lesson" as const,sourceId:sourceFor(studyItemId)}))}));
  const before=await store.read(),backup=parseBackup(JSON.stringify(await exportProfile(profile,store))),copy=memoryStore();await importProfile(profile.id,copy,backup);expect(await copy.read()).toEqual(before);expect(await api("/api/study-reviews")).toMatchObject({cards:[]});expect(await store.read()).toEqual(before);
  for(const id of legacySrsIds){const command=post(save(id));await api("/api/study-items",command);await api("/api/study-items",command);}
  const after=await store.read();expect(after.items).toEqual(before.items);expect(after.sources).toEqual(before.sources);expect(after.reviews).toHaveLength(17);expect(after.reviews.every(row=>row.version===0&&row.progress===null&&row.reviewItemId===`saved:${row.studyItemId}`)).toBe(true);
});
it("preserves independent Route, GA1 and v-card reviews, receipts, progress and JSON on repeated source saves",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store),ids=[...legacySrsIds,"study:ga1:verb:ser:entry"];
  for(const id of ids){await api("/api/study-items",post(save(id)));await api("/api/study-reviews",post({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));}
  await store.update(data=>({...data,progress:[{lessonId:"lesson:a1-1:ser-estar-description-state",flowRevision:1,status:"finished",canDoResult:"demonstrated",snapshot:{completed:true},updatedAt:123}]}));const before=await store.read();
  for(const id of legacySrsIds)await api("/api/study-items",post(save(id)));expect(await store.read()).toEqual(before);
  const profile=createProfile("Independent histories",false,false),vReview=scheduleReview(verbCards[0],undefined,3,1000);profileStores(profile.id).cards.save(vReview);
  const backup=parseBackup(JSON.stringify(await exportProfile(profile,store))),copy=memoryStore(),other=memoryStore();await importProfile(profile.id,copy,backup);await importProfile(profile.id,copy,backup);expect(await copy.read()).toEqual(before);expect(profileStores(profile.id).cards.load()).toEqual([vReview]);expect(await other.read()).toEqual(emptyLocalLearning());
});
it("renders all repaired defaults in the saved library and resolves the three original source backlinks",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store),ids=[...new Set([...legacySrsIds,...plan.defaultRepairs.map(x=>x.studyItemId)])];
  for(const id of ids)await api("/api/study-items",post(save(id)));deactivate=activateLocalTransport(api);render(<SavedStudyItemLibrary/>);
  for(const repair of plan.defaultRepairs){const item=pack.studyItems.find(x=>x.id===repair.studyItemId)!,d=item.display,front=d.type==="noun"?`${d.definiteArticle} ${d.lemma} — ${d.pluralDefiniteArticle} ${d.plural}`:d.type==="verb"?d.infinitive:d.text;fireEvent.click(await screen.findByRole("button",{name:`Показать перевод: ${front}`}));expect(screen.getByText(repair.pt,{exact:true})).toBeVisible();}
  for(const source of plan.sourceMetadata){const links=screen.getAllByRole("link",{name:`К объяснению: ${source.title} →`});expect(links.every(link=>link.getAttribute("href")===source.href)).toBe(true);}
});
it("shows the state-specific ESTAR review, grades once and restores its schedule without a GA1 substitution",async()=>{
  const store=memoryStore(),api=createLocalLearningApi(store),id="study:verb:estar:state";await api("/api/study-items",post(save(id)));deactivate=activateLocalTransport(api);const view=render(<StudyReview studyItemIds={[id]} embedded/>);const flip=await screen.findByRole("button",{name:"Показать ответ"});expect(within(flip).getByText("estar")).toBeVisible();fireEvent.click(flip);expect(screen.getByText("быть: состояние сейчас")).toBeVisible();expect(studyReviewCardById.get(id)!.examples[0].pt).toBe("O Rui está calmo.");fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));await screen.findByText(/Оценка сохранена/);const before=await store.read();expect(before.reviews[0]).toMatchObject({studyItemId:id,version:1,progress:{repetitions:1}});expect(before.reviewReceipts).toHaveLength(1);view.unmount();render(<StudyReview studyItemIds={[id]} embedded/>);expect(await screen.findByRole("heading",{name:"На сейчас всё"})).toBeVisible();expect(await store.read()).toEqual(before);
});
