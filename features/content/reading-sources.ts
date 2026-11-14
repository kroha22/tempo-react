import {allGramaticaLessons} from "./gramatica-ativa.ts";
import {shortGrammarLessons} from "./short-grammar-lessons.ts";
import {timeDaySources} from "./time-day.ts";
import {familyCardSources} from "./family-cards.ts";
import {foodCardSources,foodPreferenceSource} from "./food-cards.ts";
export type ReadingSource={id:string;title:string;href:string;unit?:number};
const sources:ReadingSource[]=[
  ...foodCardSources,
  ...familyCardSources,
  ...timeDaySources,
  ...allGramaticaLessons.map(lesson=>({id:lesson.id,title:lesson.title,href:`/learning/gramatica-ativa/${lesson.slug}/explanation`,unit:lesson.unit})),
  ...shortGrammarLessons.map(lesson=>({id:`lesson:short:${lesson.id}`,title:lesson.title,href:`/learning/practice?lesson=${lesson.id}`})),
  ...["ir","ter"].map(verb=>({id:`lesson:guide:${verb}`,title:`${verb.toUpperCase()} · объяснение`,href:`/learning/practice?verb=${verb}`})),
  ...["fazer","dizer","ir","trazer"].map(verb=>({id:`lesson:past:${verb}`,title:`${verb.toUpperCase()} · прошедшее время`,href:`/learning/practice?verb=${verb}&tense=past`})),
  foodPreferenceSource,
  {id:"lesson:everyday:body",title:"Тело и действия",href:"/learning/everyday/body"},
];
export const readingSourceById=new Map(sources.map(source=>[source.id,source]));
export const readingSource=(id:string)=>readingSourceById.get(id);
