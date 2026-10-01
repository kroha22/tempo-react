import { requestJson } from "@/shared/http/request-json";
import { eventAcknowledgementSchema, progressListSchema, progressResponseSchema } from "./dto";
import { saveItemResponseSchema } from "@/features/cards/api/saved-items-dto";
import type { BoundaryIntent, CardIntent, CompleteIntent, EventIntent } from "../lesson-engine/model/intents";
export type { LearningProgress } from "./dto";

export class LearningResponseError extends Error {}

async function jsonRequest(url: string, body: unknown, signal?: AbortSignal) {
  return requestJson(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal });
}

export async function loadLearningProgress(signal?: AbortSignal) {
  return progressListSchema.parse(await requestJson("/api/learning/progress", { signal })).progress;
}

// Commands arrive fully prepared. Transport never generates a new ID or time on retry.
export async function saveBoundary(input: BoundaryIntent, signal?: AbortSignal) {
  const result = progressResponseSchema.parse(await jsonRequest("/api/learning/progress", input, signal));
  if (result.progress.lessonId !== input.lessonId || result.progress.flowRevision !== input.flowRevision) throw new LearningResponseError("Boundary response mismatch");
  return result;
}

export async function appendLearningEvent(input: EventIntent, signal?: AbortSignal) {
  const result = eventAcknowledgementSchema.parse(await jsonRequest("/api/learning/events", input, signal));
  if (result.event.clientEventId !== input.clientEventId) throw new LearningResponseError("Event acknowledgement mismatch");
  return result;
}

export async function completeLesson(input: CompleteIntent, signal?: AbortSignal) {
  const result = progressResponseSchema.parse(await jsonRequest("/api/learning/complete", input, signal));
  if (result.progress.lessonId !== input.lessonId || result.progress.flowRevision !== input.flowRevision || result.progress.status !== "finished" || !result.progress.canDoResult) throw new LearningResponseError("Completion response mismatch");
  return result;
}

export async function saveStudyItem(input: CardIntent, signal?: AbortSignal) {
  const result = saveItemResponseSchema.parse(await jsonRequest("/api/study-items", input, signal));
  if (result.item.studyItemId !== input.studyItemId) throw new LearningResponseError("Saved item response mismatch");
  return result;
}
