import {fireEvent,render,screen,within} from "@testing-library/react";
import {expect,test,vi} from "vitest";
import AdultLessons from "@/features/practice/AdultLessons";
import {PracticePlanProvider} from "@/features/practice/plan/PracticePlanContext";
import {emptyPracticePlanProgress} from "@/features/practice/plan/model";

test.each(["ser","estar","ser-estar"])("legacy %s opens one shared explanation and all three original checks",id=>{
  render(<AdultLessons consolidateBeing singleLesson showPractice activeLessonId={id} onLessonChange={vi.fn()} onOpenPractice={vi.fn()} onOpenConjugationOverview={vi.fn()}/>);
  expect(screen.getAllByRole("region",{name:"Общее объяснение SER и ESTAR"})).toHaveLength(1);
  for(const prompt of ["O Rui ___ português.","Nós ___ no centro.","A sopa ___ quente agora."])expect(screen.getByRole("region",{name:prompt})).toBeVisible();
});

test("shared checks keep separate completion IDs and a mistake on ESTAR does not affect SER",()=>{
  let saved=emptyPracticePlanProgress();
  render(<PracticePlanProvider storage={{load:()=>saved,save:value=>{saved=value;}}}><AdultLessons consolidateBeing singleLesson activeLessonId="ser-estar" onLessonChange={vi.fn()} onOpenPractice={vi.fn()} onOpenConjugationOverview={vi.fn()}/></PracticePlanProvider>);
  const estar=within(screen.getByRole("region",{name:"Nós ___ no centro."}));
  fireEvent.click(estar.getByRole("button",{name:"somos"}));
  fireEvent.click(estar.getByRole("button",{name:"Попробовать ещё раз"}));
  fireEvent.click(estar.getByRole("button",{name:"estamos"}));
  fireEvent.click(within(screen.getByRole("region",{name:"O Rui ___ português."})).getByRole("button",{name:"é"}));
  expect(saved.completed["practice:grammar:ser"]?.needsReview).toBe(false);
  expect(saved.completed["practice:grammar:estar"]?.needsReview).toBe(true);
  expect(saved.completed["practice:grammar:ser-estar"]).toBeUndefined();
});
