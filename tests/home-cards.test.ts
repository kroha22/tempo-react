import assert from "node:assert/strict";
import test from "node:test";
import {homeCardWords,homeStudyItemIds,homeStudyItems,homeExamples,homeCardSources,homeWordsForTopic,homeRouteSources} from "../features/content/home-cards.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {gramaticaVocabulary,vocabularyFront} from "../features/content/gramatica-vocabulary.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {pairVocabulary} from "../features/content/vocabulary-catalog.ts";
import {houseWords,houseImageActivity,houseDeck} from "../features/content/house.ts";
import {housePracticeWords,checkHousePlace} from "../features/content/house-practice.ts";
import {extraFlows,routeLessonExperiences} from "../features/content/first-vertical-slice/route-extension.ts";
test("home bridge preserves canonical identities and registers exactly four new targets and eleven reviews",()=>{
  assert.equal(homeStudyItemIds.length,18);assert.equal(new Set(homeStudyItemIds).size,18);assert.equal(homeStudyItems.length,4);assert.equal(homeExamples.length,8);assert.equal(homeCardWords.filter(word=>word.reviewReady).length,7);assert.equal(homeCardWords.filter(word=>!word.reviewReady&&!word.newTarget).length,7);
  for(const word of homeCardWords){assert.equal(pack.studyItems.filter(item=>item.id===word.studyItemId).length,1);assert(studyReviewCardById.has(word.studyItemId));assert(learningCatalog.meanings.some(m=>m.legacyWordIds.includes(word.wordId)));if(word.newTarget){const house=houseWords.find(item=>item.id===word.wordId)!;assert.deepEqual(word.display,house.display);assert.equal(word.example.pt,house.example);}}
  assert.deepEqual(homeCardWords.filter(w=>w.newTarget).map(w=>w.studyItemId),["study:home:noun:cozinha:entry","study:home:noun:casa-de-banho:room","study:home:noun:escritorio:home-office","study:home:noun:garagem:entry"]);
});
test("four old defaults demonstrate their targets without changing Route flow revisions",()=>{
  for(const [id,text] of [["study:noun:quarto","A cama está no quarto."],["study:noun:caixa","O gato está dentro da caixa."],["study:noun:porta","A porta está aberta."],["study:chunk:onde-esta","Onde está o gato?"]]){const item=pack.studyItems.find(item=>item.id===id)!;assert.equal(item.contentRevision,2);assert.equal(pack.examples.find(example=>example.id===item.defaultExampleId)?.text,text);assert.equal(studyReviewCardById.get(id)?.examples[0].pt,text);}
  assert(extraFlows.every(flow=>flow.contentRevision===1));
});
test("seven existing SRS definitions and their book units are not replaced",()=>{
  for(const word of homeCardWords.filter(word=>word.reviewReady)){const old=gramaticaVocabulary.find(entry=>entry.studyItemId===word.studyItemId)!;const card=studyReviewCardById.get(word.studyItemId)!;assert.equal(card.front,vocabularyFront(old));assert.equal(card.back,old.translation);assert.deepEqual(card.examples,old.examples);for(const unit of old.units)assert(card.units.includes(unit));assert(!homeStudyItems.some(item=>item.id===word.studyItemId));}
});
test("house banks, morphology answers, scene geometry and original source IDs stay stable",()=>{
  assert.equal(housePracticeWords.length,51);assert.equal(houseWords.length,24);assert.equal(houseImageActivity.wordIds.length,24);assert.equal(houseDeck.id,"house-a-casa");assert(!pairVocabulary.some(word=>word.id.startsWith("study:home:")));assert.equal(checkHousePlace("house-sala","зал"),"ru");assert.equal(checkHousePlace("house-quarto","quarto de dormir"),"pt");assert.equal(houseWords.find(word=>word.id==="house-escada")?.label,"as escadas");
  for(const source of homeCardSources)assert.deepEqual(readingSourceById.get(source.id),source);
  assert.deepEqual(homeRouteSources.map(source=>homeWordsForTopic(source.topic,true).length),[2,7,5]);
  for(const source of homeRouteSources)for(const word of homeWordsForTopic(source.topic,true))assert(routeLessonExperiences.find(lesson=>lesson.id===source.id)!.saveItemIds.includes(word.studyItemId));
  for(const [id,answer]of[["lesson:a1-1:name-familiar-objects","as"],["lesson:a1-1:locate-object","under"],["lesson:a1-1:possession-and-presence","ha"]])assert.equal(routeLessonExperiences.find(lesson=>lesson.id===id)?.activity.correctOptionId,answer);
});
