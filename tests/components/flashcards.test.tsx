import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Flashcards from "@/features/cards/components/Flashcards";
import CardsPage from "@/app/cards/page";
import type { ReviewProgress } from "@/features/cards/scheduler";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function openVerbDeck(user = userEvent.setup()) {
  await user.click(screen.getByRole("button", { name: "Открыть колоду «1 000 глаголов»" }));
  return user;
}

describe("card review through the HTTP boundary", () => {
  it("waits for progress, exposes the word, and flips with the keyboard", async () => {
    const user = userEvent.setup();
    const load = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(load.promise);
    vi.stubGlobal("fetch", fetchMock);
    render(<Flashcards />);
    await openVerbDeck(user);

    expect(screen.getByRole("button", { name: "Показать перевод" })).toBeDisabled();
    await act(async () => { load.resolve(json({ progress: [] })); });
    const card = screen.getByRole("button", { name: "Показать перевод" });
    await waitFor(() => expect(card).toBeEnabled());
    expect(card).toHaveAccessibleDescription("tomar");
    card.focus();
    expect(card).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Показать португальское слово" })).toHaveAccessibleDescription(/брать; принимать/);
    expect(screen.getByRole("button", { name: /^Помню/ })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Показать перевод" })).toHaveAccessibleDescription("tomar");
    expect(screen.queryByRole("button", { name: /^Помню/ })).not.toBeInTheDocument();
  });

  it("keeps the same card and payload after failure; advances only on server confirmation", async () => {
    const user = userEvent.setup();
    const saved = deferred<Response>();
    const writes: ReviewProgress[] = [];
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => {
      if (init?.method !== "POST") return Promise.resolve(json({ progress: [] }));
      writes.push(JSON.parse(String(init.body)) as ReviewProgress);
      return writes.length === 1 ? Promise.resolve(json({ error: "unavailable" }, 503)) : saved.promise;
    }));
    render(<Flashcards />);
    await openVerbDeck(user);
    await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.click(screen.getByRole("button", { name: /^Помню/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Оценка не подтверждена сервером");
    expect(screen.getByText("Сегодня: 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Показать португальское слово" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Повторить сохранение" }));
    expect(writes).toHaveLength(2);
    expect(writes[1]).toEqual(writes[0]);
    expect(screen.getByRole("status")).toHaveTextContent("Сохраняем оценку");
    expect(screen.getByText("Сегодня: 0")).toBeInTheDocument();
    await act(async () => { saved.resolve(json({ progress: writes[1] })); });
    expect(await screen.findByText("Сегодня: 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Показать перевод" })).not.toHaveAccessibleDescription("tomar");
    expect(screen.getByRole("button", { name: "Показать перевод" })).toHaveFocus();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not send two reviews on a double activation", async () => {
    const user = userEvent.setup();
    const saved = deferred<Response>();
    const writes: ReviewProgress[] = [];
    vi.stubGlobal("fetch", vi.fn((_url: unknown, init?: RequestInit) => {
      if (init?.method !== "POST") return Promise.resolve(json({ progress: [] }));
      writes.push(JSON.parse(String(init.body)) as ReviewProgress);
      return saved.promise;
    }));
    render(<Flashcards />);
    await openVerbDeck(user);
    await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await user.dblClick(screen.getByRole("button", { name: /^Легко/ }));
    expect(writes).toHaveLength(1);
    expect(screen.getByRole("button", { name: /^Легко/ })).toBeDisabled();
    await act(async () => { saved.resolve(json({ progress: writes[0] })); });
    expect(await screen.findByText("Сегодня: 1")).toBeInTheDocument();
  });

  it("allows preview after a load failure but blocks rating until a successful retry", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ error: "unauthorized" }, 401)).mockResolvedValueOnce(json({ progress: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<Flashcards />);
    await openVerbDeck(user);
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    expect(screen.getByRole("button", { name: /^Помню/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Загрузить ещё раз" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Показать перевод" }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Помню/ })).toBeEnabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ignores an old load after leaving and opening a fresh session", async () => {
    const oldLoad = deferred<Response>();
    const freshLoad = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValueOnce(oldLoad.promise).mockReturnValueOnce(freshLoad.promise);
    vi.stubGlobal("fetch", fetchMock);
    const old = render(<Flashcards />);
    await openVerbDeck();
    old.unmount();
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    render(<Flashcards />);
    await openVerbDeck();
    await act(async () => { freshLoad.resolve(json({ progress: [] })); });
    await act(async () => { oldLoad.resolve(json({ error: "late failure" }, 500)); });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
  });

  it("gives the cards page one main landmark, one h1 and review before the library", async () => {
    vi.stubGlobal("fetch", vi.fn((url: unknown) => Promise.resolve(String(url).includes("study-items") ? json({ items: [], sources: [] }) : json({ progress: [] }))));
    render(<CardsPage />);
    await openVerbDeck();
    await waitFor(() => expect(screen.getByRole("button", { name: "Показать перевод" })).toBeEnabled());
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const sections = screen.getAllByRole("region");
    expect(sections[0]).toHaveAccessibleName("Карточки для запоминания глаголов");
    expect(sections[1]).toHaveAccessibleName("Сохранённые из уроков");
  });

  it("offers the separate basic-word deck without loading verb progress", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<Flashcards />);

    expect(screen.getByRole("button", { name: "Открыть колоду «1 000 глаголов»" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Открыть колоду «351 базовое слово»" }));
    expect(screen.getByRole("region", { name: "Колода «351 базовое слово»" })).toBeInTheDocument();
    expect(screen.getByText("1 / 351")).toBeInTheDocument();
    expect(screen.getByText("ter")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Показать перевод слова" }));
    expect(screen.getByText("иметь")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Следующее →" }));
    expect(screen.getByText("haver")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
