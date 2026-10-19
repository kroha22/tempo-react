import assert from "node:assert/strict";
import test from "node:test";
import { pairVocabulary, topicExpansion } from "../features/content/vocabulary-catalog.ts";
import { buildTopicExpansion, topicNounSeeds, topicSetDefinitions } from "../features/content/topic-expansion.ts";
import { learningCatalog, meaningForLegacyWord } from "../features/content/learning-catalog.ts";
import { catalogGroups } from "../features/content/learning-catalog-view.ts";
import { checkVocabularyWritingAnswer } from "../features/content/vocabulary-model.ts";
import { bodyFunctions, everydayLessons, preferenceSentence, topicWord } from "../features/content/everyday-lessons.ts";

test("new topic nouns reuse scene and source identities and retain morphology",()=>{
  assert.equal(topicWord("maca").id,"scene-word:a-maca");
  assert.equal(topicWord("arroz").id,"general-vocabulary:noun:arroz");
  assert.equal(new Set(pairVocabulary.map(word=>word.id)).size,pairVocabulary.length);
  for(const [key,article,lemma,plural] of topicNounSeeds){
    const word=topicWord(key);
    assert.equal(pairVocabulary.filter(item=>item.id===word.id).length,1,key);
    const meaning=meaningForLegacyWord(word.id)!;
    const entry=learningCatalog.entries.find(item=>item.id===meaning.entryId)!;
    assert.equal(entry.lemma,lemma,key);assert.equal(entry.morphology?.article,article,key);assert.equal(entry.morphology?.plural,plural,key);
    assert.ok(word.example?.pt);assert.ok(word.example?.ru);
  }
  assert.equal(topicExpansion.byKey.size,46);
  assert.equal([...topicExpansion.byKey.values()].filter(word=>word.id.startsWith("vocabulary:noun:")).length,37);
  const existing={id:"existing-mother",label:"a mãe",translation:"Мама",acceptedAnswers:{pt:["mamã"],ru:["мать"]}};
  assert.deepEqual(buildTopicExpansion([existing]).byKey.get("mae")?.acceptedAnswers,existing.acceptedAnswers);
});

test("all seven bounded sets appear in the intended semantic themes",()=>{
  for(const set of topicSetDefinitions){
    assert.ok(set.keys.length>=4&&set.keys.length<=8);
    const topic=catalogGroups.find(group=>group.id===`topic:${set.group==="food"?"food":`vocabulary-${set.group}`}`)!;
    assert.ok(topic,set.id);
    const found=topic.subgroups.flatMap(group=>group.sets).find(item=>item.id===`collection:${set.id}`)!;
    assert.deepEqual(found.words,set.keys.map(key=>topicWord(key).id));
  }
  assert.ok(!catalogGroups.some(group=>group.id==="topic:vocabulary-food-more"));
});

test("accent-sensitive relatives remain separate meanings and spelling answers",()=>{
  const grandma=topicWord("avo-f"),grandpa=topicWord("avo-m"),words=[grandma,grandpa];
  assert.notEqual(meaningForLegacyWord(grandma.id)?.entryId,meaningForLegacyWord(grandpa.id)?.entryId);
  assert.equal(checkVocabularyWritingAnswer(grandma,"avo",words),"accent");
  assert.equal(checkVocabularyWritingAnswer(grandma,"avô",words),"accent");
  assert.equal(checkVocabularyWritingAnswer(grandma,"avó",words),"correct");
  assert.equal(checkVocabularyWritingAnswer(grandpa,"avô",words),"correct");
  assert.equal(checkVocabularyWritingAnswer(topicWord("maca"),"maca",[topicWord("maca")]),"correct");
});

test("lesson builders retain de, agreement and explicit references to existing words",()=>{
  assert.equal(preferenceSentence(0,0,false).pt,"Eu gosto de maçãs.");
  assert.equal(preferenceSentence(1,3,true).pt,"Tu não gostas de queijo.");
  assert.equal(preferenceSentence(2,5,false).pt,"A Inês gosta de arroz.");
  for(const item of bodyFunctions)assert.equal(item.wordId,topicWord(item.key).id);
  assert.equal(new Set(everydayLessons.body.checks.map(task=>task.options.indexOf(task.answer))).size,3);
  for(const lesson of Object.values(everydayLessons)){
    assert.ok(lesson.reviewedKeys.length<=8);
    for(const task of lesson.checks){assert.equal(task.options.filter(option=>option===task.answer).length,1);assert.ok(task.explanation);}
  }
});
