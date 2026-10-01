import assert from "node:assert/strict";
import test from "node:test";
import { initialSession, sessionReducer } from "../features/learning/lesson-engine/model/session.ts";
import { createCompletionIntent, sceneResponse } from "../features/learning/lesson-engine/model/intents.ts";
import { routeLessonExperiences } from "../features/content/first-vertical-slice/route-extension.ts";

const experience = routeLessonExperiences[0];
const intent = createCompletionIntent(experience, ["exercise:intro:answer-chamo-me"], "session-test-001", "a", 1, 1000)!;
const start = () => sessionReducer(initialSession, { type: "start", generation: 1, sessionId: "session-test-001", stage: "activity", initial: true, message: "" });

test("failed completion retains the exact intent and locks the selected answer", () => {
  let state = sessionReducer(start(), { type: "select", generation: 1, selection: "a" });
  state = sessionReducer(state, { type: "completion-started", generation: 1, intent });
  state = sessionReducer(state, { type: "completion-failed", generation: 1, error: "network" });
  assert.equal(state.completion.status, "failed");
  if (state.completion.status === "failed") assert.equal(state.completion.intent, intent);
  assert.equal(sessionReducer(state, { type: "select", generation: 1, selection: "b" }), state);
  assert.equal(state.phase.stage, "activity");
});

test("old responses cannot change a new attempt or undo its summary", () => {
  let state = sessionReducer(start(), { type: "start", generation: 2, sessionId: "session-test-002", stage: "learn", initial: false, message: "" });
  assert.equal(sessionReducer(state, { type: "completion-saved", generation: 1, result: "demonstrated" }), state);
  state = sessionReducer(state, { type: "progress-loaded", generation: 2, flowRevision: 1, progress: {
    lessonId: experience.id, flowRevision: 1, status: "finished", snapshot: { completed: true }, canDoResult: "demonstrated",
  } });
  assert.equal(state.phase.stage, "learn", "explicit restart wins over a background restore");
});

test("card failure leaves the confirmed lesson result intact", () => {
  let state = sessionReducer(start(), { type: "completion-started", generation: 1, intent });
  state = sessionReducer(state, { type: "completion-saved", generation: 1, result: "demonstrated" });
  state = sessionReducer(state, { type: "card-started", generation: 1, intent: { studyItemId: "study:chunk:chamo-me", sourceType: "lesson", sourceId: experience.id, clientEventId: "client-test-001" } });
  state = sessionReducer(state, { type: "card-failed", generation: 1, id: "study:chunk:chamo-me", error: "server" });
  assert.deepEqual(state.phase, { stage: "summary", result: "demonstrated" });
  assert.equal(state.completion.status, "saved");
  assert.equal(state.cards["study:chunk:chamo-me"].status, "failed");
  state = sessionReducer(state, { type: "cards-loaded", generation: 1, ids: ["study:chunk:chamo-me"] });
  assert.equal(state.cards["study:chunk:chamo-me"].status, "saved", "server read can confirm a write whose response was lost");
});

test("invalid scene selections and missing exercise prerequisites produce no commands", () => {
  assert.equal(sceneResponse("unknown"), null);
  assert.deepEqual(sceneResponse("under"), { actorId: "gato", relation: "under", referenceId: "mesa" });
  assert.equal(createCompletionIntent(experience, [], "session-test-001", "a", 1, 1000), null);
  assert.equal(createCompletionIntent(experience, ["exercise:intro:answer-chamo-me"], "session-test-001", "unknown", 1, 1000), null);
  const scene = routeLessonExperiences.find((item) => item.activity.kind === "scene")!;
  const invalid = { ...scene, activity: { ...scene.activity, options: [{ id: "beside", label: "Рядом" }] } };
  assert.equal(createCompletionIntent(invalid, [scene.activity.id], "session-test-001", "beside", 1, 1000), null);
  const valid = createCompletionIntent(scene, [scene.activity.id], "session-test-001", "under", 1, 1000)!;
  assert.equal(new Set(valid.events.map((event) => event.clientEventId)).size, valid.events.length);
  assert(valid.events.every((event) => event.occurredAt === valid.completion.completedAt));
  assert(valid.events.some((event) => event.eventType === "scene_completed"));
});
