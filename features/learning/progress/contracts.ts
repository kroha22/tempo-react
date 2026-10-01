import { z } from "zod";
import { lessonSnapshotSchema, type LessonSnapshot } from "./dto.ts";
import { firstVerticalSliceContentPack } from "../../content/manifest.ts";

export const LEARNING_EVENT_TYPES = [
  "session_started",
  "phase_completed",
  "exercise_attempt",
  "scene_completed",
  "error",
  "checkpoint_result",
] as const;

export type LearningEventType = (typeof LEARNING_EVENT_TYPES)[number];
export type LessonProgressStatus = "not_started" | "active" | "finished";
export type CanDoResult = "demonstrated" | "partial" | "not_yet";
export type StudyItemSourceType = "lesson" | "topic" | "scene" | "summary" | "checkpoint";

export type LearningEventInput = {
  clientEventId: string;
  sessionId: string;
  lessonId: string;
  eventType: LearningEventType;
  entityId?: string;
  contentRevision: number;
  payload: Record<string, unknown>;
  occurredAt: number;
};

export type LessonProgressInput = {
  lessonId: string;
  flowRevision: number;
  status: LessonProgressStatus;
  canDoResult?: CanDoResult;
  activePhaseId?: string;
  sessionId?: string;
  snapshot: LessonSnapshot;
  updatedAt: number;
};

export type SaveStudyItemInput = {
  studyItemId: string;
  sourceType: StudyItemSourceType;
  sourceId: string;
  sourceContextId?: string;
  clientEventId: string;
};

export type CompleteLessonInput = {
  clientEventId: string;
  sessionId: string;
  lessonId: string;
  flowRevision: number;
  completedAt: number;
};

const stableIdPattern = /^[a-z0-9-]+(?::[a-z0-9-]+)+$/;
const opaqueIdPattern = /^[A-Za-z0-9:_-]{8,128}$/;
const lessonIds = new Set(firstVerticalSliceContentPack.lessons.map((lesson) => lesson.id));
const studyItemIds = new Set(firstVerticalSliceContentPack.studyItems.map((item) => item.id));
const entityRevisions = firstVerticalSliceContentPack.manifest.entityRevisions;
const structuralRevisions = Object.fromEntries(firstVerticalSliceContentPack.flows.flatMap((flow) => [
  [flow.id, flow.contentRevision],
  ...flow.phases.map((phase) => [phase.id, flow.contentRevision]),
]));
for (const use of firstVerticalSliceContentPack.exerciseUses) {
  structuralRevisions[use.id] = entityRevisions[use.lessonId] ?? 1;
}
const allContentRevisions: Record<string, number> = { ...entityRevisions, ...structuralRevisions };

const stableIdSchema = z.string().regex(stableIdPattern);
const opaqueIdSchema = z.string().regex(opaqueIdPattern);
const timestampSchema = z.int().positive();
const revisionSchema = z.int().positive();
const lessonIdSchema = z.string().refine((id) => lessonIds.has(id));
const jsonBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

const eventInputSchema = z.object({
  clientEventId: opaqueIdSchema,
  sessionId: opaqueIdSchema,
  lessonId: lessonIdSchema,
  eventType: z.enum(LEARNING_EVENT_TYPES),
  entityId: stableIdSchema.refine((id) => Object.hasOwn(allContentRevisions, id)).optional(),
  contentRevision: revisionSchema,
  payload: z.record(z.string(), z.json()).refine((value) => jsonBytes(value) <= 16_384),
  occurredAt: timestampSchema,
});
const progressInputSchema = z.object({
  lessonId: lessonIdSchema,
  flowRevision: revisionSchema,
  status: z.enum(["not_started", "active"]),
  canDoResult: z.never().optional(),
  activePhaseId: stableIdSchema.optional(),
  sessionId: opaqueIdSchema.optional(),
  snapshot: lessonSnapshotSchema.refine((value) => jsonBytes(value) <= 32_768),
  updatedAt: timestampSchema,
});
const saveItemInputSchema = z.object({
  studyItemId: z.string().refine((id) => studyItemIds.has(id)),
  sourceType: z.enum(["lesson", "topic", "scene", "summary", "checkpoint"]),
  sourceId: stableIdSchema,
  sourceContextId: stableIdSchema.optional(),
  clientEventId: opaqueIdSchema,
});
const completeInputSchema = z.object({
  clientEventId: opaqueIdSchema,
  sessionId: opaqueIdSchema,
  lessonId: lessonIdSchema,
  flowRevision: revisionSchema,
  completedAt: timestampSchema,
});

export function parseLearningEventInput(value: unknown): LearningEventInput | null {
  const parsed = eventInputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function parseLessonProgressInput(value: unknown): LessonProgressInput | null {
  const parsed = progressInputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function parseSaveStudyItemInput(value: unknown): SaveStudyItemInput | null {
  const parsed = saveItemInputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function expectedContentRevision(entityId: string): number | null {
  return allContentRevisions[entityId] ?? null;
}

export function parseCompleteLessonInput(value: unknown): CompleteLessonInput | null {
  const parsed = completeInputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function deterministicReviewItemId(studyItemId: string): string {
  return `saved:${studyItemId}`;
}

export function mergeLessonStatus(current: LessonProgressStatus | undefined, incoming: LessonProgressStatus): LessonProgressStatus {
  if (current === "finished") return "finished";
  return incoming;
}
