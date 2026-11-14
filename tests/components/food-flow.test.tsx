import {useState,type ReactNode} from "react";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {LegacyDemo} from "@/github-pages/Demo";
import {foodFlowHref} from "@/features/content/food-flow";
import {foodProductWords,foodPreferenceCard} from "@/features/content/food-cards";
import {everydayLessons} from "@/features/content/everyday-lessons";
import {learningCatalog} from "@/features/content/learning-catalog";
import {browserPracticePlanStorage} from "@/github-pages/practice-plan-storage";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
let deactivate:(()=>void)|undefined,learning:ProfileLearning,store:LearningStore;
function Learner({children}:{children:ReactNode}){const [state,setState]=useState(learning);return <ProfileLearningContext value={{profile:{id:"food-flow-test",child:false},learning:state,savingError:false,update:change=>{learning=change(learning);setState(previous=>JSON.stringify(previous)===JSON.stringify(learning)?previous:learning);return true;}}}>{children}</ProfileLearningContext>;}
beforeEach(()=>{localStorage.clear();learning=emptyProfileLearning();window.history.replaceState(null,"",`/tempo-react/#${foodFlowHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});let data=emptyLocalLearning();store={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};deactivate=activateLocalTransport(createLocalLearningApi(store));});
afterEach(()=>deactivate?.());

it("uses PT/RU introductions and saves a highlighted noun into the same existing product card",async()=>{
  render(<LegacyDemo/>);expect(screen.getByRole("region",{name:"Объяснение еды: фрукты"})).toHaveTextContent("Consigo reconhecer e escrever seis nomes de frutos.");
  fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));expect(screen.getByText(/Я могу узнать и написать шесть/)).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Читать по-португальски"}));
  fireEvent.click(screen.getAllByRole("button",{name:"Перевод: maçã"})[0]);const popup=within(screen.getByRole("dialog",{name:"Перевод слова"}));fireEvent.click(await popup.findByRole("button",{name:"В карточки"}));await popup.findByRole("button",{name:"Уже в карточках ✓"});fireEvent.keyDown(screen.getByRole("dialog"),{key:"Escape"});
  fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));const apple=within(screen.getByRole("region",{name:"Еда: личные карточки и повторение"})).getByText(foodProductWords[0].pt,{selector:"strong"}).closest("article")!;expect(await within(apple).findByRole("button",{name:"Уже в карточках ✓"})).toBeDisabled();expect((await store.read()).items.map(row=>row.studyItemId)).toEqual([foodProductWords[0].studyItemId]);
});

it("retains the constructor and checked answer through steps, topics and related grammar",()=>{
  window.history.replaceState(null,"",`/tempo-react/#${foodFlowHref("preferences")}`);render(<LegacyDemo/>);
  fireEvent.click(screen.getByRole("button",{name:"Ты"}));fireEvent.click(screen.getByRole("button",{name:"Не нравится"}));fireEvent.click(within(screen.getByRole("group",{name:"Выбери продукт"})).getByRole("button",{name:/queijo/}));expect(screen.getByText("Tu não gostas de queijo.")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));fireEvent.click(screen.getByRole("button",{name:"de"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
  fireEvent.click(screen.getByRole("link",{name:"Фрукты"}));fireEvent.click(screen.getByRole("link",{name:"Предпочтения"}));expect(screen.getByText("Tu não gostas de queijo.")).toBeVisible();
  fireEvent.click(screen.getByRole("link",{name:"Настоящее время -AR: объяснение и практика →"}));expect(window.location.hash).toContain("related=");fireEvent.click(screen.getByRole("button",{name:"← К уроку «Еда и предпочтения»"}));expect(screen.getByText("Tu não gostas de queijo.")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));expect(screen.getByRole("button",{name:"de"})).toHaveAttribute("aria-pressed","true");expect(screen.getByRole("button",{name:"Дальше"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Продукты во фразах · 2 задания"}));fireEvent.click(screen.getByRole("button",{name:"morangos"}));fireEvent.click(screen.getByRole("link",{name:"Мне нравится: собери фразу →"}));expect(window.location.hash).not.toContain("related=");expect(screen.getByText("Tu não gostas de queijo.")).toBeVisible();fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));expect(screen.getByRole("button",{name:"morangos"})).toHaveAttribute("aria-pressed","true");
});

it("maps highlighted gostar forms to the existing U49 chunk and preserves both writing drafts",async()=>{
  window.history.replaceState(null,"",`/tempo-react/#${foodFlowHref("preferences")}`);render(<LegacyDemo/>);fireEvent.click(screen.getAllByRole("button",{name:"Перевод: gosto de"})[0]);const popup=within(screen.getByRole("dialog"));fireEvent.click(await popup.findByRole("button",{name:"В карточки"}));await popup.findByRole("button",{name:"Уже в карточках ✓"});expect((await store.read()).items.map(row=>row.studyItemId)).toEqual([foodPreferenceCard.studyItemId]);fireEvent.keyDown(screen.getByRole("dialog"),{key:"Escape"});
  fireEvent.click(screen.getByRole("link",{name:"Фрукты"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"maç"}});fireEvent.click(screen.getByRole("link",{name:"Продукты и напитки"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"pã"}});fireEvent.click(screen.getByRole("link",{name:"2 · Слова"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("pã");fireEvent.click(screen.getByRole("link",{name:"Фрукты"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("maç");
});

it("keeps all four completion owners separate and shows their results after remount",()=>{
  const view=render(<Learner><LegacyDemo/></Learner>);
  for(const topic of ["fruit","meals"] as const){if(topic==="meals")fireEvent.click(screen.getByRole("link",{name:"Продукты и напитки"}));fireEvent.click(screen.getByRole("link",{name:"3 · Задания"}));const words=foodProductWords.filter(word=>word.topic===topic);for(const [i,word] of words.entries()){fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:word.noun.lemma}});fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===words.length-1?"Завершить":"Дальше"}));}}
  expect(Object.keys(browserPracticePlanStorage.load().completed).sort()).toEqual(["practice:words:expansion-food-fruit","practice:words:expansion-food-meals"]);
  fireEvent.click(screen.getByRole("link",{name:"Предпочтения"}));fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));for(const [i,task] of everydayLessons.likes.checks.entries()){fireEvent.click(screen.getByRole("button",{name:task.answer}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===4?"Завершить":"Дальше"}));}
  expect(learning.activities?.["usage:food-likes"]).toBeUndefined();expect(learning.activities?.["practice:everyday:likes"].correct).toBe(5);fireEvent.click(screen.getByRole("button",{name:"Продукты во фразах · 2 задания"}));for(const [i,task] of learningCatalog.usageModules.find(module=>module.id==="usage:food-likes")!.exercises.entries()){fireEvent.click(screen.getByRole("button",{name:task.options.find(option=>option.id===task.correctOptionId)!.text}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===1?"Завершить":"Следующая фраза →"}));}
  expect(Object.keys(browserPracticePlanStorage.load().completed)).toHaveLength(3);expect(learning.activities?.["usage:food-likes"].correct).toBe(2);fireEvent.click(screen.getByRole("button",{name:"К повторению →"}));view.unmount();render(<Learner><LegacyDemo/></Learner>);fireEvent.click(screen.getByText("Результаты заданий еды"));for(const result of ["Письмо: фрукты: 6 / 6","Письмо: продукты: 8 / 8","GOSTAR DE: 5 / 5","Продукты во фразах: 2 / 2"])expect(screen.getByText(result)).toBeVisible();
},20000);

it("keeps a legacy completion without a score instead of inventing mastery",()=>{
  const old={version:1 as const,lastStepId:"practice:everyday:likes",completed:{"practice:everyday:likes":{revision:1,needsReview:true}}};browserPracticePlanStorage.save(old);window.history.replaceState(null,"",`/tempo-react/#${foodFlowHref("preferences","review")}`);render(<LegacyDemo/>);fireEvent.click(screen.getByText("Результаты заданий еды"));expect(screen.getByText("GOSTAR DE: пройдено · стоит повторить (без сохранённого счёта)")).toBeVisible();expect(browserPracticePlanStorage.load()).toEqual(old);
});
