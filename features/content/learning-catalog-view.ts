import { learningCatalog } from "./learning-catalog.ts";
import { pairVocabulary, studyVocabularyGroups } from "./vocabulary-catalog.ts";
import { vocabularySets, type VocabularyGroup } from "./vocabulary-model.ts";
import { houseImageActivity } from "./house.ts";
import { sceneImageActivities } from "./picture-scenes.ts";

// Compatibility boundary: exercises continue to receive their original word IDs.
const wordsById = new Map(pairVocabulary.map(word => [word.id, word]));
const representative = new Map(learningCatalog.meanings.map(meaning => [meaning.id, meaning.legacyWordIds[0]]));
const legacySets = new Map(studyVocabularyGroups.flatMap(vocabularySets).map(set => [set.id, set]));
const imageDefinitions = [houseImageActivity, ...sceneImageActivities];
export const catalogWords = pairVocabulary;
export const catalogGroups: VocabularyGroup[] = learningCatalog.topics.flatMap(topic => {
  const collections = learningCatalog.collections.filter(collection => collection.topicIds.includes(topic.id) && collection.source.legacySetId && collection.meaningIds.every(id => representative.get(id)));
  if (!collections.length) return [];
  const sourceIds = new Set(collections.flatMap(collection => collection.meaningIds.flatMap(id => learningCatalog.meanings.find(m => m.id === id)!.legacyWordIds)));
  return [{
    id: topic.id, title: topic.title,
    subgroups: collections.map(collection => {
      const original = legacySets.get(collection.source.legacySetId ?? "");
      // Reviewed odd-word definitions stay on their existing IDs until category migration.
      const ids = original?.words ?? collection.meaningIds.map(id => representative.get(id)!);
      if (ids.some(id => !wordsById.has(id))) throw new Error(`Unresolved collection ${collection.id}`);
      return { id: collection.id, title: collection.title, sets: [{ ...original, id: collection.id, title: collection.title, words: ids, sourceHref: collection.source.href ?? original?.sourceHref }] };
    }),
    imageActivityIds: imageDefinitions.filter(image => sourceIds.size && image.wordIds.every(id => sourceIds.has(id))).map(image => image.id),
  }];
});
