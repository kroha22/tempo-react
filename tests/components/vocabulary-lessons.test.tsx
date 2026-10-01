import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import VocabularyLessons from "@/features/vocabulary/VocabularyLessons";

describe("VocabularyLessons", () => {
  it("opens a topic and moves from examples to cards", async () => {
    render(<VocabularyLessons />);
    const user = userEvent.setup();

    expect(screen.getByRole("heading", { name: "Слова по темам" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Открыть урок/ })).toHaveLength(8);

    await user.click(screen.getByRole("button", { name: /Дом и вещи/ }));
    expect(screen.getByText("Я могу назвать знакомые предметы дома.")).toBeInTheDocument();
    expect(screen.getByText("o apartamento — os apartamentos")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Начать карточки" }));
    await user.click(screen.getByRole("button", { name: /o apartamento/ }));
    expect(screen.getByText("квартира")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Помню/ }));
    expect(screen.getByRole("button", { name: /a sala/ })).toBeInTheDocument();
  });

  it("filters the complete 351-entry catalog", async () => {
    render(<VocabularyLessons />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Вся подборка · 351" }));
    expect(screen.getByText("Найдено: 351")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Найти слово" }), "viajar");
    expect(screen.getByText("Найдено: 1")).toBeInTheDocument();
    expect(screen.getByText("путешествовать")).toBeInTheDocument();
  });
});
