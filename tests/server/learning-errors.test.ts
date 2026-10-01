// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

// Only the storage boundary fails; exercise the actual route handlers and auth.
vi.mock("@/db", () => ({ getDb: () => { throw new Error("SQL SELECT user_id; binding secret-value"); } }));
import * as progress from "@/app/api/learning/progress/route";
import * as complete from "@/app/api/learning/complete/route";
import * as events from "@/app/api/learning/events/route";
import * as errors from "@/app/api/learning/errors/route";
import * as items from "@/app/api/study-items/route";

const lessonId = "lesson:a1-1:introduce-yourself";
const identity = { "oai-authenticated-user-id": "test-user" };
const base = { lessonId, sessionId: "session-test-001", clientEventId: "client-test-001", flowRevision: 1 };

describe("Learning API storage failures", () => {
  const cases: [string, (request: Request) => Promise<Response>, object | undefined][] = [
    ["progress read", progress.GET, undefined],
    ["progress write", progress.POST, { ...base, status: "active", snapshot: { stage: "learn" }, updatedAt: 1_800_000_000_000 }],
    ["completion prerequisite read", complete.POST, { ...base, completedAt: 1_800_000_000_000 }],
    ["event lookup and race recovery", events.POST, { ...base, eventType: "session_started", contentRevision: 1, payload: {}, occurredAt: 1_800_000_000_000 }],
    ["error patterns read", errors.GET, undefined],
    ["repair write", errors.POST, { patternKey: "ERROR:target", result: "improved" }],
    ["saved items read", items.GET, undefined],
    ["saved items write", items.POST, { studyItemId: "study:chunk:chamo-me", sourceType: "lesson", sourceId: lessonId, clientEventId: "client-test-001" }],
  ];

  it.each(cases)("%s returns a safe JSON error", async (_name, handler, body) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await handler(new Request("https://tempo.test/api", {
      method: body ? "POST" : "GET", headers: identity, body: body ? JSON.stringify(body) : undefined,
    }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error", code: "INTERNAL_ERROR" });
    expect(log).toHaveBeenCalled();
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/secret-value|test-user|SELECT/);
  });

  it.each(cases)("%s rejects anonymous requests before storage", async (_name, handler, body) => {
    const response = await handler(new Request("https://tempo.test/api", {
      method: body ? "POST" : "GET", body: body ? JSON.stringify(body) : undefined,
    }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required", code: "UNAUTHENTICATED" });
  });
});
