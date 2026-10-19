import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { VocabularyWriting } from "@/features/practice/VocabularyWriting";

const words = [{ id: "school", label: "a escola", translation: "школа" }, { id: "bread", label: "o pão", translation: "хлеб" }];
describe("VocabularyWriting", () => {
  it("retries wrong answers, accepts Portuguese without articles or accents, and completes the set", async () => {
    const user = userEvent.setup();
    render(<VocabularyWriting words={words} />);
    expect(screen.queryByText("a escola")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Твой ответ"), "школа{Enter}");
    expect(screen.getByRole("status", { name: "Результат проверки" })).toHaveTextContent("Пока не так");
    await user.clear(screen.getByLabelText("Твой ответ"));
    await user.type(screen.getByLabelText("Твой ответ"), "escola{Enter}");
    expect(screen.getByRole("status", { name: "Результат проверки" })).toHaveTextContent("Верно! a escola");
    await user.click(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByLabelText("Твой ответ")).toHaveFocus();
    await user.type(screen.getByLabelText("Твой ответ"), "pao{Enter}");
    await user.click(screen.getByRole("button", { name: "Завершить" }));
    expect(screen.getByText("Вспомнилось: 2 из 2")).toBeInTheDocument();
  });
  it("keeps typing and checking available after a hint, without counting it as recalled", async () => {
    const user = userEvent.setup();
    render(<VocabularyWriting words={words.slice(0, 1)} />);
    await user.click(screen.getByRole("button", { name: "Подсказка" }));
    expect(screen.getByRole("status", { name: "Результат проверки" })).toHaveTextContent("Подсказка: a escola");
    expect(screen.getByLabelText("Твой ответ")).toHaveFocus();
    expect(screen.getByLabelText("Твой ответ")).not.toHaveAttribute("readonly");
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("");
    await user.type(screen.getByLabelText("Твой ответ"), "escola{Enter}");
    await user.click(screen.getByRole("button", { name: "Завершить" }));
    expect(screen.getByText("Вспомнилось: 0 из 1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Повторить набор" }));
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("");
    expect(screen.queryByText("Подсказка:")).not.toBeInTheDocument();
  });
  it("inserts accented letters at the cursor and replaces a selection", async () => {
    const user = userEvent.setup();
    render(<VocabularyWriting words={words} />);
    const field = screen.getByLabelText("Твой ответ") as HTMLInputElement;
    await user.type(field, "po{ArrowLeft}");
    await user.click(screen.getByRole("button", { name: "Вставить ã" }));
    await waitFor(() => expect(field.selectionStart).toBe(2));
    expect(field).toHaveValue("pão");
    expect(field).toHaveFocus();
    field.setSelectionRange(1, 2);
    await user.click(screen.getByRole("button", { name: "Вставить á" }));
    await waitFor(() => expect(field).toHaveValue("páo"));
    await waitFor(() => expect(field.selectionStart).toBe(2));
    await user.keyboard("x");
    expect(field).toHaveValue("páxo");
  });
});
