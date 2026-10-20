import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Demo } from "@/github-pages/Demo";
import { browserPracticePlanStorage, practicePlanStorageKey } from "@/github-pages/practice-plan-storage";
import { ChildPracticePlan } from "@/features/practice/plan/ChildPracticePlan";
import { PracticePlanProvider, usePracticePlan } from "@/features/practice/plan/PracticePlanContext";
import { emptyPracticePlanProgress, type PracticePlanStorage } from "@/features/practice/plan/model";
import { topicWord, everydayLessons } from "@/features/content/everyday-lessons";

beforeEach(()=>{window.localStorage.removeItem(practicePlanStorageKey);window.history.replaceState(null,"","/tempo-react/?mode=child");vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});

test("child home saves a completed quiz, resumes after remount and allows reviewing it",()=>{
  const view=render(<Demo/>);
  expect(screen.getByRole("heading",{name:"Мой план"})).toBeVisible();
  expect(screen.getByRole("progressbar",{name:"Пройденные занятия"})).toHaveAttribute("value","0");
  fireEvent.click(screen.getByRole("button",{name:"Начать →"}));
  expect(browserPracticePlanStorage.load().completed).toEqual({});
  fireEvent.click(screen.getByRole("button",{name:"está"}));
  expect(browserPracticePlanStorage.load().completed).toEqual({});
  fireEvent.click(screen.getByRole("button",{name:"Попробовать ещё раз"}));
  fireEvent.click(screen.getByRole("button",{name:"é"}));
  expect(browserPracticePlanStorage.load().completed["practice:grammar:ser"]).toEqual({revision:1,needsReview:true});
  fireEvent.click(screen.getByRole("button",{name:"Следующее занятие →"}));
  expect(screen.getByRole("heading",{name:/^ESTAR ·/})).toBeVisible();
  view.unmount();render(<Demo/>);
  expect(screen.getByRole("progressbar",{name:"Пройденные занятия"})).toHaveAttribute("value","1");
  fireEvent.click(screen.getByRole("button",{name:"Продолжить →"}));
  expect(screen.getByRole("heading",{name:/^ESTAR ·/})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"‹ К моему плану"}));
  fireEvent.click(screen.getByRole("button",{name:"Пройденные · 1"}));
  fireEvent.click(screen.getByRole("button",{name:/SER · Кто\? Что\? Откуда\?/}));
  fireEvent.click(screen.getByRole("button",{name:"é"}));
  expect(Object.keys(browserPracticePlanStorage.load().completed)).toHaveLength(1);
  expect(browserPracticePlanStorage.load().completed["practice:grammar:ser"].needsReview).toBe(false);
});

function CompletionProbe(){const plan=usePracticePlan()!;return <button type="button" onClick={()=>plan.complete("practice:grammar:ser",false)}>Complete lesson</button>;}
test("failed writes do not increment the counter and the exact pending completion can be retried",()=>{
  let value=emptyPracticePlanProgress(),blocked=true;
  const storage:PracticePlanStorage={load:()=>value,save:next=>{if(blocked)throw new Error("quota");value=next;}};
  render(<PracticePlanProvider storage={storage}><CompletionProbe/><ChildPracticePlan onOpenCatalog={vi.fn()}/></PracticePlanProvider>);
  fireEvent.click(screen.getByRole("button",{name:"Complete lesson"}));
  expect(screen.getByRole("alert")).toHaveTextContent("Не удалось сохранить");
  expect(screen.getByRole("progressbar")).toHaveAttribute("value","0");
  blocked=false;fireEvent.click(screen.getByRole("button",{name:"Сохранить ещё раз"}));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();expect(screen.getByRole("progressbar")).toHaveAttribute("value","1");
  expect(Object.keys(value.completed)).toHaveLength(1);
});

test("a storage update from another tab updates the counter without writing over it",()=>{
  render(<Demo/>);
  const next=emptyPracticePlanProgress();next.completed["practice:grammar:ser"]={revision:1,needsReview:false};
  window.localStorage.setItem(practicePlanStorageKey,JSON.stringify(next));
  act(()=>window.dispatchEvent(new StorageEvent("storage",{key:practicePlanStorageKey,newValue:JSON.stringify(next)})));
  expect(screen.getByRole("progressbar")).toHaveAttribute("value","1");
});

test("the old catalog and words stay accessible from the child plan",()=>{
  render(<Demo/>);
  fireEvent.click(screen.getByRole("button",{name:"Все уроки и свободная практика"}));
  expect(screen.getByRole("heading",{name:"14 коротких уроков"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"‹ К моему плану"}));
  expect(screen.getByRole("heading",{name:"Мой план"})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Слова"}));
  expect(screen.getByRole("button",{name:/^Семья и друзья/})).toBeVisible();
});

test("a word set is completed only after all typed answers, and hints flag it for review",()=>{
  const progress=emptyPracticePlanProgress();progress.lastStepId="practice:words:expansion-family-close";
  browserPracticePlanStorage.save(progress);render(<Demo/>);
  fireEvent.click(screen.getByRole("button",{name:"Продолжить →"}));
  expect(browserPracticePlanStorage.load().completed).toEqual({});
  fireEvent.click(screen.getByRole("button",{name:"Написать слова"}));
  for(const [index,key] of ["mae","pai","irmao","irma","avo-f","avo-m"].entries()){
    if(index===0)fireEvent.click(screen.getByRole("button",{name:"Подсказка"}));
    fireEvent.change(screen.getByLabelText("Твой ответ"),{target:{value:topicWord(key).label}});
    fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
    if(index<5)expect(browserPracticePlanStorage.load().completed).toEqual({});
    fireEvent.click(screen.getByRole("button",{name:index===5?"Завершить":"Дальше"}));
  }
  expect(browserPracticePlanStorage.load().completed["practice:words:expansion-family-close"]).toEqual({revision:1,needsReview:true});
});

test("finishing a standalone everyday lesson is reflected in the same child plan",()=>{
  window.history.replaceState(null,"","/tempo-react/?mode=child#/learning/everyday/likes");
  render(<Demo/>);fireEvent.click(screen.getByRole("button",{name:"Попробовать самому"}));
  for(const [index,task] of everydayLessons.likes.checks.entries()){
    fireEvent.click(screen.getByRole("button",{name:task.answer}));fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
    fireEvent.click(screen.getByRole("button",{name:index===4?"Завершить":"Дальше"}));
  }
  expect(browserPracticePlanStorage.load().completed["practice:everyday:likes"]).toEqual({revision:1,needsReview:false});
  fireEvent.click(screen.getByRole("button",{name:"← Назад"}));
  expect(screen.getByRole("progressbar")).toHaveAttribute("value","1");
});
