import {useState} from "react";
import {fireEvent,render,screen,waitFor,cleanup} from "@testing-library/react";
import {beforeEach,expect,it,vi} from "vitest";
import {SessionQueryBoundary} from "@/shared/query/SessionQueryBoundary";
import {PersonalWordReview,TopicWordRating,personalWordSeed} from "@/features/practice/PersonalWordReview";
import {ProfileLearningContext,emptyProfileLearning,type ProfileLearning} from "@/features/practice/profile-learning";
import {enrollPersonalWord} from "@/features/practice/personal-word-deck";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {studyReviewCards} from "@/features/cards/study-review/catalog";
import {deterministicReviewItemId} from "@/features/learning/progress/contracts";
import * as reviews from "@/features/cards/study-review/api";
import * as legacy from "@/features/cards/api/progress";
import * as save from "@/features/learning/progress/api";
vi.mock("@/features/cards/study-review/api",()=>({loadStudyReviews:vi.fn(),gradeStudyReview:vi.fn()}));
vi.mock("@/features/cards/api/progress",()=>({loadCardProgress:vi.fn(),saveCardProgress:vi.fn()}));
vi.mock("@/features/learning/progress/api",()=>({saveStudyItem:vi.fn()}));
let stored:ProfileLearning;
beforeEach(()=>{vi.clearAllMocks();stored=emptyProfileLearning();vi.mocked(reviews.loadStudyReviews).mockResolvedValue({cards:[],serverNow:Date.now()});vi.mocked(legacy.loadCardProgress).mockResolvedValue([]);vi.mocked(legacy.saveCardProgress).mockImplementation(async p=>p);});
function Harness({children}:{children:React.ReactNode}){const [learning,setLearning]=useState(stored);return <ProfileLearningContext value={{profile:{id:"review-test",child:false},learning,savingError:false,update:fn=>{stored=fn(stored);setLearning(stored);return true;}}}><SessionQueryBoundary scopeKey="personal-review-test">{children}</SessionQueryBoundary></ProfileLearningContext>;}
it("rates an unsupported word locally and persists its next interval without fake API IDs",async()=>{
  stored.wordDeck=enrollPersonalWord([],{wordId:"custom:hello",owner:"word",targetId:"custom:hello",front:"Olá!",back:"Привет!"},"hello","mistake",1,true);
  render(<Harness><PersonalWordReview/></Harness>);fireEvent.click(await screen.findByRole("button",{name:"Показать ответ"}));fireEvent.click(screen.getByRole("button",{name:/Помню/}));await screen.findByText("На сегодня всё");expect(stored.wordDeck?.[0].progress?.interval).toBe(1);expect(stored.wordDeck?.[0].errors).toBe(1);expect(stored.wordDeck?.[0].needsPractice).toBe(false);expect(save.saveStudyItem).not.toHaveBeenCalled();expect(legacy.saveCardProgress).not.toHaveBeenCalled();
  cleanup();render(<Harness><PersonalWordReview/></Harness>);await screen.findByText("На сегодня всё");
});
it("topic ratings use the existing verb schedule and retain the same prepared intent on retry",async()=>{
  const pack=wordLibraryFor(false).find(set=>set.id==="basic-irregular")!,word=pack.words[0];
  const old={cardId:word.id,due:1,interval:20,ease:2.5,repetitions:5,lapses:0,lastGrade:2};
  vi.mocked(legacy.loadCardProgress).mockResolvedValue([old]);vi.mocked(legacy.saveCardProgress).mockRejectedValueOnce(Error("offline")).mockImplementation(async p=>p);
  render(<Harness><TopicWordRating word={word} set={pack}/></Harness>);fireEvent.click(screen.getByRole("button",{name:"Знаю"}));fireEvent.click(await screen.findByRole("button",{name:"Повторить сохранение"}));await screen.findByText("✓ В моей колоде");
  const calls=vi.mocked(legacy.saveCardProgress).mock.calls;expect(calls).toHaveLength(2);expect(calls[0][0]).toEqual(calls[1][0]);expect(calls[0][0].interval).toBeGreaterThan(20);expect(stored.wordDeck).toHaveLength(1);expect(stored.wordDeck?.[0].progress).toBeNull();
});
it("existing StudyItems retain expectedVersion and do not get a parallel local schedule",async()=>{
  const card=studyReviewCards[0],reviewItemId=deterministicReviewItemId(card.studyItemId);
  const row={studyItemId:card.studyItemId,reviewItemId,version:7,reviewedAt:1,progress:{cardId:reviewItemId,due:1,interval:10,ease:2.5,repetitions:4,lapses:0,lastGrade:2 as const}};
  vi.mocked(reviews.loadStudyReviews).mockResolvedValue({cards:[row],serverNow:Date.now()});
  vi.mocked(save.saveStudyItem).mockResolvedValue({item:{studyItemId:card.studyItemId,savedAt:1},sources:[]});
  vi.mocked(reviews.gradeStudyReview).mockImplementation(async command=>{vi.mocked(reviews.loadStudyReviews).mockResolvedValue({cards:[{...row,version:8,progress:{...row.progress,due:Date.now()+86400000}}],serverNow:Date.now()});return {card:{...row,version:8},clientEventId:command.clientEventId,duplicate:false};});
  render(<Harness><PersonalWordReview/></Harness>);fireEvent.click(await screen.findByRole("button",{name:"Показать ответ"}));fireEvent.click(screen.getByRole("button",{name:/Помню/}));await waitFor(()=>expect(reviews.gradeStudyReview).toHaveBeenCalledOnce());await screen.findByText("На сегодня всё");expect(vi.mocked(reviews.gradeStudyReview).mock.calls[0][0]).toMatchObject({studyItemId:card.studyItemId,expectedVersion:7,grade:2});expect(stored.wordDeck?.[0].progress).toBeNull();expect(personalWordSeed({id:card.studyItemId,label:card.front,translation:card.back}).owner).toBe("study");
});
