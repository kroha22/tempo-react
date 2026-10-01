import assert from "node:assert/strict";
import test from "node:test";

import { authenticatedUserId } from "../features/learning/progress/auth.ts";
import {
  deterministicReviewItemId,
  expectedContentRevision,
  mergeLessonStatus,
  parseCompleteLessonInput,
  parseLearningEventInput,
  parseLessonProgressInput,
  parseSaveStudyItemInput,
} from "../features/learning/progress/contracts.ts";

const lessonId = "lesson:a1-1:introduce-yourself";

test("authenticated user scope comes only from the hosting header", () => {
  assert.equal(authenticatedUserId(new Request("https://tempo.test")), null);
  assert.equal(authenticatedUserId(new Request("https://tempo.test", {
    headers: { "oai-authenticated-user-id": "user-123" },
  })), "user-123");
});

test("learning events accept known content and reject client user identity", () => {
  const input = {
    clientEventId: "event-client-001",
    sessionId: "session-client-001",
    lessonId,
    eventType: "phase_completed",
    entityId: "exercise:intro:answer-chamo-me",
    contentRevision: 1,
    payload: { correct: true },
    occurredAt: 1_700_000_000_000,
    userId: "forged-user",
  };
  const parsed = parseLearningEventInput(input);
  assert(parsed);
  assert.equal("userId" in parsed, false);
  assert.equal(expectedContentRevision(input.entityId), 1);
});

test("unknown lesson IDs, event types and oversized payloads are rejected", () => {
  const base = {
    clientEventId: "event-client-001",
    sessionId: "session-client-001",
    lessonId,
    eventType: "phase_completed",
    contentRevision: 1,
    payload: {},
    occurredAt: 1_700_000_000_000,
  };
  assert.equal(parseLearningEventInput({ ...base, lessonId: "lesson:unknown" }), null);
  assert.equal(parseLearningEventInput({ ...base, eventType: "unlock_everything" }), null);
  assert.equal(parseLearningEventInput({ ...base, payload: { text: "x".repeat(17_000) } }), null);
});

test("lesson progress validates safe snapshots and finished is monotonic", () => {
  const parsed = parseLessonProgressInput({
    lessonId,
    flowRevision: 1,
    status: "active",
    activePhaseId: "phase:introduce-yourself:guided-name",
    sessionId: "session-client-001",
    snapshot: { completedPhaseIds: [] },
    updatedAt: 1_700_000_000_000,
  });
  assert(parsed);
  assert.equal(mergeLessonStatus("finished", "active"), "finished");
  assert.equal(mergeLessonStatus("active", "finished"), "finished");
  assert.equal(parseLessonProgressInput({ ...parsed, status: "finished" }), null);
});

test("lesson completion has a separate validated contract", () => {
  assert(parseCompleteLessonInput({
    clientEventId: "complete-client-001",
    sessionId: "session-client-001",
    lessonId,
    flowRevision: 1,
    completedAt: 1_700_000_000_000,
  }));
});

test("StudyItem save resolves a deterministic review identity", () => {
  const input = parseSaveStudyItemInput({
    studyItemId: "study:chunk:chamo-me",
    sourceType: "lesson",
    sourceId: lessonId,
    sourceContextId: "example:como-te-chamas-rita",
    clientEventId: "save-client-001",
  });
  assert(input);
  assert.equal(deterministicReviewItemId(input.studyItemId), "saved:study:chunk:chamo-me");
  assert.equal(parseSaveStudyItemInput({ ...input, sourceType: "book" }), null);
});
