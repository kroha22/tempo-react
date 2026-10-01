import assert from "node:assert/strict";
import test from "node:test";
import { generalVocabulary, validateGeneralVocabulary } from "../features/content/general-vocabulary.ts";
import { validateVocabularyLessons, vocabularyLessons } from "../features/content/vocabulary-lessons.ts";

test("general vocabulary keeps 351 unique source entries", () => {
  assert.equal(generalVocabulary.length, 351);
  assert.equal(new Set(generalVocabulary.map((entry) => entry.id)).size, 351);
  assert.deepEqual(validateGeneralVocabulary(), []);
});

test("general vocabulary links verbs to existing cards where possible", () => {
  const linked = generalVocabulary.filter((entry) => entry.integrationStatus === "linked-existing-card");
  assert.equal(linked.length, 164);
  assert(linked.every((entry) => entry.existingCardId?.startsWith("v")));
});

test("themed vocabulary contains eight six-item lessons backed by unique entries", () => {
  const items = vocabularyLessons.flatMap((lesson) => lesson.items);
  assert.equal(vocabularyLessons.length, 8);
  assert(vocabularyLessons.every((lesson) => lesson.items.length === 6));
  assert.equal(new Set(items.map((item) => item.sourceEntryId)).size, 48);
  assert.deepEqual(validateVocabularyLessons(), []);
});

test("themed vocabulary gives lesson nouns an article and a plural form", () => {
  const nouns = vocabularyLessons.flatMap((lesson) => lesson.items).filter((item) => item.partOfSpeech === "noun");
  assert(nouns.length > 0);
  assert(nouns.every((item) => /^(o|a|o\/a)\s/.test(item.display) && item.display.includes("—")));
});
