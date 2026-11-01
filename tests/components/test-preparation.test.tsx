import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";
import {preparationUnits} from "@/features/content/test-preparation";
import {TestPreparation} from "@/features/practice/TestPreparation";
import {catalogGroups} from "@/features/content/learning-catalog-view";
import {vocabularySets} from "@/features/content/vocabulary-model";
import {emptyProfileLearning,ProfileLearningContext} from "@/features/practice/profile-learning";
import {recordActivity} from "@/features/practice/learning-rewards";

it("covers every preparation topic with a valid check and paper handoff",()=>{
  expect(preparationUnits).toHaveLength(20);
  expect(new Set(preparationUnits.map(u=>u.id)).size).toBe(20);
  expect(preparationUnits.flatMap(u=>u.questions)).toHaveLength(40);
  for(const unit of preparationUnits){
    expect(unit.paper[0]).toMatch(/IMG_01/);
    for(const question of unit.questions){
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(question.options.length);
    }
    if(unit.target){
      const topic=catalogGroups.find(g=>g.id===unit.target!.topicId);
      expect(topic,unit.id).toBeDefined();
      if(unit.target.collectionId)expect(vocabularySets(topic!).some(s=>s.id===unit.target!.collectionId),unit.id).toBe(true);
    }
  }
  expect(preparationUnits.find(u=>u.id==="prevention")?.notice).toBeDefined();
  expect(preparationUnits.find(u=>u.id==="timeline")?.notice).toBeDefined();
});

it.each(preparationUnits)("child completes $id, sees feedback, retries and reaches the exact paper instruction",async unit=>{
  const user=userEvent.setup();
  render(<TestPreparation initialChildMode initialUnitId={unit.id} onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/>);
  await user.click(screen.getByRole("button",{name:"⇄ Перевод"}));
  expect(screen.getByRole("heading",{name:unit.title[1]})).toBeVisible();
  expect(screen.getByText(unit.rule[1])).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Практика"}));
  expect(screen.getByRole("button",{name:"Verificar"})).toBeDisabled();
  // First attempt deliberately gets one answer wrong; it must not be counted as correct.
  for(let i=0;i<unit.questions.length;i++){
    const q=unit.questions[i];
    const choice=i===0?(q.answer+1)%q.options.length:q.answer;
    await user.click(screen.getByRole("button",{name:`Выбрать вариант ${choice+1}`}));
    await user.click(screen.getByRole("button",{name:"Verificar"}));
    expect(screen.getByRole("status")).toHaveTextContent(i===0?"Vê a explicação":"Correto!");
    expect(screen.getByRole("status")).toHaveTextContent(q.feedback[0]);
    await user.click(screen.getByRole("button",{name:i===unit.questions.length-1?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByRole("region",{name:"Результат занятия"})).toHaveTextContent("1 / 2");
  await user.click(screen.getByRole("button",{name:"Repetir a prática"}));
  for(let i=0;i<unit.questions.length;i++){
    await user.click(screen.getByRole("button",{name:`Выбрать вариант ${unit.questions[i].answer+1}`}));
    await user.click(screen.getByRole("button",{name:"Verificar"}));
    await user.click(screen.getByRole("button",{name:i===unit.questions.length-1?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByRole("region",{name:"Результат занятия"})).toHaveTextContent("2 / 2");
  await user.click(screen.getByRole("button",{name:"Agora no papel →"}));
  expect(screen.getByText(unit.paper[0])).toBeVisible();
  if(unit.notice)expect(screen.getByText(unit.notice[0])).toBeVisible();
  await user.click(screen.getByRole("button",{name:"⇄ Перевод"}));
  expect(screen.getByText(unit.paper[1])).toBeVisible();
  if(unit.notice)expect(screen.getByText(unit.notice[1])).toBeVisible();
});

it("labels the retained best score honestly after a lower-scoring retry",async()=>{
  const result={title:"Алфавит",group:"Слова в жизни" as const,correct:2,total:2};
  const learning=recordActivity(recordActivity(emptyProfileLearning(),"prep:letters",result),"prep:letters",{...result,correct:1});
  const user=userEvent.setup();
  render(<ProfileLearningContext value={{profile:{id:"qa",child:true},learning,savingError:false,update:()=>true}}><TestPreparation initialUnitId={null} onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/></ProfileLearningContext>);
  await user.click(screen.getByRole("button",{name:"Português"}));
  expect(screen.getByRole("button",{name:/O alfabeto/})).toHaveTextContent("Лучший результат: 2/2");
  expect(screen.queryByText(/Последняя тренировка/)).not.toBeInTheDocument();
});

it.each([false,true])("opens existing clocks, returns to preparation and completes the paper handoff (child=%s)",async child=>{
  const user=userEvent.setup();
  render(<VocabularyHub initialChildMode={child} onOpenCards={vi.fn()}/>);
  await user.click(screen.getByRole("button",{name:/Preparar o teste/}));
  let region=screen.getByRole("region",{name:"Набор подготовки к проверочной"});
  await user.click(within(region).getByRole("button",{name:"Matemática"}));
  const hours=preparationUnits.find(u=>u.id==="hours")!;
  await user.click(within(region).getByRole("button",{name:new RegExp(hours.title[0])}));
  await user.click(within(region).getByRole("button",{name:new RegExp(hours.targetLabel!)}));
  expect(screen.getByRole("region",{name:"Время и календарь: уроки"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"← Вернуться к подготовке"}));
  region=screen.getByRole("region",{name:"Набор подготовки к проверочной"});
  await user.click(within(region).getByRole("button",{name:"Praticar"}));
  for(let i=0;i<hours.questions.length;i++){
    await user.click(within(region).getByRole("button",{name:`Выбрать вариант ${hours.questions[i].answer+1}`}));
    await user.click(within(region).getByRole("button",{name:"Verificar"}));
    await user.click(within(region).getByRole("button",{name:i===hours.questions.length-1?"Concluir":"Seguinte →"}));
  }
  expect(within(region).getByText("Revisão concluída")).toBeVisible();
  await user.click(within(region).getByRole("button",{name:"Agora no papel →"}));
  expect(within(region).getByText(hours.paper[0])).toBeVisible();
});
