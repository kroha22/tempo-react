import assert from "node:assert/strict";
import test from "node:test";
import { learningProgressSchema, progressDto } from "../features/learning/progress/dto.ts";
import { parseLessonProgressInput } from "../features/learning/progress/contracts.ts";
import { savedItemsResponseSchema } from "../features/cards/api/saved-items-dto.ts";

const row = { lessonId: "lesson:a1-1:introduce-yourself", flowRevision: 1, status: "active", snapshotJson: '{"stage":"activity"}', canDoResult: null, userId: "private-user", sessionId: "private-session", version: 7 };

test("public progress projects fields and decodes a stored snapshot", () => {
  assert.deepEqual(progressDto(row), { lessonId: row.lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, canDoResult: null });
  assert.throws(() => learningProgressSchema.parse({ ...progressDto(row), status: "unlocked" }));
  assert.throws(() => learningProgressSchema.parse({ ...progressDto(row), flowRevision: Infinity }));
});

test("incompatible stored snapshots recover without leaking raw JSON", () => {
  for (const snapshotJson of ['{', '{"stage":"unknown"}', '{"stage":"activity","userId":"private"}', 'null', '[]']) {
    assert.equal(progressDto({ ...row, snapshotJson }).snapshot, null);
  }
});

test("progress rejects malformed snapshots and client completion assertions", () => {
  const input = { lessonId: row.lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, updatedAt: 1_800_000_000_000 };
  assert(parseLessonProgressInput(input));
  for (const snapshot of [{ stage: "unknown" }, { stage: "activity", userId: "forged" }, [], null]) {
    assert.equal(parseLessonProgressInput({ ...input, snapshot }), null);
  }
  assert.equal(parseLessonProgressInput({ ...input, canDoResult: "demonstrated" }), null);
  assert.equal(parseLessonProgressInput({ ...input, updatedAt: Infinity }), null);
});

test("saved-item DTO strips storage fields and rejects invalid source types", () => {
  const item = { studyItemId: "study:chunk:chamo-me", savedAt: 1_800_000_000_000 };
  assert.deepEqual(savedItemsResponseSchema.parse({ items: [{ ...item, userId: "private" }], sources: [] }), { items: [item], sources: [] });
  assert.throws(() => savedItemsResponseSchema.parse({ items: [item], sources: [{ studyItemId: item.studyItemId, sourceId: row.lessonId, sourceType: "unknown" }] }));
});
