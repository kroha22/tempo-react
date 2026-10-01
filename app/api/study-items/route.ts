import { internalErrorResponse } from "@/shared/http/server-error";
import { savedItemSchema, savedSourceSchema } from "@/features/cards/api/saved-items-dto";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { savedStudyItems, studyItemSources } from "@/db/schema";
import { authenticatedUserId, unauthorizedResponse } from "@/features/learning/progress/auth";
import { deterministicReviewItemId, parseSaveStudyItemInput } from "@/features/learning/progress/contracts";

export async function GET(request: Request) {
  const userId = authenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  try {
    const items = await getDb().select().from(savedStudyItems)
      .where(eq(savedStudyItems.userId, userId))
      .orderBy(desc(savedStudyItems.updatedAt));
    const sources = await getDb().select().from(studyItemSources)
      .where(eq(studyItemSources.userId, userId));
    return Response.json({ items: items.map((row) => savedItemSchema.parse(row)), sources: sources.map((row) => savedSourceSchema.parse(row)) });
  } catch {
    return internalErrorResponse("Study items");
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
  const input = parseSaveStudyItemInput(raw);
  if (!input) return Response.json({ error: "Invalid StudyItem save", code: "INVALID_INPUT" }, { status: 400 });

  const now = Date.now();
  const item = {
    userId,
    studyItemId: input.studyItemId,
    reviewItemId: deterministicReviewItemId(input.studyItemId),
    status: "active" as const,
    savedAt: now,
    updatedAt: now,
  };
  const source = {
    userId,
    studyItemId: input.studyItemId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceContextId: input.sourceContextId ?? "",
    createdAt: now,
  };

  try {
    await getDb().batch([
      getDb().insert(savedStudyItems).values(item).onConflictDoNothing(),
      getDb().insert(studyItemSources).values(source).onConflictDoNothing(),
    ]);
    const saved = await getDb().select().from(savedStudyItems).where(and(
      eq(savedStudyItems.userId, userId),
      eq(savedStudyItems.studyItemId, input.studyItemId),
    )).get();
    const savedSources = await getDb().select().from(studyItemSources).where(and(
      eq(studyItemSources.userId, userId),
      eq(studyItemSources.studyItemId, input.studyItemId),
    ));
    return Response.json({ item: savedItemSchema.parse(saved), sources: savedSources.map((row) => savedSourceSchema.parse(row)) });
  } catch {
    return internalErrorResponse("Study items");
  }
}
