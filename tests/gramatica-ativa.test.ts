import assert from "node:assert/strict";
import test from "node:test";
import { diagnosticPassed, grammarAnswerCorrect, grammarExitResult, grammarTasks, gramaticaLessons, normalizeGrammarAnswer } from "../features/content/gramatica-ativa.ts";
import { currentGrammarTask, grammarStart, nextGrammarStep, validGrammarSnapshot } from "../features/learning/gramatica/session.ts";
import { grammarSnapshotSchema } from "../features/learning/progress/dto.ts";
import { parseLearningEventInput } from "../features/learning/progress/contracts.ts";

test("six supplemental lessons have disjoint diagnostic, practice and independent evidence", () => {
  assert.deepEqual(gramaticaLessons.map((l) => l.unit), [18, 19, 20, 21, 22, 23]);
  const ids = gramaticaLessons.flatMap((l) => l.tasks.map((t) => t.id));
  assert.equal(new Set(ids).size, 90);
  for (const lesson of gramaticaLessons) {
    assert.equal(grammarTasks(lesson, "diagnostic").length, 6);
    assert.equal(grammarTasks(lesson, "guided").length, 4);
    assert.equal(grammarTasks(lesson, "exit").length, 5);
    const diagnostic = grammarTasks(lesson, "diagnostic");
    assert.equal(diagnostic.filter((t) => !t.options).length, 2);
    const answers = Object.fromEntries(diagnostic.map((t) => [t.id, t.answers[0]]));
    assert(diagnosticPassed(lesson, answers));
    answers[diagnostic[4].id] = "wrong";
    assert(!diagnosticPassed(lesson, answers), "5/6 cannot hide a failed production item");
    const exit = grammarTasks(lesson, "exit");
    const full = Object.fromEntries(exit.map((t) => [t.id, t.answers[0]]));
    assert(grammarExitResult(lesson, full).demonstrated);
    full[exit[4].id] = "wrong";
    assert.equal(grammarExitResult(lesson, full).correct, 4);
    assert(!grammarExitResult(lesson, full).demonstrated, "critical target cannot be averaged away");
    const start = grammarStart();
    assert(parseLearningEventInput({ lessonId: lesson.id, sessionId: start.sessionId, clientEventId: `${start.sessionId}:${exit[0].id}`, eventType: "exercise_attempt", entityId: exit[0].id, contentRevision: 1, payload: { answer: exit[0].answers[0] }, occurredAt: Date.now() }));
  }
});

test("Portuguese normalization preserves meaning-bearing accents and accepts NFC", () => {
  assert.equal(normalizeGrammarAnswer("  ELA   VAI ESTUDAR! "), "ela vai estudar");
  const task = gramaticaLessons[4].tasks.find((t) => t.answers[0] === "têm")!;
  assert(grammarAnswerCorrect(task, " TÊM. "));
  assert(!grammarAnswerCorrect(task, "tem"));
  assert(!grammarAnswerCorrect(gramaticaLessons[5].tasks.find((t) => t.answers[0] === "acabámos de ler")!, "acabamos de ler"));
});

test("safe resume, first-answer retention and diagnostic branching", () => {
  const lesson = gramaticaLessons[0];
  let snapshot = grammarStart();
  assert(validGrammarSnapshot(lesson, grammarSnapshotSchema.parse(snapshot)));
  assert.equal(nextGrammarStep(lesson, snapshot), snapshot, "unanswered task cannot advance");
  for (const task of grammarTasks(lesson, "diagnostic")) {
    assert.equal(currentGrammarTask(lesson, snapshot)?.id, task.id);
    snapshot = { ...snapshot, answers: { ...snapshot.answers, [task.id]: task.answers[0] } };
    snapshot = nextGrammarStep(lesson, snapshot)!;
  }
  assert.equal(snapshot.phase, "rule");
  assert.equal(nextGrammarStep(lesson, snapshot)?.phase, "exit");
  assert.equal(nextGrammarStep(lesson, { ...snapshot, answers: {} })?.phase, "guided");
  assert(!validGrammarSnapshot(lesson, { ...snapshot, phase: "exit", index: 6 }));
  assert(!validGrammarSnapshot(lesson, { ...snapshot, answers: { "exercise:unknown": "x" } }));
  assert(!grammarSnapshotSchema.safeParse({ ...snapshot, index: 99 }).success);
});
