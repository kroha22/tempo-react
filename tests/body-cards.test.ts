import assert from "node:assert/strict";
import test from "node:test";
import {bodyCardWords,bodyStudyItems,bodyStudyItemIds,bodyCardSources,bodyActionWordIds} from "../features/content/body-cards.ts";
import {topicExpansion,pairVocabulary} from "../features/content/vocabulary-catalog.ts";
import {feelingWords} from "../features/content/feelings-lesson.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {practicePlanSteps} from "../features/practice/plan/model.ts";
import {bodyFunctions} from "../features/content/everyday-lessons.ts";
import {gramaticaVocabulary,vocabularyFront} from "../features/content/gramatica-vocabulary.ts";

test("body bridge registers 17 new targets and reuses three GA1 cards with exact original words",()=>{
  assert.equal(bodyCardWords.length,20);assert.equal(bodyStudyItems.length,17);assert.equal(new Set(bodyStudyItemIds).size,20);
  for(const word of bodyCardWords){
    const old=word.noun?topicExpansion.byKey.get(word.key)!:feelingWords.find(row=>row.id===word.wordId)!;
    assert.equal(word.wordId,old.id);assert.deepEqual(word.example,old.example);if(word.noun)assert.deepEqual(word.noun,old.noun);
    assert(learningCatalog.meanings.some(row=>row.id===`meaning:${word.wordId}`&&row.legacyWordIds.includes(word.wordId)));
    assert.equal(pack.studyItems.filter(row=>row.id===word.studyItemId).length,1);assert(studyReviewCardById.has(word.studyItemId));
    if(!word.reused)assert.equal(word.ru,old.translation);
  }
  assert.deepEqual(bodyCardWords.filter(word=>word.reused).map(word=>word.key),["triste","cansado","pronto"]);
  for(const word of bodyCardWords.filter(word=>word.reused)){const original=gramaticaVocabulary.find(entry=>entry.studyItemId===word.studyItemId)!;assert.equal(word.pt,vocabularyFront(original));assert.equal(word.ru,original.translation);assert.equal(bodyStudyItems.some(item=>item.id===word.studyItemId),false);assert.deepEqual(studyReviewCardById.get(word.studyItemId)?.examples,original.examples);}
});
test("body senses and adjective forms stay separate and do not enter legacy exercise banks",()=>{
  const id=(key:string)=>bodyCardWords.find(word=>word.key===key)!.studyItemId;
  assert.equal(id("orelha"),"study:body:noun:orelha:outer-ear");assert.equal(id("ouvido"),"study:body:noun:ouvido:hearing");assert.equal(id("mao"),"study:body:noun:mao:hand");assert.equal(id("braco"),"study:body:noun:braco:arm");assert.equal(id("lingua"),"study:body:noun:lingua:body");
  assert(!pairVocabulary.some(word=>word.id.startsWith("study:body:")));
  for(const key of ["feliz","nervoso","calmo"]){const word=bodyCardWords.find(word=>word.key===key)!;const item=bodyStudyItems.find(item=>item.id===word.studyItemId)!;assert.equal(item.display.type,"word");assert.equal(word.pt,key);assert.equal(item.target.type,"lexeme-sense");}
  assert(!bodyStudyItemIds.some(id=>id.includes("tocar")||id.includes("bem:")||id.includes("pulmao")));
});
test("writing owners 8 and 6 and the six body appearances keep their original IDs",()=>{
  for(const [topic,set,size] of [["face","expansion-body-face",8],["movement","expansion-body-movement",6]] as const){const step=practicePlanSteps.find(step=>step.id===`practice:words:${set}`)!;assert.equal(step.kind,"words");if(step.kind!=="words")throw Error("words expected");assert.equal(step.revision,1);assert.equal(step.wordIds.length,size);assert.deepEqual(step.wordIds,bodyCardWords.filter(word=>word.topic===topic).map(word=>word.wordId));}
  assert.deepEqual(bodyActionWordIds,bodyFunctions.map(word=>word.wordId));
  assert.equal(practicePlanSteps.find(step=>step.id==="practice:everyday:body")?.revision,1);
  const lungs=pairVocabulary.find(word=>word.id==="vocabulary:noun:pulmao")!;assert.equal(lungs.label,"os pulmões");assert.deepEqual(lungs.acceptedAnswers?.pt,["o pulmão","os pulmões"]);
});
test("body sources resolve to three live word batches and preserve the old body source",()=>{
  assert.equal(bodyCardSources.length,3);for(const source of bodyCardSources)assert.deepEqual(readingSourceById.get(source.id),source);
  assert.deepEqual(readingSourceById.get("lesson:everyday:body"),{id:"lesson:everyday:body",title:"Тело и действия",href:"/learning/everyday/body"});
  for(const key of ["triste","cansado","pronto"])assert.deepEqual(studyReviewCardById.get(`study:ga1:adjective:${key}:entry`)?.units,key==="cansado"?[3,2]:[2]);
});
