import assert from "node:assert/strict";
import test from "node:test";
import { HttpError, requestJson } from "../shared/http/request-json.ts";
import { loadCardProgress, saveCardProgress } from "../features/cards/api/progress.ts";
import { scheduleReview } from "../features/cards/scheduler.ts";

test("HTTP errors cannot masquerade as successful JSON responses", async () => {
  for (const status of [401, 403, 500, 503]) {
    const transport: typeof fetch = async () => Response.json({ error: "private diagnostic" }, { status });
    await assert.rejects(requestJson("/api/progress", undefined, transport), (error: unknown) => error instanceof HttpError && error.status === status && !error.message.includes("private"));
  }
});

test("transport preserves cancellation and does not retry writes automatically", async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  const transport: typeof fetch = async (_url, init) => {
    calls += 1;
    init?.signal?.throwIfAborted();
    return Response.json({});
  };
  await assert.rejects(requestJson("/api/progress", { method: "POST", signal: controller.signal }, transport), { name: "AbortError" });
  assert.equal(calls, 1);
});

test("card adapter rejects malformed and legacy error envelopes", async (context) => {
  for (const body of [{}, { progress: [], error: "Database unavailable" }, { progress: [{ cardId: "v9999" }] }]) {
    context.mock.method(globalThis, "fetch", async () => Response.json(body));
    await assert.rejects(loadCardProgress());
    context.mock.restoreAll();
  }
});

test("card adapter returns only validated fields and confirms the requested card", async (context) => {
  const row = scheduleReview({ id: "v0043", rank: 43, basic: false }, undefined, 2, 1000);
  context.mock.method(globalThis, "fetch", async () => Response.json({ progress: [{ ...row, userId: "server-only" }] }));
  assert.deepEqual(await loadCardProgress(), [row]);
  context.mock.restoreAll();
  context.mock.method(globalThis, "fetch", async () => Response.json({ progress: { ...row, cardId: "v0044" } }));
  await assert.rejects(saveCardProgress(row));
});
