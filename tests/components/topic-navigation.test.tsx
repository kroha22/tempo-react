import {expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {navigationTopics,topicForLegacyId,topicForWordSet,topicWordsHref,groupTopicWordSets} from "@/features/content/topic-navigation";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordLibraryFor} from "@/features/content/word-learning-library";
import {catalogGroups} from "@/features/content/learning-catalog-view";
import {preparationUnits} from "@/features/content/test-preparation";
import {schoolPlanGroups} from "@/features/learning/plan/school-plan";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";
import {PlanWords} from "@/features/learning/plan/PlanWords";
import {VocabularyHub} from "@/features/practice/VocabularyHub";
import {QuickWords} from "@/features/practice/QuickWords";
import {supplementalSteps} from "@/features/learning/plan/model";
import {readingLessonIds} from "@/features/content/reading-lessons";
import {ReadingLessons} from "@/features/practice/ReadingLessons";

it("uses existing topic/legacy IDs and keeps all twenty school lessons exactly once",()=>{
  expect(navigationTopics.map(topic=>topic.id)).toEqual(["topic:reading","topic:vocabulary-family","topic:food","topic:vocabulary-calendar","topic:vocabulary-body","topic:vocabulary-house"]);
  for(const topic of navigationTopics){
    expect(topic.id==="topic:reading"||catalogGroups.some(group=>group.id===topic.id)).toBe(true);
    for(const entry of topic.legacyEntries)expect(topicForLegacyId(entry.id)?.id).toBe(topic.id);
    for(const id of topic.schoolUnitIds)expect(preparationUnits.some(unit=>unit.id===id)).toBe(true);
    for(const id of topic.supplementalStepIds)expect(supplementalSteps.some(step=>step.id===id)).toBe(true);
  }
  expect(schoolPlanGroups.flatMap(group=>group.units.map(unit=>unit.id)).sort()).toEqual(preparationUnits.map(unit=>unit.id).sort());
});
it("keeps the reading ID, all ten lesson IDs, the original word set and the legacy reader",()=>{
  const topic=navigationTopics.find(topic=>topic.id==="topic:reading")!;
  expect(topic.schoolUnitIds).toEqual(readingLessonIds);
  const sets=wordBrowseSets(false).filter(set=>topicForWordSet(set)?.id===topic.id);
  expect(sets.map(set=>set.id)).toEqual(["school:words:reading"]);
  render(<ReadingLessons onBack={vi.fn()}/>);
  expect(screen.getByText("10 тем · 10 всего")).toBeVisible();
  for(const id of readingLessonIds){const unit=preparationUnits.find(unit=>unit.id===id)!;expect(screen.getByRole("button",{name:new RegExp(unit.title[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))})).toBeVisible();}
  cleanup();render(<VocabularyHub initialTopicId="topic:reading" onOpenCards={vi.fn()}/>);
  expect(screen.getByText("10 тем · 10 всего")).toBeVisible();
});
it("assigns the existing family and food sources, including the meals alias, exactly once",()=>{
  const sets=wordBrowseSets(false);
  const expected={"topic:vocabulary-family":["library:collection:expansion-family-close:0"],"topic:food":["fruit","food","library:collection:pairs-verbs-food-shopping:0","library:collection:expansion-food-table:0","library:collection:expansion-food-vegetables:0","library:collection:expansion-food-dairy:0","library:collection:expansion-food-meat:0","library:collection:expansion-food-seasoning:0","library:collection:expansion-food-other:0","library:collection:vocabulary-lesson:cooking:0"]};
  for(const [id,ids] of Object.entries(expected))expect(sets.filter(set=>topicForWordSet(set)?.id===id).map(set=>set.id)).toEqual(ids);
});
it("groups without merging, copying, dropping or changing any set/word/source in either presentation",()=>{
  for(const child of [false,true]){
    const library=wordLibraryFor(child),sets=wordBrowseSets(child),before=JSON.stringify({library,sets});
    const grouped=groupTopicWordSets(sets),flat=grouped.flatMap(group=>group.sets);
    expect(flat).toHaveLength(sets.length);
    expect(flat.map(set=>set.id).sort()).toEqual(sets.map(set=>set.id).sort());
    expect(new Set(flat).size).toBe(sets.length);
    for(const set of flat)expect(sets.find(original=>original.id===set.id)).toBe(set);
    expect(JSON.stringify({library,sets})).toBe(before);
  }
  const source=wordBrowseSets(false).filter(set=>set.title==="Где находится?");
  const home=groupTopicWordSets(wordBrowseSets(false)).find(group=>group.id==="topic:vocabulary-house")!;
  expect(home.sets.filter(set=>set.title==="Где находится?")).toEqual(source);
});
it("renders the same canonical entry in plan, catalogue and words, preserving legacy buttons",()=>{
  render(<GeneralPlan practiceOnly/>);
  for(const topic of navigationTopics)expect(document.querySelector(`a[href="${topic.href}"]`)).toHaveTextContent(topic.title);
  cleanup();render(<VocabularyHub onOpenCards={vi.fn()}/>);
  for(const topic of navigationTopics){
    const card=within(screen.getByRole("region",{name:`Тема: ${topic.title}`}));
    expect(card.getByRole("link",{name:new RegExp(`^${topic.title}`)})).toHaveAttribute("href",topic.href);
    for(const entry of topic.legacyEntries)expect(document.querySelector(`button[data-topic-id="${entry.id}"]`)).not.toBeNull();
  }
  cleanup();render(<PlanWords/>);
  for(const topic of navigationTopics)expect(screen.getByRole("link",{name:`${topic.title} →`})).toHaveAttribute("href",topicWordsHref(topic.id));
});
it.each(navigationTopics)("opens only existing $title word sets and keeps the first card unchanged",topic=>{
  const expected=wordBrowseSets(false).filter(set=>topicForWordSet(set)?.id===topic.id);expect(expected.length).toBeGreaterThan(0);
  render(<QuickWords onBack={vi.fn()} topicId={topic.id}/>);
  const dialog=screen.getByRole("dialog",{name:"Учить слова"});
  expect(within(dialog).getByText(topic.title,{exact:true})).toBeVisible();
  const packs=dialog.querySelectorAll("button[data-tone]");expect(packs).toHaveLength(expected.length);
  fireEvent.click(packs[0]);fireEvent.click(screen.getByRole("button",{name:/Карточки слов/}));
  expect(screen.getByRole("button",{name:"Перевернуть карточку"})).toHaveTextContent(expected[0].words[0].label);
});
it("groups the child catalogue and leaves a lesson-source scope ungrouped",()=>{
  render(<QuickWords child onBack={vi.fn()}/>);expect(screen.getByText("Время и календарь")).toBeVisible();
  cleanup();render(<QuickWords sourceIds={["book:1"]} onBack={vi.fn()}/>);
  expect(document.querySelectorAll("details")).toHaveLength(0);
});
