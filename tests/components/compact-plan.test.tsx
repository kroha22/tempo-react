import {useState} from "react";
import {fireEvent,render,screen,within} from "@testing-library/react";
import {expect,it} from "vitest";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";
import {PlanWords} from "@/features/learning/plan/PlanWords";
import {PlanSchoolLesson} from "@/features/learning/plan/PlanSchoolLesson";
import {generalPlanUnits,extraUnitLinks,supplementalSteps,planStepHref} from "@/features/learning/plan/model";
import {schoolPlanGroups,schoolLessonHref} from "@/features/learning/plan/school-plan";
import {preparationUnits} from "@/features/content/test-preparation";
import {preparationWords} from "@/features/content/preparation-words";
import {ProfileLearningContext} from "@/features/practice/profile-learning";
import {createProfile,profileStores} from "@/github-pages/profiles";

it("keeps every old book and supplemental href behind collapsed rows and exposes all twenty permanent lessons",()=>{
  render(<GeneralPlan practiceOnly/>);
  const plan=screen.getByRole("region",{name:"Общий план обучения"});
  expect(plan.querySelectorAll("details[open]")).toHaveLength(0);
  expect(screen.getByRole("link",{name:"Слова и повторение"})).toHaveAttribute("href","/learning/plan/words");
  const hrefs=new Set([...plan.querySelectorAll("a")].map(a=>a.getAttribute("href")));
  for(const unit of generalPlanUnits){
    expect(hrefs.has(`/learning/gramatica-ativa/words/u${String(unit.unit).padStart(2,"0")}`)).toBe(true);
    if(unit.lesson)for(const suffix of ["","/explanation"])expect(hrefs.has(`/learning/gramatica-ativa/${unit.lesson.slug}${suffix}`)).toBe(true);
    for(const id of unit.shortLessonIds)expect(hrefs.has(`/learning/practice?lesson=${id}`)).toBe(true);
    for(const link of extraUnitLinks(unit))expect(hrefs.has(link.href)).toBe(true);
  }
  for(const step of supplementalSteps)expect(hrefs.has(planStepHref(step.id)),step.id).toBe(true);
  expect(schoolPlanGroups.flatMap(group=>group.units.map(unit=>unit.id)).sort()).toEqual(preparationUnits.map(unit=>unit.id).sort());
  for(const unit of preparationUnits)expect(hrefs.has(schoolLessonHref(unit.id))).toBe(true);
});
it("keeps saved/review/legacy/deck links together and all twenty old word lists addressable",()=>{
  render(<PlanWords/>);const hrefs=new Set([...document.querySelectorAll("a")].map(a=>a.getAttribute("href")));
  for(const href of ["/learning/quick-words","/learning/gramatica-ativa/review","/learning/gramatica-ativa/saved","/learning/legacy-cards?group=intro","/cards"])expect(hrefs.has(href)).toBe(true);
  for(const unit of preparationUnits){expect(hrefs.has(schoolLessonHref(unit.id,true))).toBe(true);expect(preparationWords(unit.id).length).toBeGreaterThan(0);}
});
it.each(["cooperation","wellbeing"])("switches %s to words and related material without losing a checked answer or prior progress",unitId=>{
  localStorage.clear();const profile=createProfile("Compact plan",false,false),stores=profileStores(profile.id),previous={title:"R/RR",group:"Слова в жизни" as const,correct:12,total:12};
  stores.learning.save({...stores.learning.load(),activities:{"prep:phonics:r-rr":previous}});
  function Session(){const [learning,setLearning]=useState(()=>stores.learning.load());return <ProfileLearningContext value={{profile,learning,savingError:false,update:change=>{const next=change(stores.learning.load());stores.learning.save(next);setLearning(next);return true;}}}><PlanSchoolLesson unitId={unitId}/></ProfileLearningContext>;}
  render(<Session/>);fireEvent.click(screen.getByRole("button",{name:"Praticar"}));
  const unit=preparationUnits.find(row=>row.id===unitId)!,practice=within(screen.getByRole("region",{name:"Практика темы"}));
  fireEvent.click(practice.getByRole("button",{name:`Выбрать вариант ${unit.questions[0].answer+1}`}));fireEvent.click(practice.getByRole("button",{name:"Verificar"}));
  fireEvent.click(screen.getByRole("button",{name:"Учить слова"}));
  expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent(preparationWords(unit.id)[0].label);
  fireEvent.click(screen.getByRole("button",{name:"Урок"}));
  expect(practice.getByRole("button",{name:"Seguinte →"})).toBeVisible();
  expect(practice.getByRole("button",{name:`Выбрать вариант ${unit.questions[0].answer+1}`})).toHaveAttribute("aria-pressed","true");
  fireEvent.click(screen.getByRole("button",{name:new RegExp(unit.targetLabel!)}));
  fireEvent.click(screen.getByRole("button",{name:`← К уроку: ${unit.title[1]}`}));
  expect(practice.getByRole("button",{name:"Seguinte →"})).toBeVisible();
  expect(stores.learning.load().activities?.["prep:phonics:r-rr"]).toEqual(previous);
});
