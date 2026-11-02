import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { gramaticaLessons, grammarTasks } from "../features/content/gramatica-ativa.ts";
import { presentGrammarLessons } from "../features/content/gramatica-present.ts";
import { pageVocabularySources } from "../features/content/gramatica-page-vocabulary.ts";
import { gramaticaVocabulary } from "../features/content/gramatica-vocabulary.ts";

const origin = new URL(process.env.TEMPO_LOCAL_TEST_URL ?? "http://localhost:3000");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Synthetic users must only target a local Worker");
const user = `ga1-qa:${randomUUID()}`;
async function request(path, body, identity = user) {
  const response = await fetch(new URL(path, origin), { method: body ? "POST" : "GET", headers: { "content-type": "application/json", "oai-authenticated-user-id": identity }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json() };
}
test("all six grammar lessons save/resume in D1, isolate users and grade first answers on the server", async () => {
  for (const lesson of gramaticaLessons) {
    const sessionId = `session:${randomUUID()}`;
    const base = { lessonId: lesson.id, sessionId, flowRevision: 1 };
    const snapshot = { stage: "activity", grammar: { sessionId, phase: "exit", index: 0, answers: {} } };
    assert.equal((await request("/api/learning/progress", { ...base, status: "active", activePhaseId: `phase:ga1:${lesson.slug}:exit`, snapshot, updatedAt: Date.now() })).status, 200);
    const loaded = await request("/api/learning/progress");
    assert.deepEqual(loaded.body.progress.find((p) => p.lessonId === lesson.id).snapshot, snapshot);
    const complete = { ...base, clientEventId: `complete:${sessionId}`, completedAt: Date.now() };
    assert.equal((await request("/api/learning/complete", complete)).status, 409, "cannot finish with missing evidence");
    for (const [index, task] of grammarTasks(lesson, "exit").entries()) {
      const answer = index === 4 ? "wrong answer" : task.answers[0];
      const event = { lessonId: lesson.id, sessionId, entityId: task.id, clientEventId: `${sessionId}:${task.id}`, eventType: "exercise_attempt", contentRevision: 1, occurredAt: Date.now(), payload: { answer, correct: true } };
      const saved = await request("/api/learning/events", event);
      assert.equal(saved.status, 201);
      assert.equal(saved.body.event.answer, answer);
      if (index === 4) {
        const retry = await request("/api/learning/events", { ...event, payload: { answer: task.answers[0], correct: true } });
        assert.equal(retry.body.duplicate, true);
        assert.equal(retry.body.event.answer, answer, "retry returns first answer even after a changed payload");
      }
    }
    const result = await request("/api/learning/complete", complete);
    assert.equal(result.status, 200);
    assert.equal(result.body.attemptCanDoResult, "partial", "4/5 with a wrong critical item cannot demonstrate the objective");
    const freshSession = `session:${randomUUID()}`;
    for (const task of grammarTasks(lesson, "exit")) assert.equal((await request("/api/learning/events", { lessonId: lesson.id, sessionId: freshSession, entityId: task.id, clientEventId: `${freshSession}:${task.id}`, eventType: "exercise_attempt", contentRevision: 1, occurredAt: Date.now(), payload: { answer: task.answers[0], correct: false } })).status, 201);
    const passed = await request("/api/learning/complete", { ...base, sessionId: freshSession, clientEventId: `complete:${freshSession}`, completedAt: Date.now() });
    assert.equal(passed.body.attemptCanDoResult, "demonstrated", "server derives correctness, ignoring client score");
    const laterPartial = await request("/api/learning/complete", { ...complete, completedAt: Date.now() });
    assert.equal(laterPartial.body.attemptCanDoResult, "partial");
    assert.equal(laterPartial.body.progress.canDoResult, "demonstrated", "historical evidence is preserved separately");
    assert.equal(laterPartial.body.progress.snapshot.canDoResult, "partial", "resume reports the latest attempt accurately");
    const repeat = { ...snapshot, grammar: { ...snapshot.grammar, sessionId: `session:${randomUUID()}`, index: 1 } };
    const resave = await request("/api/learning/progress", { ...base, sessionId: repeat.grammar.sessionId, status: "active", snapshot: repeat, updatedAt: Date.now() });
    assert.deepEqual(resave.body.progress.snapshot, repeat, "new attempt can resume after an earlier completion");
    assert.equal(resave.body.progress.canDoResult, "demonstrated", "repeat does not erase prior evidence");
    const item = `study:chunk:ga1:${lesson.vocabulary[0].slug}`;
    const save = { studyItemId: item, sourceId: lesson.id, sourceType: "lesson", clientEventId: `card:${randomUUID()}` };
    assert.equal((await request("/api/study-items", save)).status, 200);
    assert.equal((await request("/api/study-items", save)).status, 200);
  }
  const other = await request("/api/learning/progress", undefined, `${user}:other`);
  assert.deepEqual(other.body.progress, []);
  const saved = await request("/api/study-items");
  assert.equal(saved.body.items.length, 6);
  assert.equal((await request("/api/study-items", undefined, `${user}:other`)).body.items.length, 0);
});

test("eight present lessons retain independent durable attempts without changing old lessons or review schedules", async () => {
  const identity=`${user}:present`;
  const old={cardId:"v0043",due:1_900_000_000_000,interval:17,ease:2.6,repetitions:8,lapses:1,lastGrade:2};
  assert.equal((await request("/api/progress",old,identity)).status,200);
  const previous={lessonId:"lesson:a1-1:introduce-yourself",sessionId:`session:${randomUUID()}`,flowRevision:1,status:"active",snapshot:{stage:"activity"},updatedAt:Date.now()};
  assert.equal((await request("/api/learning/progress",previous,identity)).status,200);
  for(const lesson of presentGrammarLessons) {
    const sessionId=`session:${randomUUID()}`;
    const grammar={sessionId,phase:"diagnostic",index:0,answers:{}};
    assert.equal((await request("/api/learning/progress",{lessonId:lesson.id,sessionId,flowRevision:1,status:"active",snapshot:{stage:"activity",grammar},updatedAt:Date.now()},identity)).status,200);
    const loaded=await request("/api/learning/progress",undefined,identity);
    assert.deepEqual(loaded.body.progress.find(p=>p.lessonId===lesson.id).snapshot.grammar,grammar);
    const complete={lessonId:lesson.id,sessionId,flowRevision:1,clientEventId:`complete:${sessionId}`,completedAt:Date.now()};
    assert.equal((await request("/api/learning/complete",complete,identity)).status,409);
    for(const task of grammarTasks(lesson,"exit")) assert.equal((await request("/api/learning/events",{lessonId:lesson.id,sessionId,clientEventId:`${sessionId}:${task.id}`,entityId:task.id,eventType:"exercise_attempt",contentRevision:1,payload:{answer:task.answers[0]},occurredAt:Date.now()},identity)).status,201);
    assert.equal((await request("/api/learning/complete",complete,identity)).body.attemptCanDoResult,"demonstrated");
  }
  assert.deepEqual((await request("/api/progress",undefined,identity)).body.progress,[old]);
  assert.deepEqual((await request("/api/learning/progress",undefined,identity)).body.progress.find(p=>p.lessonId===previous.lessonId).snapshot,previous.snapshot);
  for(const source of pageVocabularySources) {
    const entry=gramaticaVocabulary.find(e=>e.sourceRowIds.includes(source.id));
    const save={studyItemId:entry.studyItemId,sourceType:"topic",sourceId:"course:ga1:pt-pt",sourceContextId:`unit:ga1:u${source.unit.slice(-2)}`,clientEventId:`card:${randomUUID()}`};
    assert.equal((await request("/api/study-items",save,identity)).status,200);
    assert.equal((await request("/api/study-items",save,identity)).status,200);
  }
  const queue=await request("/api/study-reviews",undefined,identity);
  assert.equal(queue.body.cards.length,16);
  const first=queue.body.cards[0];
  const reviewed=await request("/api/study-reviews",{studyItemId:first.studyItemId,clientEventId:`review:${randomUUID()}`,expectedVersion:0,grade:2},identity);
  assert.equal(reviewed.status,200);
  assert.equal(reviewed.body.card.reviewItemId,first.reviewItemId);
  assert.equal(reviewed.body.card.version,1);
  assert.deepEqual((await request("/api/progress",undefined,identity)).body.progress,[old]);
});
