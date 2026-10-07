import { learningCatalog } from "./learning-catalog.ts";
import { pairVocabulary, studyVocabularyGroups } from "./vocabulary-catalog.ts";
import { vocabularySets, type VocabularyGroup } from "./vocabulary-model.ts";
import { houseImageActivity } from "./house.ts";
import { sceneImageActivities } from "./picture-scenes.ts";
import { clothingImageActivity } from "./clothing.ts";
import { vocabularyLessons } from "./vocabulary-lessons.ts";

// Compatibility boundary: exercises continue to receive their original word IDs.
const reviewedVocabularyWords = vocabularyLessons.flatMap(lesson => lesson.items.map(item => ({
  id: item.sourceEntryId,
  label: item.display.split(" — ")[0],
  translation: item.translation,
})));
export const catalogWords = [...pairVocabulary, ...reviewedVocabularyWords.filter(word => !pairVocabulary.some(existing => existing.id === word.id))];
const wordsById = new Map(catalogWords.map(word => [word.id, word]));
const representative = new Map(learningCatalog.meanings.map(meaning => [meaning.id, meaning.legacyWordIds[0] ?? meaning.sourceEntryIds?.[0]]));
const legacySets = new Map(studyVocabularyGroups.flatMap(vocabularySets).map(set => [set.id, set]));
const imageDefinitions = [houseImageActivity, clothingImageActivity, ...sceneImageActivities];
export const catalogGroups: VocabularyGroup[] = learningCatalog.topics.flatMap(topic => {
  // The source group exists to register the instruction collection. The
  // semantic School topic is the single visible home for it and the backpack scene.
  if (topic.id === "topic:short-vocabulary-lessons" || topic.id === "topic:vocabulary-school" || topic.id.startsWith("topic:general-vocabulary")) return [];
  const collections = learningCatalog.collections.filter(collection => collection.topicIds.includes(topic.id) && (collection.source.kind === "lesson" || legacySets.has(collection.source.legacySetId ?? "")) && collection.meaningIds.every(id => representative.get(id)));
  if (!collections.length) return [];
  const baseEntryIds = new Set(collections.filter(collection => collection.source.kind !== "lesson").flatMap(collection => collection.meaningIds.map(id => learningCatalog.meanings.find(meaning => meaning.id === id)!.entryId)));
  const visibleCollections = collections.flatMap(collection => {
    const meaningIds = collection.source.kind === "lesson"
      ? collection.meaningIds.filter(id => !baseEntryIds.has(learningCatalog.meanings.find(meaning => meaning.id === id)!.entryId))
      : collection.meaningIds;
    return meaningIds.length ? [{ collection, meaningIds }] : [];
  });
  const sourceIds = new Set(visibleCollections.flatMap(({ meaningIds }) => meaningIds.flatMap(id => {
    const meaning = learningCatalog.meanings.find(item => item.id === id)!;
    return meaning.legacyWordIds.length ? meaning.legacyWordIds : [representative.get(id)!];
  })));
  return [{
    id: topic.id, title: topic.title,
    subgroups: visibleCollections.map(({ collection, meaningIds }) => {
      const original = legacySets.get(collection.source.legacySetId ?? "");
      // Reviewed odd-word definitions stay on their existing IDs until category migration.
      const ids = original?.words ?? meaningIds.map(id => representative.get(id)!);
      if (ids.some(id => !wordsById.has(id))) throw new Error(`Unresolved collection ${collection.id}`);
      return { id: collection.id, title: collection.title, sets: [{ ...original, id: collection.id, title: collection.title, words: ids, sourceHref: collection.source.href ?? original?.sourceHref }] };
    }),
    imageActivityIds: imageDefinitions.filter(image => sourceIds.size && image.wordIds.every(id => sourceIds.has(id))).map(image => image.id),
  }];
});
