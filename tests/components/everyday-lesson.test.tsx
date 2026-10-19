import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { EverydayLesson } from "@/features/practice/EverydayLesson";
import { everydayLessons } from "@/features/content/everyday-lessons";

test("preference builder changes the person, food, negation and speech text together",()=>{
  render(<EverydayLesson lessonId="likes"/>);
  expect(screen.getByText("Eu gosto de maçãs.")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Ты"}));
  fireEvent.click(screen.getByRole("button",{name:"Не нравится"}));
  fireEvent.click(screen.getByRole("button",{name:/queijo/}));
  expect(screen.getByText("Tu não gostas de queijo.")).toBeVisible();
  expect(screen.getByText("Ты не любишь сыр.")).toBeVisible();
  expect(screen.getByRole("button",{name:"Послушать: Tu não gostas de queijo."})).toBeInTheDocument();
});

test("lesson practice shows corrections, completes and restarts without claiming mastery",()=>{
  render(<EverydayLesson lessonId="likes"/>);
  fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));
  expect(screen.getByRole("button",{name:"Проверить"})).toBeDisabled();
  for(const [index,task] of everydayLessons.likes.checks.entries()){
    const group=screen.getByRole("group",{name:"Варианты ответа"});
    fireEvent.click(within(group).getByRole("button",{name:index===0?"da":task.answer}));
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
    expect(screen.getByText(task.explanation)).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:index===4?"Завершить":"Дальше"}));
  }
  expect(screen.getByText("Верно с первой попытки: 4 из 5")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Повторить"}));
  expect(screen.getByRole("button",{name:"Проверить"})).toBeDisabled();
});

test("body action tiles change the contextual phrase and support non-visual choices",()=>{
  render(<EverydayLesson lessonId="body"/>);
  fireEvent.click(screen.getByRole("button",{name:/os ouvidos/}));
  expect(screen.getByText("Ouço com os ouvidos.")).toBeVisible();
  expect(screen.getByText("Я слышу ушами.")).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));
  fireEvent.click(screen.getByRole("button",{name:"os olhos"}));
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
  expect(screen.getByText("Верно!")).toBeVisible();
});
