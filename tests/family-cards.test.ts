import assert from "node:assert/strict";
import test from "node:test";
import {familyCardWords,familyCardSources,familyStudyItems,familyStudyItemIds} from "../features/content/family-cards.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {pairVocabulary,topicExpansion} from "../features/content/vocabulary-catalog.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {practicePlanSteps} from "../features/practice/plan/model.ts";
import {gramaticaVocabulary,vocabularyFront} from "../features/content/gramatica-vocabulary.ts";

test("family bridge registers exactly 11 new cards and reuses all six F-05 identities",()=>{
  assert.equal(familyCardWords.length,17);assert.equal(new Set(familyStudyItemIds).size,17);assert.equal(familyStudyItems.length,11);
  assert.deepEqual(familyCardWords.filter(word=>word.reused).map(word=>word.studyItemId).sort(),["irmao","irma","filho","filha","professor","medico"].map(key=>`study:ga1:noun:${key}:entry`).sort());
  for(const word of familyCardWords){
    assert(pack.studyItems.some(item=>item.id===word.studyItemId));assert(studyReviewCardById.has(word.studyItemId));
    assert(learningCatalog.meanings.some(meaning=>meaning.id===`meaning:${word.wordId}`&&meaning.legacyWordIds.includes(word.wordId)));
    if(word.reused){const entry=gramaticaVocabulary.find(entry=>entry.studyItemId===word.studyItemId)!;assert.equal(word.pt,vocabularyFront(entry));assert.deepEqual(studyReviewCardById.get(word.studyItemId)?.units,[...entry.units]);}
  }
  for(const source of familyCardSources)assert.equal(readingSourceById.get(source.id)?.href,source.href);
});
test("family nouns retain morphology and distinct accent-sensitive targets; roles stay canonical or quoted",()=>{
  assert.equal(familyStudyItems.filter(item=>item.display.type==="noun").length,8);
  assert.equal(familyStudyItems.filter(item=>item.display.type==="chunk").length,3);
  for(const key of ["mae","pai","avo-f","avo-m","tio","tia","primo","prima"]){
    const item=familyStudyItems.find(item=>item.id===`study:family:noun:${key}:entry`)!,word=topicExpansion.byKey.get(key)!;
    assert.equal(item.display.type,"noun");if(item.display.type!=="noun")throw Error("noun expected");
    assert.equal(item.display.lemma,word.noun?.lemma);assert.equal(item.display.plural,word.noun?.plural);assert.equal(item.display.definiteArticle,word.noun?.article);assert.equal(item.display.pluralDefiniteArticle,word.noun?.pluralArticle);
  }
  assert.notEqual(familyCardWords.find(word=>word.wordId==="vocabulary:noun:avo-f")?.studyItemId,familyCardWords.find(word=>word.wordId==="vocabulary:noun:avo-m")?.studyItemId);
  assert.equal(familyCardWords.find(word=>word.wordId==="vocabulary:noun:professor")?.studyItemId,"study:ga1:noun:professor:entry");
  assert.equal(familyStudyItems.find(item=>item.id==="study:family:chunk:cozinheiro-forms")?.display.type,"chunk");
});
test("personal family targets do not alter exercise banks, writing owners or lexical batch sizes",()=>{
  assert(!pairVocabulary.some(word=>word.id.startsWith("study:family:")));
  for(const [topic,set] of [["close","expansion-family-close"],["relatives","expansion-family-relatives"]]){
    const step=practicePlanSteps.find(step=>step.id===`practice:words:${set}`)!;
    assert.equal(step.kind,"words");if(step.kind!=="words")throw Error("word step expected");
    assert.deepEqual(familyCardWords.filter(word=>word.topic===topic&&!word.support).map(word=>word.wordId),step.wordIds);
    assert.equal(step.wordIds.length,6);assert.equal(step.revision,1);
  }
  assert.equal(learningCatalog.usageModules.find(module=>module.id==="usage:family")?.exercises.length,10);
});
