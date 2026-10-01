import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

// Synthetic identities are only for the local Worker, never for a hosted site.
const origin = new URL(process.env.TEMPO_LOCAL_TEST_URL ?? "http://localhost:3000");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Integration fixtures must target a local Worker");
const user = `tempo-integration:${randomUUID()}`;
const row = { cardId: "v0043", due: 1_800_000_000_000, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastGrade: 2 };

async function request(method, identity, body) {
  return fetch(new URL("/api/progress", origin), {
    method,
    headers: { "content-type": "application/json", "oai-authenticated-user-id": identity },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
}

test("D1 preserves a review, retries the same payload once, and isolates users", async () => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const saved = await request("POST", user, row);
    assert.equal(saved.status, 200, "Local D1 must contain the committed migrations");
    assert.deepEqual(await saved.json(), { progress: row });
  }
  const loaded = await request("GET", user);
  assert.equal(loaded.status, 200);
  assert.deepEqual(await loaded.json(), { progress: [row] });
  const other = await request("GET", `${user}:other`);
  assert.equal(other.status, 200);
  assert.deepEqual(await other.json(), { progress: [] });
  const invalid = await request("POST", user, { ...row, cardId: "unknown" });
  assert.equal(invalid.status, 400);
});

async function learningRequest(path, method, identity, body) {
  const response = await fetch(new URL(path, origin), {
    method, headers: { "content-type": "application/json", "oai-authenticated-user-id": identity },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json();
  assert.doesNotMatch(JSON.stringify(result), /"(?:userId|sessionId|snapshotJson|payloadJson|lastEventId)"/);
  return { status: response.status, result };
}

test("Learning D1 contracts isolate progress, deduplicate events and project saved items", async () => {
  const learner = `learning-test:${randomUUID()}`;
  const other = `${learner}:other`;
  const lessonId = "lesson:a1-1:introduce-yourself";
  const sessionId = `session:${randomUUID()}`;
  const boundary = { lessonId, sessionId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, updatedAt: Date.now(), userId: other };
  const saved = await learningRequest("/api/learning/progress", "POST", learner, boundary);
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.result.progress, { lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, canDoResult: null });
  assert.deepEqual((await learningRequest("/api/learning/progress", "GET", learner)).result, { progress: [saved.result.progress] });
  assert.deepEqual((await learningRequest("/api/learning/progress", "GET", other)).result, { progress: [] });
  const invalid = await learningRequest("/api/learning/progress", "POST", learner, { ...boundary, snapshot: { stage: "unknown" } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.result.code, "INVALID_INPUT");
  const wrongRevision = await learningRequest("/api/learning/progress", "POST", learner, { ...boundary, flowRevision: 2 });
  assert.equal(wrongRevision.status, 409);
  assert.equal(wrongRevision.result.code, "REVISION_MISMATCH");

  const event = { lessonId, sessionId, clientEventId: `client:${randomUUID()}`, eventType: "session_started", contentRevision: 1, payload: {}, occurredAt: Date.now() };
  const first = await learningRequest("/api/learning/events", "POST", learner, event);
  assert.equal(first.status, 201);
  assert.deepEqual(first.result, { event: { clientEventId: event.clientEventId }, duplicate: false });
  const retry = await learningRequest("/api/learning/events", "POST", learner, event);
  assert.equal(retry.status, 200);
  assert.deepEqual(retry.result, { event: { clientEventId: event.clientEventId }, duplicate: true });
  assert.equal((await learningRequest("/api/learning/events", "POST", other, event)).status, 201);

  const itemInput = { studyItemId: "study:chunk:chamo-me", sourceType: "lesson", sourceId: lessonId, clientEventId: `client:${randomUUID()}` };
  const item = await learningRequest("/api/study-items", "POST", learner, itemInput);
  assert.equal(item.status, 200);
  const again = await learningRequest("/api/study-items", "POST", learner, itemInput);
  assert.deepEqual(again.result, item.result);
  assert.deepEqual(Object.keys(item.result.item).sort(), ["savedAt", "studyItemId"]);
  assert.deepEqual((await learningRequest("/api/study-items", "GET", other)).result, { items: [], sources: [] });

  for (let occurrence = 0; occurrence < 2; occurrence += 1) {
    const error = await learningRequest("/api/learning/events", "POST", learner, {
      ...event, clientEventId: `client:${randomUUID()}`, eventType: "error",
      payload: { errorCode: "INTRO_REQUIRED_CHUNK", targetId: "chunk:chamo-me" },
    });
    assert.equal(error.status, 201);
  }
  const patterns = await learningRequest("/api/learning/errors", "GET", learner);
  assert.equal(patterns.status, 200);
  assert.deepEqual(patterns.result.patterns, [{ patternKey: "INTRO_REQUIRED_CHUNK:chunk:chamo-me", errorCode: "INTRO_REQUIRED_CHUNK", targetId: "chunk:chamo-me", occurrenceCount: 2 }]);
  assert.deepEqual((await learningRequest("/api/learning/errors", "GET", other)).result, { patterns: [] });
  assert.equal((await learningRequest("/api/learning/errors", "POST", learner, { patternKey: patterns.result.patterns[0].patternKey, result: "improved" })).status, 200);

  const completion = { lessonId, sessionId, clientEventId: `client:${randomUUID()}`, flowRevision: 1, completedAt: Date.now() };
  const missing = await learningRequest("/api/learning/complete", "POST", learner, completion);
  assert.equal(missing.status, 409);
  assert.equal(missing.result.code, "MISSING_ATTEMPTS");
  assert(missing.result.missingItemIds.length > 0);
  for (const entityId of missing.result.missingItemIds) {
    const attempt = await learningRequest("/api/learning/events", "POST", learner, {
      ...event, clientEventId: `client:${randomUUID()}`, eventType: "exercise_attempt", entityId, payload: { correct: true },
    });
    assert.equal(attempt.status, 201);
  }
  const completed = await learningRequest("/api/learning/complete", "POST", learner, completion);
  assert.equal(completed.status, 200);
  assert.equal(completed.result.progress.status, "finished");
  assert.equal(completed.result.progress.canDoResult, "demonstrated");
  const stale = await learningRequest("/api/learning/progress", "POST", learner, boundary);
  assert.equal(stale.result.progress.status, "finished");
  assert.equal((await learningRequest("/api/learning/complete", "POST", other, completion)).status, 409);
});
