import { strict as assert } from "node:assert";
import { test } from "node:test";
import { basicWordCards } from "../features/cards/data/basic-word-cards.ts";
import { generalVocabulary } from "../features/content/general-vocabulary.ts";
import { schoolInstructionCards } from "../features/content/school-content.ts";

test("basic deck appends missing school verbs without duplicating or changing source IDs", () => {
  assert.equal(basicWordCards.length, 357);
  assert.deepEqual(basicWordCards.slice(0, 351), generalVocabulary);
  assert.equal(new Set(basicWordCards.map(card => card.id)).size, basicWordCards.length);
  for (const school of schoolInstructionCards) {
    const matches = basicWordCards.filter(card => card.partOfSpeech === "verb" && card.portuguese === school.infinitive);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].existingCardId, school.id);
  }
});
