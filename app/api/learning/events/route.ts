import { internalErrorResponse } from "@/shared/http/server-error";
import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { errorPatterns, learningEvents } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { expectedContentRevision, parseLearningEventInput } from "@/features/learning/progress/contracts";
import { gramaticaLessons, grammarAnswerCorrect } from "@/features/content/gramatica-ativa";

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

  const grammarLesson = gramaticaLessons.find((lesson) => lesson.id === input.lessonId);
  if (grammarLesson && input.eventType === "exercise_attempt") {
    const task = grammarLesson.tasks.find((item) => item.id === input.entityId);
    const answer = input.payload.answer;
    if (!task || typeof answer !== "string" || !answer.trim() || answer.length > 500 ||
        input.clientEventId !== `${input.sessionId}:${task.id}` ||
        (task.options && !task.options.includes(answer))) {
      return Response.json({ error: "Invalid grammar attempt", code: "INVALID_INPUT" }, { status: 400 });
    }
    // Never trust the browser's score or assistance claim.
    input.payload = { answer, correct: grammarAnswerCorrect(task, answer), stage: task.stage };
  }
  function acknowledgement(event: { clientEventId: string; payloadJson: string }) {
    if (grammarLesson && input!.eventType === "exercise_attempt") {
      const payload: unknown = JSON.parse(event.payloadJson);
      if (payload && typeof payload === "object" && "answer" in payload && typeof payload.answer === "string") return { clientEventId: event.clientEventId, answer: payload.answer };
    }
    return { clientEventId: event.clientEventId };
  }

  try {
    const existing = await findExisting(userId, input.clientEventId);
    if (existing) return Response.json({ event: acknowledgement(existing), duplicate: true });

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
    return Response.json({ event: acknowledgement(event), duplicate: false }, { status: 201 });
  } catch {
    const raced = await findExisting(userId, input.clientEventId).catch(() => undefined);
    if (raced) return Response.json({ event: acknowledgement(raced), duplicate: true });
    return internalErrorResponse("Learning event");
  }
}
