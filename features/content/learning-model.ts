import type { PresentationProfileId, StudyItem } from "./types.ts";
import type { Tense, VerbKey } from "../conjugation/data.ts";

/** Catalog identities do not replace cardId, StudyItem or authoritative progress. */
export type LexicalEntry = {
  id: string;
  lemma: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "expression" | "unclassified";
  morphology?: { gender?: "masculine" | "feminine"; article?: string; plural?: string; pluralArticle?: string };
  conjugationKey?: VerbKey;
};
export type LearningMeaning = {
  id: string;
  entryId: string;
  translation: string;
  /** Reuse canonical targets where the source already owns a Sense or Chunk. */
  canonicalTarget?: StudyItem["target"];
  legacyWordIds: readonly string[];
  /** Stable IDs from imported editorial sources, separate from exercise aliases. */
  sourceEntryIds?: readonly string[];
  status: "source-backed" | "needs-review";
};
export type LearningTopic = { id: string; title: string; parentIds: readonly string[] };
export type LearningCollection = {
  id: string; title: string; topicIds: readonly string[]; meaningIds: readonly string[];
  source: { kind: "lesson" | "scene" | "vocabulary" | "curated"; legacySetId?: string; href?: string };
};
export type GrammarTopic = {
  id: string; title: string; prerequisiteIds: readonly string[];
  /** A planned topic must never create a clickable link to a missing lesson. */
  destination: { status: "available"; href: string } | { status: "planned" };
};
export type VerbPattern = {
  entryId: string; tense: Tense; infinitiveEnding: "ar" | "er" | "ir";
  pattern: "regular" | "spelling-change" | "stem-change" | "irregular";
  grammarTopicId: string;
};
export type SceneDefinition = {
  id: string; title: string; image: { src: string; width: number; height: number };
  targets: readonly { id: string; meaningIds: readonly string[]; anchor: { x: number; y: number }; region?: { x: number; y: number; width: number; height: number } }[];
};
export type SemanticCategory = {
  id: string; title: string; memberMeaningIds: readonly string[];
  /** Non-members are authored; absence from a topic is NOT evidence of exclusion. */
  outsiders: readonly { meaningId: string; reason: string }[];
  ambiguousMeaningIds: readonly string[];
};
export type UsageExample = {
  id: string;
  portuguese: string;
  translation: string;
  meaningIds: readonly string[];
  grammarTopicIds: readonly string[];
};
export type UsageClozeOption = {
  id: string;
  text: string;
  meaningId: string;
  icon?: string;
};
export type UsageCloze = {
  id: string;
  prompt: string;
  before: string;
  after: string;
  options: readonly UsageClozeOption[];
  correctOptionId: string;
  feedback: string;
};
/** A short bridge from a vocabulary collection to examples and related practice. */
export type UsageModule = {
  id: string;
  title: string;
  situation: string;
  collectionIds: readonly string[];
  newMeaningIds: readonly string[];
  reviewedMeaningIds: readonly string[];
  recognitionOnly: readonly string[];
  examples: readonly UsageExample[];
  exercises: readonly UsageCloze[];
  relatedLinks: readonly { id: string; label: string; href: string; kind: "lesson" | "grammar" | "practice" }[];
};
export type ActivityBinding = {
  id: string;
  target:
    | { kind: "vocabulary"; collectionId: string; mechanic: "cards" | "pairs" | "word-search" }
    | { kind: "image"; sceneId: string; targetIds: readonly string[] }
    | { kind: "category"; categoryId: string; mechanic: "odd" | "common" }
    | { kind: "conjugation"; entryIds: readonly string[]; tense: Tense; mechanic: "sun" }
    | { kind: "usage"; usageModuleId: string; mechanic: "examples-and-cloze" }
    | { kind: "grammar"; grammarTopicId: string; legacyActivityId: string };
};
export type AssistancePolicy = { feedback: "immediate" | "on-check"; translations: "available" | "after-error"; russianScaffold: boolean };
export const assistancePresets: Record<"learn" | "self-check", AssistancePolicy> = {
  learn: { feedback: "immediate", translations: "available", russianScaffold: true },
  "self-check": { feedback: "on-check", translations: "after-error", russianScaffold: false },
};
/** Visual choices cannot override target IDs, accepted answers or grading. */
export type ActivityPresentation = { activityId: string; profile: PresentationProfileId; title?: string; illustrationSrc?: string };
export type PracticeEvidence = {
  activityId: string; targetId: string;
  skill: "recognition" | "recall" | "spelling" | "meaning" | "conjugation";
  outcome: "correct" | "incorrect";
  assistance: readonly ("translation" | "russian-answer" | "answer-reveal")[];
};
export type LearningCatalog = {
  schemaVersion: 1;
  entries: readonly LexicalEntry[]; meanings: readonly LearningMeaning[];
  topics: readonly LearningTopic[]; collections: readonly LearningCollection[];
  grammar: readonly GrammarTopic[]; verbPatterns: readonly VerbPattern[];
  scenes: readonly SceneDefinition[]; categories: readonly SemanticCategory[];
  usageModules: readonly UsageModule[];
  activities: readonly ActivityBinding[];
};

export function meaningsForTopic(catalog: LearningCatalog, topicId: string, partOfSpeech?: LexicalEntry["partOfSpeech"]) {
  const topics = new Set([topicId]);
  let size = 0;
  while (size !== topics.size) { size = topics.size; catalog.topics.forEach(topic => { if (topic.parentIds.some(id => topics.has(id))) topics.add(topic.id); }); }
  const ids = new Set(catalog.collections.filter(collection => collection.topicIds.some(id => topics.has(id))).flatMap(collection => collection.meaningIds));
  return catalog.meanings.filter(meaning => ids.has(meaning.id) && (!partOfSpeech || catalog.entries.find(entry => entry.id === meaning.entryId)?.partOfSpeech === partOfSpeech));
}

