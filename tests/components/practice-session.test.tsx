import { describe, expect, it } from "vitest";
import { createPracticeSession, practiceSessionReducer } from "@/features/practice/practice-session";
import type { PersonKey } from "@/features/conjugation/data";

const chips: PersonKey[] = ["eles", "voces", "nos", "ele", "tu", "eu"];

function adultSession() {
  return createPracticeSession({
    initialVerbKey: "fazer",
    initialTense: "present",
    initialChildMode: false,
  });
}

describe("Practice session reducer", () => {
  it("opens the exact practice target owned by a lesson", () => {
    const initial = createPracticeSession({
      initialVerbKey: "fazer",
      initialTense: "present",
      initialChildMode: false,
      initialSection: "lessons",
    });
    const practice = practiceSessionReducer(initial, {
      type: "lessonPracticeOpened",
      target: { kind: "group", group: "ar", tense: "past" },
      chips,
    });

    expect(practice).toMatchObject({
      section: "trainer",
      group: "ar",
      tense: "past",
      verbKey: "falar",
      mode: "practice",
    });
  });

  it("opens a clean conjugation overview from the lesson catalog", () => {
    const guided = practiceSessionReducer(adultSession(), {
      type: "beingGuideOpened",
      beingVerb: "ser",
      chips,
    });
    const overview = practiceSessionReducer(guided, { type: "conjugationOverviewOpened" });

    expect(overview).toMatchObject({
      section: "trainer",
      childStep: "kingdom",
      adultBeingGuide: null,
      adultActionGuide: null,
      adultTerGuide: false,
    });
  });

  it("opens one adult guide at a time and prepares its conjugation session", () => {
    const action = practiceSessionReducer(adultSession(), {
      type: "actionGuideOpened",
      actionUse: "now",
      chips,
    });

    expect(action).toMatchObject({
      adultActionGuide: "now",
      adultBeingGuide: null,
      adultTerGuide: false,
      verbKey: "estar",
      group: "irregular",
      tense: "present",
      mode: "learn",
    });

    const being = practiceSessionReducer(action, {
      type: "beingGuideOpened",
      beingVerb: "ser",
      chips,
    });

    expect(being).toMatchObject({
      adultActionGuide: null,
      adultBeingGuide: "ser",
      adultTerGuide: false,
      verbKey: "ser",
      group: "irregular",
      tense: "present",
    });

    const ir = practiceSessionReducer(being, {
      type: "lessonPracticeOpened",
      target: { kind: "ir" },
      chips,
    });

    expect(ir).toMatchObject({
      adultBeingGuide: null,
      adultActionGuide: null,
      adultTerGuide: false,
      adultIrGuide: true,
      verbKey: "ir",
      group: "irregular",
      tense: "present",
      mode: "learn",
      irQuizChoice: null,
    });
  });

  it("keeps wrong placement feedback local and accepts equivalent forms once", () => {
    const initial = createPracticeSession({
      initialVerbKey: "falar",
      initialTense: "present",
      initialChildMode: true,
      initialChildStep: "exercise",
    });
    const selected = practiceSessionReducer(initial, { type: "chipSelected", chip: "tu" });
    const wrong = practiceSessionReducer(selected, { type: "chipPlaced", target: "eu", chip: "tu", correct: false });

    expect(wrong.mistake).toBe("eu");
    expect(wrong.placed).toEqual({});
    expect(wrong.selectedChip).toBe("tu");

    const cleared = practiceSessionReducer(wrong, { type: "mistakeCleared", target: "eu" });
    const placed = practiceSessionReducer(cleared, { type: "chipPlaced", target: "eu", chip: "eu", correct: true });
    const duplicate = practiceSessionReducer(placed, { type: "chipPlaced", target: "tu", chip: "eu", correct: true });

    expect(placed.placed).toEqual({ eu: "eu" });
    expect(placed.selectedChip).toBeNull();
    expect(duplicate).toBe(placed);
  });

  it("resets exercise-only state without losing the selected presentation", () => {
    const initial = createPracticeSession({
      initialVerbKey: "fazer",
      initialTense: "past",
      initialChildMode: true,
      initialChildStep: "exercise",
    });
    const answered = practiceSessionReducer(initial, { type: "quizAnswered", selection: "fiz", correct: true });
    const reset = practiceSessionReducer(answered, {
      type: "exerciseReset",
      payload: { mode: "practice", verbKey: "ter", chips },
    });

    expect(reset).toMatchObject({
      childMode: true,
      childStep: "exercise",
      tense: "past",
      verbKey: "ter",
      mode: "practice",
      round: 1,
      quizSelection: null,
      quizResult: null,
      selectedChip: null,
      mistake: null,
    });
    expect(reset.chips).toEqual(chips);
  });

  it("locks a quiz answer until the next question", () => {
    const answered = practiceSessionReducer(adultSession(), { type: "quizAnswered", selection: "faço", correct: true });
    const repeated = practiceSessionReducer(answered, { type: "quizAnswered", selection: "faz", correct: false });
    const next = practiceSessionReducer(repeated, { type: "nextQuestion", chips });

    expect(repeated).toBe(answered);
    expect(next.quizSelection).toBeNull();
    expect(next.quizResult).toBeNull();
    expect(next.round).toBe(1);
  });
});
