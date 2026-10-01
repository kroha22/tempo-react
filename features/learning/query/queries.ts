"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { useQueryScope } from "@/shared/query/SessionQueryBoundary";
import { loadLearningProgress } from "../progress/api";
import { loadErrorPatterns } from "../progress/errors-api";

export const learningKeys = {
  progress: (scope: string) => ["learning", scope, "progress"] as const,
  errors: (scope: string) => ["learning", scope, "errors"] as const,
};

export function learningProgressOptions(scope: string) {
  return queryOptions({ queryKey: learningKeys.progress(scope), queryFn: ({ signal }) => loadLearningProgress(signal) });
}

export function useLearningProgressQuery() {
  const scope = useQueryScope();
  return useQuery({ ...learningProgressOptions(scope.scopeKey), enabled: !scope.blocked });
}

export function useErrorPatternsQuery() {
  const scope = useQueryScope();
  return useQuery({ queryKey: learningKeys.errors(scope.scopeKey), enabled: !scope.blocked,
    queryFn: ({ signal }) => loadErrorPatterns(signal) });
}
