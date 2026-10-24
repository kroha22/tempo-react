import assert from "node:assert/strict";
import test from "node:test";
import {catalogGroups,catalogWords} from "../features/content/learning-catalog-view.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";
import {spaceWords} from "../features/content/space-vocabulary.ts";
import {vocabularySets} from "../features/content/vocabulary-model.ts";

test("space reuses Route identities and connects illustrated practice to the existing lesson",()=>{
  const group=catalogGroups.find(group=>group.id==="topic:vocabulary-space")!;
  assert.deepEqual(vocabularySets(group).map(set=>set.words.length),[8,6]);
  for(const source of spaceWords){
    const words=catalogWords.filter(word=>word.id===source.id);
    assert.equal(words.length,1,source.id);
    assert.ok(words[0].illustration?.src.includes("space-drawn"));
    assert.ok(words[0].example);
  }
  const usage=learningCatalog.usageModules.find(item=>item.id==="usage:space-location")!;
  assert.equal(usage.reviewedMeaningIds.length,4);
  assert.ok(usage.relatedLinks.some(link=>link.href.endsWith("locate-object")));
  for(const id of usage.reviewedMeaningIds)assert.ok(learningCatalog.meanings.some(meaning=>meaning.id===id));
});
