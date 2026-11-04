import { z } from "zod";

// Browser-safe contracts: no database or content-pack imports.
export const lessonStatusSchema = z.enum(["not_started", "active", "finished"]);
export const canDoResultSchema = z.enum(["demonstrated", "partial", "not_yet"]);
export const grammarSnapshotSchema = z.strictObject({
  sessionId: z.string().regex(/^session:[a-f0-9-]{36}$/),
  phase: z.enum(["diagnostic", "rule", "guided", "exit"]),
  index: z.int().min(0).max(21),
  answers: z.record(z.string().max(160), z.string().max(500)).refine((value) => Object.keys(value).length <= 32),
});
export type GrammarSnapshot = z.infer<typeof grammarSnapshotSchema>;
export const lessonSnapshotSchema = z.strictObject({
  stage: z.enum(["learn", "activity", "summary"]).optional(),
  completedPhaseIds: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
  canDoResult: canDoResultSchema.optional(),
  grammar: grammarSnapshotSchema.optional(),
  checkpointAnswers: z.record(z.string().max(160),z.string().max(500)).refine(value=>Object.keys(value).length<=22).optional(),
});
export type LessonSnapshot = z.infer<typeof lessonSnapshotSchema>;

export const learningProgressSchema = z.object({
  lessonId: z.string().min(1),
  flowRevision: z.int().positive(),
  status: lessonStatusSchema,
  snapshot: lessonSnapshotSchema.nullable(),
  canDoResult: canDoResultSchema.nullable(),
  updatedAt:z.int().nonnegative().optional(),
});
export type LearningProgress = z.infer<typeof learningProgressSchema>;
export const progressListSchema = z.object({ progress: z.array(learningProgressSchema) });
export const progressResponseSchema = z.object({ progress: learningProgressSchema, attemptCanDoResult: canDoResultSchema.optional() });

// Acknowledgements deliberately omit identity, raw payloads and storage metadata.
export const eventAcknowledgementSchema = z.object({
  event: z.object({ clientEventId: z.string().min(1), answer: z.string().max(500).optional() }),
  duplicate: z.boolean(),
});
export const errorPatternSchema = z.object({
  patternKey: z.string().min(1),
  errorCode: z.string().min(1),
  targetId: z.string().min(1),
  occurrenceCount: z.int().positive(),
});
export const errorPatternsResponseSchema = z.object({ patterns: z.array(errorPatternSchema) });
export const repairInputSchema = z.object({ patternKey: z.string().min(1).max(256), result: z.literal("improved") });
export const repairResponseSchema = z.object({ ok: z.literal(true) });

/** Decode old stored JSON without letting an incompatible snapshot break the list. */
export function progressDto(row: {
  lessonId: string; flowRevision: number; status: string; snapshotJson: string; canDoResult: string | null;updatedAt?:number;
}): LearningProgress {
  let snapshot: LessonSnapshot | null = null;
  try {
    const decoded = lessonSnapshotSchema.safeParse(JSON.parse(row.snapshotJson));
    if (decoded.success) snapshot = decoded.data;
  } catch { /* null tells the UI to restart this lesson safely */ }
  return learningProgressSchema.parse({
    lessonId: row.lessonId, flowRevision: row.flowRevision, status: row.status,
    snapshot, canDoResult: row.canDoResult,...(row.updatedAt!==undefined?{updatedAt:row.updatedAt}:{}),
  });
}
