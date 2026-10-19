import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VocabularyHub } from "@/features/practice/VocabularyHub";

describe("VocabularyHub", () => {
  it("offers writing practice for the selected theme and resets it when the set changes", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^Школа/ }));
    await user.click(screen.getByRole("button", { name: "Напиши слово" }));
    await user.type(screen.getByLabelText("Твой ответ"), "mochila{Enter}");
    expect(screen.getByRole("status", { name: "Результат проверки" })).toHaveTextContent("Верно!");
    await user.click(screen.getByRole("button", { name: "Пары" }));
    await user.click(screen.getByRole("button", { name: "Напиши слово" }));
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("mochila");
    const select = screen.getByRole("combobox", { name: "Набор слов" });
    const option = Array.from((select as HTMLSelectElement).options).find(item => item.text.includes("Инструкции на уроке"))!;
    await user.selectOptions(select, option.value);
    await user.click(screen.getByRole("button", { name: "Напиши слово" }));
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("");
  });
  it("opens the migrated theme mechanics without the complete 351-word collection", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Мир в картинках/ }));
    expect(screen.getByRole("navigation", { name: "Способ изучения" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Картинка" }));
    expect(screen.getByRole("img", { name: "Иллюстрация к заданию «На нашей улице»" })).toHaveAttribute("src", "/images/scenes/street.webp");

    expect(screen.queryByRole("button", { name: "Подборка 351" })).not.toBeInTheDocument();
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
