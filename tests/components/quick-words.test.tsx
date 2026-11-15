import {fireEvent,render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {QuickWords} from "@/features/practice/QuickWords";
import {quickWordSets,quickSetsFor} from "@/features/content/quick-word-sets";
import {catalogWords} from "@/features/content/learning-catalog-view";
import {makePairBoard,matchPair} from "@/features/practice/word-pairs";
import {ProfileLearningContext,emptyProfileLearning} from "@/features/practice/profile-learning";
import {quickExpansionSets,quickIrregularWords,quickVerbSupport,quickColorWords} from "@/features/content/quick-word-expansion";
import {verbCards} from "@/features/cards/data/verb-cards";
import {verbs} from "@/features/conjugation/data";

it("has bounded shared sets and one object per repeated phrase",()=>{
  expect(quickWordSets).toHaveLength(22);
  const seen=new Map();
  for(const pack of quickWordSets){
    expect(pack.words.length).toBeGreaterThanOrEqual(6);expect(pack.words.length).toBeLessThanOrEqual(8);
    expect(new Set(pack.words.map(word=>word.id)).size).toBe(pack.words.length);
    for(const word of pack.words){const existing=catalogWords.find(item=>item.id===word.id);if(existing)expect(word).toBe(existing);}
    for(const word of pack.words){if(seen.has(word.label))expect(word).toBe(seen.get(word.label));seen.set(word.label,word);}
  }
  expect(quickWordSets[1].words.find(word=>word.label==="Preciso de ajuda.")).toBe(quickWordSets[4].words.find(word=>word.label==="Preciso de ajuda."));
});
it("reuses existing nouns and verb IDs with the canonical present forms",()=>{
  for(const pack of quickExpansionSets.filter(set=>!["verbs"].includes(set.kind)&&!set.id.startsWith("colors"))){
    for(const word of pack.words)expect(word).toBe(catalogWords.find(item=>item.id===word.id));
  }
  expect(quickIrregularWords).toHaveLength(8);
  for(const word of quickIrregularWords){
    expect(verbCards.find(card=>card.id===word.id)?.pt).toBe(word.label);
    expect(quickVerbSupport[word.id].example.pt).toBeTruthy();
    const original=verbs[word.label as keyof typeof verbs];
    if(original)expect(quickVerbSupport[word.id].firstPerson).toBe(original.forms.present.eu);
  }
  expect(quickIrregularWords.map(word=>quickVerbSupport[word.id].firstPerson)).toEqual(["sou","estou","tenho","vou","venho","faço","posso","quero"]);
  expect(new Set(quickColorWords.map(word=>word.id)).size).toBe(12);
  expect(quickColorWords[0].acceptedAnswers?.pt).toContain("vermelha");
});
it("filters shared sets, keeps the chosen filter on return and shows spoken verb examples",async()=>{
  const user=userEvent.setup();render(<QuickWords onBack={()=>{}}/>);
  await user.click(screen.getByRole("button",{name:"Глаголы"}));
  expect(screen.queryByRole("button",{name:/Животные фермы/})).not.toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:/Основные неправильные/}));
  expect(screen.getByText("Eu sou.")).toBeVisible();
  expect(screen.getByRole("button",{name:"Послушать: Sou de Portugal."})).toBeVisible();
  await user.click(screen.getByText("Формы · Presente"));
  expect(screen.getByText("somos")).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Следующая карточка"}));
  expect(screen.getByText("Eu estou.")).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Все наборы"}));
  expect(screen.getByRole("button",{name:"Глаголы"})).toHaveAttribute("aria-pressed","true");
  await user.click(screen.getByRole("button",{name:"Слова"}));
  expect(screen.getByRole("button",{name:/Животные фермы/})).toBeVisible();
  expect(screen.queryByRole("button",{name:/Основные неправильные/})).not.toBeInTheDocument();
});
it("offers child search for the new word sets but no extra games to adults",async()=>{
  const user=userEvent.setup();render(<QuickWords child onBack={()=>{}}/>);
  await user.click(screen.getByRole("button",{name:/Основные цвета/}));
  expect(screen.getByRole("button",{name:"⌕ Поиск"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"✎ Написать"}));
  expect(screen.getByRole("region",{name:"Напиши слово"})).toBeVisible();
  await user.click(screen.getByRole("textbox")).then(()=>user.keyboard("vermelha"));
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  expect(screen.getByRole("status",{name:"Результат проверки"})).toHaveTextContent("Верно!");
});
it("keeps four pairs visible and finishes the complete set",()=>{
  const ids=quickWordSets[3].words.map(word=>word.id);let board=makePairBoard(ids,4);
  expect(board.left).toHaveLength(4);
  for(const id of ids){expect(board.left).toContain(id);board=matchPair(board,id,id);}
  expect(board.completed).toBe(8);expect(board.queue).toHaveLength(0);
});
it.each(quickSetsFor(false))("opens adult $id with cards and pairs only and returns",async(pack)=>{
  const user=userEvent.setup(),back=vi.fn();render(<QuickWords onBack={back}/>);
    await user.click(screen.getByRole("button",{name:new RegExp(pack.title)}));
    expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toBeVisible();
    expect(screen.queryByText("Поиграть ещё")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"↔ Пары"}));
    expect(within(screen.getByLabelText("Португальские слова")).getAllByRole("button")).toHaveLength(4);
    await user.click(screen.getByRole("button",{name:"Все наборы"}));
  await user.click(screen.getByRole("button",{name:"К урокам"}));expect(back).toHaveBeenCalledOnce();
});
it("uses the profile presentation and limits search to individual school words",async()=>{
  const user=userEvent.setup();render(<ProfileLearningContext value={{profile:{id:"child",child:true},learning:emptyProfileLearning(),savingError:false,update:()=>true}}><QuickWords onBack={()=>{}}/></ProfileLearningContext>);
  await user.click(screen.getByRole("button",{name:/В рюкзаке/}));
  expect(screen.getByRole("button",{name:"⌕ Поиск"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"✎ Написать"}));
  expect(screen.getByRole("textbox")).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Все наборы"}));
  await user.click(screen.getByRole("button",{name:/Просьбы в классе/}));
  expect(screen.queryByRole("button",{name:"⌕ Поиск"})).not.toBeInTheDocument();
});
it("selects adult everyday talk and child school/friend phrases without mixing address",async()=>{
  expect(quickSetsFor(false).some(set=>set.id==="child-friends")).toBe(false);
  expect(quickSetsFor(true).some(set=>set.id==="adult-shopping")).toBe(false);
  const teacher=quickWordSets.find(set=>set.id==="child-classroom")!;
  const friend=quickWordSets.find(set=>set.id==="child-friends")!;
  expect(teacher.words.some(word=>word.label==="Abra, por favor.")).toBe(true);
  expect(friend.words.some(word=>word.label==="Abre, por favor.")).toBe(true);
  const user=userEvent.setup();render(<QuickWords child onBack={()=>{}}/>);
  for(const pack of quickSetsFor(true).filter(set=>set.id.startsWith("child-"))){
    await user.click(screen.getByRole("button",{name:new RegExp(pack.title)}));
    if(["child-classroom","child-friends"].includes(pack.id))expect(screen.getByText(pack.cue)).toBeVisible();
      expect(screen.queryByRole("button",{name:"⌕ Поиск"})).not.toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"✎ Написать"}));
    expect(screen.getByRole("textbox")).toBeVisible();
    expect(screen.getByRole("region",{name:"Напиши фразу"})).toBeVisible();
    expect(screen.queryByText(/Можно без артикля/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"Все наборы"}));
  }
});
it("uses one back arrow, keeps focus on screen changes and handles Escape",async()=>{
  const user=userEvent.setup(),back=vi.fn();render(<QuickWords onBack={back}/>);
  await user.click(screen.getByRole("button",{name:/В магазине и кафе/}));
  expect(screen.getByRole("heading",{name:"В магазине и кафе"})).toHaveFocus();
  expect(screen.getByRole("button",{name:"Все наборы"})).toHaveTextContent("←");
  expect(screen.queryByText("Nas compras",{exact:true})).not.toBeInTheDocument();
  fireEvent(screen.getByRole("dialog"),new Event("cancel",{cancelable:true,bubbles:true}));
  expect(screen.getByRole("heading",{name:"Учить слова"})).toHaveFocus();
  fireEvent(screen.getByRole("dialog"),new Event("cancel",{cancelable:true,bubbles:true}));expect(back).toHaveBeenCalledOnce();
});
