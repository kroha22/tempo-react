"use client";
import {useContext} from "react";
import {ChildPracticePlan} from "../../practice/plan/ChildPracticePlan";
import {usePracticePlan} from "../../practice/plan/PracticePlanContext";
import {RelatedLearningNavigation} from "../../practice/RelatedLearningNavigation";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {generalPlanHref,supplementalSteps} from "./model";

export function PlanActivity({id}:{id:string}){
  const navigate=useContext(RelatedLearningNavigation),plan=usePracticePlan();
  const back=()=>{if(navigate)navigate(generalPlanHref);else window.location.assign(generalPlanHref);};
  if(!supplementalSteps.some(step=>step.id===id))return <section><h1>Занятие не найдено</h1><LegacyLessonLink href={generalPlanHref}>К общему плану →</LegacyLessonLink></section>;
  if(!plan)return <section><h1>Занятие общего плана</h1><p>Откройте профиль, чтобы сохранить результат этого занятия.</p><LegacyLessonLink href={generalPlanHref}>К общему плану →</LegacyLessonLink></section>;
  return <ChildPracticePlan key={id} initialStepId={id} onOpenCatalog={()=>navigate?navigate("/learning/topics"):window.location.assign("/learning/topics")} onBackToPlan={back}/>;
}
