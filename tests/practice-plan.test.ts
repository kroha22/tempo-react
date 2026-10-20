import assert from "node:assert/strict";
import test from "node:test";
import { shortGrammarLessons } from "../features/content/short-grammar-lessons.ts";
import { pairVocabulary } from "../features/content/vocabulary-catalog.ts";
import { applyPracticePlanAction, emptyPracticePlanProgress, isPracticeStepComplete, mergePracticePlanProgress, nextPracticeStep, parsePracticePlanProgress, practicePlanChapters, practicePlanSteps } from "../features/practice/plan/model.ts";

test("the practice plan groups existing lessons and words without duplicating their identities",()=>{
  assert.equal(practicePlanChapters.length,5);assert.equal(practicePlanSteps.length,23);
  assert.equal(new Set(practicePlanSteps.map(step=>step.id)).size,23);
  assert.deepEqual(practicePlanSteps.filter(step=>step.kind==="grammar").map(step=>step.lessonId).sort(),shortGrammarLessons.map(lesson=>lesson.id).sort());
  for(const step of practicePlanSteps)if(step.kind==="words")assert.ok(step.wordIds.every(id=>pairVocabulary.some(word=>word.id===id)));
});

test("opening a lesson only saves a resume hint, completion is idempotent and advances the recommendation",()=>{
  let progress=emptyPracticePlanProgress();const first=practicePlanSteps[0],second=practicePlanSteps[1];
  assert.equal(nextPracticeStep(progress).id,first.id);
  progress=applyPracticePlanAction(progress,{type:"visit",stepId:first.id});
  assert.equal(isPracticeStepComplete(progress,first),false);
  progress=applyPracticePlanAction(progress,{type:"complete",stepId:first.id,needsReview:false});
  progress=applyPracticePlanAction(progress,{type:"complete",stepId:first.id,needsReview:false});
  assert.equal(Object.keys(progress.completed).length,1);assert.equal(nextPracticeStep(progress).id,second.id);
  assert.deepEqual(parsePracticePlanProgress(JSON.parse(JSON.stringify(progress))),progress);
});

test("review can improve an assisted result and never erases prior completion",()=>{
  const id=practicePlanSteps[0].id;
  let progress=applyPracticePlanAction(emptyPracticePlanProgress(),{type:"complete",stepId:id,needsReview:true});
  progress=applyPracticePlanAction(progress,{type:"complete",stepId:id,needsReview:false});
  assert.equal(progress.completed[id].needsReview,false);
  progress=applyPracticePlanAction(progress,{type:"complete",stepId:id,needsReview:true});
  assert.equal(progress.completed[id].needsReview,false);
  const changed={...practicePlanSteps[0],revision:2};
  assert.equal(isPracticeStepComplete(progress,changed),false);
  progress.completed[id]={revision:2,needsReview:false};
  assert.equal(applyPracticePlanAction(progress,{type:"complete",stepId:id,needsReview:true}).completed[id].revision,2);
});

test("merging a second tab preserves independent completions and unknown future IDs",()=>{
  const a=applyPracticePlanAction(emptyPracticePlanProgress(),{type:"complete",stepId:practicePlanSteps[0].id,needsReview:false});
  const b=applyPracticePlanAction(emptyPracticePlanProgress(),{type:"complete",stepId:practicePlanSteps[1].id,needsReview:true});
  b.completed["practice:future:chapter"]={revision:2,needsReview:false};
  const merged=mergePracticePlanProgress(a,b);
  assert.equal(Object.keys(merged.completed).length,3);assert.deepEqual(parsePracticePlanProgress(merged),merged);
  assert.equal(nextPracticeStep(merged).id,practicePlanSteps[2].id);
});

test("invalid stored progress is rejected rather than overwritten as an empty plan",()=>{
  for(const value of [null,[],{version:2,completed:{},lastStepId:null},{version:1,lastStepId:9,completed:{}},{version:1,lastStepId:null,completed:{"practice:grammar:ser":{revision:-1,needsReview:false}}},{version:1,lastStepId:null,completed:JSON.parse('{"__proto__":{"revision":1,"needsReview":false}}')}])assert.throws(()=>parsePracticePlanProgress(value));
  assert.throws(()=>applyPracticePlanAction(emptyPracticePlanProgress(),{type:"complete",stepId:"missing",needsReview:false}));
});
