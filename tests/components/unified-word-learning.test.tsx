import {renderExpandedWords as render,openWordSet} from "./render-expanded-words";
import {useState} from "react";
import {fireEvent,screen,waitFor,cleanup} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach,expect,it,vi} from "vitest";
import {SessionQueryBoundary} from "@/shared/query/SessionQueryBoundary";
import {UnifiedWordReview} from "@/features/practice/UnifiedWordReview";
import {SaveWordSet,wordSetSaveTargets} from "@/features/practice/SaveWordSet";
import {QuickWords} from "@/features/practice/QuickWords";
import {WordLearningReturn} from "@/features/practice/WordLearningEntry";
import {GrammarWordBatch} from "@/features/learning/gramatica/GrammarWordBatch";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {deterministicReviewItemId} from "@/features/learning/progress/contracts";
import {studyReviewCards} from "@/features/cards/study-review/catalog";
import * as reviews from "@/features/cards/study-review/api";
import * as legacy from "@/features/cards/api/progress";
import * as saved from "@/features/cards/api/saved-items";
import * as save from "@/features/learning/progress/api";
vi.mock("@/features/cards/study-review/api",()=>({loadStudyReviews:vi.fn(),gradeStudyReview:vi.fn()}));
vi.mock("@/features/cards/api/progress",()=>({loadCardProgress:vi.fn(),saveCardProgress:vi.fn()}));
vi.mock("@/features/cards/api/saved-items",()=>({loadSavedItems:vi.fn()}));
vi.mock("@/features/learning/progress/api",()=>({saveStudyItem:vi.fn()}));
beforeEach(()=>{vi.mocked(reviews.loadStudyReviews).mockResolvedValue({cards:[],serverNow:Date.now()});vi.mocked(legacy.loadCardProgress).mockResolvedValue([]);vi.mocked(saved.loadSavedItems).mockResolvedValue({items:[],sources:[]});});

it("reviews both histories through one card and sends each grade to its original owner",async()=>{
  const card=studyReviewCards.find(card=>card.front!=="ser")!,id=deterministicReviewItemId(card.studyItemId);
  const row={studyItemId:card.studyItemId,reviewItemId:id,version:1,reviewedAt:1,progress:{cardId:id,due:1,interval:2,ease:2.5,repetitions:1,lapses:0,lastGrade:2 as const}};
  vi.mocked(reviews.loadStudyReviews).mockResolvedValue({cards:[row],serverNow:Date.now()});
  vi.mocked(legacy.loadCardProgress).mockResolvedValue([{...row.progress,cardId:"v0001",due:0}]);
  vi.mocked(legacy.saveCardProgress).mockImplementation(async progress=>progress);
  vi.mocked(reviews.gradeStudyReview).mockImplementation(async command=>({card:{...row,version:2,reviewedAt:Date.now(),progress:{...row.progress,due:Date.now()+86400000,lastGrade:command.grade}},clientEventId:command.clientEventId,duplicate:false}));
  render(<SessionQueryBoundary><UnifiedWordReview/></SessionQueryBoundary>);
  const user=userEvent.setup();await user.click(await screen.findByRole("button",{name:"Показать ответ"}));
  await user.click(screen.getByRole("button",{name:"Помню"}));
  await waitFor(()=>expect(legacy.saveCardProgress).toHaveBeenCalledOnce());
  expect(vi.mocked(legacy.saveCardProgress).mock.calls[0][0].cardId).toBe("v0001");
  await screen.findByText(card.front);await user.click(screen.getByRole("button",{name:"Показать ответ"}));
  await user.click(screen.getByRole("button",{name:"Помню"}));
  await waitFor(()=>expect(reviews.gradeStudyReview).toHaveBeenCalledOnce());
  expect(vi.mocked(reviews.gradeStudyReview).mock.calls[0][0]).toMatchObject({studyItemId:card.studyItemId,expectedVersion:1,grade:2});
  await screen.findByText("На сегодня всё");
});
it("retries a partially saved set with the same intents and does not grade cards",async()=>{
  const pack=wordLibraryFor(false).find(set=>set.unit===1)!,targets=wordSetSaveTargets(pack);
  let calls=0;
  vi.mocked(save.saveStudyItem).mockImplementation(async input=>{calls++;if(calls===2)throw Error("offline");return {item:{studyItemId:input.studyItemId,savedAt:123},sources:[{studyItemId:input.studyItemId,sourceType:input.sourceType,sourceId:input.sourceId,sourceContextId:input.sourceContextId}]};});
  render(<SessionQueryBoundary><SaveWordSet set={pack}/></SessionQueryBoundary>);
  const add=await screen.findByRole("button",{name:"Добавить в повторение"});await waitFor(()=>expect(add).toBeEnabled());
  fireEvent.click(add);fireEvent.click(add);await screen.findByRole("alert");
  expect(save.saveStudyItem).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button",{name:"Повторить сохранение"}));
  await screen.findByRole("button",{name:"В повторении ✓"});
  expect(vi.mocked(save.saveStudyItem).mock.calls[0][0]).toEqual(vi.mocked(save.saveStudyItem).mock.calls[2][0]);
  expect(save.saveStudyItem).toHaveBeenCalledTimes(targets.length+2);
  expect(reviews.gradeStudyReview).not.toHaveBeenCalled();expect(legacy.saveCardProgress).not.toHaveBeenCalled();
});
it("resumes the same card after remount and keeps the second profile empty",async()=>{
  let stored=emptyProfileLearning();
  function Harness({initial}:{initial:ProfileLearning}){
    const [learning,setLearning]=useState(initial);
    return <ProfileLearningContext value={{profile:{id:"a",child:false},learning,savingError:false,update:fn=>{stored=fn(stored);setLearning(stored);return true;}}}><SessionQueryBoundary><QuickWords onBack={()=>{}}/></SessionQueryBoundary></ProfileLearningContext>;
  }
  const user=userEvent.setup();const first=render(<Harness initial={stored}/>);
  await openWordSet(user,/Цвета/);await user.click(screen.getByRole("button",{name:/^Карточки слов/}));
  await user.click(screen.getByRole("button",{name:"Перевернуть карточку"}));await user.click(screen.getByRole("button",{name:"Следующая карточка"}));
  expect(stored.wordSession?.index).toBe(1);first.unmount();
  render(<Harness initial={stored}/>);await user.click(screen.getByRole("button",{name:/Продолжить · Цвета/}));
  expect(screen.getByText("2 / 6")).toBeVisible();expect(screen.getByText("azul")).toBeVisible();cleanup();
  render(<Harness initial={emptyProfileLearning()}/>);expect(screen.queryByRole("button",{name:/Продолжить ·/})).not.toBeInTheDocument();
});
it("opens the book vocabulary in the common player and returns to its source",async()=>{
  const back=vi.fn(),user=userEvent.setup();render(<WordLearningReturn value={back}><GrammarWordBatch unit={54} practiceOnly/></WordLearningReturn>);
  const packs=screen.queryAllByRole("button",{name:/Урок 54/});if(packs.length)await user.click(packs[0]);
  expect(screen.getByRole("button",{name:/^Карточки слов/})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Все наборы"}));
  if(!back.mock.calls.length)await user.click(screen.getByRole("button",{name:"К урокам"}));
  expect(back).toHaveBeenCalledOnce();
});
