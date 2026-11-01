import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {PreparationPhonics} from "@/features/practice/PreparationPhonics";
import {TestPreparation} from "@/features/practice/TestPreparation";
import {preparationPhonics} from "@/features/content/preparation-phonics";

it.each(Object.entries(preparationPhonics))("completes and retries the %s spelling bank",async(id,words)=>{
  const user=userEvent.setup();render(<PreparationPhonics id={id}/>);
  expect(screen.getByRole("button",{name:"Verificar"})).toBeDisabled();
  for(const word of words){
    expect(word.word).toContain(word.segment);
    await user.click(screen.getByRole("button",{name:`${word.meaning}: ${word.group}`}));
  }
  await user.click(screen.getByRole("button",{name:"Verificar"}));
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
