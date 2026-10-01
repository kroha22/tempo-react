import type {
  CanDoObjective,
  Chunk,
  ContentBlock,
  Course,
  Example,
  ExerciseDefinition,
  ExerciseItem,
  ExerciseUse,
  KnowledgeTarget,
  Lesson,
  LessonFlowDefinition,
  Level,
  StudyItem,
  Unit,
} from "../types.ts";

const base = {
  schemaVersion: 1,
  contentRevision: 1,
  status: "reviewed" as const,
};

export const courses: Course[] = [
  {
    ...base,
    id: "course:pt-pt:a1-a2",
    kind: "course",
    titleKey: "course.title",
    targetLocale: "pt-PT",
    explanationLocales: ["ru"],
    levelIds: ["level:a1-1"],
  },
];

export const levels: Level[] = [
  {
    ...base,
    id: "level:a1-1",
    kind: "level",
    cefr: "A1.1",
    titleKey: "level.a1-1.title",
    unitIds: ["unit:a1-1:self-and-space"],
    completionCanDoIds: ["cando:introduce-yourself"],
  },
];

export const units: Unit[] = [
  {
    ...base,
    id: "unit:a1-1:self-and-space",
    kind: "unit",
    titleKey: "unit.self-and-space.title",
    lessonIds: ["lesson:a1-1:introduce-yourself"],
    primaryCanDoIds: ["cando:introduce-yourself"],
  },
];

export const canDos: CanDoObjective[] = [
  {
    ...base,
    id: "cando:introduce-yourself",
    kind: "can-do",
    statementKey: "cando.introduce-yourself",
    cefr: "A1.1",
    requiredKnowledgeIds: [
      "chunk:como-te-chamas",
      "chunk:chamo-me",
      "grammar:register:tu-entry",
      "form:ser:1s:pres-ind",
    ],
    successCriteriaKeys: ["cando.introduce-yourself.success.exchange"],
  },
];

export const knowledgeTargets: KnowledgeTarget[] = [
  {
    ...base,
    id: "grammar:register:tu-entry",
    kind: "knowledge-target",
    targetType: "register",
    titleKey: "target.register-tu.title",
  },
  {
    ...base,
    id: "form:ser:1s:pres-ind",
    kind: "knowledge-target",
    targetType: "form",
    titleKey: "target.ser-1s.title",
  },
];

export const chunks: Chunk[] = [
  {
    ...base,
    id: "chunk:ola",
    kind: "chunk",
    locale: "pt-PT",
    text: "Olá!",
    normalizedText: "olá",
    glossKey: "chunk.ola.gloss",
    register: "neutral",
    exampleIds: ["example:ola-chamo-me-rita"],
  },
  {
    ...base,
    id: "chunk:como-te-chamas",
    kind: "chunk",
    locale: "pt-PT",
    text: "Como te chamas?",
    normalizedText: "como te chamas",
    glossKey: "chunk.como-te-chamas.gloss",
    register: "informal",
    exampleIds: ["example:como-te-chamas-rita"],
  },
  {
    ...base,
    id: "chunk:chamo-me",
    kind: "chunk",
    locale: "pt-PT",
    text: "Chamo-me ...",
    normalizedText: "chamo-me",
    glossKey: "chunk.chamo-me.gloss",
    register: "neutral",
    exampleIds: ["example:ola-chamo-me-rita", "example:como-te-chamas-rita"],
  },
  {
    ...base,
    id: "chunk:sou-name",
    kind: "chunk",
    locale: "pt-PT",
    text: "Sou ...",
    normalizedText: "sou",
    glossKey: "chunk.sou-name.gloss",
    register: "neutral",
    exampleIds: ["example:eu-sou-rita", "example:sou-miguel"],
  },
  {
    ...base,
    id: "chunk:muito-prazer",
    kind: "chunk",
    locale: "pt-PT",
    text: "Muito prazer.",
    normalizedText: "muito prazer",
    glossKey: "chunk.muito-prazer.gloss",
    register: "service-formula",
    exampleIds: ["example:ola-chamo-me-rita"],
  },
];

