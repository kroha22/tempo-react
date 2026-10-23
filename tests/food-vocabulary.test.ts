import assert from "node:assert/strict";
import test from "node:test";
import { catalogGroups, catalogWords } from "../features/content/learning-catalog-view.ts";
import { foodCategories } from "../features/content/topic-expansion.ts";
import { checkVocabularyAnswer, vocabularySets } from "../features/content/vocabulary-model.ts";
import { generateOddTasks } from "../features/practice/odd-one-out.ts";
import { topicExpansion } from "../features/content/vocabulary-catalog.ts";
import { vocabularyTitlesPt } from "../features/content/vocabulary-titles.ts";

test("food categories generate unambiguous tasks through the visible catalog", () => {
  const sets = vocabularySets(catalogGroups.find(group => group.id === "topic:food")!);
  const foodSets = sets.filter(set => foodCategories.some(category => set.oddOneOut?.answerWordId === category.id));
  assert.equal(foodSets.length, 7);
  let state = 42;
  const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const seen = new Set<string>();
  for (let i = 0; i < 100; i++) {
    for (const task of generateOddTasks(foodSets, random)) {
      const set = foodSets.find(set => set.id === task.id)!;
      assert.equal(task.words.length, 5);
      assert.equal(new Set(task.words).size, 5);
      assert.deepEqual(task.words.filter(id => !set.words.includes(id)), [task.odd]);
      for (const id of [...task.words, task.place]) assert.ok(catalogWords.some(word => word.id === id), id);
      seen.add(task.words.join(","));
    }
  }
  assert.ok(seen.size > 100);
  for (const category of foodCategories) {
    const word = catalogWords.find(word => word.id === category.id)!;
    assert.equal(checkVocabularyAnswer(word, category.label), "pt");
    assert.equal(checkVocabularyAnswer(word, category.translation), "ru");
  }
});

test("food illustrations cover the supplied page without replacing word IDs", () => {
  const illustrated = catalogWords.filter(word => word.illustration);
  assert.equal(illustrated.length, 52);
  assert.equal(new Set(illustrated.map(word => `${word.illustration!.src}:${word.illustration!.column}:${word.illustration!.row}`)).size, 52);
  assert.equal(illustrated.find(word => word.noun?.lemma === "maçã")?.id, "scene-word:a-maca");
  const photoKeys = "massa arroz pera pao queijo quivi iogurte leite couve curgete pimento roma manga tangerina fiambre presunto camarao bife cenoura cebola pepino oleo azeite manteiga sardinha gelado ketchup diospiro maionese mostarda hamburguer salsicha salmao bacalhau sal vinagre feijao pimenta tomate bolo banana maca morango uvas ovos framboesas salsa laranja".split(" ");
  assert.equal(photoKeys.length, 48);
  for (const key of photoKeys) assert.ok(topicExpansion.byKey.get(key)?.illustration, key);
  for (const word of illustrated) {
    assert.ok(word.noun);
    assert.ok(word.example);
    const crop = word.illustration!.crop!;
    assert.ok(crop.x >= 0 && crop.y >= 0);
    assert.ok(crop.x + crop.width <= crop.sourceWidth);
    assert.ok(crop.y + crop.height <= crop.sourceHeight);
  }
});

test("all visible themes and word sets have Portuguese navigation titles", () => {
  for (const group of catalogGroups) {
    assert.ok(vocabularyTitlesPt[group.title], group.title);
    for (const set of vocabularySets(group)) assert.ok(vocabularyTitlesPt[set.title], set.title);
  }
});
