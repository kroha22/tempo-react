"use client";
import { useEffect, useRef, useState } from "react";
import type { GrammarLesson } from "../../content/gramatica-ativa";
import { appendLearningEvent, completeLesson, loadLearningProgress, saveBoundary, saveStudyItem } from "../progress/api";
import { loadSavedItems } from "../../cards/api/saved-items";
import type { GrammarSnapshot } from "../progress/dto";
import { grammarStart, nextGrammarStep, validGrammarSnapshot, currentGrammarTask } from "./session";
import { HttpError } from "@/shared/http/request-json";

type View = { status: "loading" } | { status: "ready"; snapshot: GrammarSnapshot } | { status: "summary"; demonstrated: boolean; snapshot?: GrammarSnapshot };
export function useGrammarSession(lesson: GrammarLesson, practiceOnly: boolean) {
  const [view, setView] = useState<View>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const live = useRef(false);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const retryCommand = useRef<(() => Promise<void>) | null>(null);

  function run(command: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); retryCommand.current = command;
    void command().then(() => { if (live.current) retryCommand.current = null; }).catch((cause: unknown) => {
      if (live.current) setError(cause instanceof HttpError && (cause.status === 401 || cause.status === 403) ? "Для сохранения нужно войти. После входа повторите действие." : "Не удалось сохранить действие. Проверьте доступ к хранилищу и повторите сохранение.");
    }).finally(() => { lock.current = false; if (live.current) setBusy(false); });
  }
  useEffect(() => {
    live.current = true;
    const abort = new AbortController(); controller.current = abort;
    const load = async () => {
      if (practiceOnly) { if (live.current) setView({ status: "ready", snapshot: grammarStart(lesson) }); return; }
      const progress = (await loadLearningProgress(abort.signal)).find((p) => p.lessonId === lesson.id);
      if (abort.signal.aborted) return;
      if (progress?.status === "finished" && progress.flowRevision === 1 && !progress.snapshot?.grammar) setView({ status: "summary", demonstrated: (progress.snapshot?.canDoResult ?? progress.canDoResult) === "demonstrated", ...(lesson.checkpoint&&progress.snapshot?.checkpointAnswers?{snapshot:{...grammarStart(lesson),answers:progress.snapshot.checkpointAnswers}}:{}) });
      else {
        const snapshot = progress?.flowRevision === 1 ? progress.snapshot?.grammar : undefined;
        setView({ status: "ready", snapshot: snapshot && validGrammarSnapshot(lesson, snapshot) ? snapshot : grammarStart(lesson) });
      }
    };
    // Keep StrictMode's discarded setup from issuing a second load.
    queueMicrotask(() => { if (!abort.signal.aborted) run(load); });
    return () => { live.current = false; abort.abort(); };
    // A keyed lesson mounts a fresh coordinator; no server cache can move its cursor.
  }, [lesson, practiceOnly]);

  async function persist(snapshot: GrammarSnapshot) {
    if (practiceOnly) return;
    await saveBoundary({ lessonId: lesson.id, sessionId: snapshot.sessionId, flowRevision: 1, status: "active", activePhaseId: `phase:ga1:${lesson.slug}:${snapshot.phase === "rule" ? "guided" : snapshot.phase}`, snapshot: { stage: "activity", grammar: snapshot }, updatedAt: Date.now() }, controller.current?.signal);
  }
  function check(answer: string) {
    if (view.status !== "ready" || !answer.trim() || error) return;
    const snapshot = view.snapshot;
    const task = currentGrammarTask(lesson, snapshot);
    if (!task || Object.hasOwn(snapshot.answers, task.id)) return;
    const event = { lessonId: lesson.id, sessionId: snapshot.sessionId, clientEventId: `${snapshot.sessionId}:${task.id}`, contentRevision: 1,
      eventType: "exercise_attempt" as const, entityId: task.id, payload: { answer }, occurredAt: Date.now() };
    run(async () => {
      const acknowledged = practiceOnly ? answer : (await appendLearningEvent(event, controller.current?.signal)).event.answer;
      if (!practiceOnly && acknowledged === undefined) throw new Error("Missing saved answer");
      const updated = { ...snapshot, answers: { ...snapshot.answers, [task.id]: acknowledged ?? answer } };
      await persist(updated);
      if (live.current) setView({ status: "ready", snapshot: updated });
    });
  }
  function next() {
    if (view.status !== "ready" || error) return;
    const snapshot = view.snapshot;
    const next = nextGrammarStep(lesson, snapshot);
    const completion = { lessonId: lesson.id, sessionId: snapshot.sessionId, clientEventId: `complete:${snapshot.sessionId}`, flowRevision: 1, completedAt: Date.now() };
    run(async () => {
      if (next) { await persist(next); if (live.current) setView({ status: "ready", snapshot: next }); }
      else {
        const { grammarExitResult } = await import("../../content/gramatica-ativa");
        const demonstrated = practiceOnly ? grammarExitResult(lesson, snapshot.answers).demonstrated : (await completeLesson(completion, controller.current?.signal)).attemptCanDoResult === "demonstrated";
        if (live.current) setView({ status: "summary", demonstrated, snapshot });
      }
    });
  }
  function restart() {
    const snapshot = grammarStart(lesson);
    run(async () => { await persist(snapshot); if (live.current) setView({ status: "ready", snapshot }); });
  }
  function saveCard(id: string) {
    const intent = { studyItemId: id, sourceType: "lesson" as const, sourceId: lesson.id, clientEventId: `card:${crypto.randomUUID()}` };
    run(async () => {
      await saveStudyItem(intent, controller.current?.signal);
      const rows = await loadSavedItems(controller.current?.signal);
      if (live.current) setSavedIds(rows.items.map((row) => row.studyItemId));
    });
  }
  return { view, busy, error, savedIds, check, next, restart, saveCard,
    retry: () => { const command = retryCommand.current; if (command) run(command); } };
}
