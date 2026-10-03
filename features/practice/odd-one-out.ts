import type { VocabularySet } from "../content/vocabulary-model.ts";

export type GeneratedOddTask = { id: string; words: readonly string[]; odd: string; place: string; explanation: string };

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Randomness is injected: a round is generated once, never during render/checking. */
export function generateOddTasks(sets: readonly VocabularySet[], random: () => number): GeneratedOddTask[] {
  return shuffled(sets.filter(set => set.oddOneOut), random).map(set => {
    const rule = set.oddOneOut!;
    const candidates = [...new Set(rule.distractors)].filter(id => !set.words.includes(id));
    if (new Set(set.words).size < 4 || !candidates.length) throw new Error(`Invalid odd-one-out set: ${set.id}`);
    const odd = candidates[Math.floor(random() * candidates.length)];
    return { id: set.id, words: shuffled([...shuffled([...new Set(set.words)], random).slice(0, 4), odd], random), odd, place: rule.answerWordId,
      explanation: `Эти четыре слова относятся к группе «${set.title.toLowerCase()}».` };
  });
}
