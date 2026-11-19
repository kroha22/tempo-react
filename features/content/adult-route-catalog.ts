import {adultMaterialKey, adultRouteBlocks, adultRouteMaterials, type AdultMaterialKind, type AdultMaterialReference} from "./adult-route.ts";
import {generalPlanUnits} from "../learning/plan/model.ts";
import {allGramaticaLessons} from "./gramatica-ativa.ts";
import {preparationUnits} from "./test-preparation.ts";
import {shortGrammarLessons} from "./short-grammar-lessons.ts";
import {practicePlanSteps} from "../practice/plan/model.ts";
import {routeLessonExperiences} from "./first-vertical-slice/route-extension.ts";
import {navigationTopics} from "./topic-navigation.ts";
import {wordBrowseSets} from "./word-browse-sets.ts";
import {wordLibraryFor, type WordLearningSet} from "./word-learning-library.ts";

export type AdultMaterialSource = Readonly<{
  kind: AdultMaterialKind;
  sourceId: string;
  title: string;
  availability: "available" | "partial" | "planned" | "tool";
  /** Original object, not a copied/rekeyed lesson or collection. */
  source: object;
  href?: string;
  explanationHref?: string;
  wordsHref?: string;
  /** Scoped selection data, not a new URL contract for QuickWords. */
  wordSets?: readonly WordLearningSet[];
  aliases?: readonly string[];
  legacyOnly?: boolean;
}>;

// Existing executable entry points outside the lesson/topic registries.
// Their href is their reference identity, never a progress key.
const activities = [
  {href:"/learning/time",title:"Часы",owner:"ClockLesson",availability:"available"},
  {href:"/learning/everyday/likes",title:"GOSTAR DE",owner:"EverydayLesson",availability:"available"},
  {href:"/learning/everyday/body",title:"Тело и действия",owner:"EverydayLesson",availability:"available"},
  {href:"/learning/trazer",title:"TRAZER",owner:"TrazerLesson",availability:"available"},
  {href:"/learning/future",title:"IR + infinitivo",owner:"FutureLesson",availability:"available"},
  {href:"/learning/past-suns",title:"Прошедшие формы",owner:"PastSuns",availability:"available"},
  {href:"/learning/conjugation",title:"Тренажёр спряжений",owner:"PracticeScreen",availability:"tool"},
] as const;

