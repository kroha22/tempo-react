import assert from "node:assert/strict";
import test from "node:test";
import { studyVocabularyGroups, pairVocabulary } from "../features/content/vocabulary-catalog.ts";
import { checkVocabularyAnswer, vocabularySets } from "../features/content/vocabulary-model.ts";
import { checkImageAnswers, placeImageWord, type ImageMatchingDefinition } from "../features/practice/image-matching.ts";
import { houseImageActivity } from "../features/content/house.ts";
import { clothingImageActivity, clothingWords } from "../features/content/clothing.ts";

test("shared activity groups resolve their sets, category answers and reviewed distractors", () => {
  const words = new Set(pairVocabulary.map(word => word.id));
  assert.equal(new Set(studyVocabularyGroups.map(group => group.id)).size, studyVocabularyGroups.length);
  for (const group of studyVocabularyGroups) {
    const sets = vocabularySets(group);
    assert.equal(new Set(sets.map(set => set.id)).size, sets.length);
    for (const set of sets) {
      assert.ok(set.words.length > 0);
      assert.equal(new Set(set.words).size, set.words.length);
      for (const id of [...set.words, ...(set.oddOneOut ? [set.oddOneOut.answerWordId, ...set.oddOneOut.distractors] : [])]) assert.ok(words.has(id), id);
    }
  }
  const room = pairVocabulary.find(word => word.id === "house-sala")!;
  assert.equal(checkVocabularyAnswer(room, " A SALA DE ESTAR! "), "pt");
  assert.equal(checkVocabularyAnswer(room, "Зал"), "ru");
  assert.equal(checkVocabularyAnswer(room, "кухня"), "wrong");
  assert.equal(checkVocabularyAnswer(room, "  "), "empty");
});

test("image matching accepts configured answers independent of hotspot IDs", () => {
  const scene: ImageMatchingDefinition = { id: "test-scene", title: "Test", image: { src: "/test.png", alt: "Test", width: 100, height: 100, crop: { x: 0, y: 0, width: 100, height: 100 } }, wordIds: ["word-tree", "word-plant"], spots: [{ id: "left-marker", x: 20, y: 30, acceptedWordIds: ["word-tree", "word-plant"] }, { id: "right-marker", x: 80, y: 30, acceptedWordIds: ["word-tree"] }] };
  assert.deepEqual(checkImageAnswers(scene, { "left-marker": "word-plant", "right-marker": "word-tree" }).map(result => result.status), ["correct", "correct"]);
  assert.deepEqual(checkImageAnswers(scene, { "right-marker": "word-plant" }).map(result => result.status), ["empty", "wrong"]);
  assert.deepEqual(placeImageWord({ "left-marker": "word-tree" }, "right-marker", "word-tree"), { "right-marker": "word-tree" });
  for (const spot of houseImageActivity.spots) {
    assert.ok(spot.x >= 0 && spot.x <= houseImageActivity.image.width);
    assert.ok(spot.y >= 0 && spot.y <= houseImageActivity.image.height);
    assert.ok(spot.acceptedWordIds.every(id => houseImageActivity.wordIds.includes(id)));
  }
  assert.deepEqual(clothingImageActivity.wordIds, clothingWords.map(word => word.id));
  assert.equal(new Set(clothingImageActivity.spots.map(spot => spot.id)).size, clothingWords.length);
  for (const spot of clothingImageActivity.spots) {
    assert.ok(spot.x >= 0 && spot.x <= clothingImageActivity.image.width);
    assert.ok(spot.y >= 0 && spot.y <= clothingImageActivity.image.height);
    assert.deepEqual(spot.acceptedWordIds, [spot.id]);
  }
});
