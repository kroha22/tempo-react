import {render,screen,fireEvent} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {WordBuilder,orderedCalendarWords} from "@/features/practice/WordBuilder";
import {QuickWords} from "@/features/practice/QuickWords";
import {wordSessionSchema} from "@/features/practice/word-learning-session";
const words=[{id:"casa",label:"a casa",translation:"Дом"},{id:"março",label:"março",translation:"Март"}];
it.each([false,true])("offers the constructor from the activity tiles; child=%s",child=>{
  render(<QuickWords child={child} sourceIds={["colors-basic"]} onBack={()=>{}}/>);
  fireEvent.click(screen.getByRole("button",{name:"Собери слово"}));expect(screen.getByRole("region",{name:"Собери слово"})).toBeVisible();
  expect(wordSessionSchema.safeParse({setId:"colors-basic",stage:"training",index:0,viewed:[],mode:"builder",updatedAt:0}).success).toBe(true);
});
it("uses separate repeated tiles, supports undo, and records a wrong word once",()=>{
  const mistake=vi.fn();render(<WordBuilder words={words} mode="builder" child onComplete={()=>{}} onMistake={mistake}/>);
  for(const label of ["a","a","s","c"])fireEvent.click(screen.getAllByRole("button",{name:label}).find(button=>!button.hasAttribute("disabled"))!);
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(mistake).toHaveBeenCalledExactlyOnceWith("casa");
  for(let i=0;i<4;i++)fireEvent.click(screen.getByRole("button",{name:"⌫ Убрать"}));
  for(const label of ["c","a","s","a"])fireEvent.click(screen.getAllByRole("button",{name:label}).find(button=>!button.hasAttribute("disabled"))!);
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));expect(screen.getByText("✓ Верно!")).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Дальше"}));expect(screen.getByText("Март")).toBeVisible();
});
it("orders the actual calendar subset and refuses unrelated or mixed words",()=>{
  const months=[{id:"may",label:"maio",translation:"Май"},{id:"march",label:"março",translation:"Март"},{id:"april",label:"abril",translation:"Апрель"}];
  expect(orderedCalendarWords(months).map(word=>word.id)).toEqual(["march","april","may"]);expect(orderedCalendarWords(words)).toEqual([]);
  const mistake=vi.fn();render(<WordBuilder words={months} mode="sequence" child={false} onComplete={()=>{}} onMistake={mistake}/>);
  fireEvent.click(screen.getByRole("button",{name:"maio"}));fireEvent.click(screen.getByRole("button",{name:"maio"}));expect(mistake).toHaveBeenCalledExactlyOnceWith("march");
  fireEvent.click(screen.getByRole("button",{name:"março"}));fireEvent.click(screen.getByRole("button",{name:"Дальше"}));fireEvent.click(screen.getByRole("button",{name:"abril"}));fireEvent.click(screen.getByRole("button",{name:"Дальше"}));fireEvent.click(screen.getByRole("button",{name:"maio"}));fireEvent.click(screen.getByRole("button",{name:"Завершить"}));expect(screen.getByRole("status")).toHaveTextContent("2 / 3");
});
