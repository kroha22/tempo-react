"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadSavedItems } from "../../cards/api/saved-items";
import { saveStudyItem } from "../progress/api";

export function useVocabularyCards(practiceOnly: boolean) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [sourceKeys, setSourceKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(!practiceOnly);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const retryJob = useRef<(() => Promise<void>) | null>(null);
  const run = useCallback((job: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setPending(true); setError(""); retryJob.current = job;
    void job().then(() => { if (!controller.current?.signal.aborted) retryJob.current = null; }).catch(() => {
      if (!controller.current?.signal.aborted) setError("Не удалось загрузить или сохранить карточку. Проверьте доступ к сохранениям, затем повторите действие.");
    }).finally(() => { lock.current = false; if (!controller.current?.signal.aborted) { setLoading(false); setPending(false); } });
  }, []);
  useEffect(() => {
    const abort = new AbortController(); controller.current = abort;
    if (!practiceOnly) queueMicrotask(() => {
      if (abort.signal.aborted) return;
      run(async () => { const rows = await loadSavedItems(abort.signal); if (!abort.signal.aborted) { setSavedIds(rows.items.map((r) => r.studyItemId)); setSourceKeys(rows.sources.filter((s) => s.sourceId === "course:ga1:pt-pt").map((s) => `${s.studyItemId}:${s.sourceContextId ?? "all"}`)); } });
    });
    return () => abort.abort();
  }, [practiceOnly, run]);
  function save(studyItemId: string, unit?: number, onSaved?: () => void) {
    if (practiceOnly || loading || error) return;
    const intent = { studyItemId, sourceType: "topic" as const, sourceId: "course:ga1:pt-pt", ...(unit ? { sourceContextId: `unit:ga1:u${String(unit).padStart(2, "0")}` } : {}), clientEventId: `card:${crypto.randomUUID()}` };
    run(async () => {
      const result = await saveStudyItem(intent, controller.current?.signal);
      if (!controller.current?.signal.aborted) { setSavedIds((ids) => [...new Set([...ids, studyItemId])]); setSourceKeys((keys) => [...new Set([...keys, ...result.sources.filter((s) => s.sourceId === "course:ga1:pt-pt").map((s) => `${s.studyItemId}:${s.sourceContextId ?? "all"}`)])]); onSaved?.(); }
    });
  }
  return { savedIds, loading, pending, error, save, sourceSaved: (id: string, unit?: number) => unit ? sourceKeys.includes(`${id}:unit:ga1:u${String(unit).padStart(2, "0")}`) : savedIds.includes(id), retry: () => { const job = retryJob.current; if (job) run(job); } };
}
