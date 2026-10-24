import {fireEvent,render,screen,within} from "@testing-library/react";
import {expect,test,vi} from "vitest";
import {FirstSteps} from "@/features/practice/FirstSteps";
import {greetingSets} from "@/features/content/greetings";
import {relatedDestination} from "@/github-pages/RelatedLearning";

test.each([false,true])("all four situations share practice and retain answers across presentation changes (child=%s)",child=>{
  render(<FirstSteps topicStep={0} onBack={vi.fn()} initialChildMode={child}/>);
  expect(screen.getByRole("heading",{name:"Olá! — Приветствия и общение"})).toBeVisible();
  for(const set of greetingSets){
    fireEvent.click(screen.getByRole("button",{name:`${set.pt} ${set.ru}`}));
    for(const phrase of set.phrases)expect(screen.getByText(phrase.pt,{selector:"strong"})).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:"Практика диалога"}));
    for(const check of set.checks){
      const task=within(screen.getByRole("region",{name:check.prompt}));
      expect(task.getByRole("button",{name:"Проверить ответ"})).toBeDisabled();
      fireEvent.click(task.getByRole("button",{name:check.options[(check.answer+1)%check.options.length]}));
      fireEvent.click(task.getByRole("button",{name:"Проверить ответ"}));
      expect(task.getByRole("status")).toHaveTextContent("Попробуй ещё раз");
      fireEvent.click(task.getByRole("button",{name:check.options[check.answer]}));
      expect(task.queryByRole("status")).toBeNull();
      fireEvent.click(task.getByRole("button",{name:"Проверить ответ"}));
      expect(task.getByRole("status")).toHaveTextContent("✓ Верно");
    }
  }
  fireEvent.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  for(const check of greetingSets[3].checks)expect(within(screen.getByRole("region",{name:check.prompt})).getByRole("status")).toHaveTextContent("✓ Верно");
});

test("the chamo-me note explains pronouns and opens the existing reflexive lesson without a fragment route",()=>{
  render(<FirstSteps topicStep={0} onBack={vi.fn()}/>);
  fireEvent.click(screen.getByRole("button",{name:"Muito prazer Представиться"}));
  fireEvent.click(screen.getByRole("button",{name:"Почему в chamo-me есть me?"}));
  const summary=screen.getByText("Chamo-me*: что значит me?");
  expect(summary.closest("details")).toHaveAttribute("open");
  expect(summary).toHaveFocus();
  const link=screen.getByRole("link",{name:"Возвратные глаголы: как работают me, te, se →"});
  expect(link).toHaveAttribute("href","/learning/practice?lesson=reflexive");
  expect(relatedDestination(link.getAttribute("href")!)).not.toBeNull();
});
