import assert from "node:assert/strict";
import test from "node:test";
import {futureAndMoodLessons} from "../features/content/gramatica-future-and-mood.ts";
import {futureGrammarUnits} from "../features/learning/gramatica/future-units.ts";
import {grammarTasks,grammarAnswerCorrect,grammarExitResult,diagnosticPassed,allGramaticaLessons} from "../features/content/gramatica-ativa.ts";
import {grammarStart,nextGrammarStep,validGrammarSnapshot} from "../features/learning/gramatica/session.ts";
import {grammarSnapshotSchema} from "../features/learning/progress/dto.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {parseLearningEventInput} from "../features/learning/progress/contracts.ts";
import {futurePageVocabularySources,futureBookPages} from "../features/content/gramatica-future-page-vocabulary.ts";
import {vocabularyForUnit,vocabularySourceLinks,gramaticaVocabulary} from "../features/content/gramatica-vocabulary.ts";
import {grammarReading,grammarGlossaryRows} from "../features/content/grammar-reading.ts";
import {readingCardChoices} from "../features/content/reading-cards.ts";

test("U24–U30 register 127 independent tasks and both runtime paths remain persistable",()=>{
  assert.deepEqual(futureAndMoodLessons.map(l=>l.unit),[24,25,26,27,28,29,30]);
  assert.equal(futureAndMoodLessons.flatMap(l=>l.tasks).length,127);
  assert.equal(new Set(allGramaticaLessons.flatMap(l=>l.tasks.map(t=>t.id))).size,532);
  assert.equal(allGramaticaLessons.filter(l=>!l.checkpoint).length,30);
  for(const lesson of futureAndMoodLessons){
    assert.equal(futureGrammarUnits.find(u=>u.unit===lesson.unit)?.practiceSlug,lesson.slug);
    assert(grammarReading[lesson.slug]);assert(!/[А-Яа-яЁё]/u.test(grammarReading[lesson.slug].rule));
    const diagnostic=grammarTasks(lesson,"diagnostic"),exit=grammarTasks(lesson,"exit");
    assert.equal(diagnostic.length,6);assert.equal(exit.length,5);assert(diagnostic.filter(t=>!t.options).length>=2);
    const answers=Object.fromEntries(diagnostic.map(t=>[t.id,t.answers[0]]));assert(diagnosticPassed(lesson,answers));
    answers[diagnostic.find(t=>!t.options)!.id]="wrong";assert(!diagnosticPassed(lesson,answers));
    const result=Object.fromEntries(exit.map(t=>[t.id,t.answers[0]]));assert(grammarExitResult(lesson,result).demonstrated);
    result[exit[4].id]="wrong";assert(!grammarExitResult(lesson,result).demonstrated);
    assert(pack.lessons.some(row=>row.id===lesson.id));
    for(const task of lesson.tasks){
      assert.equal(task.target,`grammar:ga1:${lesson.slug}`);
      assert(parseLearningEventInput({lessonId:lesson.id,sessionId:"session:12345678",clientEventId:`session:12345678:${task.id}`,eventType:"exercise_attempt",entityId:task.id,contentRevision:1,payload:{answer:task.answers[0]},occurredAt:Date.now()}));
      for(const distractor of task.options?.filter(value=>!task.answers.includes(value))??[])assert(!grammarAnswerCorrect(task,distractor));
    }
    for(const shortcut of [false,true]){
      let snapshot=grammarStart(lesson),steps=0;const phases=new Set<string>();
      while(true){
        phases.add(snapshot.phase);assert(validGrammarSnapshot(lesson,snapshot));assert(grammarSnapshotSchema.safeParse(snapshot).success);
        if(snapshot.phase!=="rule"){
          const task=grammarTasks(lesson,snapshot.phase)[snapshot.index];
          snapshot={...snapshot,answers:{...snapshot.answers,[task.id]:!shortcut&&snapshot.phase==="diagnostic"?"wrong":task.answers[0]}};
        }
        const next=nextGrammarStep(lesson,snapshot);if(!next)break;snapshot=next;assert(++steps<30);
      }
      assert.equal(phases.has("guided"),!shortcut);assert(phases.has("exit"));
    }
  }
});
test("person, accents, negative clitics and impersonal HAVER stay semantically significant",()=>{
  const cases:[number,string,string,string][]=[
    [24,"bring-eu","trarei","trazerei"],[24,"say-tu","dirás","diras"],
    [25,"make-we","faríamos","fariamos"],[25,"request-tu","poderias","podias"],
    [26,"plural-reflexive","levantem-se","se levantem"],
    [27,"tu-be","sejas","sê"],[27,"formal-give","dê","de"],[27,"plural-reflexive","não se levantem","não levantem-se"],
    [28,"we-do","fazermos","fizermos"],[28,"tu-before","saíres","saires"],
    [29,"read-we","vamos lendo","vamos ler"],[29,"do-tu","vais fazendo","vai fazendo"],
    [30,"past-plural","houve","houveram"],[30,"future-plural","haverá","haverão"],[30,"we-intent","havemos de","há de"],
  ];
  for(const [unit,slug,correct,wrong] of cases){
    const task=futureAndMoodLessons.find(l=>l.unit===unit)!.tasks.find(t=>t.id.endsWith(`:exit:${slug}`))!;
    assert(task);assert(grammarAnswerCorrect(task,` ${correct.toUpperCase()}! `));assert(!grammarAnswerCorrect(task,wrong));
  }
});
test("42 verified page links reuse existing meanings and keep HAVER DE separate from existence",()=>{
  assert.equal(futurePageVocabularySources.length,42);assert.equal(futureBookPages.length,7);
  for(const source of futurePageVocabularySources){
    const links=vocabularySourceLinks.filter(link=>link.sourceRowId===source.id);assert(links.length>0);assert.equal(source.pdfPages.length,2);
    for(const link of links){const entry=gramaticaVocabulary.find(e=>e.id===link.entryId)!;assert(entry.units.includes(Number(source.unit.slice(-2))));assert.equal(pack.studyItems.filter(item=>item.id===entry.studyItemId).length,1);}
  }
  for(let unit=24;unit<=30;unit++){assert(vocabularyForUnit(unit,"preview").length>0);assert(vocabularyForUnit(unit,"core").length>0);}
  const existence=gramaticaVocabulary.find(e=>e.studyItemId==="study:chunk:ha-presence")!;
  const intention=gramaticaVocabulary.find(e=>e.lemma==="haver de")!;
  assert(existence.units.includes(30));assert.notEqual(intention.studyItemId,existence.studyItemId);
  assert.equal(readingCardChoices("hão de")[0].studyItemId,intention.studyItemId);
  assert.equal(gramaticaVocabulary.filter(e=>e.lemma==="ouvir").length,2);
  assert.equal(vocabularyForUnit(26).find(e=>e.lemma==="ouvir")?.sense,"listen");
  const forms=grammarGlossaryRows.flatMap(([words])=>words.split(","));assert.equal(forms.length,new Set(forms).size);
});
