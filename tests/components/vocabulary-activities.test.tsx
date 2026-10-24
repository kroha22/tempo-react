import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe,it,expect} from "vitest";
import {WordPairs} from "@/features/practice/WordPairs";
import {ImageMatchingExercise} from "@/features/practice/ImageMatchingExercise";
import {WordSearch} from "@/features/practice/WordSearch";
import {makeSearchBoard,searchWords} from "@/features/practice/word-search";
import type {VocabularyWord} from "@/features/content/vocabulary-model";
import type {ImageMatchingDefinition} from "@/features/practice/image-matching";

const words:VocabularyWord[]=[{id:"apple",label:"a maçã",translation:"Яблоко",illustration:{src:"/apple.webp",row:0,column:0}},{id:"pear",label:"a pera",translation:"Груша",illustration:{src:"/pear.webp",row:0,column:0}}];
const block={id:"fruit",title:"Фрукты",words:["apple","pear"]};
const scene:ImageMatchingDefinition={id:"test",title:"Фрукты",image:{src:"/fruit.webp",alt:"Фрукты",width:100,height:100,crop:{x:0,y:0,width:100,height:100}},wordIds:["apple","pear"],spots:[{id:"one",x:20,y:20,acceptedWordIds:["apple"]},{id:"two",x:70,y:70,acceptedWordIds:["pear"]}]};

describe("illustrated vocabulary interactions",()=>{
  it("matches a word and its picture and preserves progress when changing representation",async()=>{
    const user=userEvent.setup();
    render(<WordPairs words={words} blocks={[block]}/>);
    await user.click(screen.getByRole("button",{name:"Imagem · Картинка"}));
    await user.click(screen.getByRole("button",{name:"a maçã"}));
    await user.click(screen.getByRole("button",{name:"Картинка: Яблоко"}));
    await waitFor(()=>expect(screen.getByText("1 / 2")).toBeInTheDocument());
    await user.click(screen.getByRole("button",{name:"Texto · Перевод"}));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Груша"})).toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Яблоко"})).not.toBeInTheDocument();
  });
  it("does not offer pictures for a partially illustrated pack",()=>{
    render(<WordPairs words={[words[0],{id:"pear",label:"a pera",translation:"Груша"}]} blocks={[block]}/>);
    expect(screen.queryByRole("group",{name:"Вид пар"})).not.toBeInTheDocument();
  });
  it("never reveals correct placement before manual checking",async()=>{
    const user=userEvent.setup();const {container}=render(<ImageMatchingExercise definition={scene} words={words}/>);
    await user.click(screen.getByRole("button",{name:/^1\s*a maçã$/}));
    await user.click(screen.getByRole("button",{name:"Квадрат 1, пустой"}));
    expect(screen.getByRole("button",{name:"Квадрат 1, номер 1, a maçã"})).toBeInTheDocument();
    expect(container.querySelector('[data-feedback="confirmed"]')).toBeNull();
    expect(container.querySelector('[data-feedback="placed"]')).not.toBeNull();
    await user.click(screen.getByRole("button",{name:"Проверить"}));
    expect(container.querySelector('[data-feedback="confirmed"]')).not.toBeNull();
    expect(screen.getByRole("button",{name:/Квадрат 1.*верно/})).toBeInTheDocument();
  });
  it("confirms correct placement immediately only when instant checking is enabled",async()=>{
    const user=userEvent.setup();const {container}=render(<ImageMatchingExercise definition={scene} words={words}/>);
    await user.click(screen.getByRole("switch",{name:"Показывать ошибки сразу"}));
    await user.click(screen.getByRole("button",{name:/^1\s*a maçã$/}));
    await user.click(screen.getByRole("button",{name:"Квадрат 1, пустой"}));
    expect(container.querySelector('[data-feedback="confirmed"]')).not.toBeNull();
  });
  it("celebrates a newly found word, clears the effect, and does not replay it for duplicates",async()=>{
    const {container}=render(<WordSearch words={words}/>);
    const board=makeSearchBoard(searchWords(words).slice(0,10),731);
    const path=board.placements.apple;
    const select=()=>path.forEach(index=>fireEvent.click(container.querySelector(`[data-letter-index="${index}"]`)!));
    select();
    const effect=container.querySelector('[data-celebration="apple"]')!;
    expect(effect).not.toBeNull();
    expect(effect.querySelector("svg,span")).not.toBeNull();
    await waitFor(()=>expect(container.querySelector("[data-celebration]")).toBeNull(),{timeout:1800});
    select();
    expect(container.querySelector("[data-celebration]")).toBeNull();
  });
});
