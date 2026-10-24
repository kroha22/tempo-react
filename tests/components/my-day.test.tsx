import {render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";

it("connects the daily routine to the existing clock and sentence practice",async()=>{
  render(<VocabularyHub onOpenCards={vi.fn()}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole("button",{name:/^O meu dia.*Мой день/}));
  expect(screen.getByRole("region",{name:"Мой день: время и действия"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:/^17:00/}));
  expect(screen.getByText("Я возвращаюсь домой в пять вечера.",{selector:"p"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:/^2 · Horas/}));
  expect(screen.getByRole("navigation",{name:"Упражнения с часами"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Назови время"}));
  await user.type(screen.getByLabelText("Напиши время по-португальски"),"São sete horas.");
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  expect(screen.getByRole("status")).toHaveTextContent("Верно");
  await user.click(screen.getByRole("button",{name:/^Frases/}));
  expect(screen.getByRole("link",{name:/acordar — настоящее время/})).toHaveAttribute("href","/learning/practice?verb=acordar&tense=present");
});
