import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GrammarCourse } from "../../features/learning/gramatica/GrammarCourse";
import { presentGrammarLessons } from "../../features/content/gramatica-present";
import { grammarTasks } from "../../features/content/gramatica-ativa";
import * as api from "../../features/learning/progress/api";

vi.mock("../../features/learning/progress/api", () => ({ loadLearningProgress: vi.fn(), appendLearningEvent: vi.fn(), saveBoundary: vi.fn(), completeLesson: vi.fn(), saveStudyItem: vi.fn() }));
describe("present book block", () => {
  it("opens the common plan with the first eleven book checks and the original short lessons", () => {
    render(<GrammarCourse practiceOnly />);
    expect(screen.getByRole("heading",{name:"Общий план"})).toBeVisible();
    const first=within(screen.getByText("U01–U11 · Основы и настоящее").closest("details")!);
    expect(first.getAllByRole("link",{name:/^Короткий урок:/})).toHaveLength(11);
    expect(first.getAllByRole("link",{name:/^Разобрать слова U/})).toHaveLength(11);
    expect(first.getAllByRole("link",{name:/^Проверить себя U/})).toHaveLength(11);
  });
  it("completes diagnostic, rule and exit using input while retaining a link to the foundation", async () => {
    const lesson=presentGrammarLessons[7];
    render(<GrammarCourse slug={lesson.slug} practiceOnly />);
    expect(screen.getByRole("link",{name:"Открыть прежнее объяснение и практику →"})).toHaveAttribute("href","/learning/practice?lesson=ter");
    for(const task of grammarTasks(lesson,"diagnostic")) {
      await screen.findByText(task.prompt);
      if(task.options) fireEvent.click(screen.getByRole("radio",{name:task.answers[0]}));
      else fireEvent.change(screen.getByRole("textbox"),{target:{value:task.answers[0]}});
      fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
      await screen.findByText("Верно");
      fireEvent.click(screen.getByRole("button",{name:"Дальше"}));
    }
    await screen.findByRole("heading",{name:"Коротко освежим правило"});
    fireEvent.click(screen.getByRole("button",{name:"К самостоятельной проверке"}));
    for(const [i,task] of grammarTasks(lesson,"exit").entries()) {
      await screen.findByText(task.prompt);
      fireEvent.change(screen.getByRole("textbox"),{target:{value:task.answers[0]}});
      fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
      await screen.findByText("Верно");
      fireEvent.click(screen.getByRole("button",{name:i===4?"Посмотреть итог":"Дальше"}));
    }
    await screen.findByRole("heading",{name:"Получилось!"});
    expect(api.completeLesson).not.toHaveBeenCalled();
    expect(screen.queryByText("Сохранить выражения в карточки")).toBeNull();
  });
});
