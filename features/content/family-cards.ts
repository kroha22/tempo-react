import {topicNounSeeds} from "./topic-expansion.ts";
import {professionWords} from "./identity.ts";
import {gramaticaVocabulary,vocabularyFront} from "./gramatica-vocabulary.ts";
import type {Chunk,Example,StudyItem} from "./types.ts";

export type FamilyCardTopic="close"|"relatives";
export const familyCardsHref=(topic:FamilyCardTopic="close",review=false)=>`/learning/family/cards?topic=${topic}${review?"&mode=review":""}`;
export const familyCardSources=(["close","relatives"] as const).map(topic=>({id:`lesson:family:${topic}`,title:topic==="close"?"Моя семья · Близкие":"Моя семья · Родственники",href:familyCardsHref(topic)}));
const familyKeys={close:["mae","pai","irmao","irma","avo-f","avo-m"],relatives:["tio","tia","primo","prima","filho","filha"]} as const;
const existingFamily=new Set<string>(["irmao","irma","filho","filha"]);
const reusedRoles:Record<string,string>={professor:"study:ga1:noun:professor:entry","médico":"study:ga1:noun:medico:entry"};
const roleLemmas=["estudante","professor","médico","cozinheiro","engenheiro"];
export const familyCardWords=([
  ...(["close","relatives"] as const).flatMap(topic=>familyKeys[topic].map(key=>{
    const seed=topicNounSeeds.find(row=>row[0]===key);
    if(!seed)throw new Error(`Missing family source: ${key}`);
    const [,article,lemma,plural,ru,pt,exampleRu]=seed;
    const reused=existingFamily.has(key),studyItemId=reused?`study:ga1:noun:${key}:entry`:`study:family:noun:${key}:entry`;
    const entry=reused?gramaticaVocabulary.find(row=>row.studyItemId===studyItemId):undefined;
    if(reused&&!entry)throw new Error(`Missing family card: ${studyItemId}`);
    return {topic,support:false,wordId:reused?studyItemId:`vocabulary:noun:${key}`,studyItemId,reused,pt:entry?vocabularyFront(entry):`${article} ${lemma} — ${article==="a"?"as":"os"} ${plural}`,ru:entry?.translation??ru,noun:{article,lemma,plural,pluralArticle:article==="a"?"as" as const:"os" as const},example:{pt,ru:exampleRu},forms:undefined as string|undefined};
  })),
  ...roleLemmas.map(lemma=>{
    const word=professionWords.find(word=>word.noun?.lemma===lemma);
    if(!word?.example)throw new Error(`Missing family profession: ${lemma}`);
    const reuse=reusedRoles[lemma],entry=reuse?gramaticaVocabulary.find(row=>row.studyItemId===reuse):undefined;
    if(reuse&&!entry)throw new Error(`Missing family profession card: ${reuse}`);
    return {topic:"close" as const,support:true,wordId:word.id,studyItemId:reuse??`study:family:chunk:${lemma}-forms`,reused:!!reuse,pt:entry?vocabularyFront(entry):word.label,ru:entry?.translation??word.translation,noun:undefined,example:entry?.examples[0]??word.example,forms:entry?word.label:undefined};
  }),
]);
export const familyStudyItemIds=familyCardWords.map(word=>word.studyItemId);
if(new Set(familyStudyItemIds).size!==17)throw new Error("Duplicate family card identity");
export const familyChunks:Chunk[]=[],familyExamples:Example[]=[],familyStudyItems:StudyItem[]=[];
export const familyCardRu:Record<string,string>={};
const base={schemaVersion:1,contentRevision:1,status:"reviewed" as const};
// Pure source bridge: never import manifest, vocabulary-catalog or learning-catalog here.
for(const word of familyCardWords.filter(word=>!word.reused)){
  const translationKey=`${word.studyItemId}.ru`,exampleKey=`${word.studyItemId}.example.ru`,exampleId=word.studyItemId.replace(/^study:/,"example:");
  familyCardRu[translationKey]=word.ru;familyCardRu[exampleKey]=word.example.ru;
  familyExamples.push({...base,id:exampleId,kind:"example",locale:"pt-PT",text:word.example.pt,normalizedText:word.example.pt.toLocaleLowerCase("pt-PT"),translationKey:exampleKey,targetIds:[word.studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}});
  const common={...base,id:word.studyItemId,kind:"study-item" as const,defaultExampleId:exampleId,cardEligible:true};
  if(word.noun){
    familyStudyItems.push({...common,target:{type:"lexeme-sense",senseId:word.studyItemId.replace(/^study:/,"sense:"),partOfSpeech:"noun"},display:{type:"noun",lemma:word.noun.lemma,definiteArticle:word.noun.article,plural:word.noun.plural,pluralDefiniteArticle:word.noun.pluralArticle,translationKey}});
  }else{
    const chunkId=word.studyItemId.replace(/^study:/,"chunk:");
    familyChunks.push({...base,id:chunkId,kind:"chunk",text:word.pt,normalizedText:word.pt.toLocaleLowerCase("pt-PT"),glossKey:translationKey,register:"neutral",exampleIds:[exampleId]});
    familyStudyItems.push({...common,target:{type:"chunk",chunkId},display:{type:"chunk",text:word.pt,translationKey}});
  }
}
