import {useState,type ReactNode} from "react";
import {render,screen,fireEvent} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {WordMemory} from "@/features/practice/WordMemory";
import {memoryWords,makeMemoryBoard,canPlayWordMemory,type MemoryCard} from "@/features/practice/word-memory";
import {QuickWords} from "@/features/practice/QuickWords";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {wordRoundRanges,wordSessionSchema} from "@/features/practice/word-learning-session";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
const words=[{id:"apple",label:"a maçã",translation:"Яблоко",illustration:{src:"/images/food.webp",column:0,row:0,grid:3}},{id:"milk",label:"o leite",translation:"Молоко"},{id:"bread",label:"o pão",translation:"Хлеб"}];
function flip(board:MemoryCard[],id:string,side:MemoryCard["side"]){const index=board.findIndex(card=>card.word.id===id&&card.side===side);fireEvent.click(screen.getByRole("button",{name:new RegExp(`^Карточка ${index+1}:`)}));}
it("keeps canonical objects, distinct accents and unambiguous pairs, without mutating source order",()=>{
  const ambiguous=[...words,{...words[1],id:"milk-alias",label:"leite"},{...words[0],id:"same-art",label:"a pera",translation:"Груша"},{...words[2],id:"bread-alias",label:"outro pão"}];
  expect(memoryWords(ambiguous)).toEqual(words);expect(memoryWords(words)[0]).toBe(words[0]);
  const before=words.map(word=>word.id),board=makeMemoryBoard(words);expect(makeMemoryBoard(words)).toEqual(board);expect(makeMemoryBoard(words,1)).not.toEqual(board);expect(words.map(word=>word.id)).toEqual(before);expect(board).toHaveLength(6);
  for(const word of words)expect(board.filter(card=>card.word===word).map(card=>card.side).sort()).toEqual(["meaning","pt"]);
  expect(memoryWords([{id:"f",label:"a avó",translation:"Бабушка"},{id:"m",label:"o avô",translation:"Дедушка"}])).toHaveLength(2);
  expect(canPlayWordMemory({id:"farm-animals",kind:"words",aliases:[]},words)).toBe(true);expect(canPlayWordMemory({id:"adult-shopping",kind:"phrases",aliases:[]},words)).toBe(false);
});
it("hides answers, makes first flips free, blocks same-side matches and records each mistaken word once",()=>{
  const mistake=vi.fn(),done=vi.fn(),board=makeMemoryBoard(words);render(<WordMemory words={words} child={false} onMistake={mistake} onComplete={done}/>);
  expect(screen.queryByText("a maçã")).not.toBeInTheDocument();expect(screen.queryByText("Молоко")).not.toBeInTheDocument();expect(screen.queryByRole("button",{name:/Послушать/})).not.toBeInTheDocument();
  flip(board,"apple","pt");expect(mistake).not.toHaveBeenCalled();expect(screen.getByText("a maçã")).toBeVisible();
  const secondPt=board.findIndex(card=>card.word.id==="milk"&&card.side==="pt");expect(screen.getByRole("button",{name:new RegExp(`^Карточка ${secondPt+1}:`)})).toBeDisabled();
  fireEvent.click(screen.getByRole("button",{name:"Слово: a maçã"}));expect(mistake).not.toHaveBeenCalled();flip(board,"apple","pt");flip(board,"apple","meaning");
  for(let attempt=0;attempt<2;attempt++){flip(board,"milk","pt");flip(board,"bread","meaning");expect(screen.getByText("Не пара. Посмотри и закрой карточки.")).toBeVisible();expect(screen.getByRole("group",{name:"Карточки мемори"}).querySelectorAll("button:not(:disabled)")).toHaveLength(0);fireEvent.click(screen.getByRole("button",{name:"Закрыть карточки"}));}
  expect(mistake.mock.calls).toEqual([["milk"],["bread"]]);
  flip(board,"milk","meaning");expect(screen.getByText("Молоко")).toBeVisible();flip(board,"milk","pt");flip(board,"bread","pt");flip(board,"bread","meaning");expect(screen.getByText("Все пары найдены · без ошибок 1 / 3")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"К активностям"}));expect(done).toHaveBeenCalledOnce();
});
it.each([false,true])("offers all three starting themes and enrolls errors in this profile; child=%s",child=>{
  let stored:ProfileLearning=emptyProfileLearning();
  function Harness({children}:{children:ReactNode}){const [learning,setLearning]=useState(stored);return <ProfileLearningContext value={{profile:{id:"memory-test",child},learning,savingError:false,update:fn=>{stored=fn(stored);setLearning(stored);return true;}}}>{children}</ProfileLearningContext>;}
  const library=wordLibraryFor(child);
  for(const id of ["food","farm-animals","clothes-basic"]){const pack=library.find(set=>set.id===id)!;expect(canPlayWordMemory(pack,pack.words)).toBe(true);}
  const pack=library.find(set=>set.id==="food")!,range=wordRoundRanges(pack.words.length)[0],tasks=memoryWords(pack.words.slice(range.start,range.end)),board=makeMemoryBoard(tasks,1);
  render(<Harness><QuickWords child={child} sourceIds={["food"]} onBack={()=>{}}/></Harness>);fireEvent.click(screen.getByRole("button",{name:"Мемори"}));expect(screen.getByRole("region",{name:"Мемори"})).toBeVisible();
  flip(board,tasks[0].id,"pt");flip(board,tasks[1].id,"meaning");fireEvent.click(screen.getByRole("button",{name:"Закрыть карточки"}));flip(board,tasks[0].id,"pt");flip(board,tasks[1].id,"meaning");
  expect(stored.wordDeck).toHaveLength(2);expect(stored.wordDeck?.map(row=>row.wordId).sort()).toEqual([tasks[0].id,tasks[1].id].sort());expect(stored.wordDeck?.every(row=>row.errors===1&&row.needsPractice)).toBe(true);
  expect(wordSessionSchema.safeParse(stored.wordSession).success).toBe(true);expect(stored.wordSession?.mode).toBe("memory");
});
