import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { savedStudyItems, studyReviewEvents, studyReviewProgress } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { internalErrorResponse } from "@/shared/http/server-error";
import { studyReviewCardById } from "@/features/cards/study-review/catalog";
import { studyReviewCommandSchema, studyReviewRowSchema, type StudyReviewCommand } from "@/features/cards/study-review/contracts";
import { scheduleStudyReview } from "@/features/cards/study-review/model";

type Saved = Pick<typeof savedStudyItems.$inferSelect, "studyItemId" | "reviewItemId">;
function rowDto(saved: Saved, progress?: typeof studyReviewProgress.$inferSelect | null) {
  return studyReviewRowSchema.parse({ studyItemId: saved.studyItemId, reviewItemId: saved.reviewItemId,
    version: progress?.version ?? 0, reviewedAt: progress?.reviewedAt ?? null,
    progress: progress ? { cardId: saved.reviewItemId, due: progress.due, interval: progress.interval, ease: progress.ease, repetitions: progress.repetitions, lapses: progress.lapses, lastGrade: progress.lastGrade } : null });
}
function matches(event: typeof studyReviewEvents.$inferSelect, command: StudyReviewCommand) {
  return event.studyItemId === command.studyItemId && event.grade === command.grade && event.expectedVersion === command.expectedVersion;
}
const conflict = () => Response.json({ error: "Review changed; reload before rating", code: "REVIEW_CONFLICT" }, { status: 409 });

export async function GET(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();
  try {
    const rows = await getDb().select({ saved: savedStudyItems, progress: studyReviewProgress }).from(savedStudyItems)
      .leftJoin(studyReviewProgress, and(eq(studyReviewProgress.userId, savedStudyItems.userId), eq(studyReviewProgress.reviewItemId, savedStudyItems.reviewItemId)))
      .where(and(eq(savedStudyItems.userId, userId), eq(savedStudyItems.status, "active")));
    return Response.json({ cards: rows.filter(({ saved }) => studyReviewCardById.has(saved.studyItemId)).map(({ saved, progress }) => rowDto(saved, progress)), serverNow: Date.now() });
  } catch { return internalErrorResponse("Study review read"); }
}

export async function POST(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();
  let raw: unknown;
  try { raw = await request.json(); } catch { return Response.json({ error: "Invalid JSON", code: "INVALID_INPUT" }, { status: 400 }); }
  const parsed = studyReviewCommandSchema.safeParse(raw);
  if (!parsed.success || !studyReviewCardById.has(parsed.data.studyItemId)) return Response.json({ error: "Invalid review command", code: "INVALID_INPUT" }, { status: 400 });
  const input = parsed.data;
  try {
    const db = getDb();
    const findEvent = () => db.select().from(studyReviewEvents).where(and(eq(studyReviewEvents.userId, userId), eq(studyReviewEvents.clientEventId, input.clientEventId))).get();
    const previousEvent = await findEvent();
    if (previousEvent) return matches(previousEvent, input)
      ? Response.json({ card: studyReviewRowSchema.parse(JSON.parse(previousEvent.resultJson)), clientEventId: input.clientEventId, duplicate: true }) : conflict();
    const saved = await db.select().from(savedStudyItems).where(and(eq(savedStudyItems.userId, userId), eq(savedStudyItems.studyItemId, input.studyItemId), eq(savedStudyItems.status, "active"))).get();
    if (!saved) return Response.json({ error: "Save this card before reviewing", code: "CARD_NOT_SAVED" }, { status: 404 });
    const previous = await db.select().from(studyReviewProgress).where(and(eq(studyReviewProgress.userId, userId), eq(studyReviewProgress.reviewItemId, saved.reviewItemId))).get();
    const before = rowDto(saved, previous);
    if (before.version !== input.expectedVersion) {
      // A duplicate could have committed between the first event read and here.
      const raced = await findEvent();
      return raced && matches(raced, input) ? Response.json({ card: studyReviewRowSchema.parse(JSON.parse(raced.resultJson)), clientEventId: input.clientEventId, duplicate: true }) : conflict();
    }
    const after = studyReviewRowSchema.parse(scheduleStudyReview(before, input.grade, Date.now()));
    const progress = after.progress!;
    // D1 batch is atomic. Reserve the command only if its version is current,
    // then apply it only if that exact reservation belongs to this card/grade.
    // Cross-card event-ID reuse therefore cannot advance a second schedule.
    const writes = await db.$client.batch([
      db.$client.prepare(`INSERT INTO study_review_events
        (user_id, client_event_id, study_item_id, review_item_id, grade, expected_version, result_json, reviewed_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM saved_study_items WHERE user_id = ? AND study_item_id = ? AND review_item_id = ? AND status = 'active')
        AND COALESCE((SELECT version FROM study_review_progress WHERE user_id = ? AND review_item_id = ?), 0) = ?
        ON CONFLICT DO NOTHING`).bind(userId, input.clientEventId, input.studyItemId, saved.reviewItemId, input.grade, input.expectedVersion, JSON.stringify(after), after.reviewedAt,
        userId, input.studyItemId, saved.reviewItemId, userId, saved.reviewItemId, input.expectedVersion),
      db.$client.prepare(`INSERT INTO study_review_progress
        (user_id, review_item_id, due, interval, ease, repetitions, lapses, last_grade, reviewed_at, version)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM study_review_events WHERE user_id = ? AND client_event_id = ? AND study_item_id = ? AND review_item_id = ? AND grade = ? AND expected_version = ?)
        AND EXISTS (SELECT 1 FROM saved_study_items WHERE user_id = ? AND study_item_id = ? AND review_item_id = ? AND status = 'active')
        AND COALESCE((SELECT version FROM study_review_progress WHERE user_id = ? AND review_item_id = ?), 0) = ?
        ON CONFLICT(user_id, review_item_id) DO UPDATE SET
          due = excluded.due, interval = excluded.interval, ease = excluded.ease, repetitions = excluded.repetitions,
          lapses = excluded.lapses, last_grade = excluded.last_grade, reviewed_at = excluded.reviewed_at, version = excluded.version
        WHERE study_review_progress.version = ?`).bind(userId, saved.reviewItemId, progress.due, progress.interval, progress.ease, progress.repetitions, progress.lapses, progress.lastGrade, after.reviewedAt, after.version,
        userId, input.clientEventId, input.studyItemId, saved.reviewItemId, input.grade, input.expectedVersion,
        userId, input.studyItemId, saved.reviewItemId, userId, saved.reviewItemId, input.expectedVersion, input.expectedVersion),
    ]);
    const event = await findEvent();
    if (!event || !matches(event, input)) return conflict();
    return Response.json({ card: studyReviewRowSchema.parse(JSON.parse(event.resultJson)), clientEventId: input.clientEventId, duplicate: writes[0].meta.changes === 0 });
  } catch { return internalErrorResponse("Study review write"); }
}
