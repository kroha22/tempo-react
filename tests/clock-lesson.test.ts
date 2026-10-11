import assert from "node:assert/strict";
import test from "node:test";
import { clockAngles, clockExamples, clockReadTasks, clockSetTasks, checkClockAnswer, sameClockTime } from "../features/content/clock-lesson.ts";
test("clock hands advance continuously and twelve-hour comparisons wrap correctly", () => {
  assert.deepEqual(clockAngles({hour:7,minute:30}),{hour:225,minute:180});
  assert.deepEqual(clockAngles({hour:0,minute:0}),{hour:0,minute:0});
  assert.ok(sameClockTime({hour:18,minute:40},{hour:6,minute:40}));
  assert.ok(!sameClockTime({hour:6,minute:40},{hour:7,minute:40}));
});
test("time phrases accept source and equivalent wording while numeric scaffolding remains separate", () => {
  for(const task of [...clockExamples,...clockSetTasks]) {
    assert.equal(checkClockAnswer(task,task.phrase.toUpperCase()),"correct");
    for(const alternative of task.alternatives)assert.equal(checkClockAnswer(task,alternative),"correct");
    assert.equal(checkClockAnswer(task,""),"empty");assert.equal(checkClockAnswer(task,"99:99"),"wrong");
  }
  const quarter=clockExamples.find(task=>task.id==="clock-quarter")!;
  assert.equal(checkClockAnswer(quarter,"São sete horas e quinze minutos."),"correct");
  assert.equal(checkClockAnswer(quarter,"7:15"),"numeric");
  assert.equal(checkClockAnswer(quarter,"São oito e quinze"),"wrong");
  assert.deepEqual(clockSetTasks.map(task=>[task.hour,task.minute]),[[6,40],[5,15],[4,30]]);
  assert.equal(new Set(clockReadTasks.map(task=>task.id)).size,clockReadTasks.length);
});
