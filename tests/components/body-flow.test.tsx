import {useState} from "react";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {RelatedLearning} from "@/github-pages/RelatedLearning";
import {RelatedLearningNavigation} from "@/features/practice/RelatedLearningNavigation";
import {bodyFlowHref} from "@/features/content/body-flow";
import {bodyCardWords} from "@/features/content/body-cards";
import {everydayLessons} from "@/features/content/everyday-lessons";
import {learningCatalog} from "@/features/content/learning-catalog";
import {browserPracticePlanStorage} from "@/github-pages/practice-plan-storage";
import {PracticePlanProvider} from "@/features/practice/plan/PracticePlanContext";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {activateLocalTransport} from "@/shared/http/local-transport";
import {createLocalLearningApi} from "@/github-pages/local-learning-api";
import {emptyLocalLearning,localLearningSchema,type LearningStore} from "@/github-pages/local-learning-store";
let deactivate:(()=>void)|undefined,learning:ProfileLearning,store:LearningStore;
function Harness(){const [href,setHref]=useState(window.location.hash.slice(1)),[state,setState]=useState(learning);const navigate=(next:string)=>{window.history.replaceState(null,"",`/tempo-react/#${next}`);setHref(next);};return <ProfileLearningContext value={{profile:{id:"body-flow-test",child:false},learning:state,savingError:false,update:change=>{learning=change(learning);setState(learning);return true;}}}><PracticePlanProvider storage={browserPracticePlanStorage}><RelatedLearningNavigation value={navigate}><RelatedLearning href={href} onBack={()=>navigate("/learning/plan")}/></RelatedLearningNavigation></PracticePlanProvider></ProfileLearningContext>;}
beforeEach(()=>{localStorage.clear();learning=emptyProfileLearning();window.history.replaceState(null,"",`/tempo-react/#${bodyFlowHref()}`);vi.spyOn(window,"scrollTo").mockImplementation(()=>{});let data=emptyLocalLearning();store={read:async()=>structuredClone(data),update:async change=>{data=localLearningSchema.parse(change(structuredClone(data)));return structuredClone(data);},close(){}};deactivate=activateLocalTransport(createLocalLearningApi(store));});
afterEach(()=>deactivate?.());
const go=(name:string)=>fireEvent.click(screen.getByRole("link",{name}));
it("uses PT/RU and saves the same noun from an explanation and word batch",async()=>{
  render(<Harness/>);expect(screen.getByRole("region",{name:"Тело и действия"})).toHaveTextContent("Consigo nomear partes do rosto");fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));expect(screen.getByText(/Я могу назвать части лица/)).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Читать по-португальски"}));
  fireEvent.click(screen.getAllByRole("button",{name:"Перевод: orelha"})[0]);let popup=within(screen.getByRole("dialog"));fireEvent.click(await popup.findByRole("button",{name:"В карточки"}));await popup.findByRole("button",{name:"Уже в карточках ✓"});fireEvent.keyDown(screen.getByRole("dialog"),{key:"Escape"});go("2 · Слова");const article=within(screen.getByRole("region",{name:"Тело и самочувствие: личные карточки и повторение"})).getByText("a orelha — as orelhas",{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});expect((await store.read()).items).toHaveLength(1);expect((await store.read()).sources.map(row=>row.sourceId)).toEqual(["lesson:everyday:body","lesson:body:face"]);
  go("Как я себя чувствую");fireEvent.click(screen.getByRole("button",{name:"Перевод: bem"}));popup=within(screen.getByRole("dialog"));expect(popup.queryByRole("button",{name:"В карточки"})).toBeNull();
});
it("preserves both writing drafts, body choices and feelings answers through topics and related back",()=>{
  render(<Harness/>);go("3 · Задания");fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"cabe"}});go("Тело и движение");go("3 · Задания");fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:"bra"}});go("Лицо и руки");go("3 · Задания");expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("cabe");go("1 · Объяснение");fireEvent.click(within(screen.getByRole("group",{name:"Части тела и действия"})).getByRole("button",{name:/os ouvidos/}));fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));fireEvent.click(screen.getByRole("button",{name:"os olhos"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
  go("Как я себя чувствую");go("3 · Задания");fireEvent.click(screen.getByRole("button",{name:"Estou"}));go("1 · Объяснение");go("SER / ESTAR: общее объяснение и формы →");fireEvent.click(screen.getByRole("button",{name:"← К уроку «Тело и самочувствие»"}));go("3 · Задания");expect(screen.getByRole("button",{name:"Estou"})).toHaveAttribute("aria-pressed","true");go("Лицо и руки");expect(screen.getByText("Ouço com os ouvidos.",{selector:"strong"})).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));expect(screen.getByRole("button",{name:"Дальше"})).toBeVisible();go("Тело и движение");go("3 · Задания");expect(screen.getByRole("textbox",{name:"Твой ответ"})).toHaveValue("bra");
});
it("keeps acquaintance, practice, phrase repeat and SRS separate and retains confirmed feelings after remount",async()=>{
  window.history.replaceState(null,"",`/tempo-react/#${bodyFlowHref("feelings","words")}`);const view=render(<Harness/>);const word=bodyCardWords.find(word=>word.key==="cansado")!,article=screen.getByText(word.pt,{selector:"strong"}).closest("article")!;fireEvent.click(await within(article).findByRole("button",{name:"В карточки"}));await within(article).findByRole("button",{name:"Уже в карточках ✓"});expect(learning.feelings.viewed).toEqual([]);
  const feelings=within(screen.getByRole("region",{name:"Как я себя чувствую: слова и ESTAR"}));
  for(const button of feelings.getAllByRole("button",{name:/^Отметить знакомство:/}))fireEvent.click(button);
  expect(learning.feelings.viewed).toHaveLength(6);go("3 · Задания");
  const run=(answers:string[])=>{
    const practice=within(feelings.getByLabelText("Варианты ответа").closest("section")!);
    for(const [i,answer] of answers.entries()){
      fireEvent.click(practice.getByRole("button",{name:answer}));
      fireEvent.click(practice.getByRole("button",{name:"Проверить"}));
      fireEvent.click(practice.getByRole("button",{name:i===answers.length-1?"Завершить":"Следующая фраза →"}));
    }
  };
  run(["Estou","cansada","O Miguel está nervoso."]);expect(learning.feelings.practised).toBe(true);expect(learning.feelings.repeated).toBe(false);go("4 · Повторение");fireEvent.click(screen.getByRole("button",{name:"Повторить без примеров →"}));run(["O Miguel está nervoso.","cansada","Estou"]);expect(learning.feelings.repeated).toBe(true);expect(learning.activities?.["usage:feelings"]).toBeUndefined();expect((await store.read()).reviews.every(row=>row.version===0)).toBe(true);go("4 · Повторение");view.unmount();render(<Harness/>);expect(screen.getByLabelText("Повторение: получено")).toBeVisible();expect(screen.getByLabelText("Практика: получено")).toBeVisible();expect(within(screen.getByRole("region",{name:"Награды темы"})).getByText("3 / 3")).toBeVisible();expect(learning.activities?.["usage:feelings"]).toBeUndefined();
});
it("preserves four independent numeric results and the three old plan completions",()=>{
  const view=render(<Harness/>);for(const topic of ["face","movement"]){if(topic==="movement")go("Тело и движение");go("3 · Задания");const words=bodyCardWords.filter(word=>word.topic===topic);for(const [i,word] of words.entries()){fireEvent.change(screen.getByRole("textbox",{name:"Твой ответ"}),{target:{value:word.noun!.lemma}});fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===words.length-1?"Завершить":"Дальше"}));}}
  go("Лицо и руки");fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));for(const [i,task] of everydayLessons.body.checks.entries()){fireEvent.click(screen.getByRole("button",{name:task.answer}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===5?"Завершить":"Дальше"}));}
  expect(learning.activities?.["usage:body-actions"]).toBeUndefined();fireEvent.click(screen.getByRole("button",{name:"Фразы COM · 2 задания"}));for(const [i,task] of learningCatalog.usageModules.find(module=>module.id==="usage:body-actions")!.exercises.entries()){fireEvent.click(screen.getByRole("button",{name:task.options.find(option=>option.id===task.correctOptionId)!.text}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:i===1?"Завершить":"Следующая фраза →"}));}
  expect(Object.keys(browserPracticePlanStorage.load().completed).sort()).toEqual(["practice:everyday:body","practice:words:expansion-body-face","practice:words:expansion-body-movement"]);go("4 · Повторение");view.unmount();render(<Harness/>);fireEvent.click(screen.getByText("Результаты заданий тела"));for(const result of ["Письмо: лицо и руки: 8 / 8","Письмо: тело и движение: 6 / 6","Части тела и действия: 6 / 6","Две фразы COM: 2 / 2"])expect(screen.getByText(result)).toBeVisible();
},20000);
it("shows legacy completion without inventing a score",()=>{
  browserPracticePlanStorage.save({version:1,lastStepId:null,completed:{"practice:everyday:body":{revision:1,needsReview:true}}});window.history.replaceState(null,"",`/tempo-react/#${bodyFlowHref("face","review")}`);render(<Harness/>);fireEvent.click(screen.getByText("Результаты заданий тела"));expect(screen.getByText("Части тела и действия: пройдено · стоит повторить (без сохранённого счёта)")).toBeVisible();
});
