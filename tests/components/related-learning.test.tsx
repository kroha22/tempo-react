import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Demo } from "@/github-pages/Demo";
import { RelatedLearning, relatedDestination } from "@/github-pages/RelatedLearning";
import { learningCatalog } from "@/features/content/learning-catalog";

beforeEach(() => {
  window.history.replaceState(null, "", "/tempo-react/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

test("every related phrase link has a static destination with the canonical lesson data", () => {
  for (const usage of learningCatalog.usageModules) for (const link of usage.relatedLinks) expect(relatedDestination(link.href)).not.toBeNull();
  expect(relatedDestination("/learning/lessons/%invalid")).toBeNull();
});

test("a phrase lesson opens inside the demo and returning preserves the selected answer", () => {
  render(<Demo />);
  fireEvent.click(screen.getByRole("button", { name: "Слова" }));
  fireEvent.click(screen.getByRole("button", { name: /^Школа/ }));
  fireEvent.click(screen.getByRole("button", { name: "Фразы" }));
  fireEvent.click(screen.getByRole("button", { name: "a régua" }));
  fireEvent.click(screen.getByRole("link", { name: "Где находится предмет? →" }));
  expect(screen.getByRole("heading", { name: "Где находится предмет" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Где находится предмет" })).toHaveFocus();
  expect(screen.getByText("O gato está na caixa.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "под столом" }));
  fireEvent.click(screen.getByRole("button", { name: "Проверить" }));
  expect(screen.getByText("Верно")).toBeVisible();
  fireEvent.click(screen.getAllByRole("button", { name: "← Вернуться к фразам" })[0]);
  expect(screen.getByRole("heading", { name: "Школьные вещи во фразах" })).toBeVisible();
  expect(screen.getByRole("button", { name: "a régua" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("link", { name: "Где находится предмет? →" })).toHaveFocus();
  fireEvent.click(screen.getByRole("link", { name: "У меня есть / здесь есть →" }));
  expect(screen.getByRole("heading", { name: "TER и HÁ" })).toBeVisible();
});

test("the forms destination uses the existing present-tense trainer", () => {
  render(<RelatedLearning href="/learning/conjugation" onBack={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Формы настоящего времени" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Тренажёр спряжения глаголов" })).toBeVisible();
});
