import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogGroups, catalogWords } from '../features/content/learning-catalog-view.ts';
import { learningCatalog } from '../features/content/learning-catalog.ts';
import { vocabularySets } from '../features/content/vocabulary-model.ts';
import { studyVocabularyGroups } from '../features/content/vocabulary-catalog.ts';
test('view uses model topics and collections while preserving existing activity words',()=>{
 assert.ok(catalogGroups.length<learningCatalog.topics.length);
 assert.ok(catalogGroups.every(group=>learningCatalog.topics.some(topic=>topic.id===group.id)));
 const old=new Map(studyVocabularyGroups.flatMap(vocabularySets).map(s=>[s.id,s]));
 for(const group of catalogGroups)for(const set of vocabularySets(group)){
  const c=learningCatalog.collections.find(c=>c.id===set.id)!;assert.ok(c);
  const original=old.get(c.source.legacySetId??'');if(original){assert.deepEqual(set.words,original.words);assert.deepEqual(set.oddOneOut,original.oddOneOut);}
  const words=set.words.map(id=>catalogWords.find(w=>w.id===id)!);assert.ok(words.every(Boolean));
  assert.equal(new Set(words.map(w=>w.label.toLowerCase())).size,words.length,set.id);
  assert.equal(new Set(words.map(w=>w.translation.toLowerCase())).size,words.length,set.id);
 }
 const food=catalogGroups.find(g=>g.id==='topic:food')!;
 const daily=catalogGroups.find(g=>g.id==='topic:everyday')!;
 assert.ok(vocabularySets(food).some(s=>vocabularySets(daily).some(d=>d.id===s.id)));
 assert.ok(food.imageActivityIds?.includes('image-breakfast'));
});
