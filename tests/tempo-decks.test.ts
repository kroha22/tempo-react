import assert from "node:assert/strict";
import test from "node:test";
import { tempoPracticeDecks } from "../features/cards/data/tempo-decks.ts";
import { allVerbKeys, people } from "../features/conjugation/data.ts";

test("original phrase packs and form drills have stable unique IDs and complete fields", () => {
  assert.equal(tempoPracticeDecks.length, 14);
  assert.equal(tempoPracticeDecks.filter(deck => deck.category === "phrases").flatMap(deck => deck.cards).length, 48);
  assert.equal(tempoPracticeDecks.filter(deck => deck.category === "forms").flatMap(deck => deck.cards).length, allVerbKeys.length * people.length * 2);
  const cards = tempoPracticeDecks.flatMap(deck => deck.cards);
  assert.equal(new Set(cards.map(card => card.id)).size, cards.length);
  assert.ok(cards.every(card => card.portuguese && card.russian && card.spokenPortuguese && card.prompt));
  assert.ok(cards.every(card => !Object.values(card).some(value => typeof value === "string" && /\[sound:|data:audio|<script/i.test(value))));
  const past = cards.find(card => card.id === "tempo:form:falar:past:nos");
  assert.equal(past?.portuguese, "nós falámos");
  assert.equal(past?.spokenPortuguese, "falámos");
});
