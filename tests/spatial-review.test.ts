import {test} from "node:test";
import assert from "node:assert/strict";
import {dictationTasks,placementTasks} from "../features/content/spatial-practice.ts";
import {appendTrace,checkTrace,expectedTrace,placeObject,placementCorrect} from "../features/practice/spatial-model.ts";
import {enrollPersonalWord,ratePersonalWord,mergePersonalDeck,personalDeckSchema,type PersonalWordSeed} from "../features/practice/personal-word-deck.ts";

test("placement accepts either side for beside and rejects the wrong object",()=>{
  const task=placementTasks.find(task=>task.places.length===2)!;
  assert.equal(placementCorrect(task,{[task.object]:"left"}),true);
  assert.equal(placementCorrect(task,{[task.object]:"right"}),true);
  assert.equal(placementCorrect(task,{cat:"inside"}),false);
  assert.deepEqual(placeObject({cat:"inside",book:"left"},"book","inside"),{book:"inside"});
});
test("dictations are bounded closed paths and allow returning to the start",()=>{
  for(const task of dictationTasks){const target=expectedTrace(task);assert.deepEqual(target.at(-1),task.start);assert.ok(target.every(p=>p.x>=0&&p.y>=0&&p.x<task.size&&p.y<task.size));let trace=[task.start];for(const p of target.slice(1))trace=appendTrace(trace,p,task.size);assert.equal(checkTrace(task,trace).correct,true);assert.equal(checkTrace(task,trace.slice(0,-1)).correct,false);assert.equal(checkTrace(task,[task.start,task.start]).correct,false);}
  assert.deepEqual(appendTrace([{x:0,y:0}],{x:1,y:1},5),[{x:0,y:0}]);
});
const seed:PersonalWordSeed={wordId:"word:cat",owner:"word",targetId:"word:cat",front:"o gato",back:"кот"};
test("mistake receipts deduplicate; sources merge without resetting an interval",()=>{
  let rows=enrollPersonalWord([],seed,"animals","one",1000,true);
  rows=ratePersonalWord(rows,rows[0].id,2,2000);
  const progress=rows[0].progress;
  rows=enrollPersonalWord(rows,seed,"space","two",3000,true);
  rows=enrollPersonalWord(rows,seed,"space","two",3000,true);
  assert.equal(rows.length,1);assert.equal(rows[0].errors,2);assert.equal(rows[0].needsPractice,true);assert.deepEqual(rows[0].progress,progress);assert.deepEqual(rows[0].sources,["animals","space"]);
  assert.deepEqual(personalDeckSchema.parse(rows),rows);
});
test("review grades reschedule words while external owner schedules stay external",()=>{
  const rows=enrollPersonalWord([],seed,"animals","one",1000);
  const known=ratePersonalWord(rows,rows[0].id,2,2000),again=ratePersonalWord(known,rows[0].id,0,3000);
  assert.ok(known[0].progress!.due>again[0].progress!.due);assert.equal(again[0].progress!.lapses,1);
  const linked=enrollPersonalWord([],{...seed,owner:"study",targetId:"study:word:gato"},"animals","one",1000);
  assert.equal(ratePersonalWord(linked,linked[0].id,2,2000)[0].progress,null);
});
test("backup merge keeps newer scheduling and does not double-count imported mistakes",()=>{
  const old=enrollPersonalWord([],seed,"animals","one",1000,true),newer=ratePersonalWord(old,old[0].id,3,2000);
  const merged=mergePersonalDeck(old,newer);assert.deepEqual(merged[0].progress,newer[0].progress);assert.equal(merged[0].errors,1);assert.equal(merged[0].needsPractice,false);
  assert.equal(personalDeckSchema.safeParse([...merged,...merged]).success,false);
});
