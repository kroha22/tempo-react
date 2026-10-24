import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { LegacyDemo as Demo } from "@/github-pages/Demo";
import { RelatedLearning, relatedDestination } from "@/github-pages/RelatedLearning";
import { learningCatalog } from "@/features/content/learning-catalog";
import {shortGrammarLessons} from "@/features/content/short-grammar-lessons";

beforeEach(() => {
  window.history.replaceState(null, "", "/tempo-react/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
test("both catalog card actions open the deck picker and return to the top",()=>{
  render(<Demo/>);
  fireEvent.click(screen.getByRole("button",{name:"Уроки"}));
  expect(screen.queryByRole("button",{name:"Слова"})).toBeNull();
  expect(screen.getByRole("heading",{name:"Tempos e formas — Времена и формы"})).toBeVisible();
  for(const name of ["Перейти к карточкам","Мои карточки и повторение"]){
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.click(screen.getByRole("button",{name}));
    expect(screen.getByRole("region",{name:"Колоды карточек"})).toBeVisible();
    expect(window.scrollTo).toHaveBeenCalledWith(0,0);
    fireEvent.click(screen.getByRole("button",{name:"Уроки"}));
  }
});
test("all previous grammar lessons are addressable and a selected lesson opens from the catalog",()=>{
  for(const lesson of shortGrammarLessons)expect(relatedDestination(`/learning/practice?lesson=${lesson.id}`)).not.toBeNull();
  expect(relatedDestination("/learning/practice?lesson=unknown")).toBeNull();
  render(<Demo/>);
  fireEvent.click(screen.getByRole("button",{name:"Уроки"}));
  const hrefs=screen.getAllByRole("link").map(link=>link.getAttribute("href"));
  expect(hrefs.filter(href=>href?.startsWith("#/learning/practice?lesson="))).toEqual(shortGrammarLessons.filter(lesson=>!["ser","estar"].includes(lesson.id)).map(lesson=>`#/learning/practice?lesson=${lesson.id}`));
  fireEvent.click(screen.getByRole("link",{name:/^TER.*Иметь, возраст и состояния/}));
  expect(screen.getByRole("heading",{name:"TER"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Уроки"}));
  expect(screen.getByRole("navigation",{name:"Уроки и грамматика"})).toBeVisible();
});

test("every related phrase link has a static destination with the canonical lesson data", () => {
  for (const usage of learningCatalog.usageModules) for (const link of usage.relatedLinks) expect(relatedDestination(link.href)).not.toBeNull();
  expect(relatedDestination("/learning/lessons/%invalid")).toBeNull();
});

test("a phrase lesson opens inside the demo and returning preserves the selected answer", () => {
  render(<Demo />);
  fireEvent.click(screen.getByRole("button", { name: "Уроки" }));
  fireEvent.click(screen.getByRole("button", { name: /^A escola/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Frases/ }));
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
},15000);

test("the forms destination uses the existing present-tense trainer", () => {
  render(<RelatedLearning href="/learning/conjugation" onBack={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Формы настоящего времени" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Тренажёр спряжения глаголов" })).toBeVisible();
});

test("food phrases open the preference builder and return to the same selected answer",()=>{
  render(<Demo/>);
  fireEvent.click(screen.getByRole("button",{name:"Уроки"}));
  fireEvent.click(screen.getByRole("button",{name:/^Alimentação e compras/}));
  fireEvent.click(screen.getByRole("button",{name:/^Frases/}));
  fireEvent.click(screen.getByRole("button",{name:"morangos"}));
  fireEvent.click(screen.getByRole("link",{name:"Мне нравится: собери фразу →"}));
  expect(screen.getByRole("heading",{name:"Мне нравится · GOSTAR DE"})).toHaveFocus();
  expect(screen.getByText("Eu gosto de maçãs.")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"← Назад"}));
  expect(screen.getByRole("heading",{name:"Что мне нравится есть"})).toBeVisible();
  expect(screen.getByRole("button",{name:"morangos"})).toHaveAttribute("aria-pressed","true");
});
