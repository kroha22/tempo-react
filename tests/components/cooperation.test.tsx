import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {VocabularyHub} from "@/features/practice/VocabularyHub";

it.each([false,true])("practises all three cooperation stages and reuses feelings (child=%s)",async child=>{
  const user=userEvent.setup();
  render(<VocabularyHub initialChildMode={child} onOpenCards={vi.fn()}/>);
  await user.click(within(screen.getByRole("region",{name:"Школьные материалы"})).getByRole("button",{name:/^Conversar e chegar a acordo/}));
  const region=screen.getByRole("region",{name:"Общаемся и договариваемся: уроки"});
  expect(within(region).getByRole("img")).toHaveAccessibleName(/O Rui e a Rita/);
  expect(within(region).getByRole("button",{name:"Anterior — Назад"})).toBeDisabled();
  expect(within(region).queryByRole("button",{name:"Verificar"})).not.toBeInTheDocument();
  await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));
  expect(within(region).queryByRole("img")).not.toBeInTheDocument();
  await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));
  expect(within(region).queryByLabelText("Показать перевод вопроса на русский")).not.toBeInTheDocument();
  await user.click(within(region).getByRole("button",{name:"⇄ Перевод"}));
  expect(within(region).getByText("Рита ещё говорит. Что может сделать Руй?")).toBeVisible();
  await user.click(within(region).getByRole("button",{name:"⇄ Перевод"}));
  const answers=[["Esperar pela sua vez.","É a tua vez.","Vamos falar com calma."],["Estou triste.","Podes parar, por favor?","A um adulto de confiança."],["o diálogo","a negociação","o compromisso"]];
  for(let step=0;step<3;step++){
    for(let i=0;i<3;i++){
      await user.click(within(region).getByRole("button",{name:`Выбрать: ${answers[step][i]}`}));
      await user.click(within(region).getByRole("button",{name:"Verificar"}));
      expect(within(region).getByText("Correto!",{exact:true})).toBeVisible();
      if(step===0&&i===0){
        await user.click(within(region).getByRole("button",{name:"Anterior — Назад"}));
        await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));
        expect(within(region).getByText("Correto!",{exact:true})).toBeVisible();
      }
      await user.click(within(region).getByRole("button",{name:i===2?"Concluir":"Seguinte →"}));
    }
    expect(within(region).getByText("Prática concluída")).toBeVisible();
    if(step<2){await user.click(within(region).getByRole("button",{name:"Seguinte →"}));await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));}
  }
  await user.click(within(region).getByRole("button",{name:/Como me sinto.*Rever palavras/}));
  expect(screen.getByRole("heading",{name:"Говорим о состоянии"})).toBeVisible();
});

it("replaces whole blocks, keeps word help across screens and offers Portuguese audio",async()=>{
  const user=userEvent.setup();
  render(<VocabularyHub onOpenCards={vi.fn()} initialTopicId="topic:vocabulary-cooperation"/>);
  const region=screen.getByRole("region",{name:"Общаемся и договариваемся: уроки"});
  await user.click(within(region).getByRole("button",{name:"Перевод: chegar a acordo"}));
  const popup=screen.getByRole("dialog",{name:"Перевод слова"});
  expect(within(popup).getByText("договориться")).toBeVisible();
  expect(within(popup).getByRole("button",{name:/Послушать: chegar a acordo/})).toBeInTheDocument();
  await user.click(within(popup).getByRole("button",{name:"Закрыть подсказку"}));
  await user.click(within(region).getByRole("button",{name:"⇄ Перевод"}));
  expect(within(region).getByRole("heading",{name:"Общаемся и договариваемся",level:2})).toBeVisible();
  expect(within(region).getByRole("heading",{name:"Слушать и уважать"})).toBeVisible();
  await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));
  expect(within(region).getByRole("button",{name:"⇄ Перевод"})).toHaveAttribute("aria-pressed","false");
  expect(within(region).queryByRole("button",{name:"Слова"})).not.toBeInTheDocument();
  expect(within(region).queryByRole("button",{name:"Слушать"})).not.toBeInTheDocument();
  expect(within(region).queryByRole("button",{name:/Послушать: Como podemos chegar a acordo/})).not.toBeInTheDocument();
  await user.click(within(region).getByRole("button",{name:"Seguinte — Дальше"}));
  await user.click(within(region).getByRole("button",{name:"Выбрать: Esperar pela sua vez."}));
  await user.click(within(region).getByRole("button",{name:"⇄ Перевод"}));
  expect(within(region).getByRole("button",{name:"Выбрать: Esperar pela sua vez."})).toBeVisible();
  expect(within(region).queryByText("Дождаться своей очереди.")).not.toBeInTheDocument();
  await user.click(within(region).getByRole("button",{name:"Проверить"}));
  expect(within(region).getByText("Верно",{exact:true})).toBeVisible();
  await user.click(within(region).getByRole("button",{name:"Следующая фраза →"}));
  expect(within(region).getByRole("button",{name:"⇄ Перевод"})).toHaveAttribute("aria-pressed","false");
});