const reviewedQuality = {
  ptPtReviewed: true,
  translationReviewedLocales: ["ru"],
  naturalness: "preferred" as const,
  synthetic: true,
};

export const examples: Example[] = [
  {
    ...base,
    id: "example:ola-chamo-me-rita",
    kind: "example",
    locale: "pt-PT",
    text: "Olá! Chamo-me Rita. Muito prazer.",
    normalizedText: "olá chamo-me rita muito prazer",
    translationKey: "example.ola-chamo-me-rita.ru",
    targetIds: ["chunk:ola", "chunk:chamo-me", "chunk:muito-prazer"],
    difficulty: "entry",
    presentationProfileIds: ["adult"],
    quality: reviewedQuality,
  },
  {
    ...base,
    id: "example:como-te-chamas-rita",
    kind: "example",
    locale: "pt-PT",
    text: "Como te chamas? — Chamo-me Rita.",
    normalizedText: "como te chamas chamo-me rita",
    translationKey: "example.como-te-chamas-rita.ru",
    targetIds: ["chunk:como-te-chamas", "chunk:chamo-me"],
    difficulty: "guided",
    presentationProfileIds: ["adult"],
    quality: reviewedQuality,
  },
  {
    ...base,
    id: "example:eu-sou-rita",
    kind: "example",
    locale: "pt-PT",
    text: "Eu sou a Rita.",
    normalizedText: "eu sou a rita",
    translationKey: "example.eu-sou-rita.ru",
    targetIds: ["chunk:sou-name", "form:ser:1s:pres-ind"],
    difficulty: "entry",
    presentationProfileIds: ["adult"],
    quality: reviewedQuality,
  },
  {
    ...base,
    id: "example:sou-miguel",
    kind: "example",
    locale: "pt-PT",
    text: "Sou o Miguel.",
    normalizedText: "sou o miguel",
    translationKey: "example.sou-miguel.ru",
    targetIds: ["chunk:sou-name", "form:ser:1s:pres-ind"],
    difficulty: "transfer",
    presentationProfileIds: ["adult"],
    quality: reviewedQuality,
  },
];

export const studyItems: StudyItem[] = chunks.map((chunk) => ({
  ...base,
  id: `study:${chunk.id}`,
  kind: "study-item" as const,
  target: { type: "chunk" as const, chunkId: chunk.id },
  display: {
    type: "chunk" as const,
    text: chunk.text,
    translationKey: chunk.glossKey,
  },
  defaultExampleId: chunk.exampleIds[0],
  cardEligible: true,
}));

export const contentBlocks: ContentBlock[] = [
  {
    ...base,
    id: "block:introduce-yourself:orientation",
    kind: "content-block",
    blockType: "orientation",
    titleKey: "l1.orientation.title",
    bodyKey: "l1.orientation.body",
    exampleIds: ["example:ola-chamo-me-rita"],
  },
  {
    ...base,
    id: "block:introduce-yourself:paired-chunks",
    kind: "content-block",
    blockType: "meaning",
    bodyKey: "l1.paired-chunks.body",
    exampleIds: ["example:como-te-chamas-rita"],
  },
  {
    ...base,
    id: "block:introduce-yourself:summary",
    kind: "content-block",
    blockType: "summary",
    bodyKey: "l1.summary.body",
    exampleIds: [],
  },
];

export const exerciseDefinitions: ExerciseDefinition[] = [
  {
    ...base,
    id: "exercise-definition:choice",
    kind: "exercise-definition",
    interactionType: "choice",
    skill: "comprehension",
  },
  {
    ...base,
    id: "exercise-definition:sentence-build",
    kind: "exercise-definition",
    interactionType: "sentence-build",
    skill: "production",
  },
];

