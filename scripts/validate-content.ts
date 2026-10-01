import { verbCards } from "../features/cards/data/verb-cards.ts";
import { firstVerticalSliceContentPack } from "../features/content/manifest.ts";
import { generalVocabulary, validateGeneralVocabulary } from "../features/content/general-vocabulary.ts";
import { validateVocabularyLessons, vocabularyLessons } from "../features/content/vocabulary-lessons.ts";
import { validateContentPack, validateLegacyVerbDeck } from "../features/content/validation.ts";

validateContentPack(firstVerticalSliceContentPack);
validateLegacyVerbDeck(verbCards);
const vocabularyErrors = [
  ...validateGeneralVocabulary(generalVocabulary),
  ...validateVocabularyLessons(vocabularyLessons),
];
if (vocabularyErrors.length) throw new Error(vocabularyErrors.join("\n"));

console.log(
  `Content validation passed: ${firstVerticalSliceContentPack.lessons.length} lesson, ` +
    `${firstVerticalSliceContentPack.studyItems.length} StudyItems, ${verbCards.length} legacy verbs, ` +
    `${generalVocabulary.length} vocabulary entries, ${vocabularyLessons.length} vocabulary lessons.`,
);
