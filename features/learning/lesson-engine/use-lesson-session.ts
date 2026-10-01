"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { ZodError } from "zod";
import { isCancelledError } from "@tanstack/react-query";
import type { RouteLessonExperience } from "../../content/first-vertical-slice/route-extension";
import { cardsKeys, savedItemsOptions } from "../../cards/query/queries";
import { HttpError } from "@/shared/http/request-json";
import { useQueryScope } from "@/shared/query/SessionQueryBoundary";
import { LearningResponseError } from "../progress/api";
import { learningKeys, learningProgressOptions } from "../query/queries";
import { useLessonMutations } from "../query/mutations";
import { createCompletionIntent, type BoundaryIntent, type CardIntent, type CompletionIntent } from "./model/intents";
import { initialSession, sessionBusy, sessionReducer, type Failure, type SessionAction } from "./model/session";
import { readDraft, writeDraft } from "./session-draft";

function failure(error: unknown): Failure {
  if (error instanceof HttpError) return error.status === 401 || error.status === 403 ? "auth" : error.status === 409 ? "conflict" : "server";
  if (error instanceof ZodError || error instanceof LearningResponseError || error instanceof SyntaxError) return "invalid";
  return "network";
}

export function useLessonSession(experience: RouteLessonExperience, requiredItemIds: readonly string[], flowRevision: number) {
  const scope = useQueryScope();
  const { saveBoundary, complete, saveCard: mutateCard, appendEvent } = useLessonMutations();
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  // Synchronous transitions close the double-click gap before React commits a render.
  const current = useRef(initialSession);
  const generation = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const lessonId = experience.id;
  const send = useCallback((action: SessionAction) => {
    current.current = sessionReducer(current.current, action);
    dispatch(action);
  }, []);
  const abortAll = useCallback(() => {
    for (const controller of controllers.current.values()) controller.abort();
    controllers.current.clear();
    void scope.client.cancelQueries({ queryKey: learningKeys.progress(scope.scopeKey) });
    void scope.client.cancelQueries({ queryKey: cardsKeys.savedItems(scope.scopeKey) });
  }, [scope]);
  const request = useCallback((key: string) => {
    controllers.current.get(key)?.abort();
    const controller = new AbortController();
    controllers.current.set(key, controller);
    const epoch = generation.current;
    return { signal: controller.signal, epoch, live: () => scope.isActive() && epoch === generation.current && !controller.signal.aborted };
  }, [scope]);

  const loadProgress = useCallback(async () => {
    const job = request("progress");
    send({ type: "load-progress", generation: job.epoch });
    try {
      if (scope.blocked) throw new HttpError(401);
      // Restore is explicit. Cache refetches cannot drive the exercise phase.
      const rows = await scope.client.fetchQuery({ ...learningProgressOptions(scope.scopeKey), staleTime: 0 });
      const progress = rows.find((row) => row.lessonId === lessonId);
      if (!job.live()) return;
      send({ type: "progress-loaded", generation: job.epoch, progress, flowRevision });
      if (current.current.phase.stage === "summary") writeDraft(lessonId, null);
    } catch (error) {
      if (job.live() && !isCancelledError(error)) send({ type: "progress-failed", generation: job.epoch, error: failure(error) });
    }
  }, [flowRevision, lessonId, request, scope, send]);

  const loadCards = useCallback(async () => {
    const job = request("cards");
    send({ type: "load-cards", generation: job.epoch });
    try {
      if (scope.blocked) throw new HttpError(401);
      const { items } = await scope.client.fetchQuery({ ...savedItemsOptions(scope.scopeKey), staleTime: 0 });
      if (job.live()) send({ type: "cards-loaded", generation: job.epoch, ids: items.map((item) => item.studyItemId) });
    } catch (error) {
      if (job.live() && !isCancelledError(error)) send({ type: "cards-failed", generation: job.epoch, error: failure(error) });
    }
  }, [request, scope, send]);

  const start = useCallback((stage: "learn" | "activity", initial: boolean, message: string) => {
    abortAll();
    generation.current += 1;
    const epoch = generation.current;
    const sessionId = `session:${crypto.randomUUID()}`;
    send({ type: "start", generation: epoch, sessionId, stage, message, initial });
    writeDraft(lessonId, scope.blocked ? null : stage);
    // Reload starts a fresh attempt identity, never reuses IDs with a changed answer.
    const job = request("session-event");
    if (!scope.blocked) void appendEvent({ intent: { lessonId, sessionId, eventType: "session_started", clientEventId: `start:${sessionId}`,
      contentRevision: flowRevision, payload: { entry: initial ? "open" : "restart" }, occurredAt: Date.now() }, job }).catch(() => undefined);
    void loadProgress();
    void loadCards();
  }, [abortAll, appendEvent, flowRevision, lessonId, loadCards, loadProgress, request, scope, send]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) start(scope.blocked ? "learn" : readDraft(lessonId), true, ""); });
    return () => { active = false; generation.current += 1; abortAll(); };
  }, [abortAll, lessonId, scope.blocked, start]);

  async function runBoundary(intent: BoundaryIntent) {
    const job = request("boundary");
    send({ type: "boundary-started", generation: job.epoch, intent });
    writeDraft(lessonId, "activity");
    try {
      const result = await saveBoundary({ intent, job });
      if (job.live()) {
        send({ type: "progress-loaded", generation: job.epoch, progress: result.progress, flowRevision });
        send({ type: "boundary-saved", generation: job.epoch });
      }
    } catch (error) {
      if (job.live()) send({ type: "boundary-failed", generation: job.epoch, error: failure(error) });
    }
  }

  function continueLesson() {
    const value = current.current;
    if (!value.sessionId || value.phase.stage !== "learn" || sessionBusy(value)) return;
    void runBoundary({ lessonId, sessionId: value.sessionId, flowRevision, status: "active", activePhaseId: experience.activity.id, snapshot: { stage: "activity" }, updatedAt: Date.now() });
  }
  function retryBoundary() {
    const value = current.current;
    if (value.boundary.status === "failed" && !sessionBusy(value) && value.phase.stage !== "summary") void runBoundary(value.boundary.intent);
  }

  async function runCompletion(intent: CompletionIntent) {
    const job = request("completion");
    send({ type: "completion-started", generation: job.epoch, intent });
    try {
      const result = await complete({ intent, job });
      if (!job.live()) return;
      writeDraft(lessonId, null);
      send({ type: "completion-saved", generation: job.epoch, result: result.progress.canDoResult === "demonstrated" ? "demonstrated" : "partial" });
    } catch (error) {
      if (job.live()) send({ type: "completion-failed", generation: job.epoch, error: failure(error) });
    }
  }
  function finish() {
    const value = current.current;
    if (!value.sessionId || value.phase.stage !== "activity" || !value.phase.selection || sessionBusy(value)) return;
    const intent = value.completion.status === "failed" ? value.completion.intent : createCompletionIntent(experience, requiredItemIds, value.sessionId, value.phase.selection, flowRevision, Date.now());
    if (intent) void runCompletion(intent);
  }
  function select(selection: string) {
    if (!experience.activity.options.some((option) => option.id === selection)) return;
    send({ type: "select", generation: generation.current, selection });
  }
  async function runCard(intent: CardIntent) {
    const job = request(`card:${intent.studyItemId}`);
    send({ type: "card-started", generation: job.epoch, intent });
    try {
      await mutateCard({ intent, job });
      if (job.live()) {
        send({ type: "card-saved", generation: job.epoch, id: intent.studyItemId });
        if (current.current.cardsLoad.status === "loading") void loadCards();
      }
    } catch (error) {
      if (job.live()) send({ type: "card-failed", generation: job.epoch, id: intent.studyItemId, error: failure(error) });
    }
  }
  function saveCard(id: string) {
    const value = current.current;
    if (value.phase.stage !== "summary" || !experience.saveItemIds.includes(id) || value.savedIds.includes(id)) return;
    const card = value.cards[id];
    if (card?.status === "pending") return;
    void runCard(card?.status === "failed" ? card.intent : { studyItemId: id, sourceType: "lesson", sourceId: lessonId, clientEventId: `client:${crypto.randomUUID()}` });
  }
  function restart(stage: "learn" | "activity") {
    if (sessionBusy(current.current)) return;
    start(stage, false, stage === "learn" ? "Урок начат сначала" : "Задание начато заново");
  }
  return { state, continueLesson, retryBoundary, finish, select, saveCard, restart,
    accessBlocked: scope.blocked, retryAccess: scope.retryAccess,
    loadProgress: scope.blocked ? scope.retryAccess : loadProgress,
    loadCards: scope.blocked ? scope.retryAccess : loadCards };
}
