import { gramaticaVocabulary } from "./gramatica-vocabulary.ts";
import type { Chunk, Example, StudyItem } from "./types.ts";

const base = { schemaVersion: 1, contentRevision: 1, status: "reviewed" as const };
export const vocabularyRu: Record<string, string> = {};
const newEntries = gramaticaVocabulary.filter((e) => !e.reused);
export const vocabularyExamples: Example[] = newEntries.flatMap((e) => e.examples.map((example, index) => {
  const translationKey = `${e.id}.example-${index}.ru`;
  vocabularyRu[translationKey] = example.ru;
  return { ...base, id: `example:${e.id}:${index}`, kind: "example", locale: "pt-PT", text: example.pt, normalizedText: example.pt.toLocaleLowerCase("pt-PT"), translationKey, targetIds: [e.studyItemId], difficulty: "entry", presentationProfileIds: ["adult"], quality: { ptPtReviewed: true, translationReviewedLocales: ["ru"], naturalness: "preferred", synthetic: true } };
}));
export const vocabularyChunks: Chunk[] = newEntries.filter((e) => e.partOfSpeech === "chunk").map((e) => {
  const glossKey = `${e.id}.ru`; vocabularyRu[glossKey] = e.translation;
  return { ...base, id: `chunk:${e.id}`, kind: "chunk", locale: "pt-PT", text: e.lemma, normalizedText: e.lemma.toLocaleLowerCase("pt-PT"), glossKey, register: "neutral", exampleIds: [`example:${e.id}:0`] };
});
export const vocabularyStudyItems: StudyItem[] = newEntries.map((e): StudyItem => {
  const translationKey = `${e.id}.ru`; vocabularyRu[translationKey] = e.translation;
  const common = { ...base, id: e.studyItemId, kind: "study-item" as const, defaultExampleId: `example:${e.id}:0`, cardEligible: true };
  if (e.partOfSpeech === "noun") {
    if (!e.noun) throw new Error(`Missing noun morphology: ${e.id}`);
    return { ...common, target: { type: "lexeme-sense", senseId: e.senseId, partOfSpeech: "noun" }, display: { type: "noun", lemma: e.lemma, definiteArticle: e.noun.article, plural: e.noun.plural, pluralDefiniteArticle: e.noun.pluralArticle, ...(e.noun.pluralOnly ? { pluralOnly: true } : {}), translationKey } };
  }
  if (e.partOfSpeech === "verb") return { ...common, target: { type: "lexeme-sense", senseId: e.senseId, partOfSpeech: "verb" }, display: { type: "verb", infinitive: e.lemma, translationKey } };
  if (e.partOfSpeech === "chunk") return { ...common, target: { type: "chunk", chunkId: `chunk:${e.id}` }, display: { type: "chunk", text: e.lemma, translationKey } };
  return { ...common, target: { type: "lexeme-sense", senseId: e.senseId, partOfSpeech: e.partOfSpeech }, display: { type: "word", text: e.lemma, partOfSpeech: e.partOfSpeech, translationKey } };
});
