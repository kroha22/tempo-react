import { shortGrammarLessons } from "../../content/short-grammar-lessons.ts";
import { topicExpansion } from "../../content/vocabulary-catalog.ts";
import { topicSetDefinitions } from "../../content/topic-expansion.ts";
import { everydayLessons, type EverydayLessonId } from "../../content/everyday-lessons.ts";

type StepBase = { id:string; title:string; revision:number; minutes:number };
export type PracticePlanStep = StepBase & (
  | {kind:"grammar";lessonId:string}
  | {kind:"words";setId:string;wordIds:readonly string[]}
  | {kind:"everyday";lessonId:EverydayLessonId}
);
export type PracticePlanChapter = {id:string;title:string;description:string;steps:readonly PracticePlanStep[]};
const grammar = (id:string):PracticePlanStep => {
  const lesson=shortGrammarLessons.find(item=>item.id===id);
  if(!lesson)throw new Error(`Unknown grammar lesson: ${id}`);
  return {id:`practice:grammar:${id}`,title:`${lesson.title} · ${lesson.subtitle}`,revision:1,minutes:5,kind:"grammar",lessonId:id};
};
const words = (id:string):PracticePlanStep => {
  const set=topicSetDefinitions.find(item=>item.id===id);
  if(!set)throw new Error(`Unknown word set: ${id}`);
  return {id:`practice:words:${id}`,title:set.title,revision:1,minutes:5,kind:"words",setId:id,wordIds:set.keys.map(key=>topicExpansion.byKey.get(key)!.id)};
};
const everyday = (id:EverydayLessonId):PracticePlanStep => ({id:`practice:everyday:${id}`,title:everydayLessons[id].title,revision:1,minutes:6,kind:"everyday",lessonId:id});
export const practicePlanChapters: readonly PracticePlanChapter[] = [
  {id:"first-phrases",title:"Первые фразы",description:"Кто это, где находится и что у меня есть",steps:[grammar("ser"),grammar("estar"),grammar("ser-estar"),grammar("ter")]},
  {id:"family-food",title:"Семья и еда",description:"Назови близких и расскажи, что тебе нравится",steps:[words("expansion-family-close"),words("expansion-family-relatives"),words("expansion-food-fruit"),words("expansion-food-meals"),words("expansion-food-table"),everyday("likes")]},
  {id:"body",title:"Тело и движения",description:"Узнай части тела и свяжи их с действиями",steps:[words("expansion-body-face"),words("expansion-body-movement"),everyday("body")]},
  {id:"actions",title:"Действия сейчас",description:"Постепенно разберись с формами глаголов",steps:[grammar("present-ar"),grammar("present-er"),grammar("present-er-irregular"),grammar("present-ir"),grammar("present-ir-special"),grammar("estar-a"),grammar("habit-now")]},
  {id:"stories",title:"Планы и истории",description:"Расскажи о себе, планах и прошлом",steps:[grammar("ir-plans"),grammar("reflexive"),grammar("past")]},
];
export const practicePlanSteps=practicePlanChapters.flatMap(chapter=>chapter.steps);
export type PracticePlanProgress = {version:1;lastStepId:string|null;completed:Record<string,{revision:number;needsReview:boolean}>};
export type PracticePlanAction = {type:"visit";stepId:string}|{type:"complete";stepId:string;needsReview:boolean};
export const emptyPracticePlanProgress = ():PracticePlanProgress => ({version:1,lastStepId:null,completed:{}});
export function parsePracticePlanProgress(value:unknown):PracticePlanProgress {
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Invalid practice plan");
  const raw=value as Record<string,unknown>;
  const validId=(id:unknown)=>typeof id==="string"&&/^practice:[a-z0-9:-]{1,180}$/.test(id);
  if(raw.version!==1||!(raw.lastStepId===null||validId(raw.lastStepId))||!raw.completed||typeof raw.completed!=="object"||Array.isArray(raw.completed))throw new Error("Invalid practice plan");
  const entries=Object.entries(raw.completed);
  if(entries.length>1000)throw new Error("Practice plan too large");
  const completed:PracticePlanProgress["completed"]={};
  for(const [id,item] of entries){
    if(!validId(id)||!item||typeof item!=="object"||Array.isArray(item))throw new Error("Invalid practice step");
    const row=item as Record<string,unknown>;
    if(!Number.isInteger(row.revision)||Number(row.revision)<1||Number(row.revision)>10000||typeof row.needsReview!=="boolean")throw new Error("Invalid practice completion");
    Object.defineProperty(completed,id,{value:{revision:Number(row.revision),needsReview:row.needsReview},enumerable:true,writable:true,configurable:true});
  }
  return {version:1,lastStepId:raw.lastStepId as string|null,completed};
}
export function mergePracticePlanProgress(a:PracticePlanProgress,b:PracticePlanProgress):PracticePlanProgress {
  const completed={...a.completed};
  for(const [id,next] of Object.entries(b.completed)){
    const previous=completed[id];
    completed[id]=!previous||next.revision>previous.revision?next:next.revision===previous.revision?{revision:next.revision,needsReview:previous.needsReview&&next.needsReview}:previous;
  }
  return {version:1,lastStepId:b.lastStepId??a.lastStepId,completed};
}
export function isPracticeStepComplete(progress:PracticePlanProgress,step:PracticePlanStep) {return progress.completed[step.id]?.revision===step.revision;}
export function nextPracticeStep(progress:PracticePlanProgress) {
  return practicePlanSteps.find(step=>step.id===progress.lastStepId&&!isPracticeStepComplete(progress,step))??practicePlanSteps.find(step=>!isPracticeStepComplete(progress,step))??practicePlanSteps.find(step=>step.id===progress.lastStepId)??practicePlanSteps[0];
}
export function applyPracticePlanAction(progress:PracticePlanProgress,action:PracticePlanAction):PracticePlanProgress {
  const step=practicePlanSteps.find(step=>step.id===action.stepId);
  if(!step)throw new Error("Unknown practice step");
  if(action.type==="visit")return {...progress,lastStepId:step.id};
  const completed={...progress.completed};
  const old=completed[step.id];
  if(old&&old.revision>step.revision)return {...progress,lastStepId:step.id};
  completed[step.id]={revision:step.revision,needsReview:old?.revision===step.revision?old.needsReview&&action.needsReview:action.needsReview};
  return {version:1,lastStepId:step.id,completed};
}
export type PracticePlanStorage = {load:()=>PracticePlanProgress;save:(progress:PracticePlanProgress)=>void;subscribe?:(listener:()=>void)=>()=>void};
