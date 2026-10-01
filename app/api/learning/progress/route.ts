import { progressDto } from "@/features/learning/progress/dto";
import { internalErrorResponse } from "@/shared/http/server-error";
import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { lessonProgress } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { expectedContentRevision, parseLessonProgressInput } from "@/features/learning/progress/contracts";

export async function GET(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  try {
    const progress = await getDb().select().from(lessonProgress)
      .where(eq(lessonProgress.userId, userId))
      .orderBy(desc(lessonProgress.updatedAt));
    return Response.json({ progress: progress.map(progressDto) });
  } catch {
    return internalErrorResponse("Learning progress");
  }
}

export async function POST(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON", code: "INVALID_INPUT" }, { status: 400 });
  }

  const input = parseLessonProgressInput(raw);
  if (!input) return Response.json({ error: "Invalid lesson progress", code: "INVALID_INPUT" }, { status: 400 });
  const expectedRevision = expectedContentRevision(input.lessonId);
  if (expectedRevision === null || expectedRevision !== input.flowRevision) {
    return Response.json({ error: "Flow revision mismatch", code: "REVISION_MISMATCH", expectedRevision }, { status: 409 });
  }

  const incoming = {
    userId,
    lessonId: input.lessonId,
    flowRevision: input.flowRevision,
    status: input.status,
    canDoResult: input.canDoResult ?? null,
    activePhaseId: input.activePhaseId ?? null,
    sessionId: input.sessionId ?? null,
    snapshotJson: JSON.stringify(input.snapshot),
    startedAt: input.updatedAt,
    updatedAt: input.updatedAt,
    completedAt: input.status === "finished" ? input.updatedAt : null,
    version: 1,
  };

  try {
    await getDb().insert(lessonProgress).values(incoming).onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        flowRevision: sql`CASE WHEN excluded.updated_at >= ${lessonProgress.updatedAt} THEN excluded.flow_revision ELSE ${lessonProgress.flowRevision} END`,
        status: sql`CASE WHEN ${lessonProgress.status} = 'finished' THEN 'finished' WHEN excluded.updated_at >= ${lessonProgress.updatedAt} THEN excluded.status ELSE ${lessonProgress.status} END`,
        canDoResult: sql`CASE WHEN ${lessonProgress.status} = 'finished' OR excluded.updated_at < ${lessonProgress.updatedAt} THEN ${lessonProgress.canDoResult} ELSE excluded.can_do_result END`,
        activePhaseId: sql`CASE WHEN ${lessonProgress.status} = 'finished' OR excluded.updated_at < ${lessonProgress.updatedAt} THEN ${lessonProgress.activePhaseId} ELSE excluded.active_phase_id END`,
        sessionId: sql`CASE WHEN ${lessonProgress.status} = 'finished' OR excluded.updated_at < ${lessonProgress.updatedAt} THEN ${lessonProgress.sessionId} ELSE excluded.session_id END`,
        snapshotJson: sql`CASE WHEN ${lessonProgress.status} = 'finished' OR excluded.updated_at < ${lessonProgress.updatedAt} THEN ${lessonProgress.snapshotJson} ELSE excluded.snapshot_json END`,
        updatedAt: sql`MAX(${lessonProgress.updatedAt}, excluded.updated_at)`,
        completedAt: sql`CASE WHEN ${lessonProgress.completedAt} IS NOT NULL THEN ${lessonProgress.completedAt} WHEN excluded.status = 'finished' THEN excluded.updated_at ELSE NULL END`,
        version: sql`CASE WHEN excluded.updated_at >= ${lessonProgress.updatedAt} THEN ${lessonProgress.version} + 1 ELSE ${lessonProgress.version} END`,
      },
    });
    const progress = await getDb().select().from(lessonProgress).where(and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, input.lessonId),
    )).get();
    if (!progress) return internalErrorResponse("Missing saved progress");
    return Response.json({ progress: progressDto(progress) });
  } catch {
    return internalErrorResponse("Learning progress");
  }
}
