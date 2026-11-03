import assert from "node:assert/strict";
import test from "node:test";
import { foundationGrammarLessons } from "../features/content/gramatica-foundations.ts";
import { mixedGrammarReview, mixedReviewSkills } from "../features/content/gramatica-mixed-review.ts";
import { allGramaticaLessons, grammarAnswerCorrect, grammarExitResult, grammarTasks, normalizeGrammarAnswer } from "../features/content/gramatica-ativa.ts";
import { grammarStart, nextGrammarStep, validGrammarSnapshot } from "../features/learning/gramatica/session.ts";
import { grammarSnapshotSchema } from "../features/learning/progress/dto.ts";
import { parseLearningEventInput } from "../features/learning/progress/contracts.ts";
import { firstVerticalSliceContentPack as pack } from "../features/content/manifest.ts";

test("three new checks preserve old foundations and use separate stable evidence",()=>{
  assert.deepEqual(foundationGrammarLessons.map(l=>l.unit),[1,2,3]);
  for(const lesson of foundationGrammarLessons){
    assert.equal(grammarTasks(lesson,"diagnostic").length,6);
    assert.equal(grammarTasks(lesson,"diagnostic").filter(t=>!t.options).length>=2,true);
    const exit=grammarTasks(lesson,"exit");assert.equal(exit.length,5);
    const answers=Object.fromEntries(exit.map(t=>[t.id,t.answers[0]]));
    assert(grammarExitResult(lesson,answers).demonstrated);
    answers[exit[4].id]="wrong";assert(!grammarExitResult(lesson,answers).demonstrated);
    assert(pack.lessons.some(row=>row.id===lesson.id));
  }
  assert.equal(new Set(allGramaticaLessons.flatMap(l=>l.tasks.map(t=>t.id))).size,532);
});
test("mixed check covers eleven existing targets with separate recognition and production evidence",()=>{
  assert.equal(mixedGrammarReview.tasks.length,22);
  const oldPrompts=new Set(allGramaticaLessons.filter(l=>!l.checkpoint).flatMap(l=>l.tasks.map(t=>normalizeGrammarAnswer(t.prompt))));
  for(const skill of mixedReviewSkills){
    const tasks=mixedGrammarReview.tasks.filter(t=>t.target===`grammar:ga1:${skill.slug}`);
    assert.equal(tasks.length,2);assert.equal(tasks.filter(t=>!t.options).length,1);
    for(const task of tasks){assert(!oldPrompts.has(normalizeGrammarAnswer(task.prompt)));assert(parseLearningEventInput({lessonId:mixedGrammarReview.id,sessionId:"session:12345678",clientEventId:`session:12345678:${task.id}`,eventType:"exercise_attempt",entityId:task.id,contentRevision:1,payload:{answer:task.answers[0]},occurredAt:Date.now()}));}
  }
  const definition=pack.lessons.find(l=>l.id===mixedGrammarReview.id)!;
  assert.equal(definition.lessonType,"checkpoint");assert.equal(definition.completionRule.minimumIndependentAttempts,22);
  assert.equal(definition.completionRule.requiredExerciseUseIds.length,22);
  const answers=Object.fromEntries(mixedGrammarReview.tasks.map(t=>[t.id,t.answers[0]]));
  assert(grammarExitResult(mixedGrammarReview,answers).demonstrated);
  answers[mixedGrammarReview.tasks[0].id]="wrong";
  assert(!grammarExitResult(mixedGrammarReview,answers).demonstrated,"21/22 must not conceal a weak skill");
  assert(!grammarAnswerCorrect(mixedGrammarReview.tasks.find(t=>t.answers[0]==="vêm")!,"vem"));
});
test("mixed check resumes beyond the old six-item boundary and reaches all 22 items",()=>{
  let snapshot=grammarStart(mixedGrammarReview);assert.equal(snapshot.phase,"exit");
  for(const [index,task] of mixedGrammarReview.tasks.entries()){
    assert.equal(snapshot.index,index);assert(validGrammarSnapshot(mixedGrammarReview,snapshot));
    snapshot={...snapshot,answers:{...snapshot.answers,[task.id]:task.answers[0]}};
    assert(grammarSnapshotSchema.safeParse(snapshot).success);
    const next=nextGrammarStep(mixedGrammarReview,snapshot);
    if(index===21)assert.equal(next,null);else snapshot=next!;
  }
});
