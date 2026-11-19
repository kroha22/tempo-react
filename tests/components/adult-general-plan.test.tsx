import {afterEach,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within,waitFor} from "@testing-library/react";
import {GeneralPlan} from "../../features/learning/plan/GeneralPlan";
import {ProfileLearningContext,emptyProfileLearning} from "../../features/practice/profile-learning";
import {PracticePlanProvider} from "../../features/practice/plan/PracticePlanContext";
import {emptyPracticePlanProgress} from "../../features/practice/plan/model";
import {activateLocalTransport} from "../../shared/http/local-transport";
import {QuickWords} from "../../features/practice/QuickWords";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
import {adultRequiredLessons} from "../../features/content/adult-route-lessons";
import {adultLessonGroups,validateAdultLessonGroups} from "../../features/content/adult-lesson-groups";
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
  await within(document.querySelector("header")!).findByText("Базовые занятия · 0/49");
  expect(within(document.querySelector("article")!).getByRole("link",{name:"Начать занятие →"})).toHaveAttribute("href","/learning/introduction");
  expect(document.querySelectorAll("details[data-route-block]")).toHaveLength(10);
  expect(document.querySelectorAll("details[open]")).toHaveLength(0);
  expect(validateAdultLessonGroups()).toEqual([]);
  for(const [key,required] of Object.entries(adultRequiredLessons)){
    const block=document.querySelector(`details[data-route-block="${key}"]`)!;
    const groups=block.querySelectorAll("[data-lesson-group]");
    expect([...groups].flatMap(group=>[...group.querySelectorAll("[data-material-key]")].map(row=>row.getAttribute("data-material-key")))).toEqual(required);
    expect([...groups].map(group=>group.querySelector("h3")?.textContent)).toEqual(adultLessonGroups(key as keyof typeof adultRequiredLessons).map(group=>group.title));
  }
  expect(screen.queryByText("Курс по книге",{exact:true})).toBeNull();
  expect(screen.getByText("Слова и повторение").closest("a")).toHaveAttribute("href","/learning/quick-words");
  expect(test.learning).toEqual(before);expect(test.save).not.toHaveBeenCalled();expect(test.update).not.toHaveBeenCalled();
});
it("opens the originating block and keeps all planned sources reachable as words without fake lesson URLs",async()=>{
  const test=setup();render(test.wrap(<GeneralPlan initialBlock="B10"/>));
  await within(document.querySelector("header")!).findByText("Базовые занятия · 0/49");
  const block=document.querySelector('details[data-route-block="B10"]')!;
  expect(block).toHaveAttribute("open");
  const extra=within(block as HTMLElement).getByText("Дальнейшие занятия",{exact:true});fireEvent.click(extra);
  const planned=document.querySelector('[data-material-key="book/U54"]')!;
  expect(within(planned as HTMLElement).getByRole("link",{name:"Слова занятия →"})).toHaveAttribute("href","/learning/gramatica-ativa/words/u54");
  expect(within(planned as HTMLElement).queryByRole("link",{name:"Открыть материал →"})).toBeNull();
});
it("keeps failure unknown and retains the child plan",async()=>{
  const test=setup({error:true});render(test.wrap(<GeneralPlan/>));
  await waitFor(()=>expect(document.querySelector('[role="alert"]')).toHaveTextContent("Не удалось прочитать все результаты"));
  expect(screen.queryByText("Начать занятие →",{exact:true})).toBeNull();
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
