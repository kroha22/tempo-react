import {render,screen,within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {expect,it,vi} from "vitest";
import {FirstSteps} from "@/features/practice/FirstSteps";
import {beingContent} from "@/features/content/first-steps";
import {shortGrammarLessons} from "@/features/content/short-grammar-lessons";
import {routeLessonExperiences} from "@/features/content/first-vertical-slice/route-extension";
import AdultLessons from "@/features/practice/AdultLessons";

it("uses the same explanation in Route and short grammar",()=>{
  expect(shortGrammarLessons.find(lesson=>lesson.id==="ser")!.rule).toBe(beingContent.ser.rule);
  expect(routeLessonExperiences.find(lesson=>lesson.id==="lesson:a1-1:ser-estar-description-state")!.cue).toBe(beingContent.contrast.rule);
});
it("keeps the old SER lesson quiz and replaces its explanation with the shared panel",()=>{
  render(<AdultLessons singleLesson activeLessonId="ser" onLessonChange={vi.fn()} onOpenPractice={vi.fn()} onOpenConjugationOverview={vi.fn()}/>);
  expect(screen.getByRole("region",{name:"Общее объяснение SER и ESTAR"})).toBeVisible();
  expect(screen.getByRole("heading",{name:"O Rui ___ português."})).toBeVisible();
  expect(screen.getByText(beingContent.ser.rule)).toBeVisible();
});
it.each([false,true])("checks the entire pilot and preserves answers (child=%s)",async(child)=>{
  render(<FirstSteps onBack={vi.fn()} initialChildMode={child}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole("button",{name:"Chamo-me Alex."}));
  await user.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  expect(screen.getByRole("button",{name:"Chamo-me Alex."})).toHaveAttribute("aria-pressed","true");
  await user.click(screen.getByRole("button",{name:child?"Для детей":"Для взрослых"}));
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  expect(within(screen.getByRole("region",{name:"Проверь себя"})).getByRole("status")).toHaveTextContent("Верно");
  await user.click(screen.getByRole("button",{name:"Следующий шаг →"}));
  await user.click(screen.getByRole("button",{name:"A Rita está professora."}));
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  expect(within(screen.getByRole("region",{name:"Проверь себя"})).getByRole("status")).toHaveTextContent("Попробуй ещё раз");
  expect(screen.queryByRole("button",{name:"Следующий шаг →"})).toBeNull();
  await user.click(screen.getByRole("button",{name:"A Rita é professora."}));
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  await user.click(screen.getByRole("button",{name:"Следующий шаг →"}));
  await user.click(screen.getByRole("button",{name:"A Ana está cansada."}));
  await user.click(screen.getByRole("button",{name:"Проверить"}));
  expect(within(screen.getByRole("region",{name:"Проверь себя"})).getByRole("status")).toHaveTextContent("Верно");
  expect(screen.getByRole("link",{name:"Потренировать ESTAR →"})).toHaveAttribute("href",`/learning/practice?verb=estar&tense=present${child?"&mode=kingdoms":""}`);
  await user.click(screen.getByRole("button",{name:child?"Для взрослых":"Для детей"}));
  expect(within(screen.getByRole("region",{name:"Проверь себя"})).getByRole("status")).toHaveTextContent("Верно");
});
