import {legacyRouteSources} from "./legacy-srs.ts";
import {allGramaticaLessons} from "./gramatica-ativa.ts";
import {shortGrammarLessons} from "./short-grammar-lessons.ts";
import {timeDaySources} from "./time-day.ts";
import {familyCardSources} from "./family-cards.ts";
import {foodCardSources,foodPreferenceSource} from "./food-cards.ts";
import {bodyCardSources} from "./body-cards.ts";
import {bodyFlowHref} from "./body-flow.ts";
import {homeCardSources} from "./home-cards.ts";
export type ReadingSource={id:string;title:string;href:string;unit?:number};
const sources:ReadingSource[]=[
  ...legacyRouteSources,
  ...foodCardSources,
  ...homeCardSources,
  ...bodyCardSources,
  ...familyCardSources,
  ...timeDaySources,
  ...allGramaticaLessons.map(lesson=>({id:lesson.id,title:lesson.title,href:`/learning/gramatica-ativa/${lesson.slug}/explanation`,unit:lesson.unit})),
  ...shortGrammarLessons.map(lesson=>({id:`lesson:short:${lesson.id}`,title:lesson.title,href:`/learning/practice?lesson=${lesson.id}`})),
  ...["ir","ter"].map(verb=>({id:`lesson:guide:${verb}`,title:`${verb.toUpperCase()} · объяснение`,href:`/learning/practice?verb=${verb}`})),
  ...["fazer","dizer","ir","trazer"].map(verb=>({id:`lesson:past:${verb}`,title:`${verb.toUpperCase()} · прошедшее время`,href:`/learning/practice?verb=${verb}&tense=past`})),
  foodPreferenceSource,
  {id:"lesson:everyday:body",title:"Тело и действия",href:bodyFlowHref("face","explanation")},
];
export const readingSourceById=new Map(sources.map(source=>[source.id,source]));
export const readingSource=(id:string)=>readingSourceById.get(id);
