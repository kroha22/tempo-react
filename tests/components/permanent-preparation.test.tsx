import {useState} from "react";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";
import {preparationUnits} from "@/features/content/test-preparation";
import {schoolLessonSections,sectionForUnit,permanentLessonTopic} from "@/features/content/permanent-preparation-lessons";
import {readingLessonIds} from "@/features/content/reading-lessons";
import {createProfile,profileStores} from "@/github-pages/profiles";
import {ProfileLearningContext} from "@/features/practice/profile-learning";

it("assigns exactly one permanent home to all twenty existing unit IDs",()=>{
  const ids=[...readingLessonIds,...schoolLessonSections.flatMap(section=>section.unitIds)];
  expect(ids).toHaveLength(20);expect(new Set(ids).size).toBe(20);
  expect([...ids].sort()).toEqual(preparationUnits.map(unit=>unit.id).sort());
});

it.each(preparationUnits)("reaches $id from the catalogue and keeps its original result after remount",unit=>{
  localStorage.clear();const profile=createProfile("F03",false,false),stores=profileStores(profile.id);
  const previous={title:"R/RR",group:"Слова в жизни",correct:12,total:12} as const;
  stores.learning.save({...stores.learning.load(),activities:{"prep:phonics:r-rr":previous}});
  function Session({resume}:{resume?:string}){
    const [learning,setLearning]=useState(()=>stores.learning.load());
    return <ProfileLearningContext value={{profile,learning,savingError:false,update:change=>{const next=change(stores.learning.load());stores.learning.save(next);setLearning(next);return true;}}}><VocabularyHub initialTopicId={resume} onOpenCards={vi.fn()}/></ProfileLearningContext>;
  }
  const view=render(<Session/>);
  expect(screen.queryByRole("button",{name:/Подготовка к тесту/})).not.toBeInTheDocument();
  if(unit.subject==="portuguese"){
    fireEvent.click(screen.getByRole("button",{name:/Буквы и чтение/}));
    fireEvent.click(screen.getByRole("button",{name:new RegExp(unit.title[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))}));
    expect(screen.getByRole("button",{name:"Praticar"})).toBeVisible();
  }else{
    const section=sectionForUnit(unit.id)!;
    const entry=document.querySelector<HTMLButtonElement>(`button[data-topic-id="${section.topicId}"]`);
    expect(entry).not.toBeNull();
    const library=entry?.closest("details");if(library&&!library.open)fireEvent.click(within(library).getByText("Отдельные материалы времени и распорядка"));
    fireEvent.click(entry!);
    fireEvent.click(within(screen.getByRole("region",{name:"Постоянные уроки темы"})).getByRole("button",{name:new RegExp(unit.title[1])}));
    expect(screen.getByRole("heading",{level:1,name:section.title})).toHaveFocus();
    fireEvent.click(screen.getByRole("button",{name:"Praticar"}));
    const practice=within(screen.getByRole("region",{name:"Практика темы"}));
    for(const [index,question] of unit.questions.entries()){
      fireEvent.click(practice.getByRole("button",{name:`Выбрать вариант ${question.answer+1}`}));
      fireEvent.click(practice.getByRole("button",{name:"Verificar"}));
      fireEvent.click(practice.getByRole("button",{name:index===unit.questions.length-1?"Concluir":"Seguinte →"}));
    }
    expect(stores.learning.load().activities?.[`prep:${unit.id}`]).toMatchObject({correct:unit.questions.length,total:unit.questions.length});
    expect(stores.learning.load().lastTopicId).toBe(permanentLessonTopic(unit.id));
    view.unmount();render(<Session resume={stores.learning.load().lastTopicId??undefined}/>);
    expect(screen.getByRole("button",{name:"← К теме"})).toBeVisible();
    expect(stores.learning.load().activities?.[`prep:${unit.id}`]?.correct).toBe(unit.questions.length);
  }
  expect(stores.learning.load().activities?.["prep:phonics:r-rr"]).toEqual(previous);
});

it("restores the old school:preparation continuation without resetting existing results",()=>{
  localStorage.clear();const profile=createProfile("Старое продолжение",false,false),stores=profileStores(profile.id);
  const learning={...stores.learning.load(),lastTopicId:"school:preparation",activities:{"prep:cooperation":{title:"Общение",group:"Слова в жизни" as const,correct:2,total:2}}};
  stores.learning.save(learning);
  render(<VocabularyHub initialTopicId={stores.learning.load().lastTopicId} onOpenCards={vi.fn()}/>);
  expect(screen.getByText("6 тем · 20 всего")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:/^Conviver e resolver conflitos/}));
  expect(screen.getByRole("button",{name:"Praticar"})).toBeVisible();
  expect(stores.learning.load()).toEqual(learning);
});

it.each(["cooperation","wellbeing"])("returns from %s target to the same permanent lesson and unfinished answer",id=>{
  const unit=preparationUnits.find(unit=>unit.id===id)!;
  render(<VocabularyHub initialTopicId={permanentLessonTopic(id)} onOpenCards={vi.fn()}/>);
  fireEvent.click(screen.getByRole("button",{name:"Praticar"}));
  fireEvent.click(screen.getByRole("button",{name:`Выбрать вариант ${unit.questions[0].answer+1}`}));
  fireEvent.click(screen.getByRole("button",{name:"Verificar"}));
  fireEvent.click(screen.getByRole("button",{name:new RegExp(unit.targetLabel!)}));
  if(id==="cooperation")fireEvent.click(screen.getByRole("button",{name:/Como me sinto.*Rever palavras/}));
  fireEvent.click(screen.getByRole("button",{name:"Вернуться к уроку"}));
  expect(screen.getByRole("button",{name:"Seguinte →"})).toBeVisible();
  expect(screen.getByRole("button",{name:`Выбрать вариант ${unit.questions[0].answer+1}`})).toHaveAttribute("aria-pressed","true");
});
