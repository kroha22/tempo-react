import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { flashcardProgress } from "../../../db/schema";
import { parseLegacyProgressPayload } from "@/features/cards/progress-contract";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";

export async function GET(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();
  try {
    const rows = await getDb().select().from(flashcardProgress).where(eq(flashcardProgress.userId, userId));
    const progress = rows.map((row) => ({ cardId: row.cardId, due: row.due, interval: row.interval, ease: row.ease, repetitions: row.repetitions, lapses: row.lapses, lastGrade: row.lastGrade }));
    return Response.json({ progress });
  } catch {
    return Response.json({ error: "Progress unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();
  try {
    const payload = parseLegacyProgressPayload(await request.json());
    if (!payload) {
      return Response.json({ error: "Invalid card progress" }, { status: 400 });
    }
    const value = {
      userId,
      cardId: payload.cardId,
      due: payload.due,
      interval: payload.interval,
      ease: payload.ease,
      repetitions: payload.repetitions,
      lapses: payload.lapses,
      lastGrade: payload.lastGrade,
    };
    await getDb().insert(flashcardProgress).values(value).onConflictDoUpdate({
      target: [flashcardProgress.userId, flashcardProgress.cardId],
      set: value,
    });
    return Response.json({ progress: payload });
  } catch {
    return Response.json({ error: "Unable to save progress" }, { status: 500 });
  }
}
