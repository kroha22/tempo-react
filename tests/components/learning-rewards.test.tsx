import {beforeEach,expect,it,vi} from "vitest";
import {render,screen,fireEvent,within} from "@testing-library/react";
import {emptyProfileLearning,parseProfileLearning} from "@/features/practice/profile-learning";
import {recordActivity,rewardAlbum,parseActivityResults,wordActivityId} from "@/features/practice/learning-rewards";
import {emptyPracticePlanProgress,practicePlanSteps} from "@/features/practice/plan/model";
import {ProfileManager} from "@/github-pages/ProfileManager";
import {createProfile,profileStores} from "@/github-pages/profiles";
import {UsagePractice} from "@/features/practice/UsagePractice";
import {learningCatalog} from "@/features/content/learning-catalog";
import {ShortGrammarQuiz} from "@/features/practice/ShortGrammarQuiz";
import {shortGrammarLessons} from "@/features/content/short-grammar-lessons";

beforeEach(()=>{localStorage.clear();vi.spyOn(window,"scrollTo").mockImplementation(()=>{});});
it("reads legacy learning records and combines them with already completed plan steps",()=>{
  const parsed=parseProfileLearning(emptyProfileLearning());
  expect(parsed.activities).toEqual({});
  const step=practicePlanSteps[0];
  const entries=rewardAlbum(parsed,{...emptyPracticePlanProgress(),completed:{[step.id]:{revision:step.revision,needsReview:true}}});
  expect(entries.find(entry=>entry.id===step.id)?.earned).toBe(true);
  expect(entries.filter(entry=>entry.earned)).toHaveLength(1);
});
it("keeps the best complete result and deduplicates repeated completions",()=>{
  const full={title:"Диалог",group:"Первые фразы" as const,correct:2,total:3};
  let state=recordActivity(emptyProfileLearning(),"greetings:hello",full);
  state=recordActivity(state,"greetings:hello",{...full,correct:3});
  state=recordActivity(state,"greetings:hello",{...full,correct:0});
  state=recordActivity(state,"greetings:hello",{...full,correct:1,total:1});
  expect(state.activities?.["greetings:hello"]).toEqual({...full,correct:3});
  expect(rewardAlbum(state,emptyPracticePlanProgress()).filter(item=>item.id==="greetings:hello")).toHaveLength(1);
});
it.each([null,[],{"bad":{title:"",group:"Грамматика",correct:0,total:1}},{"bad":{title:"Тест",group:"Грамматика",correct:2,total:1}},{"bad":{title:"Тест",group:"Грамматика",correct:0,total:0}}])("rejects malformed reward data (%j)",data=>{
  expect(()=>parseActivityResults(data)).toThrow();
});
it("uses the same word badge across word ordering and the guided plan",()=>{
  const step=practicePlanSteps.find(step=>step.kind==="words")!;
  if(step.kind!=="words")throw new Error("missing word step");
  expect(wordActivityId("writing",step.wordIds)).toBe(step.id);
  expect(wordActivityId("writing",[...step.wordIds].reverse())).toBe(step.id);
});
const familyModule=learningCatalog.usageModules.find(item=>item.id==="usage:family")!;
function finishPhrases(){for(const [index,exercise] of familyModule.exercises.entries()){
  const answer=exercise.options.find(option=>option.id===exercise.correctOptionId)!;
  fireEvent.click(within(screen.getByLabelText("Варианты ответа")).getByRole("button",{name:answer.text}));
  fireEvent.click(screen.getByRole("button",{name:"Проверить"}));
  fireEvent.click(screen.getByRole("button",{name:index===familyModule.exercises.length-1?"Завершить":"Следующая фраза →"}));
}}
it("collects grammar and phrases in one profile album, restores it and keeps another profile isolated",()=>{
  const profile=createProfile("Ученик",true,false),stores=profileStores(profile.id);
  const lesson=shortGrammarLessons[0];
  const view=render(<ProfileManager>{()=> <><ShortGrammarQuiz lesson={lesson}/><UsagePractice module={familyModule}/></>}</ProfileManager>);
  fireEvent.click(within(screen.getByRole("region",{name:lesson.quiz.prompt})).getByRole("button",{name:lesson.quiz.options[lesson.quiz.answer]}));
  // The usage task has its own named option group, separate from the grammar check.
  finishPhrases();
  expect(stores.learning.load().activities?.[familyModule.id].correct).toBe(familyModule.exercises.length);
  expect(stores.learning.load().activities?.[`practice:grammar:${lesson.id}`]).toBeDefined();
  fireEvent.click(screen.getAllByRole("button",{name:"В альбом наград →"})[0]);
  const album=screen.getByRole("region",{name:"Альбом наград"});
  expect(within(album).getAllByText("✓ Получено")).toHaveLength(2);
  const snapshot=stores.learning.load();view.unmount();
  render(<ProfileManager>{()=> <p>Занятие</p>}</ProfileManager>);
  fireEvent.click(screen.getByRole("button",{name:"Мои награды"}));
  expect(within(screen.getByRole("region",{name:"Альбом наград"})).getAllByText("✓ Получено")).toHaveLength(2);
  expect(stores.learning.load()).toEqual(snapshot);
  const other=createProfile("Другой",true,false);
  expect(profileStores(other.id).learning.load().activities).toBeUndefined();
});
it("does not unlock an unsaved badge and saves it through retry without losing cards",()=>{
  const profile=createProfile("Повтор",true,false),stores=profileStores(profile.id);
  render(<ProfileManager>{()=> <UsagePractice module={familyModule}/>}</ProfileManager>);
  const fail=vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new Error("quota");});
  finishPhrases();
  expect(stores.learning.load().activities?.[familyModule.id]).toBeUndefined();
  expect(screen.getByText(/Результат ещё не сохранён/)).toBeVisible();
  fail.mockRestore();
  fireEvent.click(screen.getByRole("button",{name:"Сохранить результаты ещё раз"}));
  expect(stores.learning.load().activities?.[familyModule.id].total).toBe(familyModule.exercises.length);
  expect(stores.cards.load()).toEqual([]);
});
