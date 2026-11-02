import { z } from "zod";

const timestamp = z.int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const reviewGradeSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export const studyReviewCommandSchema = z.strictObject({
  studyItemId: z.string().min(1).max(200),
  clientEventId: z.string().regex(/^review:[a-f0-9-]{36}$/),
  grade: reviewGradeSchema,
  expectedVersion: z.int().nonnegative().max(1_000_000_000),
});
export type StudyReviewCommand = z.infer<typeof studyReviewCommandSchema>;
export const reviewProgressSchema = z.object({
  cardId: z.string().min(1), due: timestamp, interval: z.number().finite().nonnegative(), ease: z.number().min(1.3).max(3.2),
  repetitions: z.int().nonnegative(), lapses: z.int().nonnegative(), lastGrade: reviewGradeSchema,
});
export const studyReviewRowSchema = z.object({
  studyItemId: z.string().min(1), reviewItemId: z.string().min(1), progress: reviewProgressSchema.nullable(),
  version: z.int().nonnegative(), reviewedAt: timestamp.nullable(),
}).refine((row) => row.progress ? row.progress.cardId === row.reviewItemId && row.version > 0 && row.reviewedAt !== null : row.version === 0 && row.reviewedAt === null);
export type StudyReviewRow = z.infer<typeof studyReviewRowSchema>;
export const studyReviewListSchema = z.object({ cards: z.array(studyReviewRowSchema), serverNow: timestamp });
export const studyReviewResponseSchema = z.object({ card: studyReviewRowSchema, clientEventId: z.string().min(1), duplicate: z.boolean() });