/** Explicitly requested by callers: not imported by the current plan/catalog UI. */
export function adultMaterialSources(): readonly AdultMaterialSource[] {
  const library = wordLibraryFor(false);
  const browse=wordBrowseSets(false);
  // A presentation regroup may retire a browse entry while its original library
  // set remains addressable. Preserve that reference without undoing the regroup.
  const retired=adultRouteMaterials.filter(ref=>ref.kind==="word-set"&&!browse.some(set=>set.id===ref.sourceId)).flatMap(ref=>{
    const set=library.find(set=>set.id===ref.sourceId);
    return set?[set]:[];
  });
  return [
    ...generalPlanUnits.map(unit => ({
      kind:"book" as const, sourceId:`U${String(unit.unit).padStart(2,"0")}`, title:unit.title,
      availability:unit.lesson ? "available" as const : "planned" as const,
      source:unit.lesson ?? unit,
      ...(unit.lesson ? {href:`/learning/gramatica-ativa/${unit.lesson.slug}`,explanationHref:`/learning/gramatica-ativa/${unit.lesson.slug}/explanation`} : {}),
      wordsHref:`/learning/gramatica-ativa/words/u${String(unit.unit).padStart(2,"0")}`,
      wordSets:library.filter(set => set.unit === unit.unit),
    })),
    ...preparationUnits.map(unit => ({kind:"preparation" as const,sourceId:unit.id,title:unit.title[1],availability:"available" as const,source:unit,href:`/learning/plan/school?unit=${encodeURIComponent(unit.id)}`})),
    ...shortGrammarLessons.map(lesson => ({kind:"short-grammar" as const,sourceId:lesson.id,title:lesson.title,availability:"available" as const,source:lesson,href:`/learning/practice?lesson=${encodeURIComponent(lesson.id)}`})),
    ...practicePlanSteps.map(step => ({kind:"practice-step" as const,sourceId:step.id,title:step.title,availability:"available" as const,source:step,href:step.kind==="grammar"?`/learning/practice?lesson=${encodeURIComponent(step.lessonId)}`:`/learning/plan/step/${encodeURIComponent(step.id)}`})),
    ...routeLessonExperiences.map(lesson => ({kind:"route" as const,sourceId:lesson.id,title:lesson.title,availability:"available" as const,source:lesson,href:`/learning/lessons/${encodeURIComponent(lesson.id)}`})),
    ...wordBrowseSets(false).map(set => ({kind:"word-set" as const,sourceId:set.id,title:set.title,availability:"available" as const,source:set,wordSets:[set],aliases:set.aliases})),
    ...retired.map(set=>({kind:"word-set" as const,sourceId:set.id,title:set.title,availability:"available" as const,source:set,wordSets:[set],aliases:set.aliases,legacyOnly:true})),
    ...navigationTopics.map(topic => ({kind:"topic" as const,sourceId:topic.id,title:topic.title,source:topic,href:topic.href,
      availability:["topic:work","topic:city","topic:vocabulary-clothing","topic:vocabulary-cooperation"].includes(topic.id) ? "partial" as const : "available" as const,
      aliases:topic.legacyEntries.map(entry => entry.id),
    })),
    ...activities.map(activity => ({kind:"activity" as const,sourceId:activity.href,title:activity.title,availability:activity.availability,source:activity,href:activity.href})),
    ...allGramaticaLessons.filter(lesson => lesson.checkpoint).map(lesson => ({kind:"checkpoint" as const,sourceId:lesson.id,title:lesson.title,availability:"available" as const,source:lesson,href:`/learning/gramatica-ativa/${lesson.slug}`})),
  ];
}

export function resolveAdultMaterials(sources: readonly AdultMaterialSource[] = adultMaterialSources()) {
  const byKey = new Map(sources.map(source => [adultMaterialKey(source),source]));
  return adultRouteMaterials.map(reference => ({reference,material:byKey.get(adultMaterialKey(reference))}));
}

/** Bidirectional coverage: source additions require an explicit curriculum placement. */
export function validateAdultRoute(
  references: readonly AdultMaterialReference[] = adultRouteMaterials,
  sources: readonly AdultMaterialSource[] = adultMaterialSources(),
): string[] {
  const errors: string[] = [];
  const blocks = new Set<string>(adultRouteBlocks.map(block => block.key));
  const sharedKeys = new Set([
    "word-set/browse:essentials", "word-set/basic-irregular",
    "word-set/browse:deck:verbs", "word-set/browse:deck:basic",
    "activity//learning/conjugation",
  ]);
  const sourceKeys = new Set<string>();
  for (const source of sources) {
    const key = adultMaterialKey(source);
    if (sourceKeys.has(key)) errors.push(`Duplicate source: ${key}`);
    sourceKeys.add(key);
    if (source.kind === "book" && !source.wordSets?.length) errors.push(`Missing book words: ${key}`);
  }
  const seen = new Set<string>();
  for (const ref of references) {
    const key = adultMaterialKey(ref);
    if (seen.has(key)) errors.push(`Duplicate placement: ${key}`);
    seen.add(key);
    if (!sourceKeys.has(key)) errors.push(`Unknown source: ${key}`);
    if (ref.block === null && !sharedKeys.has(key)) errors.push(`Missing primary block: ${key}`);
    if (ref.block !== null && !blocks.has(ref.block)) errors.push(`Unknown block: ${key}`);
    const repeat = ref.repeatIn ?? [];
    if ((ref.block === null && repeat.length > 0) || new Set(repeat).size !== repeat.length || repeat.some(block => !blocks.has(block) || block === ref.block)) errors.push(`Invalid repeat placement: ${key}`);
  }
  for (const key of sourceKeys) if (!seen.has(key)) errors.push(`Unmapped source: ${key}`);
  return errors;
}
