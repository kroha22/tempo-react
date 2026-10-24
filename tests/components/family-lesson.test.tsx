import {fireEvent,render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";
import {FirstSteps} from "@/features/practice/FirstSteps";
import {learningCatalog} from "@/features/content/learning-catalog";
import {topicExpansion} from "@/features/content/vocabulary-catalog";
import {closeFamilyKeys} from "@/features/content/family-lesson";
import {FamilyLesson} from "@/features/practice/FamilyLesson";
import {professionWords,professionForm} from "@/features/content/identity";

it.each([false,true])("explains possessives and preserves practice when changing presentation (child=%s)",child=>{
  render(<FamilyLesson initialChildMode={child}/>);
  fireEvent.click(screen.getByRole("button",{name:"Meu / teu — Чей? Чья?"}));
  for(const text of ["o meu pai","a minha mãe","o teu irmão","a tua irmã"])expect(screen.getByText(text,{selector:"strong"})).toBeVisible();
  expect(screen.queryByRole("region",{name:"Общее объяснение SER и ESTAR"})).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Pratica — Попробуй"}));
  const exercises=learningCatalog.usageModules.find(item=>item.id==="usage:family")!.exercises;
  for(const exercise of exercises.slice(0,4)){
    fireEvent.click(screen.getByRole("button",{name:exercise.options.find(option=>option.id===exercise.correctOptionId)!.text}));
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
    fireEvent.click(screen.getByRole("button",{name:"Следующая фраза →"}));
  }
  fireEvent.click(screen.getByRole("button",{name:"minha"}));
  fireEvent.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  expect(screen.getByRole("button",{name:"minha"})).toHaveAttribute("aria-pressed","true");
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
  expect(screen.getAllByRole("status").some(status=>status.textContent?.includes("Пол говорящего здесь не определяет форму"))).toBe(true);
});

it("references the common profession meanings and generated gender forms",()=>{
  const usage=learningCatalog.usageModules.find(item=>item.id==="usage:family")!;
  for(const word of professionWords){const meaning=learningCatalog.meanings.find(item=>item.legacyWordIds.includes(word.id))!;expect(usage.reviewedMeaningIds).toContain(meaning.id);}
  expect(usage.exercises).toHaveLength(10);
  expect(usage.exercises.find(item=>item.id==="cloze:family-cook")!.options.map(item=>item.text)).toContain(professionForm("cozinheiro","male"));
  expect(usage.examples.some(example=>example.portuguese===`A tua irmã é ${professionForm("engenheiro","female")}.`)).toBe(true);
});

it("reuses the six family meanings and the existing usage identity",()=>{
  const modules=learningCatalog.usageModules.filter(item=>item.id==="usage:family");
  expect(modules).toHaveLength(1);
  for(const key of closeFamilyKeys){const word=topicExpansion.byKey.get(key)!;const meaning=learningCatalog.meanings.find(item=>item.legacyWordIds.includes(word.id))!;expect(modules[0].reviewedMeaningIds).toContain(meaning.id);}
  expect(modules[0].exercises.map(item=>item.id)).toContain("cloze:family-mae");
});
it.each([false,true])("opens the family topic and completes the shared phrase flow (child=%s)",async(child)=>{
  render(<VocabularyHub initialChildMode={child} onOpenCards={vi.fn()}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole("button",{name:/^Família e amigos/}));
  expect(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"})).toHaveAttribute("aria-pressed","true");
  expect(screen.getByRole("img",{name:"Мальчик в очках читает книгу вместе с мамой и папой"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"К фразам с SER →"}));
  expect(screen.getAllByText("A minha mãe é professora.",{selector:"strong"})[0]).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Попробовать составить фразы →"}));
  const exercises=learningCatalog.usageModules.find(item=>item.id==="usage:family")!.exercises;
  for(const [index,exercise] of exercises.entries()){
    const answer=exercise.options.find(option=>option.id===exercise.correctOptionId)!.text;
    await user.click(screen.getByRole("button",{name:answer}));
    if(index===2){await user.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));expect(screen.getByRole("button",{name:answer})).toHaveAttribute("aria-pressed","true");await user.click(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"}));}
    await user.click(screen.getByRole("button",{name:"Проверить"}));
    expect(screen.getAllByRole("status").some(status=>status.textContent?.includes("Верно"))).toBe(true);
    await user.click(screen.getByRole("button",{name:index===exercises.length-1?"Завершить":"Следующая фраза →"}));
  }
  expect(screen.getByRole("heading",{name:"Все примеры пройдены"})).toBeVisible();
},15000);
it("opens the same family lesson from the first steps",async()=>{
  render(<FirstSteps initialChildMode onBack={vi.fn()}/>);
  await userEvent.click(screen.getByRole("button",{name:/^4\. A minha família/}));
  expect(screen.getByRole("region",{name:"Моя семья: слова и SER"})).toBeVisible();
  expect(screen.getByRole("button",{name:"Для детей"})).toHaveAttribute("aria-pressed","true");
});
