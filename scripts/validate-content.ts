import { verbCards } from "../features/cards/data/verb-cards.ts";
import { firstVerticalSliceContentPack } from "../features/content/manifest.ts";
import { validateContentPack, validateLegacyVerbDeck } from "../features/content/validation.ts";

validateContentPack(firstVerticalSliceContentPack);
validateLegacyVerbDeck(verbCards);

console.log(
  `Content validation passed: ${firstVerticalSliceContentPack.lessons.length} lesson, ` +
    `${firstVerticalSliceContentPack.studyItems.length} StudyItems, ${verbCards.length} legacy verbs.`,
);
