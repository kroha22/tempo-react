import type { GrammarLesson, GrammarStage, GrammarTask } from "./gramatica-ativa.ts";

export type GrammarSeed = [slug: string, prompt: string, answer: string | string[], explanation: string, distractors?: string[]];
function tasks(slug: string, stage: GrammarStage, rows: GrammarSeed[]): GrammarTask[] {
  return rows.map(([key, prompt, answer, explanation, distractors], index) => {
    const answers = Array.isArray(answer) ? answer : [answer];
    const options = distractors ? [answers[0], ...distractors] : undefined;
    if (options) options.push(...options.splice(0, index % options.length));
    return { id: `exercise:ga1:${slug}:${stage}:${key}`, stage, prompt, answers, options,
      explanation, target: `grammar:ga1:${slug}`, critical: stage === "exit" && index === 4 };
  });
}
export function grammarLesson(slug: string, unit: number, title: string, canDo: string, rule: string,
  examples: GrammarLesson["examples"], vocabulary: GrammarLesson["vocabulary"], review: string[],
  diagnostic: GrammarSeed[], guided: GrammarSeed[], exit: GrammarSeed[]): GrammarLesson {
  return { id: `lesson:ga1:${slug}`, slug, unit, title, canDo, rule, examples, vocabulary, review,
    tasks: [...tasks(slug, "diagnostic", diagnostic), ...tasks(slug, "guided", guided), ...tasks(slug, "exit", exit)] };
}
