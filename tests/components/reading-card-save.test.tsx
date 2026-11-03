import {afterEach,expect,test} from "vitest";
import {cleanup,fireEvent,render,screen,waitFor} from "@testing-library/react";
import {DescriptionReading,DescriptionParagraph} from "@/features/practice/DescriptionReading";
import {readingSource} from "@/features/content/reading-sources";
import {readingCardChoices} from "@/features/content/reading-cards";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
import {GrammarCourse} from "@/features/learning/gramatica/GrammarCourse";
import {createProfile} from "@/github-pages/profiles";
import {exportProfile,importProfile,parseBackup} from "@/github-pages/local-backup";
import {firstVerticalSliceContentPack as pack} from "@/features/content/manifest";
import {grammarReadingGlossary} from "@/features/content/grammar-reading";
import {studyReviewCardById} from "@/features/cards/study-review/catalog";
import {grammarStart} from "@/features/learning/gramatica/session";

let deactivate:(()=>void)|undefined;
afterEach(()=>{cleanup();deactivate?.();});
function store():LearningStore{let data=emptyLocalLearning();return {read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};}
const post=(input:unknown)=>({method:"POST",body:JSON.stringify(input)});
function open(pt="idade",sourceId="lesson:ga1:identity-and-origin"){
  const source=readingSource(sourceId)!;
  expect(source).toBeDefined();
  render(<DescriptionReading source={source}><DescriptionParagraph pt={pt} ru="Русское объяснение"/></DescriptionReading>);
  fireEvent.click(screen.getByRole("button",{name:`Перевод: ${pt}`}));
}
test("saving an existing word adds lesson provenance without changing its ID or reviewed schedule",async()=>{
  const data=store(),api=createLocalLearningApi(data),id=readingCardChoices("idade")[0].studyItemId;
  await api("/api/study-items",post({studyItemId:id,sourceType:"topic",sourceId:"course:ga1:pt-pt",clientEventId:"original-save"}));
  await api("/api/study-reviews",post({studyItemId:id,clientEventId:`review:${crypto.randomUUID()}`,grade:2,expectedVersion:0}));
  const snapshot=grammarStart();
  await api("/api/learning/progress",post({lessonId:"lesson:ga1:identity-and-origin",flowRevision:1,status:"active",sessionId:snapshot.sessionId,snapshot:{grammar:snapshot},updatedAt:Date.now()}));
  const before=await data.read();deactivate=activateLocalTransport(api);
  open();fireEvent.click(await screen.findByRole("button",{name:"В карточки"}));
  await screen.findByRole("button",{name:"Уже в карточках ✓"});
  const after=await data.read();expect(after.items).toEqual(before.items);expect(after.reviews).toEqual(before.reviews);expect(after.reviewReceipts).toEqual(before.reviewReceipts);expect(after.progress).toEqual(before.progress);
  expect(after.sources).toHaveLength(2);expect(after.sources[1]).toMatchObject({studyItemId:id,sourceType:"lesson",sourceId:"lesson:ga1:identity-and-origin",sourceContextId:"unit:ga1:u01"});
  cleanup();open();expect(await screen.findByRole("button",{name:"Уже в карточках ✓"})).toBeDisabled();expect((await data.read()).items).toHaveLength(1);
});
test("new reading fragments persist with translation and appear in the shared library and SRS",async()=>{
  const data=store();deactivate=activateLocalTransport(createLocalLearningApi(data));
  open("característica");fireEvent.click(await screen.findByRole("button",{name:"В карточки"}));
  await screen.findByRole("button",{name:"Уже в карточках ✓"});
  const saved=await data.read();expect(saved.items[0].studyItemId).toBe(readingCardChoices("características")[0].studyItemId);expect(saved.reviews[0]).toMatchObject({studyItemId:saved.items[0].studyItemId,version:0,progress:null});
  const profile=createProfile("Карточки",false,false),copy=parseBackup(JSON.stringify(await exportProfile(profile,data))),destination=store();
  await importProfile(profile.id,destination,copy);await importProfile(profile.id,destination,copy);
  expect(await destination.read()).toEqual(saved);
  expect(studyReviewCardById.get(saved.items[0].studyItemId)?.units).toContain(1);
  cleanup();render(<GrammarCourse slug="saved"/>);
  expect(screen.getByRole("heading",{name:"Мои карточки из уроков"})).toBeInTheDocument();
  fireEvent.click(await screen.findByRole("button",{name:/Показать перевод: característica/}));
  expect(screen.getAllByText("характеристика; признак").length).toBeGreaterThan(0);
  expect(screen.getByRole("link",{name:/К объяснению:/})).toHaveAttribute("href","/learning/gramatica-ativa/identity-and-origin/explanation");
});
test("failure retries the exact intent and rapid clicks produce one write",async()=>{
  const data=store(),api=createLocalLearningApi(data),writes:unknown[]=[];
  let fail=true;
  deactivate=activateLocalTransport(async(url,init)=>{if(init?.method==="POST"){writes.push(JSON.parse(init.body as string));if(fail){fail=false;throw new Error("disk unavailable");}}return api(url,init);});
  open();const button=await screen.findByRole("button",{name:"В карточки"});
  await waitFor(()=>expect(button).toBeEnabled());fireEvent.click(button);fireEvent.click(button);
  await screen.findByRole("alert");expect((await data.read()).items).toHaveLength(0);
  fireEvent.click(screen.getByRole("button",{name:"Повторить сохранение"}));
  await screen.findByRole("button",{name:"Уже в карточках ✓"});expect(writes).toHaveLength(2);expect(writes[0]).toEqual(writes[1]);
});
test("ambiguous vocabulary keeps separate choices and grammar tense is not a gift",()=>{
  expect(readingCardChoices("saber")).toHaveLength(2);
  expect(readingCardChoices("presente")[0]).toMatchObject({studyItemId:"study:reading:presente",ru:"настоящее время"});
  expect(readingCardChoices("ouvimos").map(row=>row.studyItemId)).toEqual(["study:ga1:verb:ouvir:hear"]);
  expect(readingCardChoices("a")).toHaveLength(0);
  for(const form of Object.keys(grammarReadingGlossary)){
    const choices=readingCardChoices(form);expect(choices.length).toBeGreaterThan(0);
    for(const choice of choices){expect(pack.studyItems.some(item=>item.id===choice.studyItemId)).toBe(true);expect(studyReviewCardById.has(choice.studyItemId)).toBe(true);}
  }
});
