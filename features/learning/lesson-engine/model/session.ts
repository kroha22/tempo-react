import type { LearningProgress } from "../../progress/dto.ts";
import type { BoundaryIntent, CardIntent, CompletionIntent } from "./intents.ts";

export type Failure = "auth" | "network" | "conflict" | "invalid" | "server";
export type LoadState = { status: "loading" | "ready" } | { status: "failed"; error: Failure };
export type Mutation<T> = { status: "idle" | "saved" } | { status: "pending"; intent: T } | { status: "failed"; intent: T; error: Failure };
export type Phase = { stage: "learn" } | { stage: "activity"; selection: string | null } | { stage: "summary"; result: "demonstrated" | "partial" };
export type SessionState = {
  generation: number; sessionId: string | null; phase: Phase; interacted: boolean;
  progressLoad: LoadState; cardsLoad: LoadState;
  boundary: Mutation<BoundaryIntent>; completion: Mutation<CompletionIntent>;
  cards: Record<string, Mutation<CardIntent>>; savedIds: readonly string[];
  stepRevision: number; message: string;
};
export const initialSession: SessionState = {
  generation: 0, sessionId: null, phase: { stage: "learn" }, interacted: false,
  progressLoad: { status: "loading" }, cardsLoad: { status: "loading" },
  boundary: { status: "idle" }, completion: { status: "idle" }, cards: {}, savedIds: [], stepRevision: 0, message: "",
};

type Transition =
  | { type: "start"; sessionId: string; stage: "learn" | "activity"; message: string; initial: boolean }
  | { type: "load-progress" }
  | { type: "progress-loaded"; progress?: LearningProgress; flowRevision: number }
  | { type: "progress-failed"; error: Failure }
  | { type: "load-cards" }
  | { type: "cards-loaded"; ids: string[] }
  | { type: "cards-failed"; error: Failure }
  | { type: "select"; selection: string }
  | { type: "boundary-started"; intent: BoundaryIntent }
  | { type: "boundary-saved" }
  | { type: "boundary-failed"; error: Failure }
  | { type: "completion-started"; intent: CompletionIntent }
  | { type: "completion-saved"; result: "demonstrated" | "partial" }
  | { type: "completion-failed"; error: Failure }
  | { type: "card-started"; intent: CardIntent }
  | { type: "card-saved"; id: string }
  | { type: "card-failed"; id: string; error: Failure };
export type SessionAction = Transition & { generation: number };

export function sessionBusy(state: SessionState) {
  return state.boundary.status === "pending" || state.completion.status === "pending" || Object.values(state.cards).some((card) => card.status === "pending");
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === "start") {
    if (action.generation <= state.generation) return state;
    return { ...initialSession, generation: action.generation, sessionId: action.sessionId,
      phase: action.stage === "activity" ? { stage: "activity", selection: null } : { stage: "learn" },
      interacted: !action.initial, savedIds: state.savedIds, stepRevision: state.stepRevision + 1, message: action.message };
  }
  if (action.generation !== state.generation) return state;
  switch (action.type) {
    case "load-progress": return { ...state, progressLoad: { status: "loading" } };
    case "progress-loaded": {
      const loaded = { ...state, progressLoad: { status: "ready" } as const };
      if (state.interacted || !action.progress) return loaded;
      const progress = action.progress;
      if (progress.flowRevision !== action.flowRevision || progress.snapshot === null) return {
        ...loaded, phase: { stage: "learn" }, message: "Сохранённый шаг несовместим с уроком. Начните урок заново.",
      };
      if (progress.status === "finished") return { ...loaded, phase: { stage: "summary", result: progress.canDoResult === "demonstrated" ? "demonstrated" : "partial" } };
      if (progress.snapshot.stage && progress.snapshot.stage !== "learn") return { ...loaded, phase: { stage: "activity", selection: null } };
      return { ...loaded, phase: { stage: "learn" } };
    }
    case "progress-failed": return { ...state, progressLoad: { status: "failed", error: action.error } };
    case "load-cards": return { ...state, cardsLoad: { status: "loading" } };
    case "cards-loaded": {
      const cards = { ...state.cards };
      for (const id of action.ids) cards[id] = { status: "saved" };
      return { ...state, cardsLoad: { status: "ready" }, cards, savedIds: [...new Set([...state.savedIds, ...action.ids])] };
    }
    case "cards-failed": return { ...state, cardsLoad: { status: "failed", error: action.error } };
    case "select":
      if (state.phase.stage !== "activity" || state.completion.status !== "idle") return state;
      return { ...state, interacted: true, phase: { stage: "activity", selection: action.selection } };
    case "boundary-started": return { ...state, interacted: true, phase: { stage: "activity", selection: state.phase.stage === "activity" ? state.phase.selection : null }, boundary: { status: "pending", intent: action.intent } };
    case "boundary-saved": return state.boundary.status === "pending" ? { ...state, boundary: { status: "saved" } } : state;
    case "boundary-failed": return state.boundary.status === "pending" ? { ...state, boundary: { ...state.boundary, status: "failed", error: action.error } } : state;
    case "completion-started":
      if (state.phase.stage !== "activity") return state;
      return { ...state, interacted: true, completion: { status: "pending", intent: action.intent } };
    case "completion-saved": return state.completion.status === "pending" ? { ...state, phase: { stage: "summary", result: action.result }, completion: { status: "saved" } } : state;
    case "completion-failed": return state.completion.status === "pending" ? { ...state, completion: { ...state.completion, status: "failed", error: action.error } } : state;
    case "card-started": return { ...state, cards: { ...state.cards, [action.intent.studyItemId]: { status: "pending", intent: action.intent } } };
    case "card-saved": return { ...state, savedIds: [...new Set([...state.savedIds, action.id])], cards: { ...state.cards, [action.id]: { status: "saved" } } };
    case "card-failed": {
      const card = state.cards[action.id];
      return card?.status === "pending" ? { ...state, cards: { ...state.cards, [action.id]: { ...card, status: "failed", error: action.error } } } : state;
    }
    default: { const exhaustive: never = action; return exhaustive; }
  }
}
