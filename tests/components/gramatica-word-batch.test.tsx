import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GrammarCourse } from "../../features/learning/gramatica/GrammarCourse";
import { vocabularyForUnit, vocabularyFront } from "../../features/content/gramatica-vocabulary";
import * as api from "../../features/learning/progress/api";
import * as saved from "../../features/cards/api/saved-items";

vi.mock("../../features/learning/progress/api", () => ({ saveStudyItem: vi.fn() }));
vi.mock("../../features/cards/api/saved-items", () => ({ loadSavedItems: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(saved.loadSavedItems).mockResolvedValue({ items: [], sources: [] });
});
describe("quick word selection", () => {
  it("links the first three units to existing lessons without creating new lesson IDs", () => {
    render(<GrammarCourse practiceOnly />);
    for (const id of ["ser", "estar", "ser-estar"]) expect(screen.getAllByRole("link", { name: "Объяснение и практика →" }).some((a) => a.getAttribute("href") === `/learning/practice?lesson=${id}`)).toBe(true);
  });
  it("waits for save acknowledgement, blocks double taps and retries the identical intent", async () => {
    const words = vocabularyForUnit(1);
    let rejectSave!: (reason: Error) => void;
    vi.mocked(api.saveStudyItem).mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectSave = reject; }));
    render(<GrammarCourse slug="words/u01" />);
    const add = await screen.findByRole("button", { name: "В карточки →" });
    await waitFor(() => expect(add).toBeEnabled());
    fireEvent.click(add); fireEvent.click(add);
    expect(api.saveStudyItem).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: vocabularyFront(words[0]) })).toBeInTheDocument();
    rejectSave(new Error("offline"));
    await screen.findByRole("alert");
    vi.mocked(api.saveStudyItem).mockImplementation(async (input) => ({ item: { studyItemId: input.studyItemId, savedAt: 123 }, sources: [{ studyItemId: input.studyItemId, sourceId: input.sourceId, sourceType: input.sourceType, sourceContextId: input.sourceContextId }] }));
    fireEvent.click(screen.getByRole("button", { name: "Повторить сохранение" }));
    await screen.findByRole("heading", { name: vocabularyFront(words[1]) });
    expect(vi.mocked(api.saveStudyItem).mock.calls[0][0]).toEqual(vi.mocked(api.saveStudyItem).mock.calls[1][0]);
    expect(vi.mocked(api.saveStudyItem).mock.calls[1][0].sourceContextId).toBe("unit:ga1:u01");
  });
  it("lets known words and skips finish without saving, including static demo", () => {
    render(<GrammarCourse slug="words/u03" practiceOnly />);
    const total = vocabularyForUnit(3).length;
    expect(screen.queryByRole("button", { name: "В карточки →" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Показать перевод" }));
    for (let i = 0; i < total; i++) fireEvent.click(screen.getByRole("button", { name: i === 0 ? "Пока пропустить" : "Знаю →" }));
    expect(screen.getByRole("heading", { name: "Все слова просмотрены" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Знаю: ${total - 1}.*Пропущено: 1`))).toBeInTheDocument();
    expect(api.saveStudyItem).not.toHaveBeenCalled();
    expect(saved.loadSavedItems).not.toHaveBeenCalled();
  });
});
