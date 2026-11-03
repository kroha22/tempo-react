import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GrammarCourse } from "../../features/learning/gramatica/GrammarCourse";
import * as api from "../../features/learning/progress/api";
import * as saved from "../../features/cards/api/saved-items";

vi.mock("../../features/learning/progress/api", () => ({ saveStudyItem: vi.fn() }));
vi.mock("../../features/cards/api/saved-items", () => ({ loadSavedItems: vi.fn() }));

describe("adult vocabulary cards", () => {
  it("flips, filters both stages and provides all 54 unit destinations in the demo", async () => {
    render(<GrammarCourse slug="vocabulary" practiceOnly />);
    expect(screen.getByText(/Всего значений: 379/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "54", hidden: true })).toHaveAttribute("href", "/learning/gramatica-ativa/vocabulary/u54");
    fireEvent.click(screen.getByRole("button", { name: "Показать ответ" }));
    expect(screen.getByRole("status")).toHaveTextContent("врач");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "óculos" } });
    expect(screen.getByText("os óculos")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ В мои карточки" })).toBeNull();
  });
  it("retries the original card intent after failure without minting an ID or dropping unit context", async () => {
    vi.mocked(saved.loadSavedItems).mockResolvedValue({ items: [], sources: [] });
    vi.mocked(api.saveStudyItem).mockRejectedValueOnce(new Error("offline")).mockImplementation(async (input) => ({ item: { studyItemId: input.studyItemId, savedAt: 123 }, sources: [{ studyItemId: input.studyItemId, sourceId: input.sourceId, sourceType: input.sourceType, sourceContextId: input.sourceContextId }] }));
    render(<GrammarCourse slug="vocabulary/u18" />);
    fireEvent.click(await screen.findByRole("button", { name: "+ В мои карточки" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Повторить действие" }));
    expect(await screen.findByRole("button", { name: "Сохранено ✓" })).toBeDisabled();
    expect(vi.mocked(api.saveStudyItem).mock.calls[0][0]).toEqual(vi.mocked(api.saveStudyItem).mock.calls[1][0]);
    expect(vi.mocked(api.saveStudyItem).mock.calls[1][0].sourceContextId).toBe("unit:ga1:u18");
  });
});
