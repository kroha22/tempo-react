import assert from "node:assert/strict";
import test from "node:test";

import {
  DAY_IN_MILLISECONDS,
  hasLowerPresentationPriority,
  intervalLabel,
  nextInterval,
  scheduleReview,
  type ReviewProgress,
} from "../features/cards/scheduler.ts";
import { parseLegacyProgressPayload } from "../features/cards/progress-contract.ts";

const regularCard = { id: "v0041", rank: 41, basic: false };
const basicCard = { id: "v0001", rank: 1, basic: true };
const previous: ReviewProgress = {
  cardId: regularCard.id,
  due: 0,
  interval: 2,
  ease: 2.5,
  repetitions: 2,
  lapses: 1,
  lastGrade: 2,
};

test("first-review intervals preserve the existing four-grade policy", () => {
  assert.equal(nextInterval(undefined, 0, false), 1 / 1440);
  assert.equal(nextInterval(undefined, 1, false), 10 / 1440);
  assert.equal(nextInterval(undefined, 2, false), 1);
  assert.equal(nextInterval(undefined, 3, false), 4);
});

test("successful reviews use ease and lower-priority cards get a longer interval", () => {
  assert.equal(nextInterval(previous, 2, false), 5);
  assert.equal(nextInterval(previous, 3, false), 6.5);
  assert.equal(nextInterval(previous, 2, true), 9);
});

test("a lapse resets repetitions, increments lapses and schedules one minute", () => {
  const reviewedAt = 1_700_000_000_000;
  const next = scheduleReview(regularCard, previous, 0, reviewedAt);

  assert.equal(next.repetitions, 0);
  assert.equal(next.lapses, 2);
  assert.equal(next.ease, 2.3);
  assert.equal(next.due, reviewedAt + DAY_IN_MILLISECONDS / 1440);
});

test("successful review increments repetitions with an injected clock", () => {
  const reviewedAt = 1_700_000_000_000;
  const next = scheduleReview(regularCard, previous, 3, reviewedAt);

  assert.equal(next.repetitions, 3);
  assert.equal(next.lapses, 1);
  assert.equal(next.ease, 2.62);
  assert.equal(next.due, reviewedAt + 6.5 * DAY_IN_MILLISECONDS);
});

test("basic flag and first forty ranks both lower presentation priority", () => {
  assert.equal(hasLowerPresentationPriority(basicCard), true);
  assert.equal(hasLowerPresentationPriority({ ...regularCard, rank: 40 }), true);
  assert.equal(hasLowerPresentationPriority(regularCard), false);
});

test("interval labels preserve minute, hour, day and month display", () => {
  assert.equal(intervalLabel(1 / 1440), "1 мин");
  assert.equal(intervalLabel(0.5), "12 ч");
  assert.equal(intervalLabel(4), "4 дн");
  assert.equal(intervalLabel(60), "2 мес");
});

test("legacy progress payloads are scoped to known IDs and scheduler ranges", () => {
  assert(parseLegacyProgressPayload(previous));
  assert.equal(parseLegacyProgressPayload({ ...previous, cardId: "v9999" }), null);
  assert.equal(parseLegacyProgressPayload({ ...previous, ease: 99 }), null);
  assert.equal(parseLegacyProgressPayload({ ...previous, repetitions: -1 }), null);
});
