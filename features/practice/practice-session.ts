import { people, verbs, type PersonKey, type Tense, type VerbGroup, type VerbKey } from "@/features/conjugation/data";
import { verbKeysForGroup } from "@/features/conjugation/resolver";
import type { ActionUse, BeingVerb, ChildStep, PracticeMode, PracticeSection, QuizResult } from "./practice-types";

export type PracticeSession = {
  section: PracticeSection;
  childMode: boolean;
  childStep: ChildStep;
  beingVerb: BeingVerb;
  adultBeingGuide: BeingVerb | null;
  actionUse: ActionUse;
  adultActionGuide: ActionUse | null;
  adultTerGuide: boolean;
  actionQuizChoice: string | null;
  verbKey: VerbKey;
  tense: Tense;
  group: VerbGroup;
  mode: PracticeMode;
  round: number;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  quizSelection: string | null;
  quizResult: QuizResult;
};

type ResetPayload = {
  mode?: PracticeMode;
  verbKey?: VerbKey;
  chips: PersonKey[];
};

export type PracticeSessionAction =
  | { type: "sectionChanged"; section: PracticeSection }
  | { type: "childModeChanged"; childMode: boolean }
  | { type: "childStepChanged"; childStep: ChildStep }
  | { type: "exerciseReset"; payload: ResetPayload }
  | { type: "chipSelected"; chip: PersonKey | null }
  | { type: "chipPlaced"; target: PersonKey; chip: PersonKey; correct: boolean }
  | { type: "mistakeCleared"; target: PersonKey }
  | { type: "verbStepped"; direction: -1 | 1; chips: PersonKey[] }
  | { type: "groupChanged"; group: VerbGroup; chips: PersonKey[] }
  | { type: "kingdomChosen"; group: VerbGroup; chips: PersonKey[] }
  | { type: "beingGuideOpened"; beingVerb: BeingVerb; chips: PersonKey[] }
  | { type: "beingVerbChanged"; beingVerb: BeingVerb; chips: PersonKey[] }
  | { type: "beingSunModeChanged"; mode: Extract<PracticeMode, "learn" | "practice">; chips: PersonKey[] }
  | { type: "beingGuideClosed" }
  | { type: "actionGuideOpened"; actionUse: ActionUse; chips: PersonKey[] }
  | { type: "actionUseChanged"; actionUse: ActionUse; chips: PersonKey[] }
  | { type: "actionQuizAnswered"; choice: string }
  | { type: "actionSunModeChanged"; mode: Extract<PracticeMode, "learn" | "practice">; chips: PersonKey[] }
  | { type: "actionGuideClosed" }
  | { type: "terGuideOpened"; chips: PersonKey[] }
  | { type: "terSunModeChanged"; mode: Extract<PracticeMode, "learn" | "practice">; chips: PersonKey[] }
  | { type: "terGuideClosed" }
  | { type: "childRulesRequested" }
  | { type: "tenseChanged"; tense: Tense; chips: PersonKey[] }
  | { type: "quizAnswered"; selection: string; correct: boolean }
  | { type: "nextQuestion"; chips: PersonKey[] };

export type CreatePracticeSessionOptions = {
  initialVerbKey: VerbKey;
  initialTense: Tense;
  initialChildMode: boolean;
  initialChildStep?: ChildStep;
};

export function createPracticeSession({
  initialVerbKey,
  initialTense,
  initialChildMode,
  initialChildStep,
}: CreatePracticeSessionOptions): PracticeSession {
  return {
    section: "trainer",
    childMode: initialChildMode,
    childStep: initialChildMode ? initialChildStep ?? "exercise" : "kingdom",
    beingVerb: "ser",
    adultBeingGuide: null,
    actionUse: "habit",
    adultActionGuide: null,
    adultTerGuide: false,
    actionQuizChoice: null,
    verbKey: initialVerbKey,
    tense: initialTense,
    group: verbs[initialVerbKey].group,
    mode: "learn",
    round: 0,
    chips: people.map((person) => person.key),
    placed: {},
    selectedChip: null,
    mistake: null,
    quizSelection: null,
    quizResult: null,
  };
}

function resetExercise(state: PracticeSession, { mode = state.mode, verbKey = state.verbKey, chips }: ResetPayload): PracticeSession {
  return {
    ...state,
    mode,
    verbKey,
    placed: {},
    selectedChip: null,
    mistake: null,
    quizSelection: null,
    quizResult: null,
    round: state.round + 1,
    chips,
  };
}

function prepareBeingLesson(state: PracticeSession, beingVerb: BeingVerb, chips: PersonKey[]): PracticeSession {
  return resetExercise({ ...state, beingVerb, group: "irregular", tense: "present" }, { mode: "learn", verbKey: beingVerb, chips });
}

function actionVerb(actionUse: ActionUse): VerbKey {
  return actionUse === "habit" ? "falar" : "estar";
}

function prepareActionLesson(state: PracticeSession, actionUse: ActionUse, chips: PersonKey[]): PracticeSession {
  const verbKey = actionVerb(actionUse);
  return resetExercise(
    { ...state, actionUse, actionQuizChoice: null, tense: "present", group: verbs[verbKey].group },
    { mode: "learn", verbKey, chips },
  );
}

