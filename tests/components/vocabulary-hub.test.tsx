import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VocabularyHub } from "@/features/practice/VocabularyHub";

describe("VocabularyHub", () => {
  it("opens the migrated theme mechanics and the 351-word lessons", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Мир в картинках/ }));
    expect(screen.getByRole("navigation", { name: "Способ изучения" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Картинка" }));
    expect(screen.getByRole("img", { name: "Иллюстрация к заданию «На нашей улице»" })).toHaveAttribute("src", "/images/scenes/street.webp");

    await user.click(screen.getByRole("button", { name: "Подборка 351" }));
    expect(screen.getAllByRole("button", { name: /Открыть урок/ })).toHaveLength(8);
    await user.click(screen.getByRole("button", { name: "Вся подборка · 351" }));
    expect(screen.getByText("Найдено: 351")).toBeInTheDocument();
  });

  it("opens the illustrated clothing activity", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Одежда/ }));
    await user.click(screen.getByRole("button", { name: "Картинка" }));

    expect(screen.getByRole("img", { name: "Открытый гардероб с одеждой, пижамой, шарфом и туфлями" })).toHaveAttribute("src", "/images/scenes/clothing.webp");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("a camisola");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("os sapatos");
  });
});
