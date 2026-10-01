import { StrictMode, useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { SessionQueryBoundary, useQueryScope, type QueryScope } from "@/shared/query/SessionQueryBoundary";
import { LessonEngine } from "@/features/learning/lesson-engine/LessonEngine";
import { RouteMap } from "@/features/learning/components/RouteMap";
import { ErrorReview } from "@/features/learning/components/ErrorReview";
import { learningKeys } from "@/features/learning/query/queries";
import { cardsKeys } from "@/features/cards/query/queries";

const lessonId = "lesson:a1-1:introduce-yourself";
const progress = { lessonId, flowRevision: 1, status: "active", snapshot: { stage: "activity" }, canDoResult: null };
const completed = { ...progress, status: "finished", snapshot: { completed: true }, canDoResult: "demonstrated" };
const patterns = [
  { patternKey: "pattern:ser", errorCode: "SER_ESTAR_CHOICE", targetId: "target:ser", occurrenceCount: 3 },
  { patternKey: "pattern:noun", errorCode: "NOUN_ARTICLE_NUMBER", targetId: "target:noun", occurrenceCount: 2 },
];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }
function Capture({ onScope }: { onScope: (scope: QueryScope) => void }) {
  const scope = useQueryScope();
  useEffect(() => { onScope(scope); }, [scope, onScope]);
  return null;
}
function api(intercept?: (url: string, init: RequestInit | undefined, body: Record<string, unknown>) => Response | Promise<Response> | undefined) {
  const writes: { url: string; body: Record<string, unknown> }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
    if (init?.method === "POST") writes.push({ url, body });
    const result = intercept?.(url, init, body);
    if (result) return result;
    if (url === "/api/learning/events") return json({ event: { clientEventId: body.clientEventId }, duplicate: false });
    if (url === "/api/learning/complete") return json({ progress: completed });
    if (url === "/api/study-items") return init?.method === "POST"
      ? json({ item: { studyItemId: body.studyItemId, savedAt: 1000 }, sources: [] }) : json({ items: [], sources: [] });
    if (url === "/api/learning/errors") return init?.method === "POST" ? json({ ok: true }) : json({ patterns });
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
beforeEach(() => { window.sessionStorage.clear(); vi.spyOn(window, "scrollTo").mockImplementation(() => undefined); });

it("refreshes cached progress without changing the selected answer or completing the lesson", async () => {
  let scope!: QueryScope;
  let refreshed = false;
  api((url, init) => url === "/api/learning/progress" && init?.method !== "POST" && refreshed ? json({ progress: [completed] }) : undefined);
  render(<SessionQueryBoundary><Capture onScope={(value) => { scope = value; }} /><LessonEngine lessonId={lessonId} /></SessionQueryBoundary>);
  await answer();
  refreshed = true;
  await act(async () => { await scope.client.refetchQueries({ queryKey: learningKeys.progress(scope.scopeKey) }); });
  expect(scope.client.getQueryData(learningKeys.progress(scope.scopeKey))).toEqual([completed]);
  expect(screen.getByRole("radio", { name: "Chamo-me..." })).toBeChecked();
  expect(screen.queryByText("Итог урока")).not.toBeInTheDocument();
});

it("keeps confirmed completion in cache when a concurrent stale GET returns late", async () => {
  let scope!: QueryScope;
  let reads = 0;
  let signal!: AbortSignal;
  const read = deferred<Response>();
  const write = deferred<Response>();
  const writes = api((url, init) => {
    if (url === "/api/learning/complete") return write.promise;
    if (url === "/api/learning/progress" && init?.method !== "POST" && ++reads > 1) { signal = init?.signal as AbortSignal; return read.promise; }
  });
  render(<SessionQueryBoundary><Capture onScope={(value) => { scope = value; }} /><LessonEngine lessonId={lessonId} /></SessionQueryBoundary>);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await waitFor(() => expect(writes.some(({ url }) => url.endsWith("/complete"))).toBe(true));
  act(() => { void scope.client.refetchQueries({ queryKey: learningKeys.progress(scope.scopeKey) }); });
  await act(async () => { write.resolve(json({ progress: completed })); });
  await screen.findByRole("heading", { name: "Получилось!" });
  expect(signal.aborted).toBe(true);
  await act(async () => { read.resolve(json({ progress: [progress] })); });
  expect(scope.client.getQueryData(learningKeys.progress(scope.scopeKey))).toEqual([completed]);
});

it("reloads the full library after saving before its initial GET finishes", async () => {
  let scope!: QueryScope;
  let reads = 0;
  let signal!: AbortSignal;
  let savedId = "";
  const oldRead = deferred<Response>();
  api((url, init, body) => {
    if (url === "/api/learning/progress" && init?.method !== "POST") return json({ progress: [completed] });
    if (url !== "/api/study-items") return;
    if (init?.method === "POST") { savedId = String(body.studyItemId); return; }
    if (++reads === 1) { signal = init?.signal as AbortSignal; return oldRead.promise; }
    return json({ items: [{ studyItemId: savedId, savedAt: 1000 }, { studyItemId: "another-saved-item", savedAt: 900 }], sources: [] });
  });
  render(<SessionQueryBoundary><Capture onScope={(value) => { scope = value; }} /><LessonEngine lessonId={lessonId} /></SessionQueryBoundary>);
  await screen.findByRole("heading", { name: "Получилось!" });
  await userEvent.setup().click(screen.getByRole("button", { name: /Chamo-me.*В карточки/ }));
  await screen.findByRole("button", { name: /Chamo-me.*Сохранено/ });
  await waitFor(() => expect(scope.client.getQueryData(cardsKeys.savedItems(scope.scopeKey))).toMatchObject({ items: [{ studyItemId: savedId }, { studyItemId: "another-saved-item" }] }));
  expect(signal.aborted).toBe(true);
  await act(async () => { oldRead.resolve(json({ items: [], sources: [] })); });
  expect(screen.getByRole("button", { name: /Chamo-me.*Сохранено/ })).toBeDisabled();
  expect(screen.queryByText("Загружаем карточки…")).not.toBeInTheDocument();
});

it("clears a lesson and its frozen completion on lost access, then starts a fresh authenticated attempt", async () => {
  let scope!: QueryScope;
  let denied = false;
  const writes = api((url, init) => {
    if (url === "/api/learning/complete") return json({}, 503);
    if (url === "/api/learning/progress" && init?.method !== "POST" && denied) return json({}, 401);
  });
  render(<SessionQueryBoundary><Capture onScope={(value) => { scope = value; }} /><LessonEngine lessonId={lessonId} /></SessionQueryBoundary>);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await screen.findByRole("button", { name: "Проверить ещё раз" });
  const retired = scope;
  const oldSession = writes.find(({ body }) => body.eventType === "session_started")?.body.sessionId;
  denied = true;
  await act(async () => { await scope.client.refetchQueries({ queryKey: learningKeys.progress(scope.scopeKey) }); });
  await screen.findByRole("button", { name: "Повторить проверку доступа" });
  expect(retired.client.getQueryCache().getAll()).toHaveLength(0);
  expect(retired.client.getMutationCache().getAll()).toHaveLength(0);
  expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Проверить ещё раз" })).not.toBeInTheDocument();
  denied = false;
  await user.click(screen.getByRole("button", { name: "Повторить проверку доступа" }));
  await screen.findByRole("radio", { name: "Estou..." });
  expect(writes.filter(({ body }) => body.eventType === "session_started").at(-1)?.body.sessionId).not.toBe(oldSession);
  expect(screen.getByRole("radio", { name: "Chamo-me..." })).not.toBeChecked();
});

it("ignores a retired attempt's late 401 without cancelling the new attempt's read in the same cache", async () => {
  let scope!: QueryScope;
  let reads = 0;
  let signal!: AbortSignal;
  const oldWrite = deferred<Response>();
  const newRead = deferred<Response>();
  const writes = api((url, init) => {
    if (url === "/api/learning/complete") return oldWrite.promise;
    if (url === "/api/learning/progress" && init?.method !== "POST" && ++reads > 1) { signal = init?.signal as AbortSignal; return newRead.promise; }
  });
  const onScope = (value: QueryScope) => { scope = value; };
  const view = render(<SessionQueryBoundary><Capture onScope={onScope} /><LessonEngine key="old" lessonId={lessonId} /></SessionQueryBoundary>);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await waitFor(() => expect(writes.some(({ url }) => url.endsWith("/complete"))).toBe(true));
  view.rerender(<SessionQueryBoundary><Capture onScope={onScope} /><LessonEngine key="new" lessonId={lessonId} /></SessionQueryBoundary>);
  await waitFor(() => expect(signal).toBeDefined());
  const currentScope = scope;
  await act(async () => { oldWrite.resolve(json({}, 401)); });
  expect(signal.aborted).toBe(false);
  expect(scope).toBe(currentScope);
  await act(async () => { newRead.resolve(json({ progress: [progress] })); });
  await screen.findByRole("radio", { name: "Chamo-me..." });
  expect(screen.queryByRole("button", { name: "Повторить проверку доступа" })).not.toBeInTheDocument();
});

it("opens only one attempt under StrictMode and completes it normally", async () => {
  const writes = api();
  render(<StrictMode><LessonEngine lessonId={lessonId} /></StrictMode>);
  const user = await answer();
  await user.click(screen.getByRole("button", { name: "Проверить и завершить" }));
  await screen.findByRole("heading", { name: "Получилось!" });
  expect(writes.filter(({ body }) => body.eventType === "session_started")).toHaveLength(1);
});

it("keeps the route available after a failed load and shows confirmed progress after retry", async () => {
  let reads = 0;
  api((url) => url === "/api/learning/progress" ? (++reads === 1 ? json({}, 503) : json({ progress: [completed] })) : undefined);
  render(<RouteMap />);
  await screen.findByRole("alert");
  expect(screen.getByRole("link", { name: "Представиться" })).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("button", { name: "Обновить маршрут" }));
  await screen.findByRole("link", { name: "Завершено. Представиться" });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("retries one error-review write without hiding other themes or duplicating a double click", async () => {
  let saves = 0;
  const pending = deferred<Response>();
  const writes = api((url, init) => url === "/api/learning/errors" && init?.method === "POST"
    ? (++saves === 1 ? json({}, 503) : pending.promise) : undefined);
  render(<ErrorReview />);
  const user = userEvent.setup();
  await screen.findByRole("heading", { name: "Когда нужен SER, а когда ESTAR" });
  await user.click(screen.getAllByRole("button", { name: "Теперь понятнее" })[0]);
  await screen.findByRole("alert");
  expect(screen.getByRole("heading", { name: "Артикль и множественное число" })).toBeInTheDocument();
  await user.dblClick(screen.getByRole("button", { name: "Повторить сохранение отметки" }));
  expect(saves).toBe(2);
  expect(writes[1]).toEqual(writes[0]);
  expect(screen.getByRole("button", { name: "Сохраняем отметку…" })).toBeDisabled();
  await act(async () => { pending.resolve(json({ ok: true })); });
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Когда нужен SER, а когда ESTAR" })).not.toBeInTheDocument());
  expect(screen.getByRole("heading", { name: "Артикль и множественное число" })).toBeInTheDocument();
});

it("keeps loaded error themes on a background failure and distinguishes retry from empty", async () => {
  let scope!: QueryScope;
  let reads = 0;
  api((url, init) => url === "/api/learning/errors" && init?.method !== "POST" && ++reads === 2 ? json({}, 503) : undefined);
  render(<SessionQueryBoundary><Capture onScope={(value) => { scope = value; }} /><ErrorReview /></SessionQueryBoundary>);
  await screen.findByRole("heading", { name: "Когда нужен SER, а когда ESTAR" });
  await act(async () => { await scope.client.refetchQueries({ queryKey: learningKeys.errors(scope.scopeKey) }); });
  await screen.findByRole("alert");
  expect(screen.getByRole("heading", { name: "Когда нужен SER, а когда ESTAR" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Пока нечего повторять" })).not.toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("button", { name: "Повторить загрузку повторения" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
});
