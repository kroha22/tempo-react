import { StrictMode, useEffect } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Flashcards from "@/features/cards/components/Flashcards";
import { CardsQueryBoundary, useCardsScope } from "@/features/cards/query/CardsQueryBoundary";
import { cardsKeys, useCardProgressQuery } from "@/features/cards/query/queries";
import { SavedStudyItemLibrary } from "@/features/cards/saved-items/SavedStudyItemLibrary";
import { verbCards } from "@/features/cards/data/verb-cards";
import { firstVerticalSliceContentPack } from "@/features/content/manifest";
import type { ReviewProgress } from "@/features/cards/scheduler";

type Scope = ReturnType<typeof useCardsScope>;
function Capture({ onScope }: { onScope: (scope: Scope) => void }) {
  const scope = useCardsScope();
  useEffect(() => { onScope(scope); }, [scope, onScope]);
  return null;
}
function DuplicateReader() { useCardProgressQuery(); return null; }
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
async function ready() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
}
async function refetch(scope: Scope) {
  await act(async () => { await scope.client.refetchQueries({ queryKey: cardsKeys.progress(scope.scopeKey) }); });
}

describe("Cards server cache and local session", () => {
  it("deduplicates readers and keeps the active face until confirmation, then uses refreshed progress", async () => {
    const user = userEvent.setup();
    let scope!: Scope;
    const overdueCard = verbCards[0];
    const overdue: ReviewProgress = { cardId: overdueCard.id, due: 1, interval: 1, ease: 2.5, repetitions: 1, lapses: 0, lastGrade: 2 };
    let reads = 0;
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => {
      if (init?.method === "POST") return Promise.resolve(json({ progress: JSON.parse(String(init.body)) }));
      return Promise.resolve(json({ progress: ++reads === 1 ? [] : [overdue] }));
    }));
    render(<CardsQueryBoundary><Capture onScope={(value) => { scope = value; }} /><Flashcards /><DuplicateReader /></CardsQueryBoundary>);
    await ready();
    expect(reads).toBe(1);
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await refetch(scope);
    expect(screen.getByRole("button", { name: "Показать португальское слово" })).toHaveAccessibleDescription(/брать; принимать/);
    expect(screen.getByText("Сегодня: 0")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    await screen.findByText("Сегодня: 1");
    expect(screen.getByRole("button", { name: "Показать перевод" })).toHaveAccessibleDescription(overdueCard.pt);
  });

  it("cancels a stale read started during a write and retains the confirmed cache row", async () => {
    const user = userEvent.setup();
    const read = deferred<Response>();
    const write = deferred<Response>();
    let scope!: Scope;
    let payload!: ReviewProgress;
    let readSignal!: AbortSignal;
    let reads = 0;
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => {
      if (init?.method === "POST") { payload = JSON.parse(String(init.body)); return write.promise; }
      if (++reads === 1) return Promise.resolve(json({ progress: [] }));
      readSignal = init?.signal as AbortSignal;
      return read.promise;
    }));
    render(<CardsQueryBoundary><Capture onScope={(value) => { scope = value; }} /><Flashcards /></CardsQueryBoundary>);
    await ready();
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    act(() => { void scope.client.refetchQueries({ queryKey: cardsKeys.progress(scope.scopeKey) }); });
    await act(async () => { write.resolve(json({ progress: payload })); });
    await screen.findByText("Сегодня: 1");
    expect(readSignal.aborted).toBe(true);
    await act(async () => { read.resolve(json({ progress: [] })); });
    expect(scope.client.getQueryData(cardsKeys.progress(scope.scopeKey))).toEqual([payload]);
    expect(screen.getByText("Сегодня: 1")).toBeInTheDocument();
  });

  it("keeps the active card on a background network failure and offers a separate retry", async () => {
    const user = userEvent.setup();
    let scope!: Scope;
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ progress: [] }))
      .mockResolvedValueOnce(json({ error: "unavailable" }, 503)).mockResolvedValueOnce(json({ progress: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<CardsQueryBoundary><Capture onScope={(value) => { scope = value; }} /><Flashcards /></CardsQueryBoundary>);
    await ready();
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await refetch(scope);
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось обновить прогресс");
    expect(screen.getByRole("button", { name: /^Помню/ })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Повторить обновление" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Показать португальское слово" })).toHaveAccessibleDescription(/брать; принимать/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it.each([401, 403])("clears private data and pending review after HTTP %s without an automatic retry loop", async (status) => {
    const user = userEvent.setup();
    let scope!: Scope;
    const item = firstVerticalSliceContentPack.studyItems[0];
    let denied = false;
    const fetchMock = vi.fn((url: unknown, init?: RequestInit) => {
      if (init?.method === "POST") return Promise.resolve(json({ error: "unavailable" }, 503));
      if (denied) return Promise.resolve(json({ error: "no access" }, status));
      return Promise.resolve(String(url).includes("study-items")
        ? json({ items: [{ studyItemId: item.id, savedAt: 1 }], sources: [] }) : json({ progress: [] }));
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<CardsQueryBoundary><Capture onScope={(value) => { scope = value; }} /><Flashcards /><SavedStudyItemLibrary /></CardsQueryBoundary>);
    await ready();
    await screen.findByText("1 карточек");
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    await screen.findByRole("button", { name: "Повторить сохранение" });
    const retired = scope;
    denied = true;
    await refetch(scope);
    await screen.findByText("Для загрузки сохранённых карточек нужно войти.");
    expect(scope).not.toBe(retired);
    expect(retired.client.getQueryCache().getAll()).toHaveLength(0);
    expect(retired.client.getMutationCache().getAll()).toHaveLength(0);
    expect(screen.getByText("0 карточек")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Повторить сохранение" })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(4);
    denied = false;
    await user.click(screen.getByRole("button", { name: "Загрузить ещё раз" }));
    await screen.findByText("1 карточек");
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("drops a rejected review when the write itself reports lost access", async () => {
    const user = userEvent.setup();
    let scope!: Scope;
    const fetchMock = vi.fn((_url: unknown, init?: RequestInit) => Promise.resolve(
      init?.method === "POST" ? json({ error: "unauthorized" }, 401) : json({ progress: [] }),
    ));
    vi.stubGlobal("fetch", fetchMock);
    render(<CardsQueryBoundary><Capture onScope={(value) => { scope = value; }} /><Flashcards /></CardsQueryBoundary>);
    await ready();
    const retired = scope;
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    await screen.findByRole("button", { name: "Загрузить ещё раз" });
    expect(scope.blocked).toBe(true);
    expect(retired.client.getMutationCache().getAll()).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Повторить сохранение" })).not.toBeInTheDocument();
    expect(screen.getByText("Сегодня: 0")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retires a changed scope, aborts its write and ignores a late successful response", async () => {
    const user = userEvent.setup();
    const write = deferred<Response>();
    let scope!: Scope;
    let payload!: ReviewProgress;
    let signal!: AbortSignal;
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => {
      if (init?.method !== "POST") return Promise.resolve(json({ progress: [] }));
      payload = JSON.parse(String(init.body)); signal = init?.signal as AbortSignal;
      return write.promise;
    }));
    const content = <><Capture onScope={(value) => { scope = value; }} /><Flashcards /></>;
    const view = render(<CardsQueryBoundary scopeKey="generation-a">{content}</CardsQueryBoundary>);
    await ready();
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    const retired = scope;
    view.rerender(<CardsQueryBoundary scopeKey="generation-b">{content}</CardsQueryBoundary>);
    await ready();
    expect(signal.aborted).toBe(true);
    await act(async () => { write.resolve(json({ progress: payload })); });
    expect(retired.client.getQueryCache().getAll()).toHaveLength(0);
    expect(scope.client.getQueryData(cardsKeys.progress(scope.scopeKey))).toEqual([]);
    expect(screen.getByText("Сегодня: 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Показать перевод" })).toHaveAccessibleDescription("tomar");
  });

  it("keeps its client usable through StrictMode's effect restart", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => Promise.resolve(json({
      progress: init?.method === "POST" ? JSON.parse(String(init.body)) : [],
    }))));
    render(<StrictMode><Flashcards /></StrictMode>);
    await ready();
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    await screen.findByText("Сегодня: 1");
  });

  it("distinguishes a library load error from an empty result and retries on demand", async () => {
    const user = userEvent.setup();
    const load = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValueOnce(load.promise).mockResolvedValueOnce(json({ items: [], sources: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SavedStudyItemLibrary />);
    expect(screen.getByRole("status")).toHaveTextContent("Загружаем сохранённые карточки");
    expect(screen.queryByText(/Пока здесь пусто/)).not.toBeInTheDocument();
    await act(async () => { load.resolve(json({ error: "unavailable" }, 503)); });
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось загрузить сохранённые карточки");
    await user.click(screen.getByRole("button", { name: "Повторить загрузку библиотеки" }));
    await screen.findByText(/Пока здесь пусто/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
