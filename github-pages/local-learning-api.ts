import { HttpError } from "../shared/http/request-json";
import { deterministicReviewItemId, expectedContentRevision, parseCompleteLessonInput, parseLearningEventInput, parseLessonProgressInput, parseSaveStudyItemInput } from "../features/learning/progress/contracts";
import { allGramaticaLessons, grammarAnswerCorrect, grammarExitResult } from "../features/content/gramatica-ativa";
import { validGrammarSnapshot } from "../features/learning/gramatica/session";
import { firstVerticalSliceContentPack as pack } from "../features/content/manifest";
import { studyReviewCommandSchema } from "../features/cards/study-review/contracts";
import { studyReviewCardById } from "../features/cards/study-review/catalog";
import { scheduleStudyReview } from "../features/cards/study-review/model";
import type { LearningStore, LocalLearning } from "./local-learning-store";

const invalid = (): never => { throw new HttpError(400); };
const conflict = (): never => { throw new HttpError(409); };
export function createLocalLearningApi(store: LearningStore) {
  return async (url: string, init?: RequestInit): Promise<unknown> => {
    init?.signal?.throwIfAborted();
    if (!init?.method || init.method === "GET") {
      const data = await store.read();
      init?.signal?.throwIfAborted();
      if (url === "/api/study-items") return { items: data.items, sources: data.sources };
      if (url === "/api/study-reviews") return { cards: data.reviews.filter(row => studyReviewCardById.has(row.studyItemId)), serverNow: Date.now() };
      if (url === "/api/learning/progress") return { progress: data.progress };
      if (url === "/api/learning/errors") return { patterns: [] };
      throw new HttpError(404);
    }
    if (init.method !== "POST" || typeof init.body !== "string") invalid();
    let raw: unknown;
    try { raw = JSON.parse(init.body as string); } catch { invalid(); }
    let response: unknown;
    await store.update(data => {
      init?.signal?.throwIfAborted();
      const now = Date.now();
      if (url === "/api/study-items") {
        const input = parseSaveStudyItemInput(raw); if (!input) return invalid();
        let item = data.items.find(row => row.studyItemId === input.studyItemId);
        if (!item) { item = { studyItemId: input.studyItemId, savedAt: now }; data.items.push(item); }
        const source = { studyItemId: input.studyItemId, sourceType: input.sourceType, sourceId: input.sourceId, ...(input.sourceContextId ? { sourceContextId: input.sourceContextId } : {}) };
        if (!data.sources.some(row => row.studyItemId === source.studyItemId && row.sourceType === source.sourceType && row.sourceId === source.sourceId && row.sourceContextId === source.sourceContextId)) data.sources.push(source);
        if (studyReviewCardById.has(item.studyItemId) && !data.reviews.some(row => row.studyItemId === item.studyItemId)) data.reviews.push({ studyItemId: item.studyItemId, reviewItemId: deterministicReviewItemId(item.studyItemId), version: 0, reviewedAt: null, progress: null });
        response = { item, sources: data.sources.filter(row => row.studyItemId === item.studyItemId) };
      } else if (url === "/api/study-reviews") {
        const parsed = studyReviewCommandSchema.safeParse(raw); if (!parsed.success) return invalid();
        const input = parsed.data;
        const previousEvent = data.reviewReceipts.find(row => row.command.clientEventId === input.clientEventId);
        const before = data.reviews.find(row => row.studyItemId === input.studyItemId);
        if (!before) throw new HttpError(404);
        // Store the exact receipt separately from the schedule, so retries never grade twice.
        if (previousEvent) {
          if (JSON.stringify(previousEvent.command) !== JSON.stringify(input)) return conflict();
          response = {...previousEvent.result,duplicate:true}; return data;
        }
        if (before.version !== input.expectedVersion) return conflict();
        const card = scheduleStudyReview(before, input.grade, now);
        data.reviews = data.reviews.map(row => row.studyItemId === card.studyItemId ? card : row);
        response = { card, clientEventId: input.clientEventId, duplicate: false };
        data.reviewReceipts.push({command:input,result:{card,clientEventId:input.clientEventId,duplicate:false}});
      } else if (url === "/api/learning/events") {
        const input = parseLearningEventInput(raw); if (!input || expectedContentRevision(input.entityId ?? input.lessonId) !== input.contentRevision) return invalid();
        const previous = data.events.find(row => row.clientEventId === input.clientEventId);
        if (previous) {
          if(previous.sessionId!==input.sessionId||previous.lessonId!==input.lessonId||previous.entityId!==input.entityId)return conflict();
          response = { event: { clientEventId: previous.clientEventId, answer: previous.answer }, duplicate: true }; return data;
        }
        const lesson = allGramaticaLessons.find(row => row.id === input.lessonId);
        let answer: string | undefined, correct: boolean | undefined;
        if (lesson && input.eventType === "exercise_attempt") {
          const task = lesson.tasks.find(row => row.id === input.entityId);
          if (!task || typeof input.payload.answer !== "string" || !input.payload.answer.trim() || input.payload.answer.length > 500 || input.clientEventId !== `${input.sessionId}:${task.id}` || (task.options && !task.options.includes(input.payload.answer))) return invalid();
          answer = input.payload.answer; correct = grammarAnswerCorrect(task, answer);
        } else correct = input.payload.correct === true;
        data.events.push({ clientEventId: input.clientEventId, sessionId: input.sessionId, lessonId: input.lessonId, entityId: input.entityId, answer, correct });
        response = { event: { clientEventId: input.clientEventId, answer }, duplicate: false };
      } else if (url === "/api/learning/progress") {
        const input = parseLessonProgressInput(raw); if (!input || expectedContentRevision(input.lessonId) !== input.flowRevision) return invalid();
        const lesson = allGramaticaLessons.find(row => row.id === input.lessonId);
        if (input.snapshot.grammar && (!lesson || input.sessionId !== input.snapshot.grammar.sessionId || !validGrammarSnapshot(lesson, input.snapshot.grammar))) return invalid();
        const old = data.progress.find(row => row.lessonId === input.lessonId);
        const progress = old && old.updatedAt > input.updatedAt ? old : { lessonId: input.lessonId, flowRevision: input.flowRevision, status: old?.status === "finished" ? "finished" as const : input.status, canDoResult: old?.canDoResult ?? null, snapshot: old?.status === "finished" && !lesson ? old.snapshot : input.snapshot, updatedAt: input.updatedAt };
        data.progress = [...data.progress.filter(row => row.lessonId !== input.lessonId), progress]; response = { progress };
      } else if (url === "/api/learning/complete") {
        const input = parseCompleteLessonInput(raw); if (!input || expectedContentRevision(input.lessonId) !== input.flowRevision) return invalid();
        const definition = pack.lessons.find(row => row.id === input.lessonId)!;
        const required = definition.completionRule.requiredExerciseUseIds.map(id => pack.exerciseUses.find(row => row.id === id)!.exerciseItemId);
        const attempts = data.events.filter(row => row.lessonId === input.lessonId && row.sessionId === input.sessionId);
        if (required.some(id => !attempts.some(row => row.entityId === id))) return conflict();
        const lesson = allGramaticaLessons.find(row => row.id === input.lessonId);
        const answers = Object.fromEntries(attempts.filter(row => row.entityId && row.answer !== undefined).map(row => [row.entityId!, row.answer!]));
        const independent = pack.exerciseUses.find(row => row.lessonId === input.lessonId && row.phase === "independent");
        const demonstrated = lesson ? grammarExitResult(lesson, answers).demonstrated : attempts.some(row => row.entityId === independent?.exerciseItemId && row.correct);
        const result = demonstrated ? "demonstrated" as const : "partial" as const;
        const old = data.progress.find(row => row.lessonId === input.lessonId);
        const canDoResult = old?.canDoResult === "demonstrated" ? old.canDoResult : result;
        const progress: LocalLearning["progress"][number] = { lessonId: input.lessonId, flowRevision: input.flowRevision, status: "finished", canDoResult, snapshot: old && old.updatedAt>input.completedAt ? old.snapshot : { completed: true, canDoResult }, updatedAt: Math.max(input.completedAt, old?.updatedAt ?? 0) };
        data.progress = [...data.progress.filter(row => row.lessonId !== input.lessonId), progress];
        response = { progress, ...(lesson ? { attemptCanDoResult: result } : {}) };
      } else throw new HttpError(404);
      return data;
    });
    return response;
  };
}
