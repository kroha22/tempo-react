/** Reusable views of existing vocabulary. Word IDs retain their canonical owners. */
export type VocabularyWord = { id: string; label: string; translation: string; acceptedAnswers?: { pt: readonly string[]; ru: readonly string[] }; noun?: { lemma: string; article: "o" | "a"; plural: string; pluralArticle: "os" | "as" }; example?: { pt: string; ru: string } };
export type VocabularySet = {
  id: string;
  title: string;
  words: readonly string[];
  sourceLabel?: string;
  sourceHref?: string;
  oddOneOut?: { answerWordId: string; distractors: readonly string[] };
};
export type VocabularySubgroup = { id: string; title: string; sets: readonly VocabularySet[] };
export type VocabularyGroup = { id: string; title: string; subgroups: readonly VocabularySubgroup[]; imageActivityIds?: readonly string[] };

export function vocabularySets(group: VocabularyGroup): readonly VocabularySet[] {
  return group.subgroups.flatMap(subgroup => subgroup.sets);
}

export function normalizeVocabularyAnswer(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ё/g, "е").trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").trim();
}
export function checkVocabularyAnswer(word: VocabularyWord, answer: string): "pt" | "ru" | "wrong" | "empty" {
  const value = normalizeVocabularyAnswer(answer);
  if (!value) return "empty";
  const withoutArticle = (text: string) => normalizeVocabularyAnswer(text).replace(/^(o|a|os|as) /, "");
  if ([word.label, ...(word.acceptedAnswers?.pt ?? [])].some(form => withoutArticle(form) === withoutArticle(value))) return "pt";
  if ([word.translation, ...(word.acceptedAnswers?.ru ?? [])].some(form => normalizeVocabularyAnswer(form) === value)) return "ru";
  return "wrong";
}

/** Allow unaccented typing unless it would merge two different answers in this set. */
export function checkVocabularyWritingAnswer(word: VocabularyWord, answer: string, words: readonly VocabularyWord[]): "correct" | "wrong" | "accent" {
  if (checkVocabularyAnswer(word,answer)!=="pt") return "wrong";
  const exact = (value:string) => value.toLocaleLowerCase("pt-PT").normalize("NFC").trim().replace(/[.!?]+$/,"").trim().replace(/\s+/g," ").replace(/^(o|a|os|as) /,"");
  const forms=[word.label,...(word.acceptedAnswers?.pt??[])];
  const ambiguous=words.some(other=>other.id!==word.id&&[other.label,...(other.acceptedAnswers?.pt??[])].some(form=>forms.some(own=>normalizeVocabularyAnswer(exact(form))===normalizeVocabularyAnswer(exact(own))&&exact(form)!==exact(own))));
  return !ambiguous||forms.some(form=>exact(form)===exact(answer))?"correct":"accent";
}
