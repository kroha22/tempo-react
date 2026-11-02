import { diagnosticPassed, grammarTasks, type GrammarLesson } from "../../content/gramatica-ativa.ts";
import type { GrammarSnapshot } from "../progress/dto.ts";

export function grammarStart(): GrammarSnapshot {
  return { sessionId: `session:${crypto.randomUUID()}`, phase: "diagnostic", index: 0, answers: {} };
}
export function currentGrammarTask(lesson: GrammarLesson, snapshot: GrammarSnapshot) {
  return snapshot.phase === "rule" ? undefined : grammarTasks(lesson, snapshot.phase)[snapshot.index];
}
export function validGrammarSnapshot(lesson: GrammarLesson, snapshot: GrammarSnapshot) {
  return (snapshot.phase === "rule" ? snapshot.index === 0 : Boolean(currentGrammarTask(lesson, snapshot))) &&
    Object.keys(snapshot.answers).every((id) => lesson.tasks.some((task) => task.id === id));
}
export function nextGrammarStep(lesson: GrammarLesson, snapshot: GrammarSnapshot): GrammarSnapshot | null {
  if (snapshot.phase === "rule") return { ...snapshot, phase: diagnosticPassed(lesson, snapshot.answers) ? "exit" : "guided", index: 0 };
  const task = currentGrammarTask(lesson, snapshot);
  if (!task || !Object.hasOwn(snapshot.answers, task.id)) return snapshot;
  if (snapshot.index + 1 < grammarTasks(lesson, snapshot.phase).length) return { ...snapshot, index: snapshot.index + 1 };
  if (snapshot.phase === "exit") return null;
  return { ...snapshot, phase: snapshot.phase === "diagnostic" ? "rule" : "exit", index: 0 };
}