export const exerciseItems: ExerciseItem[] = [
  {
    ...base,
    id: "exercise:intro:answer-chamo-me",
    kind: "exercise-item",
    definitionId: "exercise-definition:choice",
    instructionKey: "exercise.intro.answer.instruction",
    promptKey: "exercise.intro.answer.prompt",
    options: [
      { id: "answer:chamo-me-rita", text: "Chamo-me Rita." },
      { id: "answer:sou-bem", text: "Sou bem.", rationaleKey: "exercise.intro.answer.wrong-sou-bem" },
      { id: "answer:muito-prazer", text: "Muito prazer.", rationaleKey: "exercise.intro.answer.wrong-prazer" },
    ],
    correctOptionId: "answer:chamo-me-rita",
    targetIds: ["chunk:como-te-chamas", "chunk:chamo-me"],
    primaryDiagnosticTargetId: "chunk:chamo-me",
    errorCode: "INTRO_RESPONSE_MISMATCH",
  },
  {
    ...base,
    id: "exercise:intro:build-chamo-me-rita",
    kind: "exercise-item",
    definitionId: "exercise-definition:sentence-build",
    instructionKey: "exercise.intro.build-name.instruction",
    promptKey: "exercise.intro.build-name.prompt",
    acceptedTokenSequences: [["Chamo-me", "Rita", "."]],
    targetIds: ["chunk:chamo-me"],
    primaryDiagnosticTargetId: "chunk:chamo-me",
    errorCode: "CHUNK_SEQUENCE",
  },
  {
    ...base,
    id: "exercise:intro:order-short-exchange",
    kind: "exercise-item",
    definitionId: "exercise-definition:sentence-build",
    instructionKey: "exercise.intro.order.instruction",
    promptKey: "exercise.intro.order.prompt",
    acceptedTokenSequences: [["Olá!", "Como te chamas?", "Chamo-me Rita.", "Muito prazer."]],
    targetIds: ["chunk:ola", "chunk:como-te-chamas", "chunk:chamo-me", "chunk:muito-prazer"],
    primaryDiagnosticTargetId: "chunk:como-te-chamas",
    errorCode: "DIALOGUE_SEQUENCE",
  },
  {
    ...base,
    id: "exercise:intro:transfer-miguel",
    kind: "exercise-item",
    definitionId: "exercise-definition:sentence-build",
    instructionKey: "exercise.intro.transfer.instruction",
    promptKey: "exercise.intro.transfer.prompt",
    acceptedTokenSequences: [["Olá!", "Como te chamas?", "Sou o Miguel.", "Muito prazer."]],
    targetIds: ["chunk:ola", "chunk:como-te-chamas", "chunk:sou-name", "chunk:muito-prazer"],
    primaryDiagnosticTargetId: "chunk:sou-name",
    errorCode: "INTRO_REQUIRED_CHUNK",
  },
];

export const exerciseUses: ExerciseUse[] = [
  {
    id: "use:l1:notice-answer",
    exerciseItemId: "exercise:intro:answer-chamo-me",
    lessonId: "lesson:a1-1:introduce-yourself",
    phaseId: "phase:introduce-yourself:notice-answer",
    phase: "notice",
    required: true,
    order: 1,
  },
  {
    id: "use:l1:build-name",
    exerciseItemId: "exercise:intro:build-chamo-me-rita",
    lessonId: "lesson:a1-1:introduce-yourself",
    phaseId: "phase:introduce-yourself:guided-name",
    phase: "guided",
    required: true,
    order: 2,
  },
  {
    id: "use:l1:dialogue-order",
    exerciseItemId: "exercise:intro:order-short-exchange",
    lessonId: "lesson:a1-1:introduce-yourself",
    phaseId: "phase:introduce-yourself:guided-order",
    phase: "guided",
    required: true,
    order: 3,
  },
  {
    id: "use:l1:independent-exchange",
    exerciseItemId: "exercise:intro:transfer-miguel",
    lessonId: "lesson:a1-1:introduce-yourself",
    phaseId: "phase:introduce-yourself:independent-exchange",
    phase: "independent",
    required: true,
    order: 4,
  },
];

const requiredPhaseIds = [
  "phase:introduce-yourself:orientation",
  "phase:introduce-yourself:notice-answer",
  "phase:introduce-yourself:paired-chunks",
  "phase:introduce-yourself:guided-name",
  "phase:introduce-yourself:guided-order",
  "phase:introduce-yourself:independent-exchange",
  "phase:introduce-yourself:summary",
];

