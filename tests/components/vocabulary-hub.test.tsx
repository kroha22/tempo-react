import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VocabularyHub } from "@/features/practice/VocabularyHub";

describe("VocabularyHub", () => {
  it.each([false,true])("lists foundation topics without a duplicate SER/ESTAR card and returns to the same catalog (child=%s)", async(child)=>{
    render(<VocabularyHub onOpenCards={vi.fn()} initialChildMode={child}/>);
    const user=userEvent.setup();
    async function openIntroduction(){if(!child){const entry=screen.getByRole("region",{name:"Тема: Знакомство и первые фразы"});const summary=within(entry).getByText("Материалы темы");if(!summary.closest("details")!.open)await user.click(summary);}}
    expect(screen.queryByRole("button",{name:/Primeiros passos/})).toBeNull();
    expect(screen.getByRole("link",{name:/^Моя семья и близкие/})).toBeVisible();
    await user.click(child?screen.getByText("Отдельные материалы семьи"):within(screen.getByRole("region",{name:"Тема: Моя семья и близкие"})).getByText("Материалы темы"));
    await openIntroduction();
    for(const name of [/^Olá!/,/^Quem sou\?/,child?/^Família e amigos/:/^Семья и друзья: прежние упражнения/,...(child?[/^Como me sinto\?/]:[])])expect(screen.getByRole("button",{name})).toBeVisible();
    for(const name of [/^Olá!/,/^Quem sou\?/]){
      await openIntroduction();
      await user.click(screen.getByRole("button",{name}));
      expect(screen.queryByRole("navigation",{name:"Шаги первого занятия"})).toBeNull();
      expect(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"})).toHaveAttribute("aria-pressed","true");
      await user.click(screen.getByRole("button",{name:"‹ К темам"}));
    }
    if(!child)await user.click(within(screen.getByRole("region",{name:"Тема: Тело и здоровье"})).getByText("Материалы темы"));
    await user.click(screen.getByRole("button",{name:child?/^Como me sinto\?/:"Чувства и состояния"}));
    expect(screen.getByRole("region",{name:"Как я себя чувствую: слова и ESTAR"})).toBeVisible();
    await user.click(screen.getByRole("button",{name:"Назад ко всем темам"}));
    await openIntroduction();
    expect(screen.getByRole("button",{name:/^Olá!/})).toBeVisible();
  },15000);
  it("keeps internal anatomy behind its explicit set selection", async () => {
    const {container}=render(<VocabularyHub onOpenCards={vi.fn()}/>);
    const user=userEvent.setup();
    await user.click(within(screen.getByRole("region",{name:"Тема: Тело и здоровье"})).getByText("Материалы темы"));
    const body=screen.getByRole("button",{name:"Тело: схемы и прежние упражнения"});
    expect(body).toHaveAttribute("data-topic-id","topic:vocabulary-body");
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

    const entry=within(screen.getByRole("region",{name:"Тема: Одежда и цвета"}));
    await user.click(entry.getByText("Материалы темы"));
    await user.click(entry.getByRole("button", { name: "Одежда: прежние наборы и задания" }));
    await user.click(screen.getByRole("button", { name: /^Imagem/ }));

    expect(screen.getByRole("img", { name: "Открытый гардероб с одеждой, пижамой, шарфом и туфлями" })).toHaveAttribute("src", "/images/scenes/clothing.webp");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("a camisola");
    expect(screen.getByRole("group", { name: "Слова для расстановки" })).toHaveTextContent("os sapatos");
  });
});
