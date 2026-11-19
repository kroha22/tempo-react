import {expect,it,vi} from "vitest";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {PaperAccordion} from "../../features/practice/PaperAccordion";
import {QuickWords} from "../../features/practice/QuickWords";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
import {wordRoundRanges} from "../../features/practice/word-learning-session";
import {newPaperSession,paperPortuguese,paperRows,paperAnswer,paperCue,paperChecked,paperDifficult,revealPaperHint,checkPaper,markPaper,repeatPaper,nextPaperColumn} from "../../features/practice/paper-accordion";
import {ProfileLearningContext,emptyProfileLearning} from "../../features/practice/profile-learning";

const sets=wordBrowseSets(false),pack=sets.find(set=>set.id==="hello")!,range=wordRoundRanges(pack.words.length)[0],words=pack.words.slice(range.start,range.end);
const start=()=>{fireEvent.click(screen.getByRole("button",{name:"Лист готов →"}));fireEvent.click(screen.getByRole("button",{name:"Записано · скрыть образец →"}));};

it("repeats only difficult original words, excludes hinted success and reverses translation without mutation",()=>{
  const before=structuredClone(pack),id=words[0].id;
  let session=revealPaperHint(newPaperSession(),id);session=checkPaper(session);
  expect(session.marks[id]).toBe("repeat");expect(markPaper(session,id,"independent")).toBe(session);
  for(const word of words.slice(1))session=markPaper(session,word.id,"independent");
  expect(paperChecked(words,session)).toBe(true);expect(paperDifficult(words,session)).toEqual([words[0]]);
  const retry=repeatPaper(words,session);expect(paperRows(words,retry)).toEqual([words[0]]);expect(paperRows(words,retry)[0]).toBe(words[0]);expect(retry.hints).toEqual({});expect(retry.retry).toBe(true);
  const next=nextPaperColumn(retry);expect(next.column).toBe(4);expect(paperCue(words[0],next)).toBe(paperPortuguese(words[0]));expect(paperAnswer(words[0],next)).toBe(words[0].translation);expect(paperRows(words,next)).toEqual(words);expect(pack).toEqual(before);
});

it("does not choose a pack implicitly and handles an empty library",()=>{
  const view=render(<PaperAccordion sets={sets}/>);expect(screen.getByRole("combobox",{name:"Пачка слов"})).toHaveValue("");expect(screen.queryByRole("button",{name:"Лист готов →"})).toBeNull();
  view.rerender(<PaperAccordion sets={[]}/>);expect(screen.getByRole("status")).toHaveTextContent("Выберите пачку");
});

it("hides answers, offers progressive per-row help and repeats the assisted row on fresh paper",()=>{
  render(<PaperAccordion sets={sets} initialSetId={pack.id}/>);start();
  expect(screen.queryByText(paperPortuguese(words[0]))).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:`Подсказка: ${words[0].translation}`}));expect(screen.queryByText(paperPortuguese(words[0]))).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:`Открыть ответ: ${words[0].translation}`}));expect(screen.getByText(paperPortuguese(words[0]))).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Написал(а) · проверить →"}));
  const mark=within(screen.getByRole("group",{name:`Самопроверка: ${words[0].translation}`}));expect(mark.getByRole("button",{name:"Самостоятельно ✓"})).toBeDisabled();expect(mark.getByRole("button",{name:"Повторить"})).toHaveAttribute("aria-pressed","true");
  expect(screen.getByRole("button",{name:"К колонке 4 · PT → RU →"})).toBeDisabled();
  fireEvent.click(screen.getByRole("button",{name:"Повторить трудные · 1"}));expect(screen.getByText(/на свободном месте или новом листке/)).toBeVisible();
  expect(document.querySelectorAll("[data-word-id]")).toHaveLength(1);expect(screen.getByRole("button",{name:`Подсказка: ${words[0].translation}`})).toBeVisible();expect(screen.queryByText(paperPortuguese(words[0]))).toBeNull();
});

