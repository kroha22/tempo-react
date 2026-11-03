import {act,fireEvent,render,screen,waitFor} from "@testing-library/react";
import {beforeEach,expect,test,vi} from "vitest";
import {DescriptionReading,DescriptionParagraph} from "@/features/practice/DescriptionReading";
import {grammarReading,shortGrammarReading} from "@/features/content/grammar-reading";

const speak=vi.fn();
const voice={name:"Joana",lang:"pt-PT",voiceURI:"joana"};
beforeEach(()=>{
  localStorage.clear();speak.mockClear();
  vi.stubGlobal("speechSynthesis",{getVoices:()=>[voice],speak,cancel:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()});
  vi.stubGlobal("SpeechSynthesisUtterance",class {text:string;constructor(text:string){this.text=text;}});
});
function reading(){render(<DescriptionReading><DescriptionParagraph pt="Uma característica." ru="Полное русское объяснение."/></DescriptionReading>);}
test("Portuguese word help is explicit, speaks the selected word and restores keyboard focus",async()=>{
  reading();
  expect(screen.queryByText("Полное русское объяснение.")).not.toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Перевод: Uma"})).not.toBeInTheDocument();
  const word=screen.getByRole("button",{name:"Перевод: característica"});word.focus();fireEvent.click(word);
  expect(screen.getByRole("dialog")).toHaveFocus();expect(speak).not.toHaveBeenCalled();
  const audio=screen.getByRole("button",{name:"Послушать: característica"});await waitFor(()=>expect(audio).toBeEnabled());
  fireEvent.click(audio);expect(speak.mock.lastCall![0]).toMatchObject({text:"característica",lang:"pt-PT",voice});
  act(()=>speak.mock.lastCall![0].onend());
  fireEvent.keyDown(screen.getByRole("dialog"),{key:"Escape"});
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(word).toHaveFocus();
});
test("full Russian mode closes word help and does not write progress",()=>{
  reading();const before=JSON.stringify(localStorage);
  fireEvent.click(screen.getByRole("button",{name:"Перевод: característica"}));
  fireEvent.click(screen.getByRole("button",{name:"Показать объяснение по-русски"}));
  expect(screen.getByText("Полное русское объяснение.")).toBeInTheDocument();expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Читать по-португальски"}));
  expect(screen.getByRole("button",{name:"Перевод: característica"})).toBeInTheDocument();
  expect(JSON.stringify(localStorage)).toBe(before);expect(speak).not.toHaveBeenCalled();
});
test("all existing regular grammar descriptions have Portuguese companions",()=>{
  expect(Object.keys(grammarReading)).toHaveLength(23);expect(Object.keys(shortGrammarReading)).toHaveLength(14);
  for(const item of Object.values(grammarReading)){expect(item.goal).not.toMatch(/[А-Яа-яЁё]/);expect(item.rule).not.toMatch(/[А-Яа-яЁё]/);expect(item.rule.length).toBeGreaterThan(80);}
});
