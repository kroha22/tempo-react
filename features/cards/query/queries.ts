"use client";

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { loadCardProgress, saveCardProgress } from "../api/progress";
import { loadSavedItems } from "../api/saved-items";
import type { ReviewProgress } from "../scheduler";
import { useCardsScope } from "./CardsQueryBoundary";

export const cardsKeys = {
  progress: (scope: string) => ["cards", scope, "verb-progress"] as const,
  savedItems: (scope: string) => ["cards", scope, "saved-items"] as const,
};

export function useCardProgressQuery() {
  const scope = useCardsScope();
  return useQuery({ queryKey: cardsKeys.progress(scope.scopeKey), enabled: !scope.blocked,
    queryFn: ({ signal }) => loadCardProgress(signal) });
}

export function useSavedItemsQuery() {
  const scope = useCardsScope();
  return useQuery({ ...savedItemsOptions(scope.scopeKey), enabled: !scope.blocked });
}

export function savedItemsOptions(scopeKey: string) {
  return queryOptions({ queryKey: cardsKeys.savedItems(scopeKey),
    queryFn: ({ signal }) => loadSavedItems(signal) });
}

export function useSaveReviewMutation() {
  const scope = useCardsScope();
  const key = cardsKeys.progress(scope.scopeKey);
  return useMutation({
    mutationKey: ["cards", scope.scopeKey, "save-review"],
    mutationFn: (progress: ReviewProgress) => saveCardProgress(progress, scope.controller.signal),
    onMutate: async () => { await scope.client.cancelQueries({ queryKey: key }); },
    onSuccess: async (saved) => {
      // A focus refetch started during POST must not overwrite its confirmed result.
      await scope.client.cancelQueries({ queryKey: key });
      if (!scope.isActive()) return;
      scope.client.setQueryData<ReviewProgress[]>(key, (rows = []) => [
        ...rows.filter((row) => row.cardId !== saved.cardId), saved,
      ]);
    },
  });
}
