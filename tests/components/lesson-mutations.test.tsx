import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LessonEngine } from "@/features/learning/lesson-engine/LessonEngine";

const lessonId = "lesson:a1-1:introduce-yourself";
const progress = { lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, canDoResult: null };
const completed = { ...progress, status: "finished", snapshot: { completed: true }, canDoResult: "demonstrated" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
type Write = { url: string; body: Record<string, unknown> };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }
beforeEach(() => { window.sessionStorage.clear(); vi.spyOn(window, "scrollTo").mockImplementation(() => undefined); });

function api(intercept?: (url: string, init: RequestInit | undefined, body: Record<string, unknown>) => Response | Promise<Response> | undefined) {
  const writes: Write[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
    if (init?.method === "POST") writes.push({ url, body });
    const override = intercept?.(url, init, body);
    if (override) return override;
    if (url === "/api/learning/events") return json({ event: { clientEventId: body.clientEventId }, duplicate: false });
    if (url === "/api/learning/complete") return json({ progress: completed });
    if (url === "/api/study-items") return init?.method === "POST" ? json({ item: { studyItemId: body.studyItemId, savedAt: 1000 }, sources: [] }) : json({ items: [], sources: [] });
    return json({ progress: init?.method === "POST" ? progress : [progress] });
  }));
  return writes;
}
async function answer() {
  const user = userEvent.setup();
  await screen.findByRole("heading", { name: "Выберите ответ" });
  await user.click(screen.getByRole("radio", { name: "Chamo-me..." }));
  return user;
}

it("retries the frozen completion payload and prevents duplicate activation", async () => {
  let completions = 0;
  const pending = deferred<Response>();
  const writes = api((url) => url === "/api/learning/complete" ? (++completions === 1 ? json({}, 503) : pending.promise) : undefined);
  render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.dblClick(screen.getByRole("button", { name: "Проверить и завершить" }));
  await screen.findByRole("button", { name: "Проверить ещё раз" });
  expect(completions).toBe(1);
  expect(screen.getByRole("radio", { name: "Estou..." })).toBeDisabled();
  const firstWrites = writes.filter(({ body }) => body.eventType !== "session_started");
  await user.dblClick(screen.getByRole("button", { name: "Проверить ещё раз" }));
  await waitFor(() => expect(completions).toBe(2));
  const allWrites = writes.filter(({ body }) => body.eventType !== "session_started");
  expect(allWrites.slice(firstWrites.length)).toEqual(firstWrites);
  expect(screen.queryByRole("heading", { name: "Получилось!" })).not.toBeInTheDocument();
  await act(async () => { pending.resolve(json({ progress: completed })); });
  expect(await screen.findByRole("heading", { name: "Получилось!" })).toBeInTheDocument();
});

it("a fresh attempt gets new event IDs and can use a different answer", async () => {
  const writes = api((url) => url === "/api/learning/complete" ? json({}, 503) : undefined);
  render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await screen.findByRole("button", { name: "Проверить ещё раз" });
  const first = writes.find(({ body }) => body.eventType === "exercise_attempt")!;
  await user.click(screen.getByRole("button", { name: "↺ Повторить задание" }));
  await user.click(screen.getByRole("radio", { name: "Estou..." }));
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await waitFor(() => expect(writes.filter(({ url }) => url === "/api/learning/complete")).toHaveLength(2));
  const attempts = writes.filter(({ body }) => body.eventType === "exercise_attempt");
  expect(attempts.at(-1)?.body.sessionId).not.toBe(first.body.sessionId);
  expect(attempts.at(-1)?.body.clientEventId).not.toBe(first.body.clientEventId);
  expect(attempts.at(-1)?.body.payload).toMatchObject({ selected: "b", correct: false });
});

it("card errors and retries remain separate from confirmed completion", async () => {
  let saves = 0;
  const writes = api((url, init) => url === "/api/study-items" && init?.method === "POST" && ++saves === 1 ? json({}, 503) : undefined);
  render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await screen.findByRole("heading", { name: "Получилось!" });
  await user.click(screen.getByRole("button", { name: /Chamo-me.*В карточки/ }));
  const retry = await screen.findByRole("button", { name: /Chamo-me.*Повторить сохранение/ });
  expect(screen.getByRole("heading", { name: "Получилось!" })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Урок завершён");
  await user.click(retry);
  expect(await screen.findByRole("button", { name: /Chamo-me.*Сохранено/ })).toBeDisabled();
  const cardWrites = writes.filter(({ url }) => url === "/api/study-items");
  expect(cardWrites).toHaveLength(2);
  expect(cardWrites[1]).toEqual(cardWrites[0]);
});

it("a failed cards read cannot prevent restoring a finished lesson", async () => {
  api((url, init) => {
    if (init?.method === "POST") return;
    if (url === "/api/study-items") return json({}, 503);
    if (url === "/api/learning/progress") return json({ progress: [completed] });
  });
  render(<LessonEngine lessonId={lessonId} />);
  expect(await screen.findByRole("heading", { name: "Получилось!" })).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "Повторить загрузку карточек" })).toBeEnabled();
});

it("rejects an unconfirmed completion response", async () => {
  api((url) => url === "/api/learning/complete" ? json({ progress }) : undefined);
  render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  expect(await screen.findByText(/Завершение урока: Ответ сервера не удалось проверить/)).toBeInTheDocument();
  expect(screen.queryByText("Итог урока")).not.toBeInTheDocument();
});

it("ignores an old completion after leaving and opening a new lesson session", async () => {
  const pending = deferred<Response>();
  const writes = api((url) => url === "/api/learning/complete" ? pending.promise : undefined);
  const view = render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await waitFor(() => expect(writes.some(({ url }) => url === "/api/learning/complete")).toBe(true));
  const oldSession = writes.find(({ body }) => body.eventType === "session_started")?.body.sessionId;
  view.unmount();
  render(<LessonEngine lessonId={lessonId} />);
  await screen.findByRole("heading", { name: "Выберите ответ" });
  expect(writes.filter(({ body }) => body.eventType === "session_started").at(-1)?.body.sessionId).not.toBe(oldSession);
  await act(async () => { pending.resolve(json({ progress: completed })); });
  expect(screen.getByRole("heading", { name: "Выберите ответ" })).toBeInTheDocument();
});

it("retries a failed boundary with identical time and session", async () => {
  let saves = 0;
  const writes = api((url, init) => {
    if (url !== "/api/learning/progress") return;
    if (init?.method !== "POST") return json({ progress: [] });
    if (++saves === 1) return json({}, 503);
  });
  render(<LessonEngine lessonId={lessonId} />);
  const user = userEvent.setup();
  await waitFor(() => expect(screen.getByRole("button", { name: /Перейти к заданию/ })).toBeEnabled());
  await user.click(screen.getByRole("button", { name: /Перейти к заданию/ }));
  await user.click(await screen.findByRole("button", { name: "Повторить сохранение шага" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Шаг сохранён"));
  const boundaries = writes.filter(({ url }) => url === "/api/learning/progress");
  expect(boundaries).toHaveLength(2);
  expect(boundaries[1]).toEqual(boundaries[0]);
});

it("continues through the API when browser draft storage is unavailable", async () => {
  api();
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Storage blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Storage blocked", "SecurityError"); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Storage blocked", "SecurityError"); });
  render(<LessonEngine lessonId={lessonId} />);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  expect(await screen.findByRole("heading", { name: "Получилось!" })).toBeInTheDocument();
});
