import assert from "node:assert/strict";
import test from "node:test";
import { scheduleReview, scheduleReviewProgress, type ReviewGrade } from "../features/cards/scheduler.ts";
import { studyReviewCommandSchema, type StudyReviewRow } from "../features/cards/study-review/contracts.ts";
import { scheduleStudyReview, studyReviewQueue } from "../features/cards/study-review/model.ts";
import { studyReviewCardById } from "../features/cards/study-review/catalog.ts";
import { initialStudySession, studySessionReducer } from "../features/cards/study-review/session.ts";

const now = 1_800_000_000_000;
const row: StudyReviewRow = { studyItemId: "study:chunk:ga1:enquanto", reviewItemId: "saved:study:chunk:ga1:enquanto", progress: null, reviewedAt: null, version: 0 };
test("saved-card grades share the legacy pure SRS without changing basic/frequency policy", () => {
  for (const grade of [0, 1, 2, 3] as ReviewGrade[]) {
    const scheduled = scheduleStudyReview(row, grade, now);
    assert.deepEqual(scheduled.progress, scheduleReview({ id: row.reviewItemId, rank: 70, basic: false }, undefined, grade, now));
    assert.equal(scheduled.version, 1);
    assert.equal(scheduled.reviewItemId, row.reviewItemId);
    const next = scheduleStudyReview(scheduled, grade, now + 10000);
    assert.deepEqual(next.progress, scheduleReviewProgress(row.reviewItemId, scheduled.progress!, grade, now + 10000));
  }
  assert.equal(scheduleReview({ id: "v0001", rank: 1, basic: true }, undefined, 2, now).interval, 1.8);
  assert.equal(scheduleStudyReview(row, 2, now).progress?.interval, 1);
  const basicVerb = { ...row, studyItemId: "study:ga1:verb:querer:entry", reviewItemId: "saved:study:ga1:verb:querer:entry" };
  assert(studyReviewCardById.get(basicVerb.studyItemId)?.lowerPriority);
  assert.equal(scheduleStudyReview(basicVerb, 2, now).progress?.interval, 1.8);
  assert.equal(studyReviewQueue([basicVerb, row], now)[0].studyItemId, row.studyItemId);
  assert.equal(scheduleStudyReview(scheduleStudyReview(row, 2, now), 0, now + 1000).progress?.lapses, 1);
});
test("one schedule covers all lessons and due reviews precede new saved items", () => {
  assert(studyReviewCardById.get(row.studyItemId)?.units.includes(18));
  assert(studyReviewCardById.get(row.studyItemId)?.units.includes(19));
  const overdue = scheduleStudyReview(row, 0, now - 120000);
  const newRow = { ...row, studyItemId: "study:noun:livro", reviewItemId: "saved:study:noun:livro" };
  assert.deepEqual(studyReviewQueue([newRow, overdue], now).map((r) => r.studyItemId), [row.studyItemId, newRow.studyItemId]);
  assert.deepEqual(studyReviewQueue([overdue], now, 18), studyReviewQueue([overdue], now, 19));
  assert.equal(studyReviewQueue([overdue], now, 54).length, 0);
  assert.equal(studyReviewQueue([scheduleStudyReview(row, 2, now)], now).length, 0);
});
test("session pins a revealed card, retains its failed intent and advances only after acknowledgement", () => {
  let state = studySessionReducer(initialStudySession, { type: "loaded", rows: [row], now });
  state = studySessionReducer(state, { type: "flip" });
  const command = { studyItemId: row.studyItemId, clientEventId: `review:${crypto.randomUUID()}`, grade: 2 as const, expectedVersion: 0 };
  state = studySessionReducer(state, { type: "saving", command });
  const before = state;
  assert.equal(studySessionReducer(state, { type: "loaded", rows: [], now }), before);
  state = studySessionReducer(state, { type: "save-error", conflict: false });
  assert.equal(state.count, 0);
  assert.equal(state.pending, command);
  assert(state.flipped);
  state = studySessionReducer(state, { type: "saving", command });
  state = studySessionReducer(state, { type: "saved", card: scheduleStudyReview(row, 2, now), now });
  assert.equal(state.active, null);
  assert.equal(state.count, 1);
  assert.equal(state.flipped, false);
  assert.equal(state.pending, null);
});
test("command accepts a grade and expected version, never client identity or invented intervals", () => {
  const command = { studyItemId: row.studyItemId, clientEventId: `review:${crypto.randomUUID()}`, grade: 2, expectedVersion: 0 };
  assert(studyReviewCommandSchema.safeParse(command).success);
  for (const extra of [{ userId: "other" }, { due: now }, { interval: 99 }, { grade: 4 }, { expectedVersion: -1 }]) assert(!studyReviewCommandSchema.safeParse({ ...command, ...extra }).success);
});
