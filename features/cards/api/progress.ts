import { requestJson } from "../../../shared/http/request-json.ts";
import { parseLegacyProgressPayload } from "../progress-contract.ts";
import type { ReviewProgress } from "../scheduler.ts";

const demoStorageKey = "tempo-react:github-pages:card-progress";

function isStaticDemo() {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/tempo-react");
}

function loadDemoProgress(): ReviewProgress[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(demoStorageKey) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.flatMap((row) => {
      const progress = parseLegacyProgressPayload(row);
      return progress ? [progress] : [];
    });
  } catch {
    return [];
  }
}

function responseBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid progress response");
  }
  const body = value as Record<string, unknown>;
  // Older API versions can return an error with HTTP 200.
  if (body.error) throw new Error("Progress unavailable");
  return body;
}

export async function loadCardProgress(signal?: AbortSignal): Promise<ReviewProgress[]> {
  if (isStaticDemo()) return loadDemoProgress();
  const body = responseBody(await requestJson("/api/progress", { signal }));
  if (!Array.isArray(body.progress)) throw new Error("Invalid progress response");
  return body.progress.map((row) => {
    const progress = parseLegacyProgressPayload(row);
    if (!progress) throw new Error("Invalid card progress");
    return progress;
  });
}

export async function saveCardProgress(progress: ReviewProgress, signal?: AbortSignal): Promise<ReviewProgress> {
  if (isStaticDemo()) {
    const next = [...loadDemoProgress().filter((row) => row.cardId !== progress.cardId), progress];
    window.localStorage.setItem(demoStorageKey, JSON.stringify(next));
    return progress;
  }
  const body = responseBody(await requestJson("/api/progress", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(progress),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
  }));
  const saved = parseLegacyProgressPayload(body.progress);
  if (!saved || saved.cardId !== progress.cardId) throw new Error("Invalid saved progress");
  return saved;
}
