import assert from "node:assert/strict";
import test from "node:test";
import { initialReviewSession, reviewSessionReducer, reviewStats, selectNextCard } from "../features/cards/review-session.ts";
import { scheduleReview, type ReviewProgress } from "../features/cards/scheduler.ts";
import { parseLegacyProgressPayload } from "../features/cards/progress-contract.ts";

const basic = { id: "v0001", rank: 1, basic: true };
const focused = { id: "v0043", rank: 43, basic: false };
const another = { id: "v0044", rank: 44, basic: false };
const now = 1_700_000_000_000;
const progress = (card = focused): ReviewProgress => scheduleReview(card, undefined, 2, now);

test("queue prioritizes overdue reviews, then unseen non-basic cards without mutating the deck", () => {
  const cards = Object.freeze([basic, focused, another]);
  assert.equal(selectNextCard(cards, {}, now), focused);
  assert.equal(selectNextCard(cards, { [basic.id]: { ...progress(basic), due: now } }, now), basic);
  assert.equal(selectNextCard([basic], {}, now), basic);
  assert.equal(selectNextCard([], {}, now), undefined);
});

test("completed deck selects earliest due; stats ignore progress outside the deck", () => {
  const rows = {
    [basic.id]: { ...progress(basic), due: now + 10 },
    [focused.id]: { ...progress(), due: now + 5, interval: 14, repetitions: 3 },
    unrelated: progress(another),
  };
  assert.equal(selectNextCard([basic, focused], rows, now), focused);
  assert.deepEqual(reviewStats([basic, focused], rows, now), { due: 0, seen: 2, learned: 1 });
});

test("failed saves preserve the card and retry payload; only server confirmation advances the session", () => {
  let state = reviewSessionReducer(initialReviewSession, { type: "loaded", progress: [], now });
  state = reviewSessionReducer(state, { type: "flip" });
  const payload = progress();
  state = reviewSessionReducer(state, { type: "review-start", progress: payload });
  state = reviewSessionReducer(state, { type: "review-failed" });
  assert.equal(state.flipped, true);
  assert.equal(state.sessionCount, 0);
  assert.deepEqual(state.progress, {});
  state = reviewSessionReducer(state, { type: "review-start", progress: progress(another) });
  assert.equal(state.pending, payload);
  state = reviewSessionReducer(state, { type: "review-saved", progress: payload, now });
  assert.equal(state.flipped, false);
  assert.equal(state.pending, null);
  assert.equal(state.sessionCount, 1);
  assert.equal(state.progress[focused.id], payload);
  assert.equal(reviewSessionReducer(state, { type: "review-saved", progress: payload, now }), state);
});

test("loading and failed loads cannot start reviews", () => {
  assert.equal(reviewSessionReducer(initialReviewSession, { type: "flip" }), initialReviewSession);
  const failed = reviewSessionReducer(initialReviewSession, { type: "load-failed" });
  assert.equal(reviewSessionReducer(failed, { type: "review-start", progress: progress() }), failed);
});

test("repeated fractional intervals always produce timestamps accepted by the API", () => {
  let row: ReviewProgress | undefined;
  for (let i = 0; i < 20; i += 1) {
    row = scheduleReview(focused, row, 1, now);
    assert(Number.isSafeInteger(row.due));
    assert(parseLegacyProgressPayload(row));
  }
});
