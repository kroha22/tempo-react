import assert from "node:assert/strict";
import test from "node:test";
import {generalPlanUnits,generalPlanSummary,bookState,bookPassed,supplementalSteps} from "../features/learning/plan/model.ts";
import {practicePlanSteps,emptyPracticePlanProgress} from "../features/practice/plan/model.ts";
import {shortGrammarLessons} from "../features/content/short-grammar-lessons.ts";
import {grammarStart} from "../features/learning/gramatica/session.ts";
import {learningProgressSchema,progressDto,type LearningProgress} from "../features/learning/progress/dto.ts";
test("one plan covers all 54 book topics and all 23 legacy activities without new progress IDs",()=>{
  assert.equal(generalPlanUnits.length,54);assert.deepEqual(generalPlanUnits.map(unit=>unit.unit),Array.from({length:54},(_,i)=>i+1));
  assert.equal(generalPlanUnits.filter(unit=>unit.lesson).length,30);assert(generalPlanUnits.every(unit=>unit.title.length>0));
  assert.deepEqual(new Set(generalPlanUnits.flatMap(unit=>unit.shortLessonIds)),new Set(shortGrammarLessons.map(lesson=>lesson.id)));
  assert.equal(supplementalSteps.length,9);assert(supplementalSteps.every(step=>practicePlanSteps.some(old=>old.id===step.id)));
  const progress=emptyPracticePlanProgress();for(const step of practicePlanSteps)progress.completed[step.id]={revision:1,needsReview:false};
  const before=structuredClone(progress),summary=generalPlanSummary([],progress);
  assert.equal(summary.done.length,0);assert.equal(summary.supplementalDone.length,9);assert.deepEqual(progress,before);
});
test("the latest active book boundary is recommended; revisiting a passed lesson preserves the prior result",()=>{
  const a=generalPlanUnits[0].lesson!,b=generalPlanUnits[26].lesson!;
  const rows:LearningProgress[]=[{lessonId:a.id,flowRevision:1,status:"active",snapshot:{grammar:grammarStart(a)},canDoResult:null,updatedAt:100},{lessonId:b.id,flowRevision:1,status:"active",snapshot:{grammar:grammarStart(b)},canDoResult:null,updatedAt:200}];
  assert.equal(generalPlanSummary(rows).next.unit,27);
  rows[1]={...rows[1],status:"finished",canDoResult:"demonstrated"};const before=structuredClone(rows);
  assert.equal(bookState(b,rows[1]),"active");assert(bookPassed(rows[1]));
  assert.equal(generalPlanSummary(rows).done.length,1);assert.deepEqual(rows,before);
  assert.equal(bookState(a,rows[1]),"new");
});
test("read-only progress timestamps survive DTO parsing without exposing identity or changing old payloads",()=>{
  const row={lessonId:generalPlanUnits[0].lesson!.id,flowRevision:1,status:"active",snapshotJson:"{}",canDoResult:null,updatedAt:123};
  assert.equal(progressDto(row).updatedAt,123);
  const {updatedAt,...legacy}=row;assert.equal(progressDto(legacy).updatedAt,undefined);assert.equal(updatedAt,123);
  const result=learningProgressSchema.parse({...progressDto(row),userId:"private"});assert(!("userId" in result));
  assert.throws(()=>learningProgressSchema.parse({...result,updatedAt:-1}));
});
