import assert from "node:assert/strict";
import test from "node:test";
import { presentGrammarLessons } from "../features/content/gramatica-present.ts";
import { allGramaticaLessons, gramaticaLessons, grammarAnswerCorrect, grammarTasks, diagnosticPassed, grammarExitResult } from "../features/content/gramatica-ativa.ts";
import { firstGrammarUnits } from "../features/learning/gramatica/first-units.ts";
import { parseLearningEventInput } from "../features/learning/progress/contracts.ts";
import { pageVocabularySources } from "../features/content/gramatica-page-vocabulary.ts";
import { gramaticaVocabulary, vocabularyForUnit, vocabularySourceLinks } from "../features/content/gramatica-vocabulary.ts";
import { firstVerticalSliceContentPack as pack } from "../features/content/manifest.ts";

test("eight present units reuse foundations and add separate, server-recognized independent evidence", () => {
  assert.deepEqual(presentGrammarLessons.map((l) => l.unit), [4,5,6,7,8,9,10,11]);
  assert.equal(presentGrammarLessons.flatMap((l) => l.tasks).length, 140);
  assert.equal(new Set(allGramaticaLessons.flatMap((l) => l.tasks.map((t) => t.id))).size, 405);
  assert.deepEqual(gramaticaLessons.map((l) => l.unit), [18,19,20,21,22,23]);
  for (const lesson of presentGrammarLessons) {
    assert.equal(firstGrammarUnits.find((u) => u.unit === lesson.unit)?.practiceSlug, lesson.slug);
    const diagnostic = grammarTasks(lesson,"diagnostic"), exit = grammarTasks(lesson,"exit");
    assert.equal(diagnostic.length,6); assert.equal(exit.length,5);
    assert.equal(diagnostic.filter((t) => !t.options).length,2);
    const answers = Object.fromEntries(diagnostic.map((t) => [t.id,t.answers[0]]));
    assert(diagnosticPassed(lesson,answers));
    answers[diagnostic[5].id]="wrong"; assert(!diagnosticPassed(lesson,answers));
    const result = Object.fromEntries(exit.map((t) => [t.id,t.answers[0]]));
    assert(grammarExitResult(lesson,result).demonstrated);
    result[exit[4].id]="wrong"; assert(!grammarExitResult(lesson,result).demonstrated);
    assert(parseLearningEventInput({lessonId:lesson.id,sessionId:"session:12345678",clientEventId:`session:12345678:${exit[0].id}`,eventType:"exercise_attempt",entityId:exit[0].id,contentRevision:1,payload:{answer:exit[0].answers[0]},occurredAt:Date.now()}));
  }
});
test("Portuguese alternatives and accents distinguish hearing, coming, seeing and possession", () => {
  const hearing = presentGrammarLessons[5].tasks.find((t) => t.id.endsWith(":hear"))!;
  assert(grammarAnswerCorrect(hearing,"oiço")); assert(grammarAnswerCorrect(hearing,"ouço"));
  const come = presentGrammarLessons[5].tasks.find((t) => t.id.endsWith(":come-transfer"))!;
  assert(grammarAnswerCorrect(come,"vêm")); assert(!grammarAnswerCorrect(come,"veem")); assert(!grammarAnswerCorrect(come,"vem"));
  const plural = presentGrammarLessons[7].tasks.find((t) => t.id.endsWith(":children"))!;
  assert(!grammarAnswerCorrect(plural,"tem"));
});
test("page additions reuse existing meanings and original review identities", () => {
  assert.equal(pageVocabularySources.length,48); assert.equal(gramaticaVocabulary.length,379);
  for (const row of pageVocabularySources.filter(row=>Number(row.unit.slice(-2))<=11)) {
    const links = vocabularySourceLinks.filter((l) => l.sourceRowId===row.id);
    assert.equal(links.length,1);
    const entry=gramaticaVocabulary.find((e)=>e.id===links[0].entryId)!;
    assert(entry.units.includes(Number(row.unit.slice(-2))));
    assert.equal(pack.studyItems.filter((s)=>s.id===entry.studyItemId).length,1);
    assert(row.pdfPages.length===2 && row.printedPages.length===2);
  }
  assert.equal(gramaticaVocabulary.filter((e)=>e.lemma==="construir").length,1);
  assert(vocabularyForUnit(9).some((e)=>e.lemma==="construir"));
  assert(vocabularyForUnit(6).some((e)=>e.lemma==="conhecer"));
});