function prepareTerLesson(state: PracticeSession, chips: PersonKey[]): PracticeSession {
  return resetExercise({ ...state, group: "irregular", tense: "present" }, { mode: "learn", verbKey: "ter", chips });
}

export function practiceSessionReducer(state: PracticeSession, action: PracticeSessionAction): PracticeSession {
  switch (action.type) {
    case "sectionChanged":
      return { ...state, section: action.section };
    case "childModeChanged":
      return {
        ...state,
        childMode: action.childMode,
        childStep: "kingdom",
        adultBeingGuide: null,
        adultActionGuide: null,
        adultTerGuide: false,
      };
    case "childStepChanged":
      return { ...state, childStep: action.childStep };
    case "exerciseReset":
      return resetExercise(state, action.payload);
    case "chipSelected":
      return { ...state, selectedChip: action.chip };
    case "chipPlaced": {
      if (state.placed[action.target] || Object.values(state.placed).includes(action.chip)) return state;
      if (!action.correct) return { ...state, mistake: action.target };
      return {
        ...state,
        placed: { ...state.placed, [action.target]: action.chip },
        selectedChip: null,
        mistake: null,
      };
    }
    case "mistakeCleared":
      return state.mistake === action.target ? { ...state, mistake: null } : state;
    case "verbStepped": {
      const availableVerbKeys = verbKeysForGroup(state.group);
      const currentIndex = availableVerbKeys.indexOf(state.verbKey);
      const nextIndex = (currentIndex + action.direction + availableVerbKeys.length) % availableVerbKeys.length;
      return resetExercise(state, { verbKey: availableVerbKeys[nextIndex] ?? state.verbKey, chips: action.chips });
    }
    case "groupChanged": {
      const verbKey = verbKeysForGroup(action.group)[0] ?? state.verbKey;
      return resetExercise({ ...state, group: action.group }, { verbKey, chips: action.chips });
    }
    case "kingdomChosen": {
      const verbKey = verbKeysForGroup(action.group)[0] ?? state.verbKey;
      return resetExercise({ ...state, group: action.group, childStep: "rules" }, { verbKey, chips: action.chips });
    }
    case "beingGuideOpened": {
      const next = prepareBeingLesson(state, action.beingVerb, action.chips);
      return state.childMode
        ? { ...next, childStep: "special" }
        : { ...next, adultBeingGuide: action.beingVerb, adultActionGuide: null, adultTerGuide: false };
    }
    case "beingVerbChanged": {
      const next = prepareBeingLesson(state, action.beingVerb, action.chips);
      return state.childMode ? next : { ...next, adultBeingGuide: action.beingVerb };
    }
    case "beingSunModeChanged":
      return resetExercise(state, { mode: action.mode, verbKey: state.beingVerb, chips: action.chips });
    case "beingGuideClosed":
      return state.childMode ? { ...state, childStep: "kingdom" } : { ...state, adultBeingGuide: null };
    case "actionGuideOpened": {
      const next = prepareActionLesson(state, action.actionUse, action.chips);
      return state.childMode
        ? { ...next, childStep: "action" }
        : { ...next, adultBeingGuide: null, adultActionGuide: action.actionUse, adultTerGuide: false };
    }
    case "actionUseChanged": {
      const next = prepareActionLesson(state, action.actionUse, action.chips);
      return state.childMode ? next : { ...next, adultActionGuide: action.actionUse };
    }
    case "actionQuizAnswered":
      return { ...state, actionQuizChoice: action.choice };
    case "actionSunModeChanged":
      return resetExercise(state, { mode: action.mode, verbKey: actionVerb(state.actionUse), chips: action.chips });
    case "actionGuideClosed":
      return state.childMode ? { ...state, childStep: "kingdom" } : { ...state, adultActionGuide: null };
    case "terGuideOpened": {
      const next = prepareTerLesson(state, action.chips);
      return state.childMode
        ? { ...next, childStep: "ter" }
        : { ...next, adultBeingGuide: null, adultActionGuide: null, adultTerGuide: true };
    }
    case "terSunModeChanged":
      return resetExercise(state, { mode: action.mode, verbKey: "ter", chips: action.chips });
    case "terGuideClosed":
      return state.childMode ? { ...state, childStep: "kingdom" } : { ...state, adultTerGuide: false };
    case "childRulesRequested":
      return state.verbKey === "ser" || state.verbKey === "estar"
        ? { ...state, beingVerb: state.verbKey, childStep: "special" }
        : { ...state, childStep: "rules" };
    case "tenseChanged":
      return resetExercise({ ...state, tense: action.tense }, { chips: action.chips });
    case "quizAnswered":
      return state.quizResult
        ? state
        : { ...state, quizSelection: action.selection, quizResult: action.correct ? "correct" : "wrong" };
    case "nextQuestion":
      return {
        ...state,
        quizSelection: null,
        quizResult: null,
        round: state.round + 1,
        chips: action.chips,
      };
  }
}
