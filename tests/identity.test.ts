import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import test from "node:test";
import {identitySets,identityWords,professionWords,characteristicWords} from "../features/content/identity.ts";
import {pairVocabulary} from "../features/content/vocabulary-catalog.ts";
import {feelingWords} from "../features/content/feelings-lesson.ts";

test("identity sets use one shared word registry and retain CALMO's existing identity",()=>{
  assert.equal(identitySets.length,3);
  assert.equal(new Set(identityWords.map(word=>word.id)).size,identityWords.length);
  for(const word of identityWords){
    assert.equal(pairVocabulary.filter(item=>item.id===word.id).length,1,word.id);
    assert.ok(word.illustration);
    assert.ok(existsSync(`public${word.illustration.src}`));
  }
  assert.equal(characteristicWords[0],feelingWords.find(word=>word.adjective?.lemma==="calmo"));
  assert.equal(professionWords.length,6);
  assert.ok(professionWords.every(word=>word.noun?.plural));
});

test("identity practice has nine stable unique tasks and valid authored endings",()=>{
  const tasks=identitySets.flatMap(set=>set.tasks);
  assert.equal(tasks.length,9);
  assert.equal(new Set(tasks.map(task=>task.id)).size,tasks.length);
  for(const task of tasks){assert.ok(task.options.includes(task.ending));assert.ok(task.verbHint);assert.ok(task.wordHint);}
});
