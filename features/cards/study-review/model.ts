import { scheduleReviewProgress, type ReviewGrade } from "../scheduler.ts";
import type { StudyReviewRow } from "./contracts.ts";
import { studyReviewCardById } from "./catalog.ts";

/** Same pure SRS as the legacy deck; no fabricated frequency or basic flag. */
export function scheduleStudyReview(row: StudyReviewRow, grade: ReviewGrade, now: number): StudyReviewRow {
  return { ...row, progress: { ...scheduleReviewProgress(row.reviewItemId, row.progress ?? undefined, grade, now, studyReviewCardById.get(row.studyItemId)?.lowerPriority ?? false), lastGrade: grade }, version: row.version + 1, reviewedAt: now };
}
export function studyReviewQueue(rows: readonly StudyReviewRow[], now: number, unit?: number) {
  return rows.filter((row) => {
    const card = studyReviewCardById.get(row.studyItemId);
    return card && (!unit || card.units.includes(unit)) && (!row.progress || row.progress.due <= now);
  }).sort((a, b) => {
    // Overdue reviews precede unseen items; stable IDs settle ties.
    if (Boolean(a.progress) !== Boolean(b.progress)) return a.progress ? -1 : 1;
    if (!a.progress && !b.progress) {
      const priority = Number(studyReviewCardById.get(a.studyItemId)?.lowerPriority) - Number(studyReviewCardById.get(b.studyItemId)?.lowerPriority);
      if (priority) return priority;
    }
    return (a.progress?.due ?? 0) - (b.progress?.due ?? 0) || a.studyItemId.localeCompare(b.studyItemId);
  });
}
