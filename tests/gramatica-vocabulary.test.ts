import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { gramaticaVocabulary as entries, validateGramaticaVocabulary, vocabularyForUnit, vocabularyFront, vocabularySourceLinks, vocabularySources } from "../features/content/gramatica-vocabulary.ts";
import { firstVerticalSliceContentPack as pack } from "../features/content/manifest.ts";
import { studyItems } from "../features/content/first-vertical-slice/l1.ts";
import { extraStudyItems } from "../features/content/first-vertical-slice/route-extension.ts";
import { grammarStudyItems } from "../features/content/gramatica-ativa-pack.ts";
import { verbCards } from "../features/cards/data/verb-cards.ts";
import { parseSaveStudyItemInput } from "../features/learning/progress/contracts.ts";

// The supplied CSV has quoted commas but no multiline fields; preserve escaped quotes.
function csvLine(line: string) {
  return [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^",]*))/g)].map((m) => (m[1] ?? m[2]).replaceAll('""', '"'));
}
test("lossless intake: both sources agree and all original row fields and 54 unit links survive", () => {
  const original = JSON.parse(readFileSync(new URL("../plans/02-gramatica-ativa-1/source-materials/gramatica_ativa_1_vocab.json", import.meta.url), "utf8"));
  const runtime = JSON.parse(readFileSync(new URL("../features/content/gramatica-vocabulary-source.json", import.meta.url), "utf8"));
  assert.deepEqual(runtime, original);
  const [header, ...rows] = readFileSync(new URL("../plans/02-gramatica-ativa-1/source-materials/gramatica_ativa_1_vocab.csv", import.meta.url), "utf8").replace(/^\uFEFF/u, "").trim().split(/\r?\n/u).map(csvLine);
  assert.deepEqual(rows.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i]]))), original.cards);
  assert.deepEqual(vocabularySources.map((r) => Object.fromEntries(Object.entries(r).filter(([key]) => key !== "id"))), original.cards);
  assert.deepEqual(validateGramaticaVocabulary(), []);
  for (const row of vocabularySources) {
    const links = vocabularySourceLinks.filter((l) => l.sourceRowId === row.id);
    assert(links.length > 0);
    for (const link of links) assert(entries.find((e) => e.id === link.entryId)?.sourceRowIds.includes(row.id));
  }
  for (let unit = 1; unit <= 54; unit++) {
    assert(vocabularyForUnit(unit).length > 0);
    assert(vocabularyForUnit(unit, "preview").length > 0);
    assert(vocabularyForUnit(unit, "core").length > 0);
  }
});

test("semantic splits and morphological merges are explicit, not gloss string matching", () => {
  assert.equal(entries.filter((e) => e.lemma === "saber").length, 2);
  const existence = entries.find((e) => e.studyItemId === "study:chunk:ha-presence")!;
  assert(existence.forms.includes("havia"));
  assert(existence.units.includes(30));
  assert(!existence.units.includes(54));
  assert.equal(entries.filter((e) => e.lemma === "há + duração").length, 2);
  assert.equal(entries.filter((e) => e.lemma === "para").length, 3);
  assert.equal(entries.filter((e) => e.lemma === "muito").length, 2);
  const querer = entries.find((e) => e.partOfSpeech === "verb" && e.lemma === "querer")!;
  assert(querer.forms.includes("queria"));
  assert.deepEqual(querer.units, [7, 14, 20]);
  assert.equal(vocabularyFront(querer), "querer");
  assert(!entries.some((e) => e.partOfSpeech === "verb" && e.lemma === "queria"));
  assert.deepEqual(entries.find((e) => e.lemma === "tanto")?.forms, ["tanto", "tanta", "tantos", "tantas"]);
  assert.equal(vocabularyFront(entries.find((e) => e.lemma === "óculos")!), "os óculos");
});

test("existing canonical IDs retain their definitions and all new meanings resolve through Card Save", () => {
  for (const old of [...studyItems, ...extraStudyItems, ...grammarStudyItems]) assert.deepEqual(pack.studyItems.find((item) => item.id === old.id), old);
  assert.equal(verbCards.length, 1000);
  assert.equal(new Set(verbCards.map((v) => v.id)).size, 1000);
  for (const entry of entries) {
    assert.equal(pack.studyItems.filter((i) => i.id === entry.studyItemId).length, 1);
    assert(parseSaveStudyItemInput({ studyItemId: entry.studyItemId, sourceType: "topic", sourceId: "course:ga1:pt-pt", sourceContextId: "unit:ga1:u54", clientEventId: "source-save-0001" }));
  }
  assert.equal(entries.find((e) => e.lemma === "livro")?.studyItemId, "study:noun:livro");
  assert.equal(entries.find((e) => e.lemma === "enquanto")?.studyItemId, "study:chunk:ga1:enquanto");
});