export const lessons: Lesson[] = [
  {
    ...base,
    id: "lesson:a1-1:introduce-yourself",
    kind: "lesson",
    lessonType: "route",
    titleKey: "lesson.introduce-yourself.title",
    estimatedMinutes: { adult: 6 },
    primaryCanDoIds: ["cando:introduce-yourself"],
    targets: [
      ...chunks.map((chunk) => ({
        entityId: chunk.id,
        role: "new" as const,
        countsTowardLexicalLoad: true,
      })),
      {
        entityId: "grammar:register:tu-entry",
        role: "guided",
        countsTowardLexicalLoad: false,
      },
      {
        entityId: "form:ser:1s:pres-ind",
        role: "review",
        countsTowardLexicalLoad: false,
      },
    ],
    contentBlockIds: contentBlocks.map((block) => block.id),
    exerciseUseIds: exerciseUses.map((use) => use.id),
    prerequisiteIds: [],
    flowId: "flow:introduce-yourself:adult-v1",
    completionRule: {
      requiredPhaseIds,
      requiredExerciseUseIds: exerciseUses.map((use) => use.id),
      minimumIndependentAttempts: 1,
      completionOnAttempt: true,
    },
  },
];

export const flows: LessonFlowDefinition[] = [
  {
    id: "flow:introduce-yourself:adult-v1",
    lessonId: "lesson:a1-1:introduce-yourself",
    schemaVersion: 1,
    contentRevision: 1,
    profile: "chunk",
    entryPhaseId: requiredPhaseIds[0],
    phases: [
      {
        id: requiredPhaseIds[0],
        type: "orientation",
        contentBlockIds: ["block:introduce-yourself:orientation"],
        exerciseUseIds: [],
        targetIds: ["chunk:ola", "chunk:chamo-me", "chunk:muito-prazer"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 45,
      },
      {
        id: requiredPhaseIds[1],
        type: "notice",
        contentBlockIds: [],
        exerciseUseIds: ["use:l1:notice-answer"],
        targetIds: ["chunk:como-te-chamas", "chunk:chamo-me"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 45,
      },
      {
        id: requiredPhaseIds[2],
        type: "vocabulary",
        contentBlockIds: ["block:introduce-yourself:paired-chunks"],
        exerciseUseIds: [],
        targetIds: ["chunk:como-te-chamas", "chunk:chamo-me"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 50,
      },
      {
        id: requiredPhaseIds[3],
        type: "guided-practice",
        contentBlockIds: [],
        exerciseUseIds: ["use:l1:build-name"],
        targetIds: ["chunk:chamo-me"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 55,
      },
      {
        id: requiredPhaseIds[4],
        type: "guided-practice",
        contentBlockIds: [],
        exerciseUseIds: ["use:l1:dialogue-order"],
        targetIds: ["chunk:ola", "chunk:como-te-chamas", "chunk:chamo-me", "chunk:muito-prazer"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 65,
      },
      {
        id: requiredPhaseIds[5],
        type: "independent-use",
        contentBlockIds: [],
        exerciseUseIds: ["use:l1:independent-exchange"],
        targetIds: ["chunk:ola", "chunk:como-te-chamas", "chunk:sou-name", "chunk:muito-prazer"],
        required: true,
        safeBoundary: true,
        estimatedSeconds: 75,
      },
      {
        id: requiredPhaseIds[6],
        type: "summary",
        contentBlockIds: ["block:introduce-yourself:summary"],
        exerciseUseIds: [],
        targetIds: chunks.map((chunk) => chunk.id),
        required: true,
        safeBoundary: true,
        estimatedSeconds: 45,
      },
    ],
    transitions: requiredPhaseIds.slice(0, -1).map((phaseId, index) => ({
      fromPhaseId: phaseId,
      toPhaseId: requiredPhaseIds[index + 1],
      condition: "completed" as const,
      priority: 1,
    })),
    terminalPhaseId: requiredPhaseIds.at(-1)!,
    resumePolicy: {
      mode: "phase-boundary",
      maxAgeDays: 30,
      onContentRevision: "resume-if-compatible",
    },
  },
];
