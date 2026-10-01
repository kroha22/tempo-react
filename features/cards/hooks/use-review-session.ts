"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { verbCards } from "../data/verb-cards";
import { initialReviewSession, reviewSessionReducer, reviewStats, selectNextCard } from "../review-session";
import { currentReviewTimestamp, scheduleReview, type ReviewGrade, type ReviewProgress } from "../scheduler";
import { useCardsScope } from "../query/CardsQueryBoundary";
import { cardsKeys, useCardProgressQuery, useSaveReviewMutation } from "../query/queries";

export function useReviewSession() {
  const [state, dispatch] = useReducer(reviewSessionReducer, initialReviewSession);
  const scope = useCardsScope();
  const query = useCardProgressQuery();
  const mutation = useSaveReviewMutation();
  const saving = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (state.status !== "loading" && state.status !== "load-error") return;
    if (scope.blocked) {
      if (state.status !== "load-error") dispatch({ type: "load-failed" });
    } else if (query.data && query.isSuccess) {
      // Seed a session once. Background cache updates never replace its active card.
      dispatch({ type: "loaded", progress: query.data, now: currentReviewTimestamp() });
    } else if (query.isError && query.fetchStatus === "idle" && state.status !== "load-error") {
      dispatch({ type: "load-failed" });
    }
  }, [query.data, query.isSuccess, query.isError, query.fetchStatus, scope.blocked, state.status]);

  const card = useMemo(() => selectNextCard(verbCards, state.progress, state.now), [state.progress, state.now]);
  const stats = useMemo(() => reviewStats(verbCards, state.progress, state.now), [state.progress, state.now]);

  async function persist(progress: ReviewProgress) {
    if (saving.current || scope.blocked || !scope.isActive()) return;
    saving.current = true;
    dispatch({ type: "review-start", progress });
    try {
      const saved = await mutation.mutateAsync(progress);
      if (mounted.current && scope.isActive()) dispatch({ type: "review-saved", progress: saved,
        serverProgress: scope.client.getQueryData<ReviewProgress[]>(cardsKeys.progress(scope.scopeKey)), now: currentReviewTimestamp() });
    } catch {
      if (mounted.current && scope.isActive()) dispatch({ type: "review-failed" });
    } finally {
      saving.current = false;
    }
  }

  function rate(grade: ReviewGrade) {
    if (!card || !state.flipped || state.status !== "ready") return;
    void persist(scheduleReview(card, state.progress[card.id], grade, currentReviewTimestamp()));
  }

  function retry() {
    if (scope.blocked) { scope.retryAccess(); return; }
    if (state.status === "save-error" && state.pending) {
      void persist(state.pending);
    } else if (state.status === "load-error") {
      dispatch({ type: "load-start" });
      void query.refetch();
    }
  }

  return { ...state, card, stats, rate, retry, flip: () => dispatch({ type: "flip" }),
    refreshError: state.status === "ready" && query.isError, refreshing: query.isFetching,
    refresh: () => { void query.refetch(); } };
}
