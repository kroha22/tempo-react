import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {PreparationPhonics} from "@/features/practice/PreparationPhonics";
import {TestPreparation} from "@/features/practice/TestPreparation";
import {ProfileLearningContext,emptyProfileLearning} from "@/features/practice/profile-learning";
import {preparationPhonics} from "@/features/content/preparation-phonics";

it.each(Object.entries(preparationPhonics))("completes and retries the %s spelling bank",async(id,words)=>{
  const user=userEvent.setup();render(<PreparationPhonics id={id}/>);
  expect(screen.getByRole("button",{name:"Verificar"})).toBeDisabled();
  const size=id==="r-rr"||id==="s-ss"?4:words.length;
  for(let offset=0;offset<words.length;offset+=size){
    for(const word of words.slice(offset,offset+size)){
      expect(word.word).toContain(word.segment);
      await user.click(screen.getByRole("button",{name:`${word.meaning}: ${word.group}`}));
    }
    await user.click(screen.getByRole("button",{name:"Verificar"}));
    if(size===4)await user.click(screen.getByRole("button",{name:offset+size===words.length?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByText(`${words.length} / ${words.length}`)).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Repetir"}));
  expect(screen.getByRole("button",{name:"Verificar"})).toBeDisabled();
});
it("checks alphabet selections exactly and switches to consonants",async()=>{
  const user=userEvent.setup();render(<PreparationPhonics id="letters"/>);
  for(const l of "AEIOU")await user.click(screen.getByRole("button",{name:`${l} ${l.toLowerCase()}`}));
  await user.click(screen.getByRole("button",{name:"Verificar"}));
  expect(screen.getByRole("status")).toHaveTextContent("Correto!");
  await user.click(screen.getByRole("button",{name:"Consoantes"}));
  await user.click(screen.getByRole("button",{name:"Verificar"}));
  expect(screen.getByRole("status")).toHaveTextContent("Compara com a resposta");
  expect(screen.getByRole("status")).toHaveTextContent("K");
});

it("keeps checked rounds, counts mistakes once and resets the whole bank",async()=>{
  const user=userEvent.setup(),update=vi.fn(()=>true);
  render(<ProfileLearningContext value={{profile:{id:"round-test",child:false},learning:emptyProfileLearning(),savingError:false,update}}><PreparationPhonics id="r-rr"/></ProfileLearningContext>);
  const words=preparationPhonics["r-rr"];
  expect(screen.getAllByRole("article")).toHaveLength(4);
  for(let offset=0;offset<12;offset+=4){
    for(const [i,word] of words.slice(offset,offset+4).entries())await user.click(screen.getByRole("button",{name:`${word.meaning}: ${offset===0&&i===0?"rr":word.group}`}));
    await user.click(screen.getByRole("button",{name:"Verificar"}));
    if(offset===4){
      await user.click(screen.getByRole("button",{name:"← Anterior"}));
      expect(screen.getByRole("button",{name:"дорогой: rr"})).toHaveAttribute("aria-pressed","true");
      expect(screen.getByRole("button",{name:"дорогой: rr"})).toBeDisabled();
      expect(screen.getByText("Nesta ronda: 3 / 4")).toBeVisible();
      await user.click(screen.getByRole("button",{name:"Seguinte →"}));
      expect(screen.getByText("Nesta ronda: 4 / 4")).toBeVisible();
    }
    expect(update).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button",{name:offset===8?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByRole("status")).toHaveTextContent("11 / 12");
  expect(update).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("button",{name:"Repetir"}));
  expect(screen.getByText("Ronda 1 / 3 · 4 palavras")).toBeVisible();
  expect(screen.getByRole("button",{name:"Verificar"})).toBeDisabled();
  expect(screen.getByRole("button",{name:"дорогой: rr"})).toHaveAttribute("aria-pressed","false");
});
it("keeps practice answers while switching tabs and has no Portuguese paper task",async()=>{
  const user=userEvent.setup();render(<TestPreparation initialUnitId="r-rr" onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/>);
  expect(screen.getByRole("region",{name:"Слова для прослушивания"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Praticar"}));
  await user.click(screen.getByRole("button",{name:"дорогой: r"}));
  await user.click(screen.getByRole("button",{name:"Teoria"}));
  await user.click(screen.getByRole("button",{name:"Praticar"}));
  expect(screen.getByRole("button",{name:"дорогой: r"})).toHaveAttribute("aria-pressed","true");
  expect(screen.queryByLabelText("Задание на бумаге")).not.toBeInTheDocument();
  expect(within(screen.getByRole("region",{name:"Вставь сочетания букв"})).queryByText("Qual palavra significa um veículo?")).not.toBeInTheDocument();
});

it("offers word hints immediately, skips isolated letters and keeps only the translation control",async()=>{
  const user=userEvent.setup();render(<TestPreparation initialUnitId="letters" onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/>);
  const controls=within(screen.getByRole("group",{name:"Подсказки и перевод"}));
  expect(controls.getAllByRole("button")).toHaveLength(1);
  expect(screen.queryByRole("button",{name:"Перевод: a"})).not.toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Перевод: e"})).not.toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:"Перевод: vogais"}));
  const popup=within(screen.getByRole("dialog",{name:"Перевод слова"}));
  expect(popup.getByText("гласные")).toBeVisible();
  expect(popup.getByRole("button",{name:"Послушать: vogais"})).toBeVisible();
  expect(document.querySelector("button button")).toBeNull();
  expect(screen.getByRole("button",{name:"Буква H: agá"})).toBeVisible();
  expect(screen.getByRole("button",{name:"Буква R: erre"})).toBeVisible();
  expect(screen.getByRole("group",{name:"Подсказки и перевод"})).not.toHaveTextContent("Слушать");
});

it("translates explanations but keeps vocabulary Portuguese with individual hints",async()=>{
  const user=userEvent.setup();render(<TestPreparation initialUnitId="letters" onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/>);
  await user.click(screen.getByRole("button",{name:"⇄ Перевод"}));
  expect(screen.getByText("Полезные слова")).toBeVisible();
  expect(screen.getByRole("button",{name:"Перевод: a vogal"})).toHaveTextContent("a vogal");
  expect(screen.queryByText("гласная буква")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:"Перевод: a vogal"}));
  expect(within(screen.getByRole("dialog",{name:"Перевод слова"})).getByText("гласная буква")).toBeVisible();
  expect(screen.getByRole("button",{name:"Буква H: agá"})).toBeVisible();
});
