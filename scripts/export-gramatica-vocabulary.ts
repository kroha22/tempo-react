import { mkdir, writeFile } from "node:fs/promises";
import { gramaticaVocabulary, vocabularySourceLinks, vocabularySources, validateGramaticaVocabulary } from "../features/content/gramatica-vocabulary.ts";

const errors = validateGramaticaVocabulary();
if (errors.length) throw new Error(errors.join("\n"));
const directory = new URL("../outputs/gramatica-ativa-1/", import.meta.url);
await mkdir(directory, { recursive: true });
const lexemes = [...new Map(gramaticaVocabulary.map((entry) => [entry.lexemeId, { id: entry.lexemeId, lemma: entry.lemma, partOfSpeech: entry.partOfSpeech }])).values()];
await writeFile(new URL("vocabulary-normalized.json", directory), JSON.stringify({ schemaVersion: 1, contentRevision: 1, locale: "pt-PT", source: "02-gramatica-ativa-1", sourceStatus: "adapted_from_book_topic", lexemes, meanings: gramaticaVocabulary, sourceRows: vocabularySources, sourceLinks: vocabularySourceLinks }, null, 2) + "\n");
const sourceById = new Map(vocabularySources.map((source) => [source.id, source]));
const entryById = new Map(gramaticaVocabulary.map((entry) => [entry.id, entry]));
const header = ["source_row_id", "unit", "stage", "source_pt", "source_ru", "source_unique_key", "source_status", "source_tags", "meaning_id", "lexeme_id", "sense_id", "study_item_id", "lemma", "part_of_speech", "translation", "units_used", "forms", "article", "plural", "plural_article", "plural_only"];
const rows = vocabularySourceLinks.map((link) => {
  const source = sourceById.get(link.sourceRowId)!; const entry = entryById.get(link.entryId)!;
  return [source.id, source.unit, source.stage, source.pt, source.ru, source.unique_key, source.source_status, source.tags, entry.id, entry.lexemeId, entry.senseId, entry.studyItemId, entry.lemma, entry.partOfSpeech, entry.translation, entry.units.join(";"), entry.forms.join(";"), entry.noun?.article ?? "", entry.noun?.plural ?? "", entry.noun?.pluralArticle ?? "", entry.noun?.pluralOnly ? "true" : "false"];
});
const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
await writeFile(new URL("vocabulary-normalized.csv", directory), [header, ...rows].map((row) => row.map(quote).join(",")).join("\n") + "\n");
console.log(`Exported ${gramaticaVocabulary.length} meanings, ${vocabularySources.length} source rows, ${vocabularySourceLinks.length} meaning links.`);
