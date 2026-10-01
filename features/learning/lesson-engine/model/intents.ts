import type { RouteLessonExperience } from "../../../content/first-vertical-slice/route-extension.ts";
import { createPlacement } from "../../../scenes/domain.ts";
import { validateScenePlacement } from "../../../scenes/validation.ts";

export type BoundaryIntent = Readonly<{
  lessonId: string; sessionId: string; flowRevision: number; status: "active";
  activePhaseId: string; snapshot: { stage: "activity" }; updatedAt: number;
}>;
export type EventIntent = Readonly<{
  lessonId: string; sessionId: string; clientEventId: string; contentRevision: number;
  eventType: "session_started" | "exercise_attempt" | "scene_completed" | "error";
  entityId?: string; payload: Readonly<Record<string, unknown>>; occurredAt: number;
}>;
export type CompleteIntent = Readonly<{
  lessonId: string; sessionId: string; clientEventId: string; flowRevision: number; completedAt: number;
}>;
export type CardIntent = Readonly<{
  studyItemId: string; sourceType: "lesson"; sourceId: string; clientEventId: string;
}>;
export type CompletionIntent = Readonly<{ selection: string; events: readonly EventIntent[]; completion: CompleteIntent }>;

/** Validate semantics before creating any events; never cast an arbitrary option. */
export function sceneResponse(selection: string) {
  if (selection !== "inside" && selection !== "on" && selection !== "under") return null;
  return createPlacement("gato", selection, selection === "inside" ? "caixa" : "mesa");
}

export function createCompletionIntent(
  experience: RouteLessonExperience, requiredItemIds: readonly string[],
  sessionId: string, selection: string, flowRevision: number, now: number,
): CompletionIntent | null {
  if (!requiredItemIds.length || !experience.activity.options.some((option) => option.id === selection)) return null;
  const placement = experience.activity.kind === "scene" ? sceneResponse(selection) : null;
  if (experience.activity.kind === "scene" && !placement) return null;
  const correct = selection === experience.activity.correctOptionId;
  const base = { lessonId: experience.id, sessionId, contentRevision: flowRevision, occurredAt: now };
  const events: EventIntent[] = requiredItemIds.map((entityId) => ({
    ...base, eventType: "exercise_attempt", entityId, clientEventId: `attempt:${sessionId}:${entityId}`,
    payload: { selected: selection, correct, assistance: "none" },
  }));
  if (placement) events.push({
    ...base, eventType: "scene_completed", entityId: experience.activity.id,
    clientEventId: `scene:${sessionId}:${experience.activity.id}`,
    payload: validateScenePlacement({ id: "scene-task:cat-under-table", expected: createPlacement("gato", "under", "mesa") }, placement),
  });
  if (!correct) events.push({
    ...base, eventType: "error", entityId: experience.activity.targetId,
    clientEventId: `error:${sessionId}:${experience.activity.id}`,
    payload: { errorCode: experience.activity.errorCode, targetId: experience.activity.targetId,
      recommendationId: `recommendation:${experience.activity.errorCode.toLowerCase().replaceAll("_", "-")}` },
  });
  return { selection, events, completion: {
    lessonId: experience.id, sessionId, clientEventId: `complete:${sessionId}`, flowRevision, completedAt: now,
  } };
}
