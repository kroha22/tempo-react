import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LessonEngine } from "@/features/learning/lesson-engine/LessonEngine";

const lessonId = "lesson:a1-1:introduce-yourself";
const progress = { lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, canDoResult: null };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

beforeEach(() => { window.sessionStorage.clear(); });

function mockApi(load: (signal?: AbortSignal | null) => Promise<Response>, pendingCards = false) {
  vi.stubGlobal("fetch", vi.fn((url: string, init?: RequestInit) => {
    if (url === "/api/study-items") return pendingCards ? new Promise<Response>(() => undefined) : Promise.resolve(json({ items: [], sources: [] }));
    if (url === "/api/learning/events") return Promise.resolve(json({ event: { clientEventId: "client-test-001" }, duplicate: false }));
    if (init?.method === "POST") return Promise.resolve(json({ progress }));
    return load(init?.signal);
  }));
}

it("restores a validated activity snapshot", async () => {
  mockApi(async () => json({ progress: [progress] }));
  render(<LessonEngine lessonId={lessonId} />);
  expect(await screen.findByRole("heading", { name: "Выберите ответ" })).toBeInTheDocument();
});

it("does not promise a saved draft when progress cannot be authenticated", async () => {
  mockApi(async () => json({ error: "Authentication required", code: "UNAUTHENTICATED" }, 401));
  render(<LessonEngine lessonId={lessonId} />);
  expect(await screen.findByText("Загрузка прогресса: Для сохранения прогресса нужно войти.")).toBeInTheDocument();
  expect(screen.queryByText(/Черновик сохранён/)).not.toBeInTheDocument();
});

it.each([{ snapshot: null }, { flowRevision: 2 }])("offers recovery for incompatible progress %j", async (override) => {
  mockApi(async () => json({ progress: [{ ...progress, ...override }] }));
  render(<LessonEngine lessonId={lessonId} />);
  expect(await screen.findByText(/Сохранённый шаг несовместим/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Представиться" })).toBeInTheDocument();
});

it("does not trust an active snapshot as proof of completion", async () => {
  mockApi(async () => json({ progress: [{ ...progress, snapshot: { stage: "summary" } }] }));
  render(<LessonEngine lessonId={lessonId} />);
  expect(await screen.findByRole("heading", { name: "Выберите ответ" })).toBeInTheDocument();
  expect(screen.queryByText("Итог урока")).not.toBeInTheDocument();
});

it("does not overwrite a new step with a late restore", async () => {
  let resolve!: (response: Response) => void;
  const pending = new Promise<Response>((done) => { resolve = done; });
  mockApi(() => pending);
  const user = userEvent.setup();
  render(<LessonEngine lessonId={lessonId} />);
  await waitFor(() => expect(screen.getByRole("button", { name: /Перейти к заданию/ })).toBeEnabled());
  await user.click(screen.getByRole("button", { name: /Перейти к заданию/ }));
  expect(await screen.findByRole("heading", { name: "Выберите ответ" })).toBeInTheDocument();
  await act(async () => { resolve(json({ progress: [{ ...progress, snapshot: { stage: "learn" } }] })); });
  expect(screen.getByRole("heading", { name: "Выберите ответ" })).toBeInTheDocument();
});

it("aborts both reads when leaving the lesson", async () => {
  let signal: AbortSignal | null | undefined;
  mockApi((incoming) => { signal = incoming; return new Promise(() => undefined); }, true);
  const view = render(<LessonEngine lessonId={lessonId} />);
  await waitFor(() => expect(signal).toBeDefined());
  const calls = vi.mocked(fetch).mock.calls;
  const cardsSignal = calls.find(([url]) => url === "/api/study-items")?.[1]?.signal;
  expect(cardsSignal).toBeDefined();
  view.unmount();
  expect(signal?.aborted).toBe(true);
  expect(cardsSignal?.aborted).toBe(true);
});
