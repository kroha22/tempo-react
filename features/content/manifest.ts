import { ru } from "./locale/ru.ts";
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

const revisionedEntities = [...canonicalEntities, ...fullFlows];

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
  locales: { ru: { ...ru, ...routeExtensionRu } },
  courses,
  levels: fullLevels,
  units: fullUnits,
  canDos: fullCanDos,
  knowledgeTargets: fullKnowledgeTargets,
  chunks: fullChunks,
  examples: fullExamples,
  studyItems: fullStudyItems,
  contentBlocks: fullContentBlocks,
  exerciseDefinitions,
  exerciseItems: fullExerciseItems,
  exerciseUses: fullExerciseUses,
  lessons: fullLessons,
  flows: fullFlows,
};
