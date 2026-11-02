import source from "./gramatica-vocabulary-source.json" with { type: "json" };
import { vocabularyDecisions, type VocabularyDecision, type WordClass } from "./gramatica-vocabulary-editorial.ts";

export type GrammarVocabularySource = {
  id: string; unit: string; stage: "preview" | "core"; pt: string; ru: string;
  source_status: string; tags: string; unique_key: string;
};
export type GrammarVocabularyEntry = {
  id: string; lexemeId: string; senseId: string; studyItemId: string; lemma: string;
  partOfSpeech: WordClass; sense: string; translation: string; forms: string[];
  examples: { pt: string; ru: string }[]; sourceRowIds: string[]; units: number[];
  noun?: VocabularyDecision["noun"]; government?: string; reused: boolean;
};
export const vocabularySources: GrammarVocabularySource[] = source.cards.map((r, i) => {
  if (r.stage !== "preview" && r.stage !== "core") throw new Error("Invalid vocabulary stage");
  return { ...r, stage: r.stage, id: `source:ga1:vocab:row-${String(i + 1).padStart(4, "0")}` };
});
const slug = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const entries = new Map<string, GrammarVocabularyEntry>();
export const vocabularySourceLinks: { sourceRowId: string; entryId: string }[] = [];
for (const row of vocabularySources) {
  const unit = Number(row.unit.slice(-2));
  const decisions = vocabularyDecisions.filter((d) => d.surfaces.includes(row.pt) && (!d.units || d.units.includes(unit)));
  if (!decisions.length) throw new Error(`Unresolved vocabulary source: ${row.id}`);
  for (const d of decisions) {
    const identity = `${d.partOfSpeech}:${slug(d.lemma)}:${d.sense}`;
    const id = `vocabulary:ga1:${identity}`;
    let entry = entries.get(id);
    if (!entry) {
      entry = { id, lexemeId: `lexeme:ga1:${d.partOfSpeech}:${slug(d.lemma)}`, senseId: `sense:ga1:${identity}`,
        studyItemId: d.existingStudyItemId ?? `study:ga1:${identity}`, lemma: d.lemma, partOfSpeech: d.partOfSpeech, sense: d.sense,
        translation: d.translation ?? row.ru, forms: [], examples: [], sourceRowIds: [], units: [],
        ...(d.noun ? { noun: d.noun } : {}), ...(d.government ? { government: d.government } : {}), reused: Boolean(d.existingStudyItemId) };
      entries.set(id, entry);
    }
    if (entry.studyItemId !== (d.existingStudyItemId ?? entry.studyItemId)) throw new Error(`Conflicting card identity: ${id}`);
    if (!entry.examples.some((e) => e.pt === d.example.pt)) entry.examples.push(d.example);
    entry.forms = [...new Set([...entry.forms, d.lemma, row.pt, ...(d.forms ?? [])])];
    entry.sourceRowIds = [...new Set([...entry.sourceRowIds, row.id])];
    entry.units = [...new Set([...entry.units, unit])].sort((a, b) => a - b);
    vocabularySourceLinks.push({ sourceRowId: row.id, entryId: id });
  }
}
export const gramaticaVocabulary = [...entries.values()];
export function vocabularyForUnit(unit?: number, stage?: "preview" | "core") {
  const sources = new Set(vocabularySources.filter((r) => (!unit || Number(r.unit.slice(-2)) === unit) && (!stage || r.stage === stage)).map((r) => r.id));
  return gramaticaVocabulary.filter((e) => e.sourceRowIds.some((id) => sources.has(id)));
}
export function vocabularyFront(entry: GrammarVocabularyEntry) {
  if (entry.noun) return entry.noun.pluralOnly ? `${entry.noun.pluralArticle} ${entry.noun.plural}` : `${entry.noun.article} ${entry.lemma} — ${entry.noun.pluralArticle} ${entry.noun.plural}`;
  if (entry.lemma === "gostava de") return "gostava de / gostaria de";
  if (entry.partOfSpeech === "chunk") return entry.lemma === "haver" ? "há / havia / houve / haverá" : entry.lemma;
  // Infinitive remains the verb front; source forms stay on the back.
  return entry.partOfSpeech === "verb" ? entry.lemma : entry.forms.join(" / ");
}
export function vocabularyHref(unit?: number) { return `/learning/gramatica-ativa/vocabulary${unit ? `/u${String(unit).padStart(2, "0")}` : ""}`; }

export function validateGramaticaVocabulary() {
  const issues: string[] = [];
  if (vocabularySources.length !== 463) issues.push("Expected all 463 source links");
  if (new Set(vocabularySources.map((r) => r.pt)).size !== 363) issues.push("Expected all 363 source spellings");
  if (new Set(vocabularySources.map((r) => r.unit)).size !== 54) issues.push("Expected all 54 source units");
  if (new Set(gramaticaVocabulary.map((e) => e.studyItemId)).size !== gramaticaVocabulary.length) issues.push("Two vocabulary meanings share a StudyItem");
  for (const e of gramaticaVocabulary) {
    if (!e.examples.length || !e.translation || !e.sourceRowIds.length) issues.push(`Incomplete vocabulary entry ${e.id}`);
    if (e.partOfSpeech === "noun" && !e.noun) issues.push(`Missing noun morphology ${e.id}`);
    if (e.partOfSpeech === "verb" && !/(?:ar|er|ir|or|ôr)(?:-se)?$/u.test(e.lemma)) issues.push(`Verb front is not an infinitive: ${e.id}`);
  }
  return issues;
}
