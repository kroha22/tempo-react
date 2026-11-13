import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within,waitFor} from "@testing-library/react";
import {FoodCards} from "@/features/cards/saved-items/FoodCards";
import {SavedStudyItemLibrary} from "@/features/cards/saved-items/SavedStudyItemLibrary";
import {LegacyDemo} from "@/github-pages/Demo";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {foodProductWords,foodPreferenceCard,foodCardsHref} from "@/features/content/food-cards";
import {gramaticaVocabulary} from "@/features/content/gramatica-vocabulary";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {createProfile,profileDataKey} from "@/github-pages/profiles";

let deactivate:(()=>void)|undefined;
const post=(body:unknown)=>({method:"POST",body:JSON.stringify(body)});
const save=(studyItemId:string,sourceId:string)=>({studyItemId,sourceType:"lesson",sourceId,clientEventId:`card:${crypto.randomUUID()}`});
function memoryStore():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
function setup(){const store=memoryStore(),api=createLocalLearningApi(store);deactivate=activateLocalTransport(api);return {store,api};}
beforeEach(()=>{localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${foodCardsHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
afterEach(()=>deactivate?.());

it("saves 14 products plus the existing gostar card and adds preference sources without duplicates",async()=>{
  const {store}=setup();render(<LegacyDemo/>);
  for(const topic of ["fruit","meals"]){if(topic==="meals")fireEvent.click(screen.getByRole("link",{name:"Продукты и напитки · 8 слов"}));for(const word of foodProductWords.filter(word=>word.topic===topic)){const article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});}}
  const before=await store.read();fireEvent.click(screen.getByRole("link",{name:"Предпочтения"}));
  for(const button of await screen.findAllByRole("button",{name:"В карточки"})){fireEvent.click(button);}
  await waitFor(()=>expect(screen.getAllByRole("button",{name:"Уже в карточках ✓"})).toHaveLength(7));
  const data=await store.read();expect(data.items).toHaveLength(15);expect(data.reviews).toHaveLength(15);expect(data.sources).toHaveLength(21);
  for(const old of before.reviews)expect(data.reviews.find(row=>row.studyItemId===old.studyItemId)).toEqual(old);
  expect(data.sources.filter(row=>row.sourceId==="lesson:everyday:likes")).toHaveLength(7);
},20000);

it("adds the existing likes source to rated U49 without changing sources, review or legacy gostar",async()=>{
  const {store,api}=setup(),id=foodPreferenceCard.studyItemId;
  await api("/api/study-items",post({...save(id,"lesson:old:likes"),sourceContextId:"unit:ga1:u49"}));await api("/api/study-reviews",post({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));
  const before=await store.read(),profile=createProfile("Old gostar",false,false),key=profileDataKey(profile.id),raw=JSON.parse(localStorage.getItem(key)!);
  const legacy={cardId:"v0057",due:500,interval:2,ease:2.5,repetitions:2,lapses:0,lastGrade:2};localStorage.setItem(key,JSON.stringify({...raw,cards:[legacy]}));
  render(<FoodCards topic="preferences"/>);const article=screen.getByText("gostar de",{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});
  const after=await store.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);expect(after.sources).toEqual([...before.sources,{studyItemId:id,sourceType:"lesson",sourceId:"lesson:everyday:likes"}]);expect(JSON.parse(localStorage.getItem(key)!).cards).toEqual([legacy]);
});

it("retries a lost save with one intent and exposes the original plural note and source in the library",async()=>{
  const {store,api}=setup(),requests:string[]=[];let fail=true;deactivate=activateLocalTransport(async(url,init)=>{const result=await api(url,init);if(url==="/api/study-items"&&init?.method==="POST"){requests.push(init.body as string);if(fail){fail=false;throw Error("response lost");}}return result;});
  const view=render(<FoodCards topic="meals"/>),word=foodProductWords.find(word=>word.key==="leite")!,article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;
  expect(within(article).getByText(word.usageNote)).toBeVisible();fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));fireEvent.click(await within(article).findByRole("button",{name:"Повторить сохранение"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});expect(requests).toHaveLength(2);expect(requests[0]).toEqual(requests[1]);expect((await store.read()).sources).toHaveLength(1);
  view.unmount();render(<SavedStudyItemLibrary/>);fireEvent.click(await screen.findByRole("button",{name:`Показать перевод: ${word.pt}`}));expect(screen.getByText(word.usageNote)).toBeVisible();expect(screen.getByRole("link",{name:"К словам: Еда · Продукты и напитки →"})).toHaveAttribute("href",foodCardsHref("meals"));
});

it("keeps unrelated SRS intact, hides usage notes until flip and round-trips the food review",async()=>{
  const {store,api}=setup(),word=foodProductWords.find(word=>word.key==="arroz")!,other=gramaticaVocabulary.find(row=>row.studyItemId!==foodPreferenceCard.studyItemId)!;
  await api("/api/study-items",post(save(other.studyItemId,"lesson:other:source")));await api("/api/study-items",post(save(word.studyItemId,"lesson:food:meals")));const unrelated=(await store.read()).reviews.find(row=>row.studyItemId===other.studyItemId);
  render(<FoodCards mode="review"/>);const flip=await screen.findByRole("button",{name:"Показать ответ"});expect(within(flip).getByText(word.pt,{selector:"strong"})).toBeVisible();expect(screen.queryByText(word.usageNote)).toBeNull();fireEvent.click(flip);expect(screen.getByText(word.usageNote)).toBeVisible();fireEvent.click(screen.getByRole("button",{name:/^Помню ·/}));await screen.findByText(/Оценка сохранена/);
  const before=await store.read();expect(before.reviews.find(row=>row.studyItemId===other.studyItemId)).toEqual(unrelated);const profile=createProfile("Food copy",false,false),copy=parseBackup(JSON.stringify(await exportProfile(profile,store))),restored=memoryStore();await importProfile(profile.id,restored,copy);await importProfile(profile.id,restored,copy);const after=await restored.read();expect(after.items).toEqual(before.items);expect(after.sources).toEqual(before.sources);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);
});
