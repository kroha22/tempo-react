import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within,waitFor} from "@testing-library/react";
import {BodyCards} from "@/features/cards/saved-items/BodyCards";
import {SavedStudyItemLibrary} from "@/features/cards/saved-items/SavedStudyItemLibrary";
import {LegacyDemo} from "@/github-pages/Demo";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {bodyCardWords,bodyCardsHref} from "@/features/content/body-cards";
import {bodyFlowHref} from "@/features/content/body-flow";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {createProfile} from "@/github-pages/profiles";

let deactivate:(()=>void)|undefined;
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
const save=(studyItemId:string,sourceId:string)=>({studyItemId,sourceType:"lesson",sourceId,clientEventId:`card:${crypto.randomUUID()}`});
function memoryStore():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
function setup(){const store=memoryStore(),api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${bodyCardsHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(()=>deactivate?.());
it("saves all three batches once and reuses six body appearances with the old source",async()=>{
  const {store}=setup(),view=render(<LegacyDemo/>);
  for(const topic of ["face","movement","feelings"]){if(topic!=="face")fireEvent.click(screen.getByRole("link",{name:topic==="movement"?"Тело и движение · 6 слов":"Как я себя чувствую · 6 слов"}));for(const word of bodyCardWords.filter(word=>word.topic===topic)){const article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});}}
  const before=await store.read();expect(before.items).toHaveLength(20);expect(before.sources).toHaveLength(20);view.unmount();render(<BodyCards source="body"/>);
  for(const button of await screen.findAllByRole("button",{name:"В карточки"}))fireEvent.click(button);
  await waitFor(()=>expect(screen.getAllByRole("button",{name:"Уже в карточках ✓"})).toHaveLength(6));const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.sources).toHaveLength(26);expect(after.sources.filter(row=>row.sourceId==="lesson:everyday:body")).toHaveLength(6);
},20000);
it("adds the new feelings source to all three rated GA1 targets without resetting progress or sources",async()=>{
  const {store,api}=setup(),reused=bodyCardWords.filter(word=>word.reused);
  for(const word of reused){await api("/api/study-items",post({...save(word.studyItemId,"lesson:old:state"),sourceContextId:`unit:ga1:u0${word.key==="cansado"?3:2}`}));await api("/api/study-reviews",post({studyItemId:word.studyItemId,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));}
  const before=await store.read();render(<BodyCards topic="feelings"/>);
  for(const word of reused){const article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});}
  const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);expect(after.sources.slice(0,3)).toEqual(before.sources);expect(after.sources.slice(3).map(row=>row.sourceId)).toEqual(Array(3).fill("lesson:body:feelings"));
});
it("retries a lost save idempotently and returns from the saved library to the correct source",async()=>{
  const {store,api}=setup(),requests:string[]=[];let fail=true;deactivate=activateLocalTransport(async(url,init)=>{const result=await api(url,init);if(url==="/api/study-items"&&init?.method==="POST"){requests.push(init.body as string);if(fail){fail=false;throw Error("response lost");}}return result;});
  const view=render(<BodyCards topic="movement"/>),word=bodyCardWords.find(word=>word.key==="braco")!,article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));fireEvent.click(await within(article).findByRole("button",{name:"Повторить сохранение"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});expect(requests).toHaveLength(2);expect(requests[0]).toEqual(requests[1]);expect((await store.read()).sources).toHaveLength(1);
  view.unmount();render(<SavedStudyItemLibrary/>);fireEvent.click(await screen.findByRole("button",{name:`Показать перевод: ${word.pt}`}));expect(screen.getByRole("link",{name:"К словам: Тело и самочувствие · Тело и движение →"})).toHaveAttribute("href",bodyFlowHref("movement","words"));
});
it("rates only saved body cards and round-trips JSON without changing unrelated reviews or another profile",async()=>{
  const {store,api}=setup(),word=bodyCardWords[0],other="study:ga1:chunk:gostar-de:entry";
  await api("/api/study-items",post(save(other,"lesson:other:source")));await api("/api/study-items",post(save(word.studyItemId,"lesson:body:face")));const unrelated=(await store.read()).reviews.find(row=>row.studyItemId===other);
  render(<BodyCards mode="review"/>);const flip=await screen.findByRole("button",{name:"Показать ответ"});expect(within(flip).getByText(word.pt,{selector:"strong"})).toBeVisible();fireEvent.click(flip);fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));await screen.findByText(/Оценка сохранена/);
  const before=await store.read();expect(before.reviews.find(row=>row.studyItemId===other)).toEqual(unrelated);const profile=createProfile("Body copy",false,false),copy=parseBackup(JSON.stringify(await exportProfile(profile,store))),restored=memoryStore(),another=memoryStore();await importProfile(profile.id,restored,copy);await importProfile(profile.id,restored,copy);const after=await restored.read();expect(after.items).toEqual(before.items);expect(after.sources).toEqual(before.sources);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);expect(await another.read()).toEqual(emptyLocalLearning());
});