export function validateLearningCatalog(c: LearningCatalog): string[] {
  const errors: string[] = [];
  const index = (items: readonly { id: string }[], name: string) => { const ids = new Set(items.map(item => item.id)); if (ids.size !== items.length) errors.push(`Duplicate ${name}`); return ids; };
  const entries=index(c.entries,"entry"), meanings=index(c.meanings,"meaning"), topics=index(c.topics,"topic"), collections=index(c.collections,"collection"), grammar=index(c.grammar,"grammar"), scenes=index(c.scenes,"scene"), categories=index(c.categories,"category"), usageModules=index(c.usageModules,"usage module"); index(c.activities,"activity");
  const refs=(ids:readonly string[], allowed:Set<string>, owner:string)=>ids.forEach(id=>{if(!allowed.has(id))errors.push(`${owner}: missing ${id}`);});
  const aliases=new Set<string>(),sourceEntries=new Set<string>();
  c.meanings.forEach(m=>{refs([m.entryId],entries,m.id);m.legacyWordIds.forEach(id=>{if(aliases.has(id))errors.push(`Duplicate alias ${id}`);aliases.add(id);});m.sourceEntryIds?.forEach(id=>{if(sourceEntries.has(id))errors.push(`Duplicate source entry ${id}`);sourceEntries.add(id);});});
  c.collections.forEach(s=>{refs(s.topicIds,topics,s.id);refs(s.meaningIds,meanings,s.id);if(new Set(s.meaningIds).size!==s.meaningIds.length)errors.push(`Duplicate membership ${s.id}`);});
  c.topics.forEach(t=>refs(t.parentIds,topics,t.id));
  c.grammar.forEach(g=>refs(g.prerequisiteIds,grammar,g.id));
  function cycles(items:readonly {id:string; parents:readonly string[]}[]) {
    const map=new Map(items.map(i=>[i.id,i.parents])),done=new Set<string>(),active=new Set<string>();
    function visit(id:string){if(active.has(id)){errors.push(`Cycle ${id}`);return;}if(done.has(id))return;active.add(id);(map.get(id)??[]).forEach(visit);active.delete(id);done.add(id);}
    items.forEach(i=>visit(i.id));
  }
  cycles(c.topics.map(t=>({id:t.id,parents:t.parentIds})));cycles(c.grammar.map(g=>({id:g.id,parents:g.prerequisiteIds})));
  c.verbPatterns.forEach(p=>{refs([p.entryId],entries,"pattern");refs([p.grammarTopicId],grammar,"pattern");if(c.entries.find(e=>e.id===p.entryId)?.partOfSpeech!=="verb")errors.push(`Not a verb ${p.entryId}`);});
  c.scenes.forEach(s=>{index(s.targets,`${s.id} target`);s.targets.forEach(t=>{refs(t.meaningIds,meanings,t.id);if(!t.meaningIds.length)errors.push(`Empty target ${t.id}`);if(!Number.isFinite(t.anchor.x)||!Number.isFinite(t.anchor.y)||t.anchor.x<0||t.anchor.x>1||t.anchor.y<0||t.anchor.y>1)errors.push(`Invalid anchor ${t.id}`);});});
  c.categories.forEach(k=>{refs([...k.memberMeaningIds,...k.outsiders.map(o=>o.meaningId),...k.ambiguousMeaningIds],meanings,k.id);if(k.outsiders.some(o=>k.memberMeaningIds.includes(o.meaningId)||k.ambiguousMeaningIds.includes(o.meaningId)||!o.reason.trim()))errors.push(`Ambiguous outsider ${k.id}`);});
  c.usageModules.forEach(module=>{
    refs(module.collectionIds,collections,module.id);
    refs([...module.newMeaningIds,...module.reviewedMeaningIds],meanings,module.id);
    if(new Set([...module.newMeaningIds,...module.reviewedMeaningIds]).size!==module.newMeaningIds.length+module.reviewedMeaningIds.length)errors.push(`Duplicate lexical scope ${module.id}`);
    if(module.newMeaningIds.length>14)errors.push(`Lexical load above fourteen ${module.id}`);
    module.examples.forEach(example=>{refs(example.meaningIds,meanings,example.id);refs(example.grammarTopicIds,grammar,example.id);});
    module.exercises.forEach(exercise=>{const options=index(exercise.options,`${exercise.id} option`);refs(exercise.options.map(option=>option.meaningId),meanings,exercise.id);refs([exercise.correctOptionId],options,exercise.id);});
  });
  c.activities.forEach(a=>{const t=a.target;if(t.kind==="vocabulary")refs([t.collectionId],collections,a.id);else if(t.kind==="image"){refs([t.sceneId],scenes,a.id);refs(t.targetIds,new Set(c.scenes.find(s=>s.id===t.sceneId)?.targets.map(x=>x.id)),a.id);}else if(t.kind==="category")refs([t.categoryId],categories,a.id);else if(t.kind==="usage")refs([t.usageModuleId],usageModules,a.id);else if(t.kind==="grammar")refs([t.grammarTopicId],grammar,a.id);else {refs(t.entryIds,entries,a.id);t.entryIds.forEach(id=>{if(!c.verbPatterns.some(p=>p.entryId===id&&p.tense===t.tense))errors.push(`Unsupported sun ${id}:${t.tense}`);});}});
  return errors;
}
