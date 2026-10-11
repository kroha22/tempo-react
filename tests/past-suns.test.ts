import assert from "node:assert/strict";
import test from "node:test";
import { people } from "../features/conjugation/data.ts";
import { pastSunLessons, pastSunAnswer } from "../features/content/past-sun-lessons.ts";
test("past suns reuse shared paradigms and cover each person with translated exercises", () => {
  const expected = { fazer: ["fiz", "fizeste", "fez", "fizemos", "fizeram", "fizeram"], dizer: ["disse", "disseste", "disse", "dissemos", "disseram", "disseram"], ir: ["fui", "foste", "foi", "fomos", "foram", "foram"], trazer: ["trouxe", "trouxeste", "trouxe", "trouxemos", "trouxeram", "trouxeram"] };
  assert.equal(pastSunLessons.length, 4);
  const ids = new Set<string>();
  for (const lesson of pastSunLessons) {
    assert.deepEqual(people.map(person => pastSunAnswer(lesson.verb, person.key)), expected[lesson.verb]);
    assert.equal(lesson.exercises.length, 6);
    assert.equal(new Set(lesson.exercises.map(task => task.person)).size, 6);
    for (const task of lesson.exercises) { assert.ok(!ids.has(task.id)); ids.add(task.id); assert.ok(task.translation && task.before && task.after); }
  }
});
