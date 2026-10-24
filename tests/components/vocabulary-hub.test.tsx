import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VocabularyHub } from "@/features/practice/VocabularyHub";

describe("VocabularyHub", () => {
  it.each([false,true])("lists foundation topics without a duplicate SER/ESTAR card and returns to the same catalog (child=%s)", async(child)=>{
    render(<VocabularyHub onOpenCards={vi.fn()} initialChildMode={child}/>);
    const user=userEvent.setup();
    expect(screen.queryByRole("button",{name:/Primeiros passos/})).toBeNull();
    for(const name of [/^Olá!/,/^Quem sou\?/,/^Família e amigos/,/^Como me sinto\?/])expect(screen.getByRole("button",{name})).toBeVisible();
    for(const name of [/^Olá!/,/^Quem sou\?/]){
      await user.click(screen.getByRole("button",{name}));
      expect(screen.queryByRole("navigation",{name:"Шаги первого занятия"})).toBeNull();
      expect(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"})).toHaveAttribute("aria-pressed","true");
      await user.click(screen.getByRole("button",{name:"‹ К темам"}));
    }
    await user.click(screen.getByRole("button",{name:/^Como me sinto\?/}));
    expect(screen.getByRole("region",{name:"Как я себя чувствую: слова и ESTAR"})).toBeVisible();
    await user.click(screen.getByRole("button",{name:"Назад ко всем темам"}));
    expect(screen.getByRole("button",{name:/^Olá!/})).toBeVisible();
  },15000);
  it("keeps internal anatomy behind its explicit set selection", async () => {
    const {container}=render(<VocabularyHub onOpenCards={vi.fn()}/>);
    const user=userEvent.setup();
    const body=screen.getByRole("button",{name:/^O corpo/});
    expect(body.querySelector("img")).toHaveAttribute("src","/images/covers/body-v1.webp");
    await user.click(body);
    expect(container.textContent).not.toContain("o coração");
    await user.click(screen.getByRole("button",{name:/^Por dentro do corpo/}));
    expect(container.textContent).toContain("o coração");
    await user.click(screen.getByRole("button",{name:/^O essencial/}));
    expect(container.textContent).not.toContain("o coração");
  });
  it("offers writing practice for the selected theme and resets it when the set changes", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^A escola/ }));
    await user.click(screen.getByRole("button", { name: /^Escreve/ }));
    await user.type(screen.getByLabelText("Твой ответ"), "mochila{Enter}");
    expect(screen.getByRole("status", { name: "Результат проверки" })).toHaveTextContent("Верно!");
    await user.click(screen.getByRole("button", { name: /^Pares/ }));
    await user.click(screen.getByRole("button", { name: /^Escreve/ }));
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("mochila");
    await user.click(screen.getByRole("button", { name: /^Instruções na aula/ }));
    await user.click(screen.getByRole("button", { name: /^Escreve/ }));
    expect(screen.getByLabelText("Твой ответ")).toHaveValue("");
  });
  it("opens the migrated theme mechanics without the complete 351-word collection", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Мир в картинках/ }));
    expect(screen.getByRole("navigation", { name: "Способ изучения" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Imagem/ }));
    expect(screen.getByRole("img", { name: "Иллюстрация к заданию «На нашей улице»" })).toHaveAttribute("src", "/images/scenes/street.webp");

    expect(screen.queryByRole("button", { name: "Подборка 351" })).not.toBeInTheDocument();
  });

  it("opens the illustrated clothing activity", async () => {
    render(<VocabularyHub onOpenCards={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Одежда/ }));
    await user.click(screen.getByRole("button", { name: /^Imagem/ }));

    expect(screen.getByRole("img", { name: "Открытый гардероб с одеждой, пижамой, шарфом и туфлями" })).toHaveAttribute("src", "/images/scenes/clothing.webp");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("a camisola");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("os sapatos");
  });
});
