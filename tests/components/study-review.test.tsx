import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudyReview } from "../../features/cards/study-review/StudyReview";
import * as api from "../../features/cards/study-review/api";
import { HttpError } from "../../shared/http/request-json";
import { scheduleStudyReview } from "../../features/cards/study-review/model";
import type { StudyReviewRow } from "../../features/cards/study-review/contracts";

vi.mock("../../features/cards/study-review/api", () => ({ loadStudyReviews: vi.fn(), gradeStudyReview: vi.fn() }));
const now = 1800000000000;
const row: StudyReviewRow = { studyItemId: "study:chunk:ga1:enquanto", reviewItemId: "saved:study:chunk:ga1:enquanto", version: 0, progress: null, reviewedAt: null };
function prepare() { vi.mocked(api.loadStudyReviews).mockResolvedValue({ cards: [row], serverNow: now }); }
async function reveal() { fireEvent.click(await screen.findByRole("button", { name: "Показать ответ" })); }
function response() { return { card: scheduleStudyReview(row, 2, now), clientEventId: "ack", duplicate: false }; }

describe("server-backed adult review", () => {
  it("submits a double click once and advances only after server acknowledgement", async () => {
    prepare();
    let resolve!: (value: ReturnType<typeof response>) => void;
    vi.mocked(api.gradeStudyReview).mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<StudyReview />); await reveal();
    const grade = screen.getByRole("button", { name: /Помню/ });
    fireEvent.click(grade); fireEvent.click(grade);
    await screen.findByText("Сохраняем оценку…");
    expect(api.gradeStudyReview).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Оценено за эту сессию: 0/)).toBeInTheDocument();
    await act(async () => { resolve(response()); });
    await screen.findByRole("heading", { name: "На сейчас всё" });
    expect(screen.getByText(/Оценено за эту сессию: 1/)).toBeInTheDocument();
  });
  it("keeps the revealed card and retries the exact same failed command", async () => {
    prepare(); vi.mocked(api.gradeStudyReview).mockRejectedValueOnce(new Error("offline")).mockResolvedValue(response());
    render(<StudyReview />); await reveal();
    fireEvent.click(screen.getByRole("button", { name: /Помню/ }));
    await screen.findByRole("alert");
    expect(screen.getByText("пока")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Повторить сохранение оценки" }));
    await screen.findByRole("heading", { name: "На сейчас всё" });
    expect(vi.mocked(api.gradeStudyReview).mock.calls[0][0]).toEqual(vi.mocked(api.gradeStudyReview).mock.calls[1][0]);
  });
  it("requires a reload on version conflict and never automatically resubmits a grade", async () => {
    prepare(); vi.mocked(api.gradeStudyReview).mockRejectedValue(new HttpError(409));
    render(<StudyReview />); await reveal();
    fireEvent.click(screen.getByRole("button", { name: /Помню/ }));
    await screen.findByRole("button", { name: "Обновить расписание" });
    vi.mocked(api.loadStudyReviews).mockResolvedValue({ cards: [response().card], serverNow: now });
    fireEvent.click(screen.getByRole("button", { name: "Обновить расписание" }));
    await screen.findByRole("heading", { name: "На сейчас всё" });
    expect(api.gradeStudyReview).toHaveBeenCalledTimes(1);
  });
  it("clears the card on access failure without a retry loop", async () => {
    prepare(); vi.mocked(api.gradeStudyReview).mockRejectedValue(new HttpError(401));
    render(<StudyReview />); await reveal();
    fireEvent.click(screen.getByRole("button", { name: /Помню/ }));
    await screen.findByRole("button", { name: "Повторить проверку доступа" });
    expect(screen.queryByText("enquanto")).toBeNull();
    expect(api.gradeStudyReview).toHaveBeenCalledTimes(1);
  });
  it("does not replace D1 with browser storage in the existing static demo", () => {
    render(<StudyReview practiceOnly />);
    expect(screen.getByText(/нужен Tempo с серверным сохранением/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Помню/ })).toBeNull();
  });
});
