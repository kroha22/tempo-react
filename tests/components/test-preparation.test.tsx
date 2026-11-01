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
import {PreparationMonths} from "@/features/practice/PreparationMonths";
import {calendarMonths} from "@/features/content/calendar";
import {preparationGuides} from "@/features/content/test-preparation-guides";

it("covers every preparation topic with a valid check and paper handoff",()=>{
  expect(preparationUnits).toHaveLength(20);
  expect(new Set(preparationUnits.map(u=>u.id)).size).toBe(20);
  expect(preparationUnits.flatMap(u=>u.questions)).toHaveLength(40);
  for(const unit of preparationUnits){
    expect(preparationGuides[unit.id],unit.id).toBeDefined();
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
  expect(screen.getByText(unit.paper[1])).toBeVisible();
  expect(screen.queryByRole("navigation",{name:"Блок подготовки"})).not.toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:"⇄ Перевод"}));
  const quiz=within(screen.getByRole("region",{name:"Практика темы"}));
  expect(quiz.getByRole("button",{name:"Verificar"})).toBeDisabled();
  // First attempt deliberately gets one answer wrong; it must not be counted as correct.
  for(let i=0;i<unit.questions.length;i++){
    const q=unit.questions[i];
    const choice=i===0?(q.answer+1)%q.options.length:q.answer;
    await user.click(quiz.getByRole("button",{name:`Выбрать вариант ${choice+1}`}));
    await user.click(quiz.getByRole("button",{name:"Verificar"}));
    expect(quiz.getByRole("status")).toHaveTextContent(i===0?"Vê a explicação":"Correto!");
    expect(quiz.getByRole("status")).toHaveTextContent(q.feedback[0]);
    await user.click(quiz.getByRole("button",{name:i===unit.questions.length-1?"Concluir":"Seguinte →"}));
  }
  expect(screen.getByRole("region",{name:"Результат занятия"})).toHaveTextContent("1 / 2");
  await user.click(screen.getByRole("button",{name:"Repetir a prática"}));
  for(let i=0;i<unit.questions.length;i++){
    await user.click(quiz.getByRole("button",{name:`Выбрать вариант ${unit.questions[i].answer+1}`}));
    await user.click(quiz.getByRole("button",{name:"Verificar"}));
    await user.click(quiz.getByRole("button",{name:i===unit.questions.length-1?"Concluir":"Seguinte →"}));
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

it.each([false,true])("embeds existing clocks and keeps explanation, quiz and paper together (child=%s)",async child=>{
  const user=userEvent.setup();
  render(<VocabularyHub initialChildMode={child} onOpenCards={vi.fn()}/>);
  await user.click(screen.getByRole("button",{name:/Preparar o teste/}));
  const region=screen.getByRole("region",{name:"Набор подготовки к проверочной"});
  await user.click(within(region).getByRole("button",{name:"Matemática"}));
  const hours=preparationUnits.find(u=>u.id==="hours")!;
  await user.click(within(region).getByRole("button",{name:new RegExp(hours.title[0])}));
  expect(screen.queryByRole("button",{name:new RegExp(hours.targetLabel!)})).not.toBeInTheDocument();
  expect(within(region).getByText(hours.paper[0])).toBeVisible();
  const clock=within(screen.getByRole("region",{name:"Часы: короткие блоки"}));
  await user.click(clock.getByRole("button",{name:"Ler o relógio"}));
  await user.type(clock.getByLabelText("Escreve a hora em português"),"São sete horas.");
  await user.click(clock.getByRole("button",{name:"Verificar"}));
  expect(clock.getByRole("status")).toHaveTextContent("Correto!");
  const quiz=within(screen.getByRole("region",{name:"Практика темы"}));
  for(let i=0;i<hours.questions.length;i++){
    await user.click(quiz.getByRole("button",{name:`Выбрать вариант ${hours.questions[i].answer+1}`}));
    await user.click(quiz.getByRole("button",{name:"Verificar"}));
    await user.click(quiz.getByRole("button",{name:i===hours.questions.length-1?"Concluir":"Seguinte →"}));
  }
  expect(within(region).getByText("Revisão concluída")).toBeVisible();
  await user.click(within(region).getByRole("button",{name:"Agora no papel →"}));
  expect(within(region).getByText(hours.paper[0])).toBeVisible();
});

it("sorts shuffled months, corrects an incorrect order and checks all 31-day selections",async()=>{
  const user=userEvent.setup();render(<PreparationMonths/>);
  const pool=within(screen.getByRole("group",{name:"Перепутанные месяцы"}));
  for(const [pt] of [...calendarMonths].reverse())await user.click(pool.getByRole("button",{name:pt}));
  await user.click(screen.getByRole("button",{name:"Verificar a ordem"}));
  expect(screen.getByRole("status")).toHaveTextContent("0 de 12");
  await user.click(screen.getByRole("button",{name:"Recomeçar"}));
  for(const [pt] of calendarMonths)await user.click(pool.getByRole("button",{name:pt}));
  await user.click(screen.getByRole("button",{name:"Verificar a ordem"}));
  expect(screen.getByText(/Os 12 meses estão no lugar certo!/)).toBeVisible();
  for(const i of [0,2,4,6,7,9,11,1])await user.click(screen.getByRole("checkbox",{name:`31 dias: ${calendarMonths[i][0]}`}));
  await user.click(screen.getByRole("button",{name:"Verificar os meses com 31 dias"}));
  expect(screen.getByText(/Confere as marcas/)).toBeVisible();
  await user.click(screen.getByRole("checkbox",{name:"31 dias: fevereiro"}));
  await user.click(screen.getByRole("button",{name:"Verificar os meses com 31 dias"}));
  expect(screen.getByText(/Correto! Todos os meses estão bem assinalados./)).toBeVisible();
});

it("embeds the existing organ diagram with all six matching targets",()=>{
  render(<TestPreparation initialUnitId="organs" initialChildMode onUnitChange={vi.fn()} onBack={vi.fn()} onOpen={vi.fn()}/>);
  const diagram=within(screen.getByRole("region",{name:"Органы: схема и практика"}));
  expect(diagram.getByRole("group",{name:"Слова для расстановки"})).toBeVisible();
  expect(diagram.getAllByRole("button",{name:/Квадрат \d+, пустой/})).toHaveLength(6);
  expect(screen.getByText(preparationUnits.find(u=>u.id==="organs")!.paper[0])).toBeVisible();
});
