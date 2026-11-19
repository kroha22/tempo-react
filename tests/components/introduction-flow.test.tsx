import {useState,type ReactNode} from "react";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within,waitFor} from "@testing-library/react";
import {LegacyDemo} from "../../github-pages/Demo";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "../../features/practice/profile-learning";
import {activateLocalTransport} from "../../shared/http/local-transport";
import {createLocalLearningApi} from "../../github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "../../github-pages/local-learning-store";
import {introductionHref,introductionCards,introductionExplanation} from "../../features/content/introduction-flow";
import {greetingSets} from "../../features/content/greetings";
import {identitySets} from "../../features/content/identity";
import {GrammarCourse} from "../../features/learning/gramatica/GrammarCourse";

let release:(()=>void)|undefined,learning:ProfileLearning,data:ReturnType<typeof emptyLocalLearning>;
function Learner({children,child=false}:{children:ReactNode;child?:boolean}){const [value,setValue]=useState(learning);return <ProfileLearningContext value={{profile:{id:"intro-test",child},learning:value,savingError:false,update:change=>{learning=change(learning);setValue(learning);return true;}}}>{children}</ProfileLearningContext>;}
beforeEach(()=>{learning=emptyProfileLearning();data=emptyLocalLearning();localStorage.clear();window.history.replaceState(null,"",`/tempo-react/#${introductionHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};release=activateLocalTransport(createLocalLearningApi(store));});
afterEach(()=>release?.());

it("opens adult PT/RU explanation without recording results and restores an answer through phases and reading",()=>{
  const before=structuredClone(learning);render(<Learner><LegacyDemo/></Learner>);
  expect(screen.getByRole("heading",{name:"Первые разговоры и чтение"})).toBeVisible();
  expect(screen.getByText((_,element)=>element?.tagName==="P"&&element.textContent===introductionExplanation[0].pt)).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));expect(screen.getByText(/Я могу поздороваться/)).toBeVisible();
  expect(learning).toEqual(before);expect(data).toEqual(emptyLocalLearning());
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));fireEvent.click(screen.getByRole("button",{name:"Bom dia!"}));
  fireEvent.click(screen.getByRole("link",{name:"1 · Объяснение"}));fireEvent.click(screen.getByText("Буквы и чтение — по необходимости"));fireEvent.click(screen.getByRole("link",{name:"Открыть буквы и чтение →"}));
  expect(window.location.hash).toContain("related=");fireEvent.click(screen.getByRole("button",{name:"← К первым разговорам"}));
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));expect(screen.getByRole("button",{name:"Bom dia!"})).toHaveAttribute("aria-pressed","true");expect(learning).toEqual(before);
});

it("writes the same four greeting and three identity owners and retains their results in review",async()=>{
  window.history.replaceState(null,"",`/tempo-react/#${introductionHref("practice")}`);render(<Learner><LegacyDemo/></Learner>);
  for(const set of greetingSets){fireEvent.click(screen.getByRole("button",{name:`${set.pt} ${set.ru}`}));for(const check of set.checks){const section=screen.getByRole("heading",{name:check.prompt}).closest("section")!;fireEvent.click(within(section).getByRole("button",{name:check.options[check.answer]}));fireEvent.click(within(section).getByRole("button",{name:"Проверить ответ"}));}}
  fireEvent.click(screen.getByRole("button",{name:"Рассказать о себе"}));
  for(const set of identitySets){fireEvent.click(screen.getByRole("button",{name:`${set.title} — ${set.ru}`}));for(const [index,task] of set.tasks.entries()){fireEvent.click(screen.getByRole("button",{name:`Задание ${index+1} из ${set.tasks.length}`}));const section=screen.getByRole("region",{name:task.prompt});fireEvent.click(within(section).getByRole("button",{name:task.verb}));fireEvent.click(within(section).getByRole("button",{name:task.ending}));fireEvent.click(within(section).getByRole("button",{name:"Проверить фразу"}));}}
  expect(Object.keys(learning.activities!)).toEqual([...greetingSets,...identitySets].map(set=>set.id));
  for(const row of Object.values(learning.activities!))expect(row.correct).toBe(row.total);
  fireEvent.click(screen.getByRole("link",{name:"4 · Повторение"}));fireEvent.click(screen.getByText("Результаты готовых заданий"));expect(screen.getByText("Поздороваться: 2 / 2")).toBeVisible();expect(screen.getByRole("link",{name:"Продолжить общий план →"})).toHaveAttribute("href","#/learning/plan");
  await screen.findByText("Пока нет сохранённых карточек");
});

it("reuses an existing intro card source and does not reset its review when saved again",async()=>{
  window.history.replaceState(null,"",`/tempo-react/#${introductionHref("words")}`);const view=render(<Learner><LegacyDemo/></Learner>);
  fireEvent.click(screen.getByText("Пять готовых фраз — в карточки"));const card=screen.getByText(introductionCards.words[0].pt,{selector:"strong"}).closest("article")!;
  fireEvent.click(await within(card).findByRole("button",{name:"В карточки"}));await within(card).findByRole("button",{name:"Повторение подключено ✓"});
  const saved=structuredClone(data);expect(saved.items).toHaveLength(1);expect(saved.items[0].studyItemId).toBe(introductionCards.words[0].studyItemId);expect(saved.sources[0].sourceId).toBe(introductionCards.source.id);
  view.unmount();render(<Learner><LegacyDemo/></Learner>);fireEvent.click(screen.getByText("Пять готовых фраз — в карточки"));await waitFor(()=>expect(screen.getByRole("button",{name:"Повторение подключено ✓"})).toBeDisabled());expect(data).toEqual(saved);
});

it("includes words saved from PT hints in this flow's review with the original source",async()=>{
  render(<Learner><LegacyDemo/></Learner>);fireEvent.click(screen.getAllByRole("button",{name:"Перевод: perguntar"})[0]);
  const popup=within(screen.getByRole("dialog",{name:"Перевод слова"}));fireEvent.click(await popup.findByRole("button",{name:"В карточки"}));await popup.findByRole("button",{name:"Уже в карточках ✓"});
  fireEvent.click(screen.getByRole("button",{name:"Закрыть подсказку"}));fireEvent.click(screen.getByRole("link",{name:"4 · Повторение"}));
  const face=await screen.findByRole("button",{name:"Показать ответ"});expect(face).toHaveTextContent("perguntar");expect(data.sources).toEqual([{studyItemId:"study:ga1:verb:perguntar:entry",sourceType:"lesson",sourceId:introductionCards.source.id}]);
});

it.each([false,true])("keeps the completed U01 boundary and selects the right continuation (child=%s)",async child=>{
  release?.();const row={lessonId:"lesson:ga1:identity-and-origin",status:"finished",flowRevision:1,canDoResult:"demonstrated",snapshot:null,updatedAt:100};release=activateLocalTransport(async()=>({progress:[row]}));
  render(<Learner child={child}><GrammarCourse slug="identity-and-origin"/></Learner>);
  if(child){expect(await screen.findByRole("link",{name:/Урок 2:/})).toHaveAttribute("href","/learning/gramatica-ativa/location-and-state");expect(screen.queryByRole("link",{name:"Продолжить общий план →"})).toBeNull();}
  else {expect(await screen.findByRole("link",{name:"Продолжить общий план →"})).toHaveAttribute("href","/learning/plan");expect(screen.queryByRole("link",{name:/Урок 2:/})).toBeNull();}
  expect(row.updatedAt).toBe(100);
});
