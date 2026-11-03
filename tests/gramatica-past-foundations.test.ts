import assert from "node:assert/strict";
import test from "node:test";
import {pastFoundationLessons} from "../features/content/gramatica-past-foundations.ts";
import {pastGrammarUnits} from "../features/learning/gramatica/past-units.ts";
import {grammarTasks,grammarAnswerCorrect,grammarExitResult,diagnosticPassed,allGramaticaLessons} from "../features/content/gramatica-ativa.ts";
import {grammarStart,nextGrammarStep,validGrammarSnapshot} from "../features/learning/gramatica/session.ts";
import {grammarSnapshotSchema} from "../features/learning/progress/dto.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {parseLearningEventInput} from "../features/learning/progress/contracts.ts";
import {pageVocabularySources} from "../features/content/gramatica-page-vocabulary.ts";
import {vocabularyForUnit,vocabularySourceLinks,gramaticaVocabulary} from "../features/content/gramatica-vocabulary.ts";
test("six book units register independent evidence without changing the old runtime",()=>{
  assert.deepEqual(pastFoundationLessons.map(l=>l.unit),[12,13,14,15,16,17]);
  assert.equal(pastFoundationLessons.flatMap(l=>l.tasks).length,102);
  assert.equal(new Set(allGramaticaLessons.flatMap(l=>l.tasks.map(t=>t.id))).size,532);
  for(const lesson of pastFoundationLessons){
    assert.equal(pastGrammarUnits.find(u=>u.unit===lesson.unit)?.practiceSlug,lesson.slug);
    const diagnostic=grammarTasks(lesson,"diagnostic"),exit=grammarTasks(lesson,"exit");
    assert.equal(diagnostic.length,6);assert.equal(exit.length,5);
    assert(diagnostic.filter(t=>!t.options).length>=2);
    const answers=Object.fromEntries(diagnostic.map(t=>[t.id,t.answers[0]]));assert(diagnosticPassed(lesson,answers));
    answers[diagnostic.find(t=>!t.options)!.id]="wrong";assert(!diagnosticPassed(lesson,answers));
    const result=Object.fromEntries(exit.map(t=>[t.id,t.answers[0]]));assert(grammarExitResult(lesson,result).demonstrated);
    result[exit[4].id]="wrong";assert(!grammarExitResult(lesson,result).demonstrated);
    assert(pack.lessons.some(row=>row.id===lesson.id));
    for(const task of lesson.tasks)assert(parseLearningEventInput({lessonId:lesson.id,sessionId:"session:12345678",clientEventId:`session:12345678:${task.id}`,eventType:"exercise_attempt",entityId:task.id,contentRevision:1,payload:{answer:task.answers[0]},occurredAt:Date.now()}));
    // Force the full guided route; every cursor/answer set must survive the persisted DTO.
    let snapshot=grammarStart(lesson),steps=0;
    while(true){
      assert(validGrammarSnapshot(lesson,snapshot));assert(grammarSnapshotSchema.safeParse(snapshot).success);
      if(snapshot.phase!=="rule"){
        const task=grammarTasks(lesson,snapshot.phase)[snapshot.index];
        snapshot={...snapshot,answers:{...snapshot.answers,[task.id]:snapshot.phase==="diagnostic"?"wrong":task.answers[0]}};
      }
      const next=nextGrammarStep(lesson,snapshot);if(!next)break;snapshot=next;assert(++steps<30);
    }
  }
});
test("pt-PT accents, clitic placement and VER/VIR remain meaningful",()=>{
  const task=(answer:string)=>pastFoundationLessons.flatMap(l=>l.tasks).find(t=>t.answers.includes(answer))!;
  for(const [correct,wrong] of [["falámos","falamos"],["pôde","pode"],["saímos","saimos"],["púnhamos","punhamos"],["levantamo-nos","levantamos-nos"],["deitámo-nos","deitamos-nos"],["vimos viemos","viemos vimos"],["costumávamos vamos","costumamos vamos"]]){
    assert(task(correct));assert(!grammarAnswerCorrect(task(correct),wrong));assert(grammarAnswerCorrect(task(correct),` ${correct.toUpperCase()}! `));
  }
});
test("page vocabulary reuses meanings, keeps saber senses separate and adds missing infinitives",()=>{
  const sources=pageVocabularySources.filter(s=>Number(s.unit.slice(-2))>=12);
  assert.equal(sources.length,32);
  for(const source of sources){
    const links=vocabularySourceLinks.filter(l=>l.sourceRowId===source.id);assert(links.length>=1);
    for(const link of links){const entry=gramaticaVocabulary.find(e=>e.id===link.entryId)!;assert(entry.units.includes(Number(source.unit.slice(-2))));assert.equal(pack.studyItems.filter(s=>s.id===entry.studyItemId).length,1);}
  }
  for(const verb of ["dizer","trazer","fazer","querer","ver","vir","dar","saber","pôr","poder","cair","sair"])assert(vocabularyForUnit(14).some(e=>e.lemma===verb));
  assert.equal(vocabularyForUnit(14).filter(e=>e.lemma==="saber").length,2);
  assert.equal(gramaticaVocabulary.filter(e=>e.lemma==="estar").length,1);
  for(const [unit,verb] of [[13,"pagar"],[15,"vestir-se"]] as const)assert(vocabularyForUnit(unit).some(e=>e.lemma===verb));
});
