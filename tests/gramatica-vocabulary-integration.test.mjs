import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { gramaticaVocabulary } from "../features/content/gramatica-vocabulary.ts";

const origin = new URL(process.env.TEMPO_LOCAL_TEST_URL ?? "http://localhost:3000");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Only a local Worker may receive synthetic identities");
const identity = `ga1-vocabulary:${randomUUID()}`;
async function request(path, body, user = identity) {
  const response = await fetch(new URL(path, origin), { method: body ? "POST" : "GET", headers: { "content-type": "application/json", "oai-authenticated-user-id": user }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json() };
}
test("dictionary save preserves old review/lesson/card records and accumulates 54-unit source contexts without duplicate cards", async () => {
  const review = { cardId: "v0043", due: 1_800_000_000_000, interval: 17, ease: 2.7, repetitions: 8, lapses: 2, lastGrade: 3 };
  assert.equal((await request("/api/progress", review)).status, 200);
  const lesson = { lessonId: "lesson:a1-1:introduce-yourself", sessionId: `session:${randomUUID()}`, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, updatedAt: Date.now() };
  assert.equal((await request("/api/learning/progress", lesson)).status, 200);
  const original = await request("/api/study-items", { studyItemId: "study:noun:livro", sourceType: "lesson", sourceId: lesson.lessonId, clientEventId: `card:${randomUUID()}` });
  assert.equal(original.status, 200);
  const book = gramaticaVocabulary.find((e) => e.lemma === "livro");
  assert.equal(book.studyItemId, "study:noun:livro");
  for (const unit of book.units) {
    const save = { studyItemId: book.studyItemId, sourceType: "topic", sourceId: "course:ga1:pt-pt", sourceContextId: `unit:ga1:u${String(unit).padStart(2, "0")}`, clientEventId: `card:${randomUUID()}` };
    for (let i = 0; i < 2; i++) {
      const result = await request("/api/study-items", save);
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.item, original.body.item, "first savedAt and ID must survive");
    }
  }
  // Pick a source meaning from every unit, also covering units without runtime lessons.
  for (let unit = 1; unit <= 54; unit++) {
    const entry = gramaticaVocabulary.find((e) => e.units.includes(unit));
    assert.equal((await request("/api/study-items", { studyItemId: entry.studyItemId, sourceType: "topic", sourceId: "course:ga1:pt-pt", sourceContextId: `unit:ga1:u${String(unit).padStart(2, "0")}`, clientEventId: `card:${randomUUID()}` })).status, 200);
  }
  const saved = await request("/api/study-items");
  assert.equal(saved.body.items.filter((item) => item.studyItemId === book.studyItemId).length, 1);
  assert.equal(saved.body.sources.filter((s) => s.studyItemId === book.studyItemId).length, book.units.length + 1);
  assert(saved.body.sources.some((s) => s.sourceContextId === "unit:ga1:u54"));
  assert.deepEqual((await request("/api/progress")).body.progress, [review]);
  assert.deepEqual((await request("/api/learning/progress")).body.progress[0].snapshot, lesson.snapshot);
  assert.deepEqual((await request("/api/study-items", undefined, `${identity}:other`)).body.items, []);
  assert.equal((await request("/api/study-items", { studyItemId: "study:unknown", sourceType: "topic", sourceId: "course:ga1:pt-pt", clientEventId: `card:${randomUUID()}` })).status, 400);
});
