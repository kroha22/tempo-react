import {useState,type ReactNode} from "react";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {act,fireEvent,render,screen,within} from "@testing-library/react";
import {LegacyDemo} from "@/github-pages/Demo";
import {familyFlowHref} from "@/features/content/family-flow";
import {familyCardWords} from "@/features/content/family-cards";
import {learningCatalog} from "@/features/content/learning-catalog";
import {browserPracticePlanStorage} from "@/github-pages/practice-plan-storage";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
let deactivate:(()=>void)|undefined,learning:ProfileLearning;
function Learner({children}:{children:ReactNode}){const [state,setState]=useState(learning);return <ProfileLearningContext value={{profile:{id:"family-test",child:false},learning:state,savingError:false,update:change=>{const next=change(learning);learning=next;setState(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);return true;}}}>{children}</ProfileLearningContext>;}
beforeEach(()=>{localStorage.clear();learning=emptyProfileLearning();window.history.replaceState(null,"",`/tempo-react/#${familyFlowHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});let data=emptyLocalLearning();const store:LearningStore={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};deactivate=activateLocalTransport(createLocalLearningApi(store));});
afterEach(()=>deactivate?.());

it("shows a legacy writing completion without inventing a score or rewriting the old plan",()=>{
  const old={version:1 as const,lastStepId:"practice:words:expansion-family-close",completed:{"practice:words:expansion-family-close":{revision:1,needsReview:true}}};
  browserPracticePlanStorage.save(old);window.history.replaceState(null,"",`/tempo-react/#${familyFlowHref("close","review")}`);
  render(<LegacyDemo/>);fireEvent.click(screen.getByText("Результаты заданий семьи"));
  expect(screen.getByText("Письмо: близкие: пройдено · стоит повторить (без сохранённого счёта)")).toBeVisible();
  expect(browserPracticePlanStorage.load()).toEqual(old);
});

it("shows PT explanation by default, translates it and saves a highlighted family word with its source",async()=>{
  render(<LegacyDemo/>);
  expect(screen.getByRole("heading",{name:"A minha família"})).toBeVisible();
  fireEvent.click(screen.getAllByRole("button",{name:"Перевод: mãe"})[0]);
  const popup=within(screen.getByRole("dialog",{name:"Перевод слова"}));
  expect(popup.getByText("мама",{selector:"span"})).toBeVisible();
  fireEvent.click(await popup.findByRole("button",{name:"В карточки"}));await popup.findByRole("button",{name:"Уже в карточках ✓"});
  fireEvent.keyDown(screen.getByRole("dialog"),{key:"Escape"});expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Показать по-русски"}));
  expect(screen.getByRole("heading",{name:"Моя семья"})).toBeVisible();
  expect(screen.getByText(/Я могу представить своих близких/)).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Вернуться к португальскому"}));
  expect(screen.getByRole("heading",{name:"A minha família"})).toBeVisible();
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));
  const mother=screen.getByText(familyCardWords[0].pt,{selector:"strong"}).closest("article")!;
  expect(await within(mother).findByRole("button",{name:"Уже в карточках ✓"})).toBeDisabled();
});

it("keeps the family phrase answer through steps, another topic and related grammar",()=>{
  render(<LegacyDemo/>);fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  fireEvent.click(screen.getByRole("button",{name:"a minha mãe"}));
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));
  fireEvent.click(screen.getByRole("link",{name:"Родственники"}));
  fireEvent.click(screen.getByRole("link",{name:"Близкие"}));
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(screen.getByRole("button",{name:"a minha mãe"})).toHaveAttribute("aria-pressed","true");
  fireEvent.click(screen.getByRole("link",{name:"SER: формы и практика →"}));expect(window.location.hash).toContain("related=");
  fireEvent.click(screen.getByRole("button",{name:"← К уроку «Моя семья и близкие»"}));
  expect(screen.getByRole("button",{name:"a minha mãe"})).toHaveAttribute("aria-pressed","true");
  act(()=>{window.history.replaceState(null,"",`/tempo-react/#${familyFlowHref("close","explanation","/learning/practice?lesson=ser-estar")}`);window.dispatchEvent(new HashChangeEvent("hashchange"));});
  fireEvent.click(screen.getByRole("button",{name:"← К уроку «Моя семья и близкие»"}));
  expect(screen.getByRole("heading",{name:"Близкие · Объяснение"})).toBeVisible();
});

it("keeps both writing drafts and unique label/feedback associations across steps",()=>{
  render(<LegacyDemo/>);fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));fireEvent.click(screen.getByRole("button",{name:"Написать 6 слов"}));
  fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"mã"}});
  fireEvent.click(screen.getByRole("link",{name:"Родственники"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"ti"}});
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("ti");
  fireEvent.click(screen.getByRole("link",{name:"Близкие"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("mã");
  const inputs=[...document.querySelectorAll<HTMLInputElement>('input[placeholder="Напиши слово…"]')];expect(new Set(inputs.map(input=>input.id)).size).toBe(inputs.length);expect(new Set(inputs.map(input=>input.getAttribute("aria-describedby"))).size).toBe(inputs.length);
});

it("retains separate phrase and writing results after remount without inventing overall completion",()=>{
  const view=render(<Learner><LegacyDemo/></Learner>);
  expect(screen.queryByRole("region",{name:"Каталог единого маршрута",hidden:true})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  for(const exercise of learningCatalog.usageModules.find(module=>module.id==="usage:family")!.exercises){fireEvent.click(screen.getByRole("button",{name:exercise.options.find(option=>option.id===exercise.correctOptionId)!.text}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:exercise.id==="cloze:family-your-engineer"?"Завершить":"Следующая фраза →"}));}
  expect(learning.activities?.["usage:family"].correct).toBe(10);expect(browserPracticePlanStorage.load().completed).toEqual({});
  fireEvent.click(screen.getByRole("button",{name:"К повторению →"}));
  fireEvent.click(screen.getByRole("link",{name:"Родственники"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));
  for(const word of familyCardWords.filter(word=>word.topic==="relatives")){fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:word.noun!.lemma}});fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:word.wordId.includes("filha")?"Завершить":"Дальше"}));}
  expect(learning.activities?.["practice:words:expansion-family-relatives"].correct).toBe(6);
  expect(Object.keys(browserPracticePlanStorage.load().completed)).toEqual(["practice:words:expansion-family-relatives"]);
  fireEvent.click(screen.getByRole("link",{name:"4 · Повторение"}));view.unmount();render(<Learner><LegacyDemo/></Learner>);
  fireEvent.click(screen.getByText("Результаты заданий семьи"));expect(screen.getByText("Фразы о близких: 10 / 10")).toBeVisible();expect(screen.getByText("Письмо: родственники: 6 / 6")).toBeVisible();expect(screen.getByText("Письмо: близкие: результата пока нет")).toBeVisible();
},15000);
