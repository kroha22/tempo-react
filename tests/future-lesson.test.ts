import assert from "node:assert/strict";
import test from "node:test";
import { futureTasks, futureForm, futureSentence, checkFutureTask } from "../features/content/future-lesson.ts";
test("future exercise preserves the four source sentences and both independent decisions", () => {
  assert.deepEqual(futureTasks.map(futureSentence), [
    "O João e o Tiago vão passear juntos amanhã à tarde.",
    "Duarte, tu vais jogar futebol amanhã?",
    "Olá! Vocês vão andar de patins depois das aulas?",
    "A Teresa vai ver um filme na próxima quinta-feira.",
  ]);
  for (const task of futureTasks) {
    assert.equal(task.verbs.filter(form => form === futureForm(task.person)).length, 1);
    assert.equal(task.times.length, 3);
    assert.deepEqual(checkFutureTask(task, null, null), { verb: false, time: false });
    assert.deepEqual(checkFutureTask(task, futureForm(task.person), task.timeIndex), { verb: true, time: true });
    assert.deepEqual(checkFutureTask(task, futureForm(task.person), (task.timeIndex + 1) % 3), { verb: true, time: false });
    assert.deepEqual(checkFutureTask(task, task.verbs.find(form => form !== futureForm(task.person))!, task.timeIndex), { verb: false, time: true });
  }
});
