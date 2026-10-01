export type ContentStatus = "draft" | "reviewed" | "published" | "deprecated";

export type CanonicalEntity = {
  id: string;
  schemaVersion: number;
  contentRevision: number;
  status: ContentStatus;
  locale?: "pt-PT";
  tags?: string[];
};

export type TextCatalog = Record<string, string>;

export type Course = CanonicalEntity & {
  kind: "course";
  titleKey: string;
  targetLocale: "pt-PT";
  explanationLocales: string[];
  levelIds: string[];
};

export type Level = CanonicalEntity & {
  kind: "level";
  cefr: "Pre-A1" | "A1.1" | "A1.2" | "A2";
  titleKey: string;
  unitIds: string[];
  completionCanDoIds: string[];
};

export type Unit = CanonicalEntity & {
  kind: "unit";
  titleKey: string;
  lessonIds: string[];
  primaryCanDoIds: string[];
  checkpointId?: string;
};

export type CanDoObjective = CanonicalEntity & {
  kind: "can-do";
  statementKey: string;
  cefr: "Pre-A1" | "A1.1" | "A1.2" | "A2";
  requiredKnowledgeIds: string[];
  successCriteriaKeys: string[];
};

export type KnowledgeTarget = CanonicalEntity & {
  kind: "knowledge-target";
  targetType: "grammar" | "form" | "register";
  titleKey: string;
};

export type Chunk = CanonicalEntity & {
  kind: "chunk";
  text: string;
  normalizedText: string;
  glossKey: string;
  register: "neutral" | "informal" | "formal" | "service-formula";
  exampleIds: string[];
};

export type Example = CanonicalEntity & {
  kind: "example";
  text: string;
  normalizedText: string;
  translationKey: string;
  targetIds: string[];
  difficulty: "entry" | "guided" | "transfer";
  presentationProfileIds: PresentationProfileId[];
  quality: {
    ptPtReviewed: boolean;
    translationReviewedLocales: string[];
    naturalness: "draft" | "acceptable" | "preferred";
    synthetic: boolean;
  };
};

export type ChunkStudyItem = CanonicalEntity & {
  kind: "study-item";
  target: { type: "chunk"; chunkId: string };
  display: { type: "chunk"; text: string; translationKey: string };
  defaultExampleId: string;
  cardEligible: boolean;
};

export type NounStudyItem = CanonicalEntity & {
  kind: "study-item";
  target: { type: "lexeme-sense"; senseId: string; partOfSpeech: "noun" };
  display: {
    type: "noun";
    lemma: string;
    definiteArticle: "o" | "a";
    plural: string;
    pluralDefiniteArticle: "os" | "as";
    translationKey: string;
  };
  defaultExampleId: string;
  cardEligible: boolean;
};

export type VerbStudyItem = CanonicalEntity & {
  kind: "study-item";
  target: { type: "lexeme-sense"; senseId: string; partOfSpeech: "verb" };
  display: { type: "verb"; infinitive: string; translationKey: string };
  defaultExampleId: string;
  cardEligible: boolean;
};

export type StudyItem = ChunkStudyItem | NounStudyItem | VerbStudyItem;

export type LessonTarget = {
  entityId: string;
  role: "new" | "guided" | "review" | "assessment" | "recognition-only";
  countsTowardLexicalLoad: boolean;
};

export type Lesson = CanonicalEntity & {
  kind: "lesson";
  lessonType: "route" | "checkpoint";
  titleKey: string;
  estimatedMinutes: { adult: number };
  primaryCanDoIds: string[];
  targets: LessonTarget[];
  contentBlockIds: string[];
  exerciseUseIds: string[];
  prerequisiteIds: string[];
  flowId: string;
  completionRule: {
    requiredPhaseIds: string[];
    requiredExerciseUseIds: string[];
    minimumIndependentAttempts: number;
    completionOnAttempt: boolean;
  };
};

export type ContentBlock = CanonicalEntity & {
  kind: "content-block";
  blockType: "orientation" | "meaning" | "example" | "summary";
  titleKey?: string;
  bodyKey: string;
  exampleIds: string[];
};

export type ExerciseDefinition = CanonicalEntity & {
  kind: "exercise-definition";
  interactionType: "choice" | "sentence-build";
  skill: "recognition" | "production" | "context-accuracy" | "comprehension";
};

export type ExerciseOption = {
  id: string;
  text: string;
  rationaleKey?: string;
};

export type ExerciseItem = CanonicalEntity & {
  kind: "exercise-item";
  definitionId: string;
  instructionKey: string;
  promptKey: string;
  options?: ExerciseOption[];
  correctOptionId?: string;
  acceptedTokenSequences?: string[][];
  targetIds: string[];
  primaryDiagnosticTargetId: string;
  errorCode: string;
};

export type ExerciseUse = {
  id: string;
  exerciseItemId: string;
  lessonId: string;
  phaseId: string;
  phase: "notice" | "guided" | "independent";
  required: boolean;
  order: number;
};

export type LessonPhaseType =
  | "orientation"
  | "notice"
  | "vocabulary"
  | "guided-practice"
  | "independent-use"
  | "summary";

export type LessonPhaseDefinition = {
  id: string;
  type: LessonPhaseType;
  titleKey?: string;
  contentBlockIds: string[];
  exerciseUseIds: string[];
  targetIds: string[];
  required: boolean;
  safeBoundary: boolean;
  estimatedSeconds: number;
};

export type LessonTransition = {
  fromPhaseId: string;
  toPhaseId: string;
  condition: "completed";
  priority: number;
};

export type LessonFlowDefinition = {
  id: string;
  lessonId: string;
  schemaVersion: number;
  contentRevision: number;
  profile: "chunk" | "route" | "contrast" | "scene-led" | "checkpoint";
  entryPhaseId: string;
  phases: LessonPhaseDefinition[];
  transitions: LessonTransition[];
  terminalPhaseId: string;
  resumePolicy: {
    mode: "phase-boundary" | "exercise-boundary" | "scene-state";
    maxAgeDays: number;
    onContentRevision: "resume-if-compatible" | "restart-phase" | "restart-lesson";
  };
};

export type PresentationProfileId = "adult" | "kingdoms";

export type ContentManifest = {
  manifestVersion: string;
  generatedAt: string;
  schemaVersions: Record<string, number>;
  entityRevisions: Record<string, number>;
};

export type ContentPack = {
  manifest: ContentManifest;
  publishedPresentationProfileIds: PresentationProfileId[];
  locales: { ru: TextCatalog };
  courses: Course[];
  levels: Level[];
  units: Unit[];
  canDos: CanDoObjective[];
  knowledgeTargets: KnowledgeTarget[];
  chunks: Chunk[];
  examples: Example[];
  studyItems: StudyItem[];
  contentBlocks: ContentBlock[];
  exerciseDefinitions: ExerciseDefinition[];
  exerciseItems: ExerciseItem[];
  exerciseUses: ExerciseUse[];
  lessons: Lesson[];
  flows: LessonFlowDefinition[];
};

export type LegacyVerbDeckItem = {
  id: string;
  pt: string;
  rank: number;
};
