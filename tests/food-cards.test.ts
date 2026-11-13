import assert from "node:assert/strict";
import test from "node:test";
import {foodProductWords,foodStudyItems,foodStudyItemIds,foodPreferenceCard,foodPreferenceSource,foodPreferenceWordIds,foodCardSources} from "../features/content/food-cards.ts";
import {topicExpansion,pairVocabulary} from "../features/content/vocabulary-catalog.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {practicePlanSteps} from "../features/practice/plan/model.ts";
import {preferenceFoods} from "../features/content/everyday-lessons.ts";

test("food bridge preserves the exact existing words, morphology, translations and examples",()=>{
  assert.equal(foodProductWords.length,14);assert.equal(foodStudyItems.length,14);assert.equal(new Set(foodStudyItemIds).size,15);
  for(const word of foodProductWords){const original=topicExpansion.byKey.get(word.key)!;assert.equal(word.wordId,original.id);assert.equal(word.ru,original.translation);assert.deepEqual(word.noun,original.noun);assert.deepEqual(word.example,original.example);assert(learningCatalog.meanings.some(row=>row.id===`meaning:${word.wordId}`&&row.legacyWordIds.includes(word.wordId)));assert(pack.studyItems.some(row=>row.id===word.studyItemId));assert(studyReviewCardById.has(word.studyItemId));}
  assert.equal(foodProductWords.find(row=>row.key==="laranja")?.studyItemId,"study:food:noun:laranja:fruit");assert.equal(foodProductWords.find(row=>row.key==="peixe")?.studyItemId,"study:food:noun:peixe:food");assert.equal(foodProductWords.find(row=>row.key==="frango")?.studyItemId,"study:food:noun:frango:meat");
});
test("gostar de reuses U49 and its old source without confusing the polite request",()=>{
  assert.equal(foodPreferenceCard.studyItemId,"study:ga1:chunk:gostar-de:entry");assert.deepEqual(studyReviewCardById.get(foodPreferenceCard.studyItemId)?.units,[49]);assert.deepEqual(readingSourceById.get(foodPreferenceSource.id),foodPreferenceSource);
  assert(!foodStudyItemIds.includes("study:chunk:ga1:gostava-de"));assert(!foodStudyItemIds.includes("v0057"));assert.equal(foodStudyItems.some(item=>item.id===foodPreferenceCard.studyItemId),false);
  for(const source of foodCardSources)assert.equal(readingSourceById.get(source.id)?.href,source.href);
  assert.deepEqual(foodPreferenceWordIds,preferenceFoods.map(word=>word.wordId));
});
test("food adapters do not change writing owners; plural notes remain presentation-only",()=>{
  assert(!pairVocabulary.some(word=>word.id.startsWith("study:food:")));
  for(const [topic,set,size] of [["fruit","expansion-food-fruit",6],["meals","expansion-food-meals",8]] as const){const step=practicePlanSteps.find(step=>step.id===`practice:words:${set}`)!;assert.equal(step.kind,"words");if(step.kind!=="words")throw Error("words expected");assert.equal(step.revision,1);assert.equal(step.wordIds.length,size);assert.deepEqual(step.wordIds,foodProductWords.filter(word=>word.topic===topic).map(word=>word.wordId));}
  for(const word of foodProductWords.filter(word=>word.topic==="meals")){assert(word.usageNote);assert.equal(studyReviewCardById.get(word.studyItemId)?.usageNote,word.usageNote);}
});
