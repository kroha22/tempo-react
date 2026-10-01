import { errorPatternSchema, repairInputSchema } from "@/features/learning/progress/dto";
import { internalErrorResponse } from "@/shared/http/server-error";
import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { errorPatterns } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";

export async function GET(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  try {
    const patterns = await getDb().select().from(errorPatterns).where(and(
      eq(errorPatterns.userId, userId),
      inArray(errorPatterns.state, ["active", "improving"]),
    )).orderBy(asc(errorPatterns.nextReviewAt));
    return Response.json({ patterns: patterns.map((row) => errorPatternSchema.parse(row)) });
  } catch {
    return internalErrorResponse("Error patterns");
  }
}

export async function POST(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON", code: "INVALID_INPUT" }, { status: 400 }); }
  const parsed = repairInputSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Invalid repair result", code: "INVALID_INPUT" }, { status: 400 });
  const { patternKey } = parsed.data;
  try {
    await getDb().update(errorPatterns).set({ state: "improving", nextReviewAt: Date.now() + 3 * 86_400_000 }).where(and(eq(errorPatterns.userId, userId), eq(errorPatterns.patternKey, patternKey)));
    return Response.json({ ok: true });
  } catch { return internalErrorResponse("Error patterns"); }
}
