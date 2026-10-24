import {fireEvent,render,screen,within} from "@testing-library/react";
import {expect,test,vi} from "vitest";
import {FirstSteps} from "@/features/practice/FirstSteps";
import {FamilyLesson} from "@/features/practice/FamilyLesson";
import {identitySets} from "@/features/content/identity";

test.each([false,true])("all identity sets share phrase answers and distinguish verb and word errors (child=%s)",child=>{
  render(<FirstSteps topicStep={1} initialChildMode={child} onBack={vi.fn()}/>);
  expect(screen.getByRole("region",{name:"Кто я: слова и фразы с SER"})).toBeVisible();
  expect(screen.getByRole("link",{name:"SER / ESTAR: общее объяснение и формы →"})).toBeVisible();
  expect(screen.queryByRole("region",{name:"Общее объяснение SER и ESTAR"})).toBeNull();
  for(const set of identitySets){
    fireEvent.click(screen.getByRole("button",{name:`${set.title} — ${set.ru}`}));
    expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent(set.words[0].label);
    fireEvent.click(screen.getByRole("button",{name:"Примеры фраз"}));
    for(const example of set.examples)expect(screen.getByText(example.pt,{selector:"strong"})).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:"Собери фразу"}));
    set.tasks.forEach((task,index)=>{
      fireEvent.click(screen.getByRole("button",{name:`Задание ${index+1} из 3`}));
      const region=within(screen.getByRole("region",{name:task.prompt}));
      expect(region.getByRole("button",{name:"Проверить фразу"})).toBeDisabled();
      fireEvent.click(region.getByRole("button",{name:task.verb==="sou"?"é":"sou"}));
      fireEvent.click(region.getByRole("button",{name:task.ending}));
      fireEvent.click(region.getByRole("button",{name:"Проверить фразу"}));
      expect(region.getByRole("status")).toHaveTextContent(task.verbHint);
      fireEvent.click(region.getByRole("button",{name:task.verb}));
      fireEvent.click(region.getByRole("button",{name:task.options.find(value=>value!==task.ending)!}));
      fireEvent.click(region.getByRole("button",{name:"Проверить фразу"}));
      expect(region.getByRole("status")).toHaveTextContent(task.wordHint);
      fireEvent.click(region.getByRole("button",{name:task.ending}));
      fireEvent.click(region.getByRole("button",{name:"Проверить фразу"}));
      expect(region.getByRole("status")).toHaveTextContent("✓ Верно!");
      expect(region.getByRole("status")).toHaveTextContent(task.translation);
    });
  }
  fireEvent.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  expect(screen.getAllByRole("status").some(item=>item.textContent?.includes("✓ Верно!"))).toBe(true);
});

test("family reuses the profession cards without another grammar explanation",()=>{
  render(<FamilyLesson/>);
  fireEvent.click(screen.getByRole("button",{name:"Profissões — Профессии"}));
  expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent("o estudante / a estudante");
  fireEvent.click(screen.getByRole("button",{name:"Следующая карточка"}));
  expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent("o professor / a professora");
});
