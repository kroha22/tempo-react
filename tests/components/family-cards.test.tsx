import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {FamilyCards} from "@/features/cards/saved-items/FamilyCards";
import {SavedStudyItemLibrary} from "@/features/cards/saved-items/SavedStudyItemLibrary";
import {LegacyDemo} from "@/github-pages/Demo";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {familyCardWords,familyCardsHref} from "@/features/content/family-cards";
import {familyFlowHref} from "@/features/content/family-flow";
import {gramaticaVocabulary} from "@/features/content/gramatica-vocabulary";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {createProfile} from "@/github-pages/profiles";

let deactivate:(()=>void)|undefined;
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
const save=(id:string,sourceId="lesson:old:family")=>({studyItemId:id,sourceType:"lesson",sourceId,clientEventId:`card:${crypto.randomUUID()}`});
function memoryStore():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
function setup(){const store=memoryStore(),api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${familyCardsHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(()=>deactivate?.());

it("saves all 17 family choices with the proper source and keeps a single card after revisiting",async()=>{
  const {store}=setup();render(<LegacyDemo/>);
  fireEvent.click(screen.getByText("Профессии для семейных фраз · 5 карточек по желанию"));
  for(const topic of ["close","relatives"]){
    if(topic==="relatives")fireEvent.click(screen.getByRole("link",{name:"Родственники · 6 слов"}));
    for(const word of familyCardWords.filter(word=>word.topic===topic)){
      const article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;
      fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));
      await within(article).findByRole("button",{name:"Уже в карточках ✓"});
    }
  }
  fireEvent.click(screen.getByRole("link",{name:"Близкие · 6 слов"}));
  const data=await store.read();expect(data.items).toHaveLength(17);expect(data.sources).toHaveLength(17);expect(data.reviews).toHaveLength(17);
  for(const word of familyCardWords)expect(data.sources.find(row=>row.studyItemId===word.studyItemId)?.sourceId).toBe(`lesson:family:${word.topic}`);
  expect(data.reviews.every(row=>row.version===0&&row.progress===null)).toBe(true);
  expect(await within(screen.getByText(familyCardWords[0].pt,{selector:"strong"}).closest("article")!).findByRole("button",{name:"Уже в карточках ✓"})).toBeDisabled();
},20000);

it.each(["study:ga1:noun:irmao:entry","study:ga1:noun:professor:entry"])("adds a family source to rated %s without resetting its review",async id=>{
  const {store,api}=setup();await api("/api/study-items",post(save(id)));
  await api("/api/study-reviews",post({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));
  const before=await store.read();render(<FamilyCards/>);
  if(id.includes("professor"))fireEvent.click(screen.getByText("Профессии для семейных фраз · 5 карточек по желанию"));
  const word=familyCardWords.find(word=>word.studyItemId===id)!,article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;
  fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});
  const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);
  expect(after.sources.map(row=>row.sourceId).sort()).toEqual(["lesson:family:close","lesson:old:family"]);
});

it("retries a lost Card Save response with the same intent and returns from the saved library source",async()=>{
  const {store,api}=setup(),requests:string[]=[];let fail=true;
  deactivate=activateLocalTransport(async(url,init)=>{const result=await api(url,init);if(url==="/api/study-items"&&init?.method==="POST"){requests.push(init.body as string);if(fail){fail=false;throw Error("response lost");}}return result;});
  const view=render(<FamilyCards topic="relatives"/>),word=familyCardWords.find(word=>word.topic==="relatives")!,article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;
  fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));
  fireEvent.click(await within(article).findByRole("button",{name:"Повторить сохранение"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});
  expect(requests).toHaveLength(2);expect(requests[0]).toEqual(requests[1]);expect((await store.read()).items).toHaveLength(1);expect((await store.read()).sources).toHaveLength(1);
  view.unmount();render(<SavedStudyItemLibrary/>);
  expect(await screen.findByRole("link",{name:"К словам: Моя семья · Родственники →"})).toHaveAttribute("href",familyFlowHref("relatives","words"));
});

it("reviews only saved family cards and retains schedule and sources in a JSON backup round-trip",async()=>{
  const {store,api}=setup(),word=familyCardWords[0],other=gramaticaVocabulary.find(row=>!familyCardWords.some(word=>word.studyItemId===row.studyItemId))!;
  await api("/api/study-items",post(save(other.studyItemId)));await api("/api/study-items",post(save(word.studyItemId,"lesson:family:close")));
  const unrelated=(await store.read()).reviews.find(row=>row.studyItemId===other.studyItemId);
  render(<FamilyCards mode="review"/>);fireEvent.click(await screen.findByRole("button",{name:"Показать ответ"}));
  expect(within(screen.getByRole("button",{name:"Скрыть ответ"})).getByText(word.pt,{selector:"strong"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));await screen.findByText(/Оценка сохранена/);
  const before=await store.read();expect(before.reviews.find(row=>row.studyItemId===other.studyItemId)).toEqual(unrelated);
  expect(before.reviews.find(row=>row.studyItemId===word.studyItemId)?.version).toBe(1);
  const profile=createProfile("Family backup",false,false,"boy"),copy=parseBackup(JSON.stringify(await exportProfile(profile,store))),restored=memoryStore();
  await importProfile(profile.id,restored,copy);await importProfile(profile.id,restored,copy);
  const after=await restored.read();expect(after.items).toEqual(before.items);expect(after.sources).toEqual(before.sources);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);
});
