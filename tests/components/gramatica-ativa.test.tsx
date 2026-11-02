import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GrammarCourse } from "../../features/learning/gramatica/GrammarCourse";
import * as api from "../../features/learning/progress/api";
import { gramaticaLessons } from "../../features/content/gramatica-ativa";

vi.mock("../../features/learning/progress/api", () => ({ loadLearningProgress: vi.fn(), appendLearningEvent: vi.fn(), saveBoundary: vi.fn(), completeLesson: vi.fn(), saveStudyItem: vi.fn() }));

describe("adult grammar lesson coordinator", () => {
  it("retains one answer and retries the same event after a failed save", async () => {
    vi.mocked(api.loadLearningProgress).mockResolvedValue([]);
    vi.mocked(api.appendLearningEvent).mockRejectedValueOnce(new Error("network")).mockResolvedValue({ event: { clientEventId: "ack", answer: "tinha" }, duplicate: false });
    vi.mocked(api.saveBoundary).mockResolvedValue({ progress: { lessonId: gramaticaLessons[0].id, flowRevision: 1, status: "active", snapshot: null, canDoResult: null } });
    render(<GrammarCourse slug="past-background" />);
    await screen.findByText(/Возраст в прошлом: Quando/);
    fireEvent.click(screen.getByRole("radio", { name: "tinha" }));
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));
    await screen.findByRole("alert");
    expect(screen.queryByText("Верно")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Повторить сохранение" }));
    await screen.findByText("Верно");
    expect(vi.mocked(api.appendLearningEvent).mock.calls[0][0]).toEqual(vi.mocked(api.appendLearningEvent).mock.calls[1][0]);
    expect(screen.getByRole("radio", { name: "tinha" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Дальше" }));
    await waitFor(() => expect(screen.getByText(/Часы в прошлом: ___ uma hora/)).toBeInTheDocument());
  });
  it("provides usable practice in the existing static demo without claiming persistence", async () => {
    render(<GrammarCourse slug="polite-requests" practiceOnly />);
    await screen.findByText(/В кафе сейчас/);
    expect(screen.getByText(/результат не сохраняется на сервере/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Queria um café, por favor." }));
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));
    await screen.findByText("Верно");
  });
  it("restores the latest partial attempt without mistaking historical mastery for its result", async () => {
    vi.mocked(api.loadLearningProgress).mockResolvedValue([{ lessonId: gramaticaLessons[0].id, flowRevision: 1, status: "finished", snapshot: { completed: true, canDoResult: "partial" }, canDoResult: "demonstrated" }]);
    render(<GrammarCourse slug="past-background" />);
    await screen.findByRole("heading", { name: "Проверка завершена — есть что повторить" });
    expect(screen.queryByRole("heading", { name: "Получилось!" })).toBeNull();
  });
});
