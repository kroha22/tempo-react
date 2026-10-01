"use client";

import { useMutation } from "@tanstack/react-query";
import { HttpError } from "@/shared/http/request-json";
import { useQueryScope, type QueryScope } from "@/shared/query/SessionQueryBoundary";
import { cardsKeys } from "@/features/cards/query/queries";
import type { savedItemsResponseSchema } from "@/features/cards/api/saved-items-dto";
import type { z } from "zod";
import { appendLearningEvent, completeLesson, saveBoundary, saveStudyItem } from "../progress/api";
import type { LearningProgress } from "../progress/dto";
import type { BoundaryIntent, CardIntent, CompletionIntent, EventIntent } from "../lesson-engine/model/intents";
import { learningKeys } from "./queries";
import { improveErrorPattern } from "../progress/errors-api";

export type RequestJob = { signal: AbortSignal; live: () => boolean };
type Command<T> = { intent: T; job: RequestJob };

function signalFor(scope: QueryScope, job: RequestJob) {
  if (scope.blocked) throw new HttpError(401);
  if (!scope.isActive() || !job.live()) throw new DOMException("Attempt retired", "AbortError");
  return AbortSignal.any([scope.controller.signal, job.signal, AbortSignal.timeout(15_000)]);
}

async function updateProgress(scope: QueryScope, progress: LearningProgress, job: RequestJob) {
  if (!scope.isActive() || !job.live()) return;
  const queryKey = learningKeys.progress(scope.scopeKey);
  await scope.client.cancelQueries({ queryKey });
  if (!scope.isActive() || !job.live()) return;
  scope.client.setQueryData<LearningProgress[]>(queryKey, (rows) => rows && [
    ...rows.filter((row) => row.lessonId !== progress.lessonId), progress,
  ]);
  // A single acknowledgement must never stand in for a missing full list.
  if (!scope.client.getQueryData(queryKey)) void scope.client.invalidateQueries({ queryKey, refetchType: "all" });
}

async function runCommand<T>(scope: QueryScope, job: RequestJob, operation: (signal: AbortSignal) => Promise<T>) {
  const signal = signalFor(scope, job);
  try {
    const result = await operation(signal);
    signal.throwIfAborted();
    if (!scope.isActive() || !job.live()) throw new DOMException("Attempt retired", "AbortError");
    return result;
  } catch (error) {
    // A late failure from a retired attempt must not revoke the new scope.
    if (!scope.isActive() || !job.live()) throw new DOMException("Attempt retired", "AbortError");
    throw error;
  }
}

export function useImproveErrorMutation() {
  const scope = useQueryScope();
  return useMutation({
    mutationKey: ["learning", scope.scopeKey, "improve-error"],
    mutationFn: (patternKey: string) => {
      if (scope.blocked) throw new HttpError(401);
      return improveErrorPattern(patternKey, AbortSignal.any([scope.controller.signal, AbortSignal.timeout(15_000)]));
    },
    onSuccess: async () => {
      // The acknowledgement schedules a later review; it does not delete history.
      if (scope.isActive()) await scope.client.invalidateQueries({ queryKey: learningKeys.errors(scope.scopeKey), refetchType: "none" });
    },
  });
}

export function useLessonMutations() {
  const scope = useQueryScope();
  const boundary = useMutation({
    mutationKey: ["learning", scope.scopeKey, "boundary"],
    mutationFn: ({ intent, job }: Command<BoundaryIntent>) => runCommand(scope, job, (signal) => saveBoundary(intent, signal)),
    onSuccess: (result, { job }) => updateProgress(scope, result.progress, job),
  });
  const completion = useMutation({
    mutationKey: ["learning", scope.scopeKey, "completion"],
    mutationFn: ({ intent, job }: Command<CompletionIntent>) => runCommand(scope, job, async (signal) => {
      for (const event of intent.events) {
        signal.throwIfAborted();
        if (!job.live()) throw new DOMException("Attempt retired", "AbortError");
        await appendLearningEvent(event, signal);
      }
      signal.throwIfAborted();
      if (!job.live()) throw new DOMException("Attempt retired", "AbortError");
      return completeLesson(intent.completion, signal);
    }),
    onSuccess: async (result, { job }) => {
      await updateProgress(scope, result.progress, job);
      if (scope.isActive() && job.live()) await scope.client.invalidateQueries({ queryKey: learningKeys.errors(scope.scopeKey) });
    },
  });
  const card = useMutation({
    mutationKey: ["learning", scope.scopeKey, "save-item"],
    mutationFn: ({ intent, job }: Command<CardIntent>) => runCommand(scope, job, (signal) => saveStudyItem(intent, signal)),
    onSuccess: async (result, { job }) => {
      if (!scope.isActive() || !job.live()) return;
      const key = cardsKeys.savedItems(scope.scopeKey);
      await scope.client.cancelQueries({ queryKey: key });
      if (!scope.isActive() || !job.live()) return;
      // POST contains the acknowledged item and its sources, not the whole library.
      scope.client.setQueryData<z.infer<typeof savedItemsResponseSchema>>(key, (data) => data && ({
        items: [...data.items.filter((item) => item.studyItemId !== result.item.studyItemId), result.item],
        sources: [...data.sources.filter((source) => source.studyItemId !== result.item.studyItemId), ...result.sources],
      }));
      await scope.client.invalidateQueries({ queryKey: key });
    },
  });
  const event = useMutation({
    mutationKey: ["learning", scope.scopeKey, "session-event"],
    mutationFn: ({ intent, job }: Command<EventIntent>) => runCommand(scope, job, (signal) => appendLearningEvent(intent, signal)),
  });
  return { saveBoundary: boundary.mutateAsync, complete: completion.mutateAsync, saveCard: card.mutateAsync, appendEvent: event.mutateAsync };
}
