import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it} from "vitest";
import {FeelingsLesson} from "@/features/practice/FeelingsLesson";
import {feelingWords} from "@/features/content/feelings-lesson";
import {learningCatalog} from "@/features/content/learning-catalog";
import {FirstSteps} from "@/features/practice/FirstSteps";

it("reuses stable meanings and gives every state an illustration",()=>{
  expect(new Set(feelingWords.map(word=>word.id)).size).toBe(6);
  for(const word of feelingWords){
    expect(word.illustration).toBeDefined();
    const meanings=learningCatalog.meanings.filter(item=>item.legacyWordIds.includes(word.id));
    expect(meanings).toHaveLength(1);
  }
  expect(learningCatalog.usageModules.filter(item=>item.id==="usage:feelings")).toHaveLength(1);
});
it.each([false,true])("completes the same ESTAR practice in both presentations (child=%s)",async(child)=>{
  render(<FeelingsLesson initialChildMode={child}/>);
  const user=userEvent.setup();
  expect(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"})).toHaveAttribute("aria-pressed","true");
  await user.click(screen.getByRole("button",{name:"К фразам с ESTAR →"}));
  expect(screen.getAllByText("A Rita está nervosa.")[0]).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Попробовать составить фразы →"}));
  for(const [index,answer] of ["Estou","cansada","O Miguel está nervoso."].entries()){
    await user.click(screen.getByRole("button",{name:answer}));
    await user.click(screen.getByRole("button",{name:"Проверить"}));
    expect(screen.getAllByRole("status").some(status=>status.textContent?.includes("Верно"))).toBe(true);
    await user.click(screen.getByRole("button",{name:index===2?"Завершить":"Следующая фраза →"}));
  }
  expect(screen.getByRole("heading",{name:child?"Фразы получились!":"Все примеры пройдены"})).toBeVisible();
  if(child){expect(screen.getByText("3 из 3")).toBeVisible();await user.click(screen.getByRole("button",{name:"Посмотреть коллекцию"}));expect(screen.getByLabelText("Практика: впереди")).toBeVisible();}
  else expect(screen.getByRole("link",{name:/ESTAR: формы и практика/})).toHaveAttribute("href","/learning/practice?verb=estar&tense=present");
},15000);
it("opens states as the fifth first-steps lesson",async()=>{
  render(<FirstSteps initialChildMode onBack={()=>{}}/>);
  await userEvent.click(screen.getByRole("button",{name:/^5\. Como me sinto/}));
  expect(screen.getByRole("region",{name:"Как я себя чувствую: слова и ESTAR"})).toBeVisible();
  expect(screen.getByRole("button",{name:"Для детей"})).toHaveAttribute("aria-pressed","true");
});
it.each([false,true])("earns three rewards through shared learning actions and retains them across presentations (child=%s)",async(child)=>{
  render(<FeelingsLesson initialChildMode={child}/>);
  const user=userEvent.setup();
  const rewards=screen.getByRole("region",{name:"Награды темы"});
  expect(within(rewards).getByText("0 / 3")).toBeVisible();
  for(let index=0;index<6;index++){
    await user.click(screen.getByRole("button",{name:"Перевернуть карточку"}));
    // Reopening one translation must not advance the count twice.
    if(index===0){await user.click(screen.getByRole("button",{name:"Перевернуть карточку"}));await user.click(screen.getByRole("button",{name:"Перевернуть карточку"}));expect(within(rewards).getByText("1 / 6 слов")).toBeVisible();}
    if(index<5)await user.click(screen.getByRole("button",{name:"Следующая карточка"}));
  }
  expect(within(rewards).getByLabelText("Знакомство: получено")).toBeVisible();
  expect(screen.queryByRole("button",{name:"Повторить без примеров →"})).toBeNull();
  await user.click(screen.getByRole("button",{name:"Pratica — Попробуй"}));
  async function run(answers:string[]){for(const [index,answer] of answers.entries()){
    await user.click(screen.getByRole("button",{name:answer}));await user.click(screen.getByRole("button",{name:"Проверить"}));await user.click(screen.getByRole("button",{name:index===2?"Завершить":"Следующая фраза →"}));
  }}
  await run(["Sou","cansada","O Miguel está nervoso."]);
  expect(within(rewards).getByLabelText("Практика: впереди")).toBeVisible();
  if(child)expect(screen.getByRole("heading",{name:"Ты потренировался!"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:child?"Повторить фразы":"↺ Повторить фразы"}));
  await run(["Estou","cansada","O Miguel está nervoso."]);
  expect(within(rewards).getByLabelText("Практика: получено")).toBeVisible();
  await user.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  expect(within(rewards).getByText("2 / 3")).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Повторить без примеров →"}));
  expect(screen.queryByRole("region",{name:"Примеры фраз"})).toBeNull();
  await run(["O Miguel está nervoso.","cansada","Estou"]);
  expect(within(rewards).getByText("3 / 3")).toBeVisible();
},25000);
