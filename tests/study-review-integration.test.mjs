import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { scheduleReviewProgress } from "../features/cards/scheduler.ts";
import { studyReviewCards } from "../features/cards/study-review/catalog.ts";

const origin = new URL(process.env.TEMPO_LOCAL_TEST_URL ?? "http://localhost:3000");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Synthetic identities must only target a local Worker");
const user = `study-srs-test:${randomUUID()}`;
async function request(path, body, identity = user) {
  const response = await fetch(new URL(path, origin), { method: body ? "POST" : "GET", headers: { "content-type": "application/json", ...(identity ? { "oai-authenticated-user-id": identity } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  return { status: response.status, body: await response.json() };
}
async function save(studyItemId, unit = 18) {
  return request("/api/study-items", { studyItemId, sourceType: "topic", sourceId: "course:ga1:pt-pt", sourceContextId: `unit:ga1:u${unit}`, clientEventId: `card:${randomUUID()}` });
}
const command = (studyItemId, grade, expectedVersion = 0) => ({ studyItemId, grade, expectedVersion, clientEventId: `review:${randomUUID()}` });

test("shared SRS persists all grades, reuses IDs, preserves sources/legacy progress and isolates users", async () => {
  assert.equal((await request("/api/study-reviews", undefined, "")).status, 401);
  assert.deepEqual((await request("/api/study-reviews")).body.cards, []);
  const legacy = { cardId: "v0043", due: 1800000000000, interval: 7, ease: 2.7, repetitions: 3, lapses: 1, lastGrade: 2 };
  assert.equal((await request("/api/progress", legacy)).status, 200);
  const ids = ["study:chunk:ga1:enquanto", "study:noun:livro", "study:chunk:ga1:meia-noite", "study:chunk:ga1:por-favor"];
  for (const [grade, id] of ids.entries()) {
    assert(studyReviewCards.some((card) => card.studyItemId === id));
    assert.equal((await request("/api/study-reviews", command(id, grade))).status, 404);
    const saved = await save(id);
    assert.equal(saved.status, 200);
    const input = command(id, grade);
    const result = await request("/api/study-reviews", input);
    assert.equal(result.status, 200, JSON.stringify(result.body));
    const card = result.body.card;
    assert.equal(card.reviewItemId, `saved:${id}`);
    assert.equal(card.version, 1);
    assert.deepEqual(card.progress, scheduleReviewProgress(card.reviewItemId, undefined, grade, card.reviewedAt));
    const retry = await request("/api/study-reviews", input);
    assert.equal(retry.body.duplicate, true);
    assert.deepEqual(retry.body.card, card);
    assert.equal((await request("/api/study-reviews", { ...input, grade: (grade + 1) % 4 })).status, 409);
    assert.equal((await request("/api/study-reviews", command(id, grade))).status, 409);
    await save(id, 19);
    const loaded = (await request("/api/study-reviews")).body.cards.find((row) => row.studyItemId === id);
    assert.deepEqual(loaded, card, "saving another lesson must not reset SRS");
    assert.equal((await request("/api/study-items")).body.items.find((item) => item.studyItemId === id).savedAt, saved.body.item.savedAt);
  }
  const old = (await request("/api/study-reviews")).body.cards.find((row) => row.studyItemId === ids[0]);
  const later = await request("/api/study-reviews", command(ids[0], 0, 1));
  assert.equal(later.body.card.version, 2);
  assert.deepEqual(later.body.card.progress, scheduleReviewProgress(old.reviewItemId, old.progress, 0, later.body.card.reviewedAt));
  assert.equal(later.body.card.progress.lapses, 2);
  assert.deepEqual((await request("/api/progress")).body.progress, [legacy]);
  const basicVerb = "study:ga1:verb:querer:entry";
  await save(basicVerb, 7);
  const basicResult = await request("/api/study-reviews", command(basicVerb, 2));
  assert.equal(basicResult.body.card.progress.interval, 1.8, "basic verb priority must use the existing metadata");
  assert.deepEqual((await request("/api/study-reviews", undefined, `${user}:other`)).body.cards, []);
  assert.equal((await request("/api/study-reviews", command(ids[0], 2), `${user}:other`)).status, 404);
  assert.equal((await request("/api/study-reviews", { ...command(ids[0], 2), userId: "other" })).status, 400);
  assert.equal((await request("/api/study-reviews", { ...command(ids[0], 2), due: 9999999999 })).status, 400);
});

test("concurrent duplicates apply once; racing commands cannot overwrite newer progress or consume a second card", async () => {
  const id = "study:chunk:ga1:ultimamente";
  await save(id);
  const first = command(id, 2);
  const replies = await Promise.all(Array.from({ length: 6 }, () => request("/api/study-reviews", first)));
  assert(replies.every((r) => r.status === 200), JSON.stringify(replies));
  for (const reply of replies) assert.deepEqual(reply.body.card, replies[0].body.card);
  assert.equal((await request("/api/study-reviews")).body.cards.find((r) => r.studyItemId === id).version, 1);
  const race = await Promise.all([request("/api/study-reviews", command(id, 0, 1)), request("/api/study-reviews", command(id, 3, 1))]);
  assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await request("/api/study-reviews")).body.cards.find((r) => r.studyItemId === id).version, 2);
  const left = "study:chunk:ga1:antes-de", right = "study:chunk:ga1:desde-que";
  await save(left); await save(right);
  const collision = command(left, 2);
  const conflict = await Promise.all([request("/api/study-reviews", collision), request("/api/study-reviews", { ...collision, studyItemId: right })]);
  assert.deepEqual(conflict.map((r) => r.status).sort(), [200, 409]);
  const rows = (await request("/api/study-reviews")).body.cards.filter((r) => r.studyItemId === left || r.studyItemId === right);
  assert.deepEqual(rows.map((r) => r.version).sort(), [0, 1]);
});
