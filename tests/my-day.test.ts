import assert from "node:assert/strict";
import test from "node:test";
import {myDayEvents,myDayVerbWords,myDayTimeWords} from "../features/content/my-day.ts";
import {catalogGroups,catalogWords} from "../features/content/learning-catalog-view.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {verbCards} from "../features/cards/data/verb-cards.ts";
import {allVerbKeys} from "../features/conjugation/data.ts";
import {vocabularySets} from "../features/content/vocabulary-model.ts";

test("my day reuses verb card identities and binds six time targets to contextual practice",()=>{
  assert.equal(myDayEvents.length,6);
  for(const word of myDayVerbWords){
    assert.equal(verbCards.find(card=>card.pt===word.label)?.id,word.id);
    assert.equal(catalogWords.filter(item=>item.id===word.id).length,1);
    assert.ok(allVerbKeys.includes(word.label as typeof allVerbKeys[number]));
  }
  const group=catalogGroups.find(group=>group.id==="topic:vocabulary-my-day")!;
  assert.deepEqual(vocabularySets(group).map(set=>set.words.length),[6,6]);
  const usage=learningCatalog.usageModules.find(item=>item.id==="usage:my-day")!;
  assert.equal(usage.newMeaningIds.length,6);
  assert.equal(usage.reviewedMeaningIds.length,6);
  for(const word of myDayTimeWords)assert.ok(catalogWords.some(item=>item.id===word.id));
  for(const id of [...usage.newMeaningIds,...usage.reviewedMeaningIds])assert.ok(learningCatalog.meanings.some(item=>item.id===id));
  for(const task of usage.exercises){assert.ok(task.options.some(option=>option.id===task.correctOptionId));assert.equal(new Set(task.options.map(option=>option.text)).size,task.options.length);}
});
