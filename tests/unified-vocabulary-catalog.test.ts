import assert from "node:assert/strict";
import test from "node:test";
import { generalVocabulary } from "../features/content/general-vocabulary.ts";
import { learningCatalog, meaningForLegacyWord, meaningForSourceEntry } from "../features/content/learning-catalog.ts";
import { pairVocabulary } from "../features/content/vocabulary-catalog.ts";
import { vocabularyLessons } from "../features/content/vocabulary-lessons.ts";
import { validateLearningCatalog } from "../features/content/learning-model.ts";
import { catalogGroups, catalogWords } from "../features/content/learning-catalog-view.ts";

test("the unified learning catalog has no broken identities or references", () => {
  assert.deepEqual(validateLearningCatalog(learningCatalog), []);
});

test("all 351 source entries resolve once in the shared learning catalog", () => {
  const aliases = learningCatalog.meanings.flatMap(meaning => meaning.sourceEntryIds ?? []);
  assert.equal(generalVocabulary.length, 351);
  assert.equal(aliases.length, generalVocabulary.length);
  assert.equal(new Set(aliases).size, generalVocabulary.length);
  for (const source of generalVocabulary) {
    const meaning = meaningForSourceEntry(source.id);
    assert.ok(meaning, source.id);
    assert.equal(meaning.sourceEntryIds?.[0], source.id);
    assert.ok(learningCatalog.entries.some(entry => entry.id === meaning.entryId));
  }
});

test("reviewed vocabulary lessons reference source meanings without duplicating lexical entries", () => {
  for (const lesson of vocabularyLessons) {
    const collection = learningCatalog.collections.find(item => item.id === `collection:${lesson.id}`);
    assert.ok(collection, lesson.id);
    assert.deepEqual(collection.meaningIds, lesson.items.map(item => meaningForSourceEntry(item.sourceEntryId)!.id));
    assert.ok(collection.meaningIds.every(id => learningCatalog.meanings.find(meaning => meaning.id === id)?.status === "source-backed"));
  }
  const sourceTer = meaningForSourceEntry("general-vocabulary:verb:ter")!;
  const legacyTer = pairVocabulary.find(word => word.label === "ter")!;
  assert.equal(sourceTer.entryId, meaningForLegacyWord(legacyTer.id)!.entryId);
  assert.notEqual(sourceTer.id, meaningForLegacyWord(legacyTer.id)!.id);
});

test("legacy vocabulary IDs remain available to the existing mechanics", () => {
  assert.equal(new Set(pairVocabulary.map(word => word.id)).size, pairVocabulary.length);
  for (const word of pairVocabulary) assert.ok(meaningForLegacyWord(word.id), word.id);
  const activityCollections = new Set(learningCatalog.activities.flatMap(activity => activity.target.kind === "vocabulary" ? [activity.target.collectionId] : []));
  assert.ok([...activityCollections].every(id => learningCatalog.collections.find(collection => collection.id === id)?.source.legacySetId));
});

test("the Words catalog integrates only missing reviewed words into semantic topics", () => {
  const labels = new Map(catalogWords.map(word => [word.id, word.label]));
  const integratedSets = catalogGroups.flatMap(group => group.subgroups
    .filter(subgroup => subgroup.id.startsWith("collection:vocabulary-lesson:"))
    .map(subgroup => ({ group: group.title, title: subgroup.title, words: subgroup.sets[0].words.map(id => labels.get(id)) })));

  assert.equal(integratedSets.flatMap(set => set.words).length, 35);
  assert.deepEqual(integratedSets.find(set => set.title === "Дом и вещи")?.words, ["o apartamento", "a chave", "o objeto"]);
  assert.deepEqual(integratedSets.find(set => set.title === "Город и дорога")?.words, ["a praça", "a avenida", "a ponte", "a estação"]);
  assert.deepEqual(integratedSets.find(set => set.title === "Разговор и понимание")?.words, ["dizer", "conversar", "contar"]);
  assert.deepEqual(integratedSets.find(set => set.title === "Движение и поездки")?.words, ["caminhar"]);
  assert.ok(integratedSets.every(set => !set.words.includes(undefined)));
  assert.ok(!catalogGroups.some(group => ["Вся подборка", "Короткие уроки"].includes(group.title)));
});