it("keeps separate pack and part drafts and uses every word once across initial paper parts",()=>{
  const ranges=wordRoundRanges(pack.words.length);expect(ranges.flatMap(r=>pack.words.slice(r.start,r.end).map(word=>word.id))).toEqual(pack.words.map(word=>word.id));expect(ranges.every(r=>r.end-r.start<=6)).toBe(true);
  render(<PaperAccordion sets={sets} initialSetId={pack.id}/>);start();fireEvent.click(screen.getByRole("button",{name:`Подсказка: ${words[0].translation}`}));
  fireEvent.change(screen.getByRole("combobox",{name:"На этот лист"}),{target:{value:"1"}});expect(screen.getByRole("button",{name:"Лист готов →"})).toBeVisible();
  fireEvent.change(screen.getByRole("combobox",{name:"На этот лист"}),{target:{value:"0"}});expect(screen.getByRole("button",{name:`Открыть ответ: ${words[0].translation}`})).toBeVisible();
  fireEvent.change(screen.getByRole("combobox",{name:"Пачка слов"}),{target:{value:"polite"}});expect(screen.getByRole("button",{name:"Лист готов →"})).toBeVisible();
  fireEvent.change(screen.getByRole("combobox",{name:"Пачка слов"}),{target:{value:pack.id}});expect(screen.getByRole("button",{name:`Открыть ответ: ${words[0].translation}`})).toBeVisible();
});

it("opens and exits from adult words without rewriting saved sessions, cards or result owners",()=>{
  const learning=emptyProfileLearning(),update=vi.fn(()=>true);learning.wordSession={setId:"hello",stage:"cards",index:2,viewed:[words[0].id],mode:"pairs",updatedAt:123};
  const before=structuredClone(learning);
  render(<ProfileLearningContext value={{profile:{id:"paper-adult",child:false},learning,savingError:false,update}}><QuickWords onBack={vi.fn()}/></ProfileLearningContext>);
  fireEvent.click(screen.getByRole("button",{name:"▤ Бумажная гармошка"}));fireEvent.change(screen.getByRole("combobox",{name:"Пачка слов"}),{target:{value:pack.id}});start();fireEvent.click(screen.getByRole("button",{name:`Подсказка: ${words[0].translation}`}));
  fireEvent.keyDown(screen.getByRole("dialog",{name:"Учить слова"}),{key:"Escape"});fireEvent.click(screen.getByRole("button",{name:"К подборкам слов"}));
  expect(screen.getByRole("searchbox",{name:"Найти подборку"})).toBeVisible();expect(update).not.toHaveBeenCalled();expect(learning).toEqual(before);
});

it("keeps the child presentation unchanged and resets paper self-check on profile replacement",()=>{
  const learning=emptyProfileLearning(),update=vi.fn(()=>true),back=vi.fn();
  const wrap=(profile:{id:string;child:boolean})=><ProfileLearningContext value={{profile,learning,savingError:false,update}}><QuickWords onBack={back}/></ProfileLearningContext>;
  const view=render(wrap({id:"paper-child",child:true}));expect(screen.queryByRole("button",{name:/Бумажная гармошка/})).toBeNull();
  view.rerender(wrap({id:"paper-a",child:false}));fireEvent.click(screen.getByRole("button",{name:"▤ Бумажная гармошка"}));fireEvent.change(screen.getByRole("combobox",{name:"Пачка слов"}),{target:{value:pack.id}});start();
  view.rerender(wrap({id:"paper-b",child:false}));expect(screen.getByRole("combobox",{name:"Пачка слов"})).toHaveValue("");expect(screen.queryByRole("button",{name:"Написал(а) · проверить →"})).toBeNull();expect(update).not.toHaveBeenCalled();
});

it("starts from the current part of an existing pack and returns without replacing its saved cursor",()=>{
  const learning=emptyProfileLearning(),update=vi.fn(()=>true),start=wordRoundRanges(pack.words.length)[1].start;
  learning.wordSession={setId:pack.id,stage:"choice",index:start,viewed:[],mode:"pairs",updatedAt:123};const before=structuredClone(learning);
  render(<ProfileLearningContext value={{profile:{id:"paper-resume",child:false},learning,savingError:false,update}}><QuickWords initialSetId={pack.id} resumeInitial onBack={vi.fn()}/></ProfileLearningContext>);
  fireEvent.click(screen.getByRole("button",{name:"Бумажная гармошка"}));expect(screen.getByRole("combobox",{name:"Пачка слов"})).toHaveValue(pack.id);expect(screen.getByRole("combobox",{name:"На этот лист"})).toHaveValue("1");
  fireEvent.click(screen.getByRole("button",{name:"К активностям"}));expect(screen.getByRole("group",{name:"Выбери активность"})).toBeVisible();expect(update).not.toHaveBeenCalled();expect(learning).toEqual(before);
});
