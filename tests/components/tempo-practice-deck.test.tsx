import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { TempoPracticeDeck } from "@/features/cards/components/TempoPracticeDeck";
import { tempoPracticeDecks } from "@/features/cards/data/tempo-decks";

test("a phrase flips to Russian, rating advances and manual previous resets the flip", () => {
  const deck = tempoPracticeDecks.find(item => item.category === "phrases")!;
  render(<TempoPracticeDeck deck={deck} onBack={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Перевернуть карточку Tempo" }));
  expect(screen.getByText(deck.cards[0].russian)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Помню" }));
  expect(screen.getByRole("button", { name: "Перевернуть карточку Tempo" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText(deck.cards[1].prompt)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Предыдущая карточка" }));
  expect(screen.getByText(deck.cards[0].prompt)).toBeVisible();
});
test("a form drill reveals the canonical Portuguese form rather than saving a new verb", () => {
  const deck = tempoPracticeDecks.find(item => item.id === "tempo:deck:forms:ar:past")!;
  render(<TempoPracticeDeck deck={deck} onBack={vi.fn()} />);
  expect(screen.getByText(deck.cards[0].form!.infinitive)).toBeVisible();
  expect(screen.getByText(`${deck.cards[0].form!.pronoun} …`)).toBeVisible();
  expect(screen.queryByText(deck.cards[0].prompt)).not.toBeInTheDocument();
  expect(screen.getByRole("button", {name: `Послушать: ${deck.cards[0].form!.infinitive}`})).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Перевернуть карточку Tempo" }));
  expect(screen.getByText(deck.cards[0].portuguese)).toBeVisible();
  expect(screen.getByRole("button", {name: `Послушать: ${deck.cards[0].spokenPortuguese}`})).toBeInTheDocument();
});
