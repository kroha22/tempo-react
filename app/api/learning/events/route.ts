import { internalErrorResponse } from "@/shared/http/server-error";
import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { errorPatterns, learningEvents } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { expectedContentRevision, parseLearningEventInput } from "@/features/learning/progress/contracts";

async function findExisting(userId: string, clientEventId: string) {
  return getDb().select().from(learningEvents).where(and(
    eq(learningEvents.userId, userId),
    eq(learningEvents.clientEventId, clientEventId),
  )).get();
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

  const input = parseLearningEventInput(raw);
  if (!input) return Response.json({ error: "Invalid learning event", code: "INVALID_INPUT" }, { status: 400 });

  const revisionOwnerId = input.entityId ?? input.lessonId;
  const expectedRevision = expectedContentRevision(revisionOwnerId);
  if (expectedRevision === null || expectedRevision !== input.contentRevision) {
    return Response.json({ error: "Content revision mismatch", code: "REVISION_MISMATCH", expectedRevision }, { status: 409 });
  }

  try {
    const existing = await findExisting(userId, input.clientEventId);
    if (existing) return Response.json({ event: { clientEventId: existing.clientEventId }, duplicate: true });

    const event = {
      id: `event:${crypto.randomUUID()}`,
      userId,
      clientEventId: input.clientEventId,
      sessionId: input.sessionId,
      lessonId: input.lessonId,
      eventType: input.eventType,
      entityId: input.entityId ?? null,
      contentRevision: input.contentRevision,
      payloadJson: JSON.stringify(input.payload),
      occurredAt: input.occurredAt,
      receivedAt: Date.now(),
    };

    if (input.eventType === "error") {
      const errorCode = typeof input.payload.errorCode === "string" ? input.payload.errorCode : "UNKNOWN";
      const targetId = typeof input.payload.targetId === "string" ? input.payload.targetId : input.entityId ?? "unknown";
      const patternKey = `${errorCode}:${targetId}`;
      const recommendationId = typeof input.payload.recommendationId === "string" ? input.payload.recommendationId : null;
      await getDb().batch([
        getDb().insert(learningEvents).values(event),
        getDb().insert(errorPatterns).values({ userId, patternKey, errorCode, targetId, occurrenceCount: 1, state: "emerging", firstSeenAt: event.receivedAt, lastSeenAt: event.receivedAt, lastEventId: event.id, recommendationId, nextReviewAt: event.receivedAt }).onConflictDoUpdate({
          target: [errorPatterns.userId, errorPatterns.patternKey],
          set: { occurrenceCount: sql`${errorPatterns.occurrenceCount} + 1`, state: sql`CASE WHEN ${errorPatterns.occurrenceCount} + 1 >= 2 THEN 'active' ELSE ${errorPatterns.state} END`, lastSeenAt: event.receivedAt, lastEventId: event.id, recommendationId, nextReviewAt: event.receivedAt },
        }),
      ]);
    } else await getDb().insert(learningEvents).values(event);
    return Response.json({ event: { clientEventId: event.clientEventId }, duplicate: false }, { status: 201 });
  } catch {
    const raced = await findExisting(userId, input.clientEventId).catch(() => undefined);
    if (raced) return Response.json({ event: { clientEventId: raced.clientEventId }, duplicate: true });
    return internalErrorResponse("Learning event");
  }
}
