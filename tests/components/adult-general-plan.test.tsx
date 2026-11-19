import {afterEach,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {GeneralPlan} from "../../features/learning/plan/GeneralPlan";
import {ProfileLearningContext,emptyProfileLearning} from "../../features/practice/profile-learning";
import {PracticePlanProvider} from "../../features/practice/plan/PracticePlanContext";
import {emptyPracticePlanProgress} from "../../features/practice/plan/model";
import {activateLocalTransport} from "../../shared/http/local-transport";
import {QuickWords} from "../../features/practice/QuickWords";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
let release:(()=>void)|undefined;
afterEach(()=>{cleanup();release?.();});
function setup({child=false,error=false,word=false}={}){
  const learning=emptyProfileLearning(),progress=emptyPracticePlanProgress(),update=vi.fn(()=>true),save=vi.fn();
  if(word)learning.wordSession={setId:"hello",index:2,viewed:["hello"],stage:"cards",mode:"pairs",updatedAt:500};
  release=activateLocalTransport(async()=>{if(error)throw Error("unavailable");return {progress:[]};});
  const context={profile:{id:"adult-ui",child},learning,savingError:false,update};
  return {context,learning,progress,save,update,wrap:(content:React.ReactNode)=><ProfileLearningContext value={context}><PracticePlanProvider storage={{load:()=>progress,save}}>{content}</PracticePlanProvider></ProfileLearningContext>};
}
it("shows one continuation and ten collapsed adult blocks without source courses or writing progress",async()=>{
  const test=setup(),before=structuredClone(test.learning);render(test.wrap(<GeneralPlan/>));
  // Wait on the small loading status before scanning the complete material tree.
  // Repeated accessible-role scans can starve query notifications in jsdom.
  await screen.findByText("Базовые занятия · 0/49");
  expect(screen.getByRole("link",{name:"Начать занятие →"})).toHaveAttribute("href","/learning/introduction");
  expect(document.querySelectorAll("details[data-route-block]")).toHaveLength(10);
  expect(document.querySelectorAll("details[open]")).toHaveLength(0);
  expect(screen.queryByText("Курс по книге",{exact:true})).toBeNull();
  expect(screen.getByRole("link",{name:"Слова и повторение"})).toHaveAttribute("href","/learning/quick-words");
  expect(test.learning).toEqual(before);expect(test.save).not.toHaveBeenCalled();expect(test.update).not.toHaveBeenCalled();
});
it("opens the originating block and keeps all planned sources reachable as words without fake lesson URLs",async()=>{
  const test=setup();render(test.wrap(<GeneralPlan initialBlock="B10"/>));
  await screen.findByText("Базовые занятия · 0/49");
  const block=document.querySelector('details[data-route-block="B10"]')!;
  expect(block).toHaveAttribute("open");
  const extra=within(block as HTMLElement).getByText("Дальнейшие занятия",{exact:true});fireEvent.click(extra);
  const planned=document.querySelector('[data-material-key="book/U54"]')!;
  expect(within(planned as HTMLElement).getByRole("link",{name:"Слова занятия →"})).toHaveAttribute("href","/learning/gramatica-ativa/words/u54");
  expect(within(planned as HTMLElement).queryByRole("link",{name:"Открыть материал →"})).toBeNull();
});
it("keeps failure unknown and retains the child plan",async()=>{
  const test=setup({error:true});render(test.wrap(<GeneralPlan/>));
  expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось прочитать все результаты");
  expect(screen.queryByRole("link",{name:"Начать занятие →"})).toBeNull();
  cleanup();const child=setup({child:true});render(child.wrap(<GeneralPlan practiceOnly/>));
  expect(screen.getByText("Курс по книге",{exact:true})).toBeInTheDocument();
});
it("resumes the exact saved word and stage without writing merely on opening",()=>{
  const test=setup({word:true}),before=structuredClone(test.learning);render(test.wrap(<QuickWords initialSetId="hello" resumeInitial onBack={vi.fn()}/>));
  expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent(wordBrowseSets(false).find(set=>set.id==="hello")!.words[2].label);
  expect(test.learning).toEqual(before);expect(test.update).not.toHaveBeenCalled();
});
it("keeps the saved lesson-card library and its SRS reachable from the common adult word entry",()=>{
  const test=setup();render(test.wrap(<QuickWords onBack={vi.fn()}/>));
  expect(screen.getByRole("link",{name:"Мои карточки из уроков →"})).toHaveAttribute("href","/learning/gramatica-ativa/saved");
  expect(screen.getByRole("link",{name:"Повторить сохранённые →"})).toHaveAttribute("href","/learning/gramatica-ativa/review");
  expect(test.update).not.toHaveBeenCalled();expect(test.save).not.toHaveBeenCalled();
});
