import { requestJson } from "../../../shared/http/request-json.ts";
import { studyReviewListSchema, studyReviewResponseSchema, type StudyReviewCommand } from "./contracts.ts";

const signalWithTimeout = (signal?: AbortSignal) => signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000);
export async function loadStudyReviews(signal?: AbortSignal) {
  return studyReviewListSchema.parse(await requestJson("/api/study-reviews", { signal: signalWithTimeout(signal) }));
}
export async function gradeStudyReview(command: StudyReviewCommand, signal?: AbortSignal) {
  const result = studyReviewResponseSchema.parse(await requestJson("/api/study-reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(command), signal: signalWithTimeout(signal) }));
  if (result.clientEventId !== command.clientEventId || result.card.studyItemId !== command.studyItemId || result.card.version !== command.expectedVersion + 1 || result.card.progress?.lastGrade !== command.grade) throw new Error("Review acknowledgement mismatch");
  return result;
}
