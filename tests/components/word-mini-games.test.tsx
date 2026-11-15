import {render,screen,fireEvent} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {WordMiniGame} from "@/features/practice/WordMiniGame";
import {QuickWords} from "@/features/practice/QuickWords";
const words=[{id:"house",label:"a casa",translation:"Дом"},{id:"cat",label:"o gato",translation:"Кот"},{id:"book",label:"o livro",translation:"Книга"}];
it("shows whole thematic dictionaries, retains all verb IDs and reuses overlapping essentials",()=>{
  const sets=wordBrowseSets(false);
  expect(sets.some(set=>/ · \d+$/.test(set.title))).toBe(false);
  const verbs=sets.find(set=>set.title==="Все глаголы")!;
  expect(new Set(verbs.words.map(word=>word.id)).size).toBe(1000);
  expect(verbs.aliases).toContain("deck:verbs:124");
  const basics=sets.find(set=>set.title==="Повседневный словарь")!;expect(basics.words.length).toBeGreaterThan(350);
  const essential=sets.find(set=>set.id==="browse:essentials")!,greetings=sets.find(set=>set.id==="hello")!;
  expect(essential.words.find(word=>word.id===greetings.words[0].id)).toBe(greetings.words[0]);
  expect(sets.some(set=>/^Урок \d/.test(set.title))).toBe(false);
});
it("allows correction but counts only first-attempt letters in the result",()=>{
  const done=vi.fn();render(<WordMiniGame words={words} mode="letters" child={false} onComplete={done}/>);
  fireEvent.click(screen.getByRole("button",{name:"a"}));expect(screen.getByRole("status")).toHaveTextContent("Попробуй ещё раз");
  fireEvent.click(screen.getByRole("button",{name:"s"}));expect(screen.getByText("a casa")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Дальше"}));fireEvent.click(screen.getByRole("button",{name:"t"}));
  fireEvent.click(screen.getByRole("button",{name:"Дальше"}));fireEvent.click(screen.getByRole("button",{name:"v"}));
  fireEvent.click(screen.getByRole("button",{name:"Завершить"}));expect(screen.getByRole("status")).toHaveTextContent("2 / 3");
  fireEvent.click(screen.getByRole("button",{name:"Готово"}));expect(done).toHaveBeenCalledOnce();
});
it("does not disclose the listening answer in the sound button or prompt",()=>{
  render(<WordMiniGame words={words} mode="listening" child={false} onComplete={()=>{}}/>);
  expect(screen.getByRole("button",{name:"Послушать задание"})).toBeVisible();
  expect(screen.queryByText("a casa")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Кот"}));expect(screen.getByText("Попробуй ещё раз")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Дом"}));expect(screen.getByText("a casa")).toBeVisible();
});
it.each([false,true])("offers new games in both presentations; child=%s",child=>{
  render(<QuickWords child={child} sourceIds={["colors-basic"]} onBack={()=>{}}/>);
  expect(screen.getByRole("button",{name:/^Карточки слов/})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Вставь букву"}));expect(screen.getByRole("region",{name:"Вставь букву"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"♫ На слух"}));expect(screen.getByRole("region",{name:"Послушай и выбери"})).toBeVisible();
});
it("uses the heard Portuguese phrase when translations overlap",()=>{
  render(<WordMiniGame mode="listening" child={false} onComplete={()=>{}} words={[{id:"morning",label:"Bom dia.",translation:"Доброе утро / добрый день"},{id:"afternoon",label:"Boa tarde.",translation:"Добрый день"}]}/>);
  expect(screen.getByRole("button",{name:"Bom dia."})).toBeVisible();
  expect(screen.getByRole("button",{name:"Boa tarde."})).toBeVisible();
  expect(screen.queryByRole("button",{name:"Добрый день"})).not.toBeInTheDocument();
});
