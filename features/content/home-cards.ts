import {houseWords} from "./house.ts";
import {extraStudyItems,routeExtensionRu,extraExamples,routeLessonExperiences} from "./first-vertical-slice/route-extension.ts";
import {gramaticaVocabulary,vocabularyFront} from "./gramatica-vocabulary.ts";
import {ru} from "./locale/ru.ts";
import type {Example,NounStudyItem} from "./types.ts";
export type HomeCardTopic="rooms"|"objects"|"location";
export const homeCardTopics=["rooms","objects","location"] as const;
export const homeCardTitles={rooms:"Комнаты",objects:"Знакомые предметы",location:"Где находится?"};
export const homeCardsHref=(topic:HomeCardTopic="rooms",review=false)=>`/learning/home/cards?topic=${topic}${review?"&mode=review":""}`;
export const homeBatchSources=homeCardTopics.map(topic=>({id:`lesson:home:${topic}`,title:`Дом · ${homeCardTitles[topic]}`,href:homeCardsHref(topic)}));
export const homeRouteSources=[
  {topic:"rooms",id:"lesson:a1-1:possession-and-presence",title:"TER и HÁ",href:"/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence"},
  {topic:"objects",id:"lesson:a1-1:name-familiar-objects",title:"Знакомые предметы",href:"/learning/lessons/lesson%3Aa1-1%3Aname-familiar-objects"},
  {topic:"location",id:"lesson:a1-1:locate-object",title:"Где находится предмет",href:"/learning/lessons/lesson%3Aa1-1%3Alocate-object"},
] as const;
export const homeCardSources=[...homeBatchSources,...homeRouteSources.map(source=>({id:source.id,title:source.title,href:source.href}))];
const repairs:Record<string,{pt:string;ru:string}>={
  "study:noun:quarto":{pt:"A cama está no quarto.",ru:"Кровать находится в спальне."},
  "study:noun:caixa":{pt:"O gato está dentro da caixa.",ru:"Кот внутри коробки."},
  "study:noun:porta":{pt:"A porta está aberta.",ru:"Дверь открыта."},
  "study:chunk:onde-esta":{pt:"Onde está o gato?",ru:"Где кот?"},
};
const rows=[
  ["rooms","quarto","house-quarto","study:noun:quarto"],["rooms","sala","house-sala","study:noun:sala"],
  ["rooms","cozinha","house-cozinha","study:home:noun:cozinha:entry"],["rooms","casa-de-banho","house-casa-de-banho","study:home:noun:casa-de-banho:room"],
  ["rooms","escritorio","house-escritorio","study:home:noun:escritorio:home-office"],["rooms","garagem","house-garagem","study:home:noun:garagem:entry"],
  ...["mesa","caixa","porta","janela","gato","chave","livro"].map(key=>["objects",key,`study:noun:${key}`,`study:noun:${key}`] as const),
  ...["onde-esta","dentro-de","em-cima-de","debaixo-de","ao-lado-de"].map(key=>["location",key,`study:chunk:${key}`,`study:chunk:${key}`] as const),
] as const;
const texts:Record<string,string>={...ru,...routeExtensionRu};
export const homeCardWords=rows.map(([topic,key,wordId,studyItemId])=>{
  const item=extraStudyItems.find(item=>item.id===studyItemId),dictionary=gramaticaVocabulary.find(entry=>entry.studyItemId===studyItemId),house=houseWords.find(word=>word.id===wordId);
  const display=item?.display??house?.display;if(!display)throw new Error(`Missing home source: ${wordId}`);
  const example=dictionary?.examples[0]??repairs[studyItemId]??(item?(()=>{const e=extraExamples.find(e=>e.id===item.defaultExampleId);if(!e)throw new Error(`Missing home example: ${studyItemId}`);return {pt:e.text,ru:texts[e.translationKey]};})():{pt:house!.example,ru:house!.exampleTranslation});
  const pt=dictionary?vocabularyFront(dictionary):display.type==="noun"?`${display.definiteArticle} ${display.lemma} — ${display.pluralDefiniteArticle} ${display.plural}`:display.type==="chunk"?display.text:"";
  return {topic,key,wordId,studyItemId,pt,ru:dictionary?.translation??(item?texts[display.translationKey]:house!.translation),example,display,newTarget:!item,reviewReady:!!dictionary};
});
export const homeStudyItemIds=homeCardWords.map(word=>word.studyItemId);
export function homeWordsForTopic(topic:HomeCardTopic,fromRoute=false){
  const source=homeRouteSources.find(source=>source.topic===topic)!;
  const allowed=fromRoute?new Set(routeLessonExperiences.find(lesson=>lesson.id===source.id)!.saveItemIds):null;
  return homeCardWords.filter(word=>word.topic===topic&&(!allowed||allowed.has(word.studyItemId)));
}
if(new Set(homeStudyItemIds).size!==18)throw new Error("Duplicate home target");
export const homeCardRu:Record<string,string>={},homeExamples:Example[]=[],homeStudyItems:NounStudyItem[]=[];
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
for(const word of homeCardWords.filter(word=>word.newTarget||repairs[word.studyItemId])){
  const exampleId=`example:home:${word.key}`,translationKey=`${exampleId}.ru`;
  homeCardRu[translationKey]=word.example.ru;
  homeExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:word.example.pt,normalizedText:word.example.pt.toLocaleLowerCase("pt-PT"),translationKey,targetIds:[word.studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
  if(word.newTarget&&word.display.type==="noun"){
    const key=`${word.studyItemId}.ru`;homeCardRu[key]=word.ru;
    homeStudyItems.push({...base,id:word.studyItemId,kind:"study-item",target:{type:"lexeme-sense",senseId:word.studyItemId.replace(/^study:/,"sense:"),partOfSpeech:"noun"},display:{...word.display,translationKey:key},defaultExampleId:exampleId,cardEligible:true});
  }
}
