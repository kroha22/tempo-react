import { ru } from "./locale/ru.ts";
import {readingChunks,readingExamples,readingStudyItems,readingRu} from "./reading-cards.ts";
import { vocabularyChunks, vocabularyExamples, vocabularyRu, vocabularyStudyItems } from "./gramatica-vocabulary-pack.ts";
import { grammarBlocks, grammarCanDos, grammarChunks, grammarCourses, grammarDefinitions, grammarExamples, grammarFlows, grammarItems, grammarLessons, grammarLevels, grammarRu, grammarStudyItems, grammarTargets, grammarUnits, grammarUses } from "./gramatica-ativa-pack.ts";
import {
  canDos,
  chunks,
  contentBlocks,
  courses,
  examples,
  exerciseDefinitions,
  exerciseItems,
  exerciseUses,
  flows,
  knowledgeTargets,
  lessons,
  levels,
  studyItems,
  units,
} from "./first-vertical-slice/l1.ts";
import type { CanonicalEntity, ContentPack } from "./types.ts";
import {
  extraCanDos,
  extraChunks,
  extraContentBlocks,
  extraExamples,
  extraExerciseItems,
  extraExerciseUses,
  extraFlows,
  extraKnowledgeTargets,
  extraLessons,
  extraStudyItems,
  routeExtensionRu,
} from "./first-vertical-slice/route-extension.ts";

const fullLessons = [...lessons, ...extraLessons];
const fullCanDos = [...canDos, ...extraCanDos];
const fullChunks = [...chunks, ...extraChunks];
const fullKnowledgeTargets = [...knowledgeTargets, ...extraKnowledgeTargets];
const fullExamples = [...examples, ...extraExamples];
const fullStudyItems = [...studyItems, ...extraStudyItems];
const fullContentBlocks = [...contentBlocks, ...extraContentBlocks];
const fullExerciseItems = [...exerciseItems, ...extraExerciseItems];
const fullExerciseUses = [...exerciseUses, ...extraExerciseUses];
const fullFlows = [...flows, ...extraFlows];
const fullUnits = units.map((unit) => ({ ...unit, lessonIds: fullLessons.filter((lesson) => lesson.lessonType === "route").map((lesson) => lesson.id), primaryCanDoIds: fullCanDos.filter((canDo) => !canDo.id.includes("checkpoint")).map((canDo) => canDo.id), checkpointId: "checkpoint:a1-1:new-room" }));
const fullLevels = levels.map((level) => ({ ...level, completionCanDoIds: fullCanDos.map((canDo) => canDo.id) }));

const canonicalEntities: CanonicalEntity[] = [
  ...readingChunks,...readingExamples,...readingStudyItems,
  ...vocabularyChunks, ...vocabularyExamples, ...vocabularyStudyItems,
  ...grammarCourses, ...grammarLevels, ...grammarUnits, ...grammarCanDos, ...grammarTargets,
  ...grammarChunks, ...grammarExamples, ...grammarStudyItems, ...grammarBlocks, ...grammarDefinitions, ...grammarItems, ...grammarLessons,
  ...courses,
  ...fullLevels,
  ...fullUnits,
  ...fullCanDos,
  ...fullKnowledgeTargets,
  ...fullChunks,
  ...fullExamples,
  ...fullStudyItems,
  ...fullContentBlocks,
  ...exerciseDefinitions,
  ...fullExerciseItems,
  ...fullLessons,
];

const revisionedEntities = [...canonicalEntities, ...fullFlows, ...grammarFlows];

export const firstVerticalSliceContentPack: ContentPack = {
  manifest: {
    manifestVersion: "first-vertical-slice.1",
    generatedAt: "2026-08-11T00:00:00.000Z",
    schemaVersions: { content: 1, lessonFlow: 1 },
    entityRevisions: Object.fromEntries(
      revisionedEntities.map((entity) => [entity.id, entity.contentRevision]),
    ),
  },
  publishedPresentationProfileIds: ["adult"],
  locales: { ru: { ...ru, ...routeExtensionRu, ...grammarRu, ...vocabularyRu,...readingRu } },
  courses: [...courses, ...grammarCourses],
  levels: [...fullLevels, ...grammarLevels],
  units: [...fullUnits, ...grammarUnits],
  canDos: [...fullCanDos, ...grammarCanDos],
  knowledgeTargets: [...fullKnowledgeTargets, ...grammarTargets],
  chunks: [...fullChunks, ...grammarChunks, ...vocabularyChunks,...readingChunks],
  examples: [...fullExamples, ...grammarExamples, ...vocabularyExamples,...readingExamples],
  studyItems: [...fullStudyItems, ...grammarStudyItems, ...vocabularyStudyItems,...readingStudyItems],
  contentBlocks: [...fullContentBlocks, ...grammarBlocks],
  exerciseDefinitions: [...exerciseDefinitions, ...grammarDefinitions],
  exerciseItems: [...fullExerciseItems, ...grammarItems],
  exerciseUses: [...fullExerciseUses, ...grammarUses],
  lessons: [...fullLessons, ...grammarLessons],
  flows: [...fullFlows, ...grammarFlows],
};
