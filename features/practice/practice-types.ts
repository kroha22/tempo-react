export type PracticeMode = "learn" | "practice" | "choose" | "reverse";
export type PracticeSection = "trainer" | "lessons" | "vocabulary" | "cards";
export type BeingVerb = "ser" | "estar";
export type ActionUse = "habit" | "now";
export type QuizResult = "correct" | "wrong" | null;

export type ChildStep = "kingdom" | "rules" | "special" | "action" | "ter" | "ir" | "exercise";

export type LessonPracticeTarget =
  | { kind: "group"; group: "ar" | "er" | "ir" | "irregular"; tense: "present" | "past" }
  | { kind: "verb"; verbKey: "fazer" | "ir"; tense: "present" | "past" }
  | { kind: "being"; beingVerb: BeingVerb }
  | { kind: "action"; actionUse: ActionUse }
  | { kind: "ter" }
  | { kind: "ir" };
