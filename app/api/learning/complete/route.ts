import { progressDto } from "@/features/learning/progress/dto";
import { internalErrorResponse } from "@/shared/http/server-error";
import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { learningEvents, lessonProgress } from "@/db/schema";
import { firstVerticalSliceContentPack } from "@/features/content/manifest";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { expectedContentRevision, parseCompleteLessonInput } from "@/features/learning/progress/contracts";

export async function POST(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON", code: "INVALID_INPUT" }, { status: 400 });
  }
  const input = parseCompleteLessonInput(raw);
  if (!input) return Response.json({ error: "Invalid completion request", code: "INVALID_INPUT" }, { status: 400 });
  if (expectedContentRevision(input.lessonId) !== input.flowRevision) {
    return Response.json({ error: "Flow revision mismatch", code: "REVISION_MISMATCH" }, { status: 409 });
  }

  const lesson = firstVerticalSliceContentPack.lessons.find((candidate) => candidate.id === input.lessonId)!;
  const flow = firstVerticalSliceContentPack.flows.find((candidate) => candidate.id === lesson.flowId)!;
  const requiredItemIds = lesson.completionRule.requiredExerciseUseIds.map((useId) =>
    firstVerticalSliceContentPack.exerciseUses.find((use) => use.id === useId)!.exerciseItemId,
  );

  try {
    const attempts = await getDb().select().from(learningEvents).where(and(
      eq(learningEvents.userId, userId),
      eq(learningEvents.lessonId, input.lessonId),
      eq(learningEvents.sessionId, input.sessionId),
      eq(learningEvents.eventType, "exercise_attempt"),
      inArray(learningEvents.entityId, requiredItemIds),
    ));
    const attemptedItemIds = new Set(attempts.map((attempt) => attempt.entityId));
    const missingItemIds = requiredItemIds.filter((id) => !attemptedItemIds.has(id));
    if (missingItemIds.length) {
      return Response.json({ error: "Required attempts missing", code: "MISSING_ATTEMPTS", missingItemIds }, { status: 409 });
    }

    const independentUse = firstVerticalSliceContentPack.exerciseUses.find((use) =>
      use.lessonId === input.lessonId && use.phase === "independent",
    );
    const independentAttempt = attempts.find((attempt) => attempt.entityId === independentUse?.exerciseItemId);
    let independentCorrect = false;
    try {
      independentCorrect = JSON.parse(independentAttempt?.payloadJson ?? "{}").correct === true;
    } catch {
      independentCorrect = false;
    }
    const canDoResult = independentCorrect ? "demonstrated" as const : "partial" as const;
    const completionEvent = {
      id: `event:${crypto.randomUUID()}`,
      userId,
      clientEventId: input.clientEventId,
      sessionId: input.sessionId,
      lessonId: input.lessonId,
      eventType: "lesson_completed" as const,
      entityId: input.lessonId,
      contentRevision: input.flowRevision,
      payloadJson: JSON.stringify({ canDoResult, requiredItemIds }),
      occurredAt: input.completedAt,
      receivedAt: Date.now(),
    };

    await getDb().insert(learningEvents).values(completionEvent).onConflictDoNothing();
    await getDb().insert(lessonProgress).values({
      userId,
      lessonId: input.lessonId,
      flowRevision: input.flowRevision,
      status: "finished",
      canDoResult,
      activePhaseId: flow.terminalPhaseId,
      sessionId: input.sessionId,
      snapshotJson: JSON.stringify({ completed: true, canDoResult }),
      startedAt: input.completedAt,
      updatedAt: input.completedAt,
      completedAt: input.completedAt,
      version: 1,
    }).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        status: "finished",
        canDoResult: sql`CASE WHEN ${lessonProgress.canDoResult} = 'demonstrated' THEN ${lessonProgress.canDoResult} ELSE excluded.can_do_result END`,
        activePhaseId: flow.terminalPhaseId,
        sessionId: sql`CASE WHEN excluded.updated_at >= ${lessonProgress.updatedAt} THEN excluded.session_id ELSE ${lessonProgress.sessionId} END`,
        snapshotJson: sql`CASE WHEN excluded.updated_at >= ${lessonProgress.updatedAt} THEN excluded.snapshot_json ELSE ${lessonProgress.snapshotJson} END`,
        updatedAt: sql`MAX(${lessonProgress.updatedAt}, excluded.updated_at)`,
        completedAt: sql`COALESCE(${lessonProgress.completedAt}, excluded.completed_at)`,
        version: sql`${lessonProgress.version} + 1`,
      },
    });
    const progress = await getDb().select().from(lessonProgress).where(and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, input.lessonId),
    )).get();
    if (!progress) return internalErrorResponse("Missing saved progress");
    return Response.json({ progress: progressDto(progress) });
  } catch {
    return internalErrorResponse("Lesson completion");
  }
}
