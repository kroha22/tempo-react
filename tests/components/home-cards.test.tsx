import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {homeFlowHref} from "@/features/content/home-flow";
import {HomeCards} from "@/features/cards/saved-items/HomeCards";
import {SavedStudyItemLibrary} from "@/features/cards/saved-items/SavedStudyItemLibrary";
import {LegacyDemo} from "@/github-pages/Demo";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {homeCardWords,homeCardsHref,homeRouteSources} from "@/features/content/home-cards";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {createProfile} from "@/github-pages/profiles";
let deactivate:(()=>void)|undefined;
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
const save=(studyItemId:string,sourceId:string)=>({studyItemId,sourceType:"lesson",sourceId,clientEventId:`card:${crypto.randomUUID()}`});
function memoryStore():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
function setup(){const store=memoryStore(),api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
async function saveVisible(keys?:readonly string[]){for(const word of homeCardWords.filter(word=>!keys||keys.includes(word.key))){const node=screen.queryByText(word.pt,{selector:"strong"});if(!node)continue;const article=node.closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});}}
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${homeCardsHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(()=>deactivate?.());
it("saves 6/7/5 and adds original lesson appearances without duplicate cards or reviews",async()=>{
  const {store}=setup(),view=render(<LegacyDemo/>);for(const topic of ["rooms","objects","location"]){if(topic!=="rooms")fireEvent.click(screen.getByRole("link",{name:topic==="objects"?"Знакомые предметы · 7 слов":"Где находится? · 5 слов"}));await saveVisible();}const before=await store.read();expect(before.items).toHaveLength(18);expect(before.reviews).toHaveLength(18);view.unmount();const batch=render(<HomeCards topic="objects"/>);batch.rerender(<HomeCards topic="objects" source="route"/>);await saveVisible();const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.sources).toHaveLength(25);
});
it("round-trips legacy saved targets without reviews and creates only missing version-zero rows on explicit save",async()=>{
  const {store,api}=setup(),missing=homeCardWords.filter(word=>!word.reviewReady&&!word.newTarget),profile=createProfile("Legacy home",false,false);
  await store.update(data=>({...data,items:missing.map(word=>({studyItemId:word.studyItemId,savedAt:123})),sources:missing.map(word=>({studyItemId:word.studyItemId,sourceType:"lesson" as const,sourceId:homeRouteSources.find(source=>source.topic===word.topic)!.id}))}));
  const backup=parseBackup(JSON.stringify(await exportProfile(profile,store))),restored=memoryStore();await importProfile(profile.id,restored,backup);expect((await restored.read()).reviews).toEqual([]);expect(await api("/api/study-reviews")).toMatchObject({cards:[]});expect((await store.read()).reviews).toEqual([]);
  const view=render(<HomeCards/>);for(const topic of ["rooms","objects","location"]){view.rerender(<HomeCards topic={topic}/>);await saveVisible(missing.map(word=>word.key));}const after=await store.read();expect(after.items).toEqual(backup.learning.items);expect(after.sources.slice(0,7)).toEqual(backup.learning.sources);expect(after.reviews).toHaveLength(7);expect(after.reviews.every(row=>row.version===0&&row.progress===null)).toBe(true);
});
it("keeps rated old and newly supported targets, receipts, sources and Route progress intact",async()=>{
  const {store,api}=setup(),rated=homeCardWords.filter(word=>word.reviewReady||word.key==="caixa");
  for(const word of rated){await api("/api/study-items",post({...save(word.studyItemId,"lesson:old:home"),sourceContextId:"unit:ga1:u46"}));await api("/api/study-reviews",post({studyItemId:word.studyItemId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));}
  await store.update(data=>({...data,progress:[{lessonId:"lesson:a1-1:locate-object",flowRevision:1,status:"finished",canDoResult:"demonstrated",snapshot:{completed:true},updatedAt:123}]}));const before=await store.read(),view=render(<HomeCards/>);for(const topic of ["rooms","objects","location"]){view.rerender(<HomeCards topic={topic}/>);await saveVisible(rated.map(word=>word.key));}const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);expect(after.progress).toEqual(before.progress);expect(after.sources.slice(0,before.sources.length)).toEqual(before.sources);expect(after.sources).toHaveLength(16);
});
it("retries a lost save once and exposes corrected canonical examples and both source links",async()=>{
  const {store,api}=setup(),requests:string[]=[];let fail=true;deactivate=activateLocalTransport(async(url,init)=>{const result=await api(url,init);if(url==="/api/study-items"&&init?.method==="POST"){requests.push(init.body as string);if(fail){fail=false;throw Error("response lost");}}return result;});const word=homeCardWords[0],view=render(<HomeCards/>),article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));fireEvent.click(await within(article).findByRole("button",{name:"Повторить сохранение"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});expect(requests).toHaveLength(2);expect(requests[0]).toEqual(requests[1]);await api("/api/study-items",post(save(word.studyItemId,"lesson:a1-1:possession-and-presence")));expect((await store.read()).items).toHaveLength(1);
  view.unmount();render(<SavedStudyItemLibrary/>);fireEvent.click(await screen.findByRole("button",{name:`Показать перевод: ${word.pt}`}));expect(screen.getByText("A cama está no quarto.")).toBeVisible();expect(screen.getByRole("link",{name:"К словам: Дом · Комнаты →"})).toHaveAttribute("href",homeFlowHref("rooms","words"));expect(screen.getByRole("link",{name:"К объяснению: TER и HÁ →"})).toHaveAttribute("href",homeRouteSources[0].href);
});
it("rates only saved home cards, preserves unrelated reviews and imports JSON idempotently",async()=>{
  const {store,api}=setup(),word=homeCardWords.find(word=>word.key==="cozinha")!,other="study:body:adjective:feliz:state";await api("/api/study-items",post(save(other,"lesson:body:feelings")));await api("/api/study-items",post(save(word.studyItemId,"lesson:home:rooms")));const unrelated=(await store.read()).reviews.find(row=>row.studyItemId===other);render(<HomeCards mode="review"/>);const flip=await screen.findByRole("button",{name:"Показать ответ"});expect(within(flip).getByText(word.pt,{selector:"strong"})).toBeVisible();fireEvent.click(flip);fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));await screen.findByText(/Оценка сохранена/);const before=await store.read();expect(before.reviews.find(row=>row.studyItemId===other)).toEqual(unrelated);const profile=createProfile("Home copy",false,false),copy=parseBackup(JSON.stringify(await exportProfile(profile,store))),restored=memoryStore(),another=memoryStore();await importProfile(profile.id,restored,copy);await importProfile(profile.id,restored,copy);expect(await restored.read()).toEqual(before);expect(await another.read()).toEqual(emptyLocalLearning());
});
