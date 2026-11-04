import {allGramaticaLessons,type GrammarLesson} from "../../content/gramatica-ativa.ts";
import {firstGrammarUnits} from "../gramatica/first-units.ts";
import {practicePlanSteps,isPracticeStepComplete,type PracticePlanProgress} from "../../practice/plan/model.ts";
import type {LearningProgress} from "../progress/dto.ts";
import {pastGrammarUnits} from "../gramatica/past-units.ts";
import {futureGrammarUnits} from "../gramatica/future-units.ts";

export const generalPlanHref="/learning/plan";
const plannedTitles=["Возможность, знание и обязанность","SER + particípio · пассив","ESTAR + particípio · результат","SE · объявления и пассив","Прямая и косвенная речь","Артикли","ISTO / ISSO / AQUILO","ESTE / ESSE / AQUELE","Притяжательные","Вопросительные","Неопределённые слова","Относительные слова","Прямое дополнение","Косвенное и прямое дополнение","Местоимения после предлогов","Предлоги места","Предлоги движения","Предлоги времени","Глагол + предлог","Прилагательное + предлог","Сравнительная степень","Превосходная степень","TÃO / TANTO","DESDE / HÁ"];
export type PlanUnit={unit:number;title:string;lesson?:GrammarLesson;shortLessonIds:string[]};
const relatedShort:Record<number,string[]>={12:["past"],13:["past"],14:["past"],15:["reflexive"],16:["past"],17:["habit-now"],18:["past"],19:["past"],23:["ir-plans","estar-a"]};
export const generalPlanUnits:PlanUnit[]=Array.from({length:54},(_,index)=>{
  const unit=index+1,lesson=allGramaticaLessons.find(row=>row.unit===unit&&!row.checkpoint);
  const first=firstGrammarUnits.find(row=>row.unit===unit);
  return {unit,title:lesson?.title??plannedTitles[unit-31],...(lesson?{lesson}:{}),shortLessonIds:first?[first.lessonId]:(relatedShort[unit]??[])};
});
export const generalPlanBlocks=[{title:"Основы и настоящее",from:1,to:11},{title:"Прошлое и привычки",from:12,to:17},{title:"Связанные действия",from:18,to:23},{title:"Будущее, инструкции и намерения",from:24,to:30},{title:"Следующие темы книги",from:31,to:54}];
export const supplementalSteps=practicePlanSteps.filter(step=>step.kind!=="grammar");
export const planStepHref=(id:string)=>`${generalPlanHref}/step/${encodeURIComponent(id)}`;
export function extraUnitLinks(unit:PlanUnit){
  const links=unit.unit===7?[{href:"/learning/trazer",title:"Ещё практика TRAZER"}]:(pastGrammarUnits.find(row=>row.unit===unit.unit)?.related??futureGrammarUnits.find(row=>row.unit===unit.unit)?.related??[]);
  return links.filter(link=>!unit.shortLessonIds.some(id=>link.href===`/learning/practice?lesson=${id}`));
}
export function bookPassed(row?:LearningProgress){return row?.flowRevision===1&&row.status==="finished"&&row.canDoResult==="demonstrated";}
export function bookState(lesson:GrammarLesson,row?:LearningProgress){
  if(!row||row.lessonId!==lesson.id||row.flowRevision!==1)return "new" as const;
  if(row.snapshot?.grammar)return "active" as const;
  if(row.status==="finished")return (row.snapshot?.canDoResult??row.canDoResult)==="demonstrated"?"done" as const:"review" as const;
  return row.status==="active"?"active" as const:"new" as const;
}
export function generalPlanSummary(rows:readonly LearningProgress[],practice?:PracticePlanProgress){
  const ready=generalPlanUnits.filter((unit):unit is PlanUnit&{lesson:GrammarLesson}=>!!unit.lesson);
  const rowById=new Map(rows.map(row=>[row.lessonId,row]));
  const active=ready.filter(unit=>bookState(unit.lesson,rowById.get(unit.lesson.id))==="active").sort((a,b)=>(rowById.get(b.lesson.id)?.updatedAt??0)-(rowById.get(a.lesson.id)?.updatedAt??0));
  const done=ready.filter(unit=>bookPassed(rowById.get(unit.lesson.id)));
  const review=ready.filter(unit=>bookState(unit.lesson,rowById.get(unit.lesson.id))==="review");
  const next=active[0]??ready.find(unit=>bookState(unit.lesson,rowById.get(unit.lesson.id))==="new")??review[0]??ready[0];
  return {ready,done,review,next,rowById,supplementalDone:practice?supplementalSteps.filter(step=>isPracticeStepComplete(practice,step)):[]};
}
