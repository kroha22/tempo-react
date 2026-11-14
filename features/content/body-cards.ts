import {topicNounSeeds} from "./topic-expansion.ts";
import {feelingWords} from "./feelings-lesson.ts";
import {gramaticaVocabulary,vocabularyFront} from "./gramatica-vocabulary.ts";
import type {Example,StudyItem} from "./types.ts";

export type BodyCardTopic="face"|"movement"|"feelings";
export const bodyCardsHref=(topic:BodyCardTopic="face",review=false)=>`/learning/body/cards?topic=${topic}${review?"&mode=review":""}`;
export const bodyCardTopics=["face","movement","feelings"] as const;
export const bodyCardTitles={face:"Лицо и руки",movement:"Тело и движение",feelings:"Как я себя чувствую"};
export const bodyCardSources=bodyCardTopics.map(topic=>({id:`lesson:body:${topic}`,title:`Тело и самочувствие · ${bodyCardTitles[topic]}`,href:bodyCardsHref(topic)}));
type BodyCardWord={topic:BodyCardTopic;key:string;wordId:string;studyItemId:string;pt:string;ru:string;forms:string;example:{pt:string;ru:string};reused:boolean;noun?:{lemma:string;article:"o"|"a";plural:string;pluralArticle:"os"|"as"}};
const rows=[
  ["face","cabeca","entry"],["face","olho","entry"],["face","orelha","outer-ear"],["face","ouvido","hearing"],
  ["face","nariz","entry"],["face","boca","entry"],["face","lingua","body"],["face","mao","hand"],
  ["movement","braco","arm"],["movement","perna","entry"],["movement","pe","foot"],["movement","dedo","entry"],["movement","joelho","entry"],["movement","barriga","entry"],
] as const;
const seeds=new Map(topicNounSeeds.map(seed=>[seed[0],seed]));
export const bodyCardWords:BodyCardWord[]=rows.map(([topic,key,sense])=>{
  const seed=seeds.get(key);if(!seed)throw new Error(`Missing body seed: ${key}`);
  const [,article,lemma,plural,ru,pt,exampleRu]=seed,pluralArticle=article==="a"?"as" as const:"os" as const;
  const forms=`${article} ${lemma} — ${pluralArticle} ${plural}`;
  return {topic,key,wordId:`vocabulary:noun:${key}`,studyItemId:`study:body:noun:${key}:${sense}`,pt:forms,forms,ru,noun:{lemma,article,plural,pluralArticle},example:{pt,ru:exampleRu},reused:false};
});
for(const word of feelingWords){
  const key=word.adjective!.lemma,reused=["triste","cansado","pronto"].includes(key);
  const original=reused?gramaticaVocabulary.find(entry=>entry.studyItemId===`study:ga1:adjective:${key}:entry`):undefined;
  if(reused&&!original)throw new Error(`Missing reused feeling card: ${key}`);
  bodyCardWords.push({topic:"feelings",key,wordId:word.id,studyItemId:original?.studyItemId??`study:body:adjective:${key}:state`,pt:original?vocabularyFront(original):key,ru:original?.translation??word.translation,forms:word.label,example:word.example!,reused});
}
export const bodyStudyItemIds=bodyCardWords.map(word=>word.studyItemId);
export const bodyActionWordIds=["olho","ouvido","nariz","lingua","mao","boca"].map(key=>bodyCardWords.find(word=>word.key===key)!.wordId);
if(new Set(bodyStudyItemIds).size!==20)throw new Error("Duplicate body card identity");
export const bodyCardRu:Record<string,string>={},bodyExamples:Example[]=[],bodyStudyItems:StudyItem[]=[];
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
// Source-only bridge; do not import manifest or either exercise catalog here.
for(const word of bodyCardWords.filter(word=>!word.reused)){
  const translationKey=`${word.studyItemId}.ru`,exampleKey=`${word.studyItemId}.example.ru`,exampleId=word.studyItemId.replace(/^study:/,"example:");
  bodyCardRu[translationKey]=word.ru;bodyCardRu[exampleKey]=word.example.ru;
  bodyExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:word.example.pt,normalizedText:word.example.pt.toLocaleLowerCase("pt-PT"),translationKey:exampleKey,targetIds:[word.studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
  const common={...base,id:word.studyItemId,kind:"study-item" as const,defaultExampleId:exampleId,cardEligible:true};
  bodyStudyItems.push(word.noun?{...common,target:{type:"lexeme-sense",senseId:word.studyItemId.replace(/^study:/,"sense:"),partOfSpeech:"noun"},display:{type:"noun",lemma:word.noun.lemma,definiteArticle:word.noun.article,plural:word.noun.plural,pluralDefiniteArticle:word.noun.pluralArticle,translationKey}}:{...common,target:{type:"lexeme-sense",senseId:word.studyItemId.replace(/^study:/,"sense:"),partOfSpeech:"adjective"},display:{type:"word",text:word.pt,partOfSpeech:"adjective",translationKey}});
}
