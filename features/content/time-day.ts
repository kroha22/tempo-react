import {calendarWords,calendarMonths} from "./calendar.ts";
import {preparationKeywords} from "./preparation-support.ts";
import {myDayVerbWords,myDayTimeWords,myDayEvents} from "./my-day.ts";
import {gramaticaVocabulary} from "./gramatica-vocabulary.ts";
import type {Chunk,Example,StudyItem} from "./types.ts";
import type {VocabularyWord} from "./vocabulary-model.ts";

export const timeDayTopics=["hours","months","routine"] as const;
export type TimeDayTopic=typeof timeDayTopics[number];
export const timeDayPhases=["explanation","words","practice","review"] as const;
export type TimeDayPhase=typeof timeDayPhases[number];
export const timeDayTitles={hours:"Часы",months:"Месяцы",routine:"Мой день"};
export const timeDayHref=(topic:TimeDayTopic="hours",phase:TimeDayPhase="explanation",related?:string)=>`/learning/time-day?topic=${topic}&phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const timeDaySources=timeDayTopics.map(topic=>({id:`lesson:time-day:${topic}`,title:`Время и мой день · ${timeDayTitles[topic]}`,href:timeDayHref(topic,"words")}));
const existingVerbs:Record<string,string>={acordar:"study:ga1:verb:acordar:entry",ir:"study:ga1:verb:ir:entry",estudar:"study:ga1:verb:estudar:entry",voltar:"study:ga1:verb:voltar:entry"};
const wordsByTopic:Record<TimeDayTopic,VocabularyWord[]>={hours:preparationKeywords.hours.map(([label,translation],index)=>({id:`prep-keyword:hours:${index}`,label,translation})),months:calendarWords.filter(word=>calendarMonths.some(([pt])=>pt===word.label)),routine:[...myDayVerbWords,...myDayTimeWords]};
export const timeDayWords=timeDayTopics.flatMap(topic=>wordsByTopic[topic].map(word=>{
  const reuse=existingVerbs[word.label]??(word.label==="a noite"?"study:ga1:noun:noite:entry":undefined);
  const entry=reuse?gramaticaVocabulary.find(entry=>entry.studyItemId===reuse):undefined;
  if(reuse&&!entry)throw new Error(`Missing existing time card: ${reuse}`);
  // Breakfast is a quoted sentence, never the existing medication/decision senses of tomar.
  const breakfast=word.label==="tomar"?myDayEvents.find(event=>event.verb==="tomar"):undefined;
  const identity=word.id.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^a-z0-9:-]+/g,"-");
  return {topic,wordId:word.id,studyItemId:reuse??`study:time-day:${identity}`,pt:entry?.lemma??breakfast?.phrase??word.label,ru:entry?.translation??breakfast?.ru??word.translation,reused:!!reuse,
    example:word.example??(breakfast?{pt:breakfast.phrase,ru:breakfast.ru}:{pt:word.label,ru:word.translation})};
}));
if(new Set(timeDayWords.map(word=>word.studyItemId)).size!==timeDayWords.length)throw new Error("Duplicate time-day card identity");
export const timeDayStudyItemIds=timeDayWords.map(word=>word.studyItemId);
export const timeDayChunks:Chunk[]=[],timeDayExamples:Example[]=[],timeDayStudyItems:StudyItem[]=[];
export const timeDayRu:Record<string,string>={};
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
for(const word of timeDayWords.filter(word=>!word.reused)){
  const chunkId=word.studyItemId.replace(/^study:/,"chunk:"),exampleId=word.studyItemId.replace(/^study:/,"example:"),translationKey=`time-day.${word.wordId}.ru`,exampleKey=`time-day.${word.wordId}.example.ru`;
  timeDayRu[translationKey]=word.ru;timeDayRu[exampleKey]=word.example.ru;
  // Quotes from existing lessons; do not infer noun morphology or turn forms into verbs.
  timeDayChunks.push({...base,id:chunkId,kind:"chunk",text:word.pt,normalizedText:word.pt.toLocaleLowerCase("pt-PT"),glossKey:translationKey,register:"neutral",exampleIds:[exampleId]});
  timeDayExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:word.example.pt,normalizedText:word.example.pt.toLocaleLowerCase("pt-PT"),translationKey:exampleKey,targetIds:[word.studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
  timeDayStudyItems.push({...base,id:word.studyItemId,kind:"study-item",target:{type:"chunk",chunkId},display:{type:"chunk",text:word.pt,translationKey},defaultExampleId:exampleId,cardEligible:true});
}
export const timeDayActivityIds=["prep:hours","clock:read","clock:set","prep:months","prep:months:order","prep:months:days","usage:calendar:months-first","usage:calendar:months-last","usage:my-day"];
