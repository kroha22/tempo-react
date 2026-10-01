import { hasLowerPresentationPriority, type ReviewProgress, type SchedulableCard } from "./scheduler.ts";

export type ProgressByCard = Readonly<Record<string, ReviewProgress>>;
export type ReviewStatus = "loading" | "load-error" | "ready" | "saving" | "save-error";
export type ReviewSession = {
  progress: ProgressByCard;
  status: ReviewStatus;
  flipped: boolean;
  sessionCount: number;
  now: number;
  pending: ReviewProgress | null;
};

export const initialReviewSession: ReviewSession = {
  progress: {}, status: "loading", flipped: false, sessionCount: 0, now: 0, pending: null,
};

export type ReviewAction =
  | { type: "load-start" }
  | { type: "loaded"; progress: ReviewProgress[]; now: number }
  | { type: "load-failed" }
  | { type: "flip" }
  | { type: "review-start"; progress: ReviewProgress }
  | { type: "review-saved"; progress: ReviewProgress; now: number; serverProgress?: ReviewProgress[] }
  | { type: "review-failed" };

export function reviewSessionReducer(state: ReviewSession, action: ReviewAction): ReviewSession {
  switch (action.type) {
    case "load-start":
      return { ...state, status: "loading" };
    case "loaded":
      return { ...state, status: "ready", progress: Object.fromEntries(action.progress.map((row) => [row.cardId, row])), now: action.now };
    case "load-failed":
      return { ...state, status: "load-error" };
    case "flip":
      return state.status === "ready" || state.status === "load-error" ? { ...state, flipped: !state.flipped } : state;
    case "review-start":
      if (!state.flipped || !["ready", "save-error"].includes(state.status)) return state;
      return { ...state, status: "saving", pending: state.pending ?? action.progress };
    case "review-saved":
      if (state.status !== "saving" || state.pending?.cardId !== action.progress.cardId) return state;
      return { ...state, status: "ready", pending: null, flipped: false, sessionCount: state.sessionCount + 1, now: action.now, progress: {
        ...(action.serverProgress ? Object.fromEntries(action.serverProgress.map((row) => [row.cardId, row])) : state.progress),
        [action.progress.cardId]: action.progress,
      } };
    case "review-failed":
      return state.status === "saving" ? { ...state, status: "save-error" } : state;
  }
}

/** Preserve the existing policy: overdue, unseen (non-basic first), then earliest due. */
export function selectNextCard<T extends SchedulableCard>(cards: readonly T[], progress: ProgressByCard, now: number): T | undefined {
  let overdue: T | undefined;
  let unseen: T | undefined;
  let focused: T | undefined;
  let earliest: T | undefined;
  for (const card of cards) {
    const row = progress[card.id];
    if (!row) {
      unseen ??= card;
      if (!hasLowerPresentationPriority(card)) focused ??= card;
    } else {
      if (!earliest || row.due < progress[earliest.id].due) earliest = card;
      if (row.due <= now && (!overdue || row.due < progress[overdue.id].due)) overdue = card;
    }
  }
  return overdue ?? focused ?? unseen ?? earliest;
}

export function reviewStats(cards: readonly SchedulableCard[], progress: ProgressByCard, now: number) {
  let due = 0;
  let seen = 0;
  let learned = 0;
  for (const card of cards) {
    const row = progress[card.id];
    if (!row) continue;
    seen += 1;
    if (row.due <= now) due += 1;
    if (row.repetitions >= 3 && row.interval >= 14) learned += 1;
  }
  return { due, seen, learned };
}
