"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HttpError } from "@/shared/http/request-json";
import { useQueryScope } from "@/shared/query/SessionQueryBoundary";
import { gradeStudyReview, loadStudyReviews } from "./api";
import type { StudyReviewCommand } from "./contracts";
import type { ReviewGrade } from "../scheduler";
import { initialStudySession, studySessionReducer } from "./session";
import { studyReviewCardById } from "./catalog";

export function useStudyReview(unit?: number) {
  const scope = useQueryScope();
  const key = ["cards", scope.scopeKey, "study-reviews"] as const;
  const query = useQuery({ queryKey: key, enabled: !scope.blocked, queryFn: ({ signal }) => loadStudyReviews(signal), staleTime: 0 });
  const [state, dispatch] = useReducer(studySessionReducer, initialStudySession);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const mutation = useMutation({
    mutationKey: ["cards", scope.scopeKey, "grade-study-item"],
    mutationFn: (command: StudyReviewCommand) => gradeStudyReview(command, scope.controller.signal),
    onMutate: async () => { await scope.client.cancelQueries({ queryKey: key }); },
    onSuccess: async (result) => {
      await scope.client.cancelQueries({ queryKey: key });
      if (!scope.isActive()) return;
      scope.client.setQueryData<Awaited<ReturnType<typeof loadStudyReviews>>>(key, (data) => data ? { ...data, serverNow: Math.max(data.serverNow, result.card.reviewedAt ?? 0), cards: data.cards.map((row) => row.studyItemId === result.card.studyItemId && result.card.version >= row.version ? result.card : row) } : undefined);
    },
  });
  const empty = state.active === null;
  useEffect(() => {
    if (scope.blocked) return;
    if (query.data && query.isSuccess && query.fetchStatus === "idle" && (state.status === "loading" || state.status === "load-error" || (state.status === "ready" && empty))) dispatch({ type: "loaded", rows: query.data.cards, now: query.data.serverNow, unit });
    else if (query.isError && query.fetchStatus === "idle" && state.status === "loading") dispatch({ type: "load-error" });
  }, [query.data, query.isSuccess, query.isError, query.fetchStatus, state.status, empty, scope.blocked, unit]);

  // Refresh the empty queue at the next deadline; browser time never grades a card.
  useEffect(() => {
    if (state.status !== "ready" || state.active || !state.rows.length || scope.blocked) return;
    const nextDue = Math.min(...state.rows.flatMap((row) => (!unit || studyReviewCardById.get(row.studyItemId)?.units.includes(unit)) && row.progress && row.progress.due > state.now ? [row.progress.due] : []));
    if (!Number.isFinite(nextDue)) return;
    const timer = setTimeout(() => { void query.refetch(); }, Math.min(60000, Math.max(1000, nextDue - state.now)));
    return () => clearTimeout(timer);
  }, [state.status, state.active, state.rows, state.now, scope.blocked, query, unit]);

  async function persist(command: StudyReviewCommand) {
    if (busy.current || scope.blocked || !scope.isActive()) return;
    busy.current = true; dispatch({ type: "saving", command });
    try {
      const { card } = await mutation.mutateAsync(command);
      const latest = scope.client.getQueryData<Awaited<ReturnType<typeof loadStudyReviews>>>(key);
      if (mounted.current && scope.isActive()) dispatch({ type: "saved", card, now: Math.max(card.reviewedAt ?? state.now, latest?.serverNow ?? 0), latestRows: latest?.cards, unit });
    } catch (error) {
      if (mounted.current && scope.isActive()) dispatch({ type: "save-error", conflict: error instanceof HttpError && error.status === 409 });
    } finally { busy.current = false; }
  }
  function rate(grade: ReviewGrade) {
    if (state.status !== "ready" || !state.flipped || !state.active) return;
    void persist({ clientEventId: `review:${crypto.randomUUID()}`, studyItemId: state.active.studyItemId, expectedVersion: state.active.version, grade });
  }
  const reload = useCallback(() => {
    if (scope.blocked) { scope.retryAccess(); return; }
    if (busy.current) return;
    dispatch({ type: "reload" }); void query.refetch();
  }, [scope, query]);
  return { ...state, rate, flip: () => dispatch({ type: "flip" }), reload,
    eligibleCount: state.rows.filter((row) => !unit || studyReviewCardById.get(row.studyItemId)?.units.includes(unit)).length,
    retry: () => { if (scope.blocked) scope.retryAccess(); else if (state.pending && state.status === "save-error") void persist(state.pending); else reload(); },
    accessBlocked: scope.blocked, refreshing: query.isFetching, refreshError: query.isError && state.status === "ready" };
}
