import type { StudyReviewCommand, StudyReviewRow } from "./contracts.ts";
import { studyReviewQueue } from "./model.ts";

export type StudySession = {
  status: "loading" | "load-error" | "ready" | "saving" | "save-error" | "conflict";
  rows: StudyReviewRow[]; active: StudyReviewRow | null; flipped: boolean; now: number;
  pending: StudyReviewCommand | null; count: number; receipt: StudyReviewRow | null;
};
export const initialStudySession: StudySession = { status: "loading", rows: [], active: null, flipped: false, now: 0, pending: null, count: 0, receipt: null };
export type StudyAction =
  | { type: "loaded"; rows: StudyReviewRow[]; now: number; unit?: number }
  | { type: "load-error" }
  | { type: "reload" }
  | { type: "flip" }
  | { type: "saving"; command: StudyReviewCommand }
  | { type: "save-error"; conflict: boolean }
  | { type: "saved"; card: StudyReviewRow; now: number; unit?: number; latestRows?: StudyReviewRow[] };
export function studySessionReducer(state: StudySession, action: StudyAction): StudySession {
  switch (action.type) {
    case "loaded": {
      if (!["loading", "load-error"].includes(state.status) && !(state.status === "ready" && state.active === null)) return state;
      return { ...state, status: "ready", rows: action.rows, active: studyReviewQueue(action.rows, action.now, action.unit)[0] ?? null, now: action.now, flipped: false, pending: null };
    }
    case "load-error": return state.status === "loading" ? { ...state, status: "load-error" } : state;
    case "reload": return { ...state, status: "loading", active: null, flipped: false, pending: null };
    case "flip": return state.status === "ready" && state.active ? { ...state, flipped: !state.flipped } : state;
    case "saving": return state.active && ((state.status === "ready" && state.flipped) || state.status === "save-error") ? { ...state, status: "saving", pending: action.command } : state;
    case "save-error": return state.status === "saving" ? { ...state, status: action.conflict ? "conflict" : "save-error" } : state;
    case "saved": {
      if (state.status !== "saving" || action.card.studyItemId !== state.pending?.studyItemId) return state;
      const rows = (action.latestRows ?? state.rows).map((row) => row.studyItemId === action.card.studyItemId && action.card.version >= row.version ? action.card : row);
      return { ...state, rows, now: action.now, active: studyReviewQueue(rows, action.now, action.unit)[0] ?? null, flipped: false, status: "ready", pending: null, count: state.count + 1, receipt: action.card };
    }
  }
}
