import assert from "node:assert/strict";
import test from "node:test";
import { trazerAnswer, checkTrazerAnswer, trazerLesson } from "../features/content/trazer-lesson.ts";
import { people, verbs } from "../features/conjugation/data.ts";
test("trazer lesson uses the shared irregular paradigm for every exercise", () => {
  assert.deepEqual(people.map(person => trazerAnswer(person.key)), ["trouxe", "trouxeste", "trouxe", "trouxemos", "trouxeram", "trouxeram"]);
  assert.equal(verbs.trazer.group, "irregular");
  assert.equal(new Set(trazerLesson.exercises.map(task => task.id)).size, 6);
  assert.equal(new Set(trazerLesson.exercises.map(task => task.person)).size, 6);
  for (const task of trazerLesson.exercises) {
    assert.ok(checkTrazerAnswer(task.person, ` ${trazerAnswer(task.person).toUpperCase()} `));
    assert.ok(!checkTrazerAnswer(task.person, "trazi"));
    assert.ok(!checkTrazerAnswer(task.person, ""));
  }
});
