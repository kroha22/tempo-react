import {topicNounSeeds} from "./topic-expansion.ts";
import {generalVocabulary} from "./general-vocabulary.ts";
import {gramaticaVocabulary,vocabularyFront} from "./gramatica-vocabulary.ts";
import type {Example,NounStudyItem} from "./types.ts";
import {foodFlowHref} from "./food-flow.ts";

export type FoodCardTopic="fruit"|"meals"|"preferences";
export const foodCardsHref=(topic:FoodCardTopic="fruit",review=false)=>`/learning/food/cards?topic=${topic}${review?"&mode=review":""}`;
export const foodCardSources=[{id:"lesson:food:fruit",title:"Еда · Фрукты",href:foodFlowHref("fruit","words")},{id:"lesson:food:meals",title:"Еда · Продукты и напитки",href:foodFlowHref("meals","words")}];
// Source identity stays stable; old standalone lesson URL remains supported.
export const foodPreferenceSource={id:"lesson:everyday:likes",title:"Что мне нравится",href:foodFlowHref("preferences","explanation")};
const rows=[
  ["fruit","maca","scene-word:a-maca","entry"], ["fruit","banana","scene-word:a-banana","entry"],
  ["fruit","laranja","scene-word:a-laranja","fruit"], ["fruit","pera","vocabulary:noun:pera","entry"],
  ["fruit","morango","vocabulary:noun:morango","entry"], ["fruit","melancia","vocabulary:noun:melancia","entry"],
  ["meals","pao","scene-word:o-pao","entry"], ["meals","leite","scene-word:o-leite","entry"],
  ["meals","agua","vocabulary:noun:agua","entry"], ["meals","queijo","vocabulary:noun:queijo","entry"],
  ["meals","arroz","general-vocabulary:noun:arroz","entry"], ["meals","peixe","vocabulary:noun:peixe","food"],
  ["meals","carne","vocabulary:noun:carne","entry"], ["meals","frango","vocabulary:noun:frango","meat"],
] as const;
const notes:Record<string,string>={
  pao:"О хлебе как продукте обычно говорят в единственном числе. Os pães — отдельные хлебы или виды хлеба.",
  leite:"О молоке обычно говорят в единственном числе. Os leites — виды молока; значение порции зависит от контекста.",
  agua:"О воде обычно говорят в единственном числе. As águas — множественная форма для особого контекста, например видов воды.",
  queijo:"O queijo — сыр как продукт. Os queijos — отдельные сыры или сорта сыра.",
  arroz:"О рисе как продукте обычно говорят в единственном числе. Os arrozes — множественная форма, например для сортов или блюд из риса.",
  peixe:"Здесь рыба как еда. Os peixes — отдельные рыбы, а не обозначение любых порций рыбы.",
  carne:"О мясе как продукте обычно говорят в единственном числе. As carnes — например, виды мяса.",
  frango:"Здесь куриное мясо. Os frangos может обозначать целые тушки; это не название любых порций мяса.",
};
// Match buildTopicExpansion's last-seed ownership (photo seeds may repeat keys).
const seedsByKey=new Map(topicNounSeeds.map(seed=>[seed[0],seed]));
export const foodProductWords=rows.map(([topic,key,wordId,sense])=>{
  const seed=seedsByKey.get(key);
  if(!seed)throw new Error(`Missing food source: ${key}`);
  const [,article,lemma,plural,translation,pt,ru]=seed;
  const pluralArticle=article==="a"?"as" as const:"os" as const;
  return {topic,key,wordId,studyItemId:`study:food:noun:${key}:${sense}`,pt:`${article} ${lemma} — ${pluralArticle} ${plural}`,ru:generalVocabulary.find(word=>word.id===wordId)?.translation??translation,noun:{lemma,article,plural,pluralArticle},example:{pt,ru},usageNote:notes[key]};
});
const gostar=gramaticaVocabulary.find(entry=>entry.studyItemId==="study:ga1:chunk:gostar-de:entry");
if(!gostar)throw new Error("Missing existing gostar de card");
export const foodPreferenceCard={studyItemId:gostar.studyItemId,pt:vocabularyFront(gostar),ru:gostar.translation};
export const foodPreferenceWordIds=["maca","morango","pera","queijo","leite","arroz"].map(key=>foodProductWords.find(word=>word.key===key)!.wordId);
export const foodStudyItemIds=[...foodProductWords.map(word=>word.studyItemId),foodPreferenceCard.studyItemId];
if(new Set(foodStudyItemIds).size!==15)throw new Error("Duplicate food card identity");
export const foodCardRu:Record<string,string>={},foodExamples:Example[]=[],foodStudyItems:NounStudyItem[]=[];
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
// Source-only bridge: no dependency on manifest or exercise/semantic catalogs.
for(const word of foodProductWords){
  const translationKey=`${word.studyItemId}.ru`,exampleKey=`${word.studyItemId}.example.ru`,exampleId=word.studyItemId.replace(/^study:/,"example:");
  foodCardRu[translationKey]=word.ru;foodCardRu[exampleKey]=word.example.ru;
  foodExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:word.example.pt,normalizedText:word.example.pt.toLocaleLowerCase("pt-PT"),translationKey:exampleKey,targetIds:[word.studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
  foodStudyItems.push({...base,id:word.studyItemId,kind:"study-item",defaultExampleId:exampleId,cardEligible:true,target:{type:"lexeme-sense",senseId:word.studyItemId.replace(/^study:/,"sense:"),partOfSpeech:"noun"},display:{type:"noun",lemma:word.noun.lemma,definiteArticle:word.noun.article,plural:word.noun.plural,pluralDefiniteArticle:word.noun.pluralArticle,translationKey}});
}
