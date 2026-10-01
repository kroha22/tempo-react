import { verbCards } from "./data/verb-cards.ts";
import type { ReviewProgress } from "./scheduler.ts";

const legacyCardIds = new Set(verbCards.map((card) => card.id));

function finiteRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

export function parseLegacyProgressPayload(value: unknown): Omit<ReviewProgress, "lastGrade"> & { lastGrade: number | null } | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (typeof payload.cardId !== "string" || !legacyCardIds.has(payload.cardId)) return null;
  if (!Number.isSafeInteger(payload.due) || (payload.due as number) < 0) return null;
  if (!finiteRange(payload.interval, 0, 36_500)) return null;
  if (!finiteRange(payload.ease, 1.3, 3.2)) return null;
  if (!nonNegativeInteger(payload.repetitions) || !nonNegativeInteger(payload.lapses)) return null;
  if (payload.lastGrade !== null && ![0, 1, 2, 3].includes(payload.lastGrade as number)) return null;
  return {
    cardId: payload.cardId,
    due: payload.due as number,
    interval: payload.interval,
    ease: payload.ease,
    repetitions: payload.repetitions,
    lapses: payload.lapses,
    lastGrade: payload.lastGrade as number | null,
  };
}
