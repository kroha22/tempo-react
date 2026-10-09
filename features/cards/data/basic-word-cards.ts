import { generalVocabulary } from "../../content/general-vocabulary.ts";
import { schoolInstructionCards } from "../../content/school-content.ts";
import type { GeneralVocabularyEntry } from "../../content/general-vocabulary-types.ts";

// Preserve the source collection and its IDs; append only missing school verbs.
export const basicWordCards: readonly GeneralVocabularyEntry[] = [
  ...generalVocabulary,
  ...schoolInstructionCards.filter(card => !generalVocabulary.some(word => word.partOfSpeech === "verb" && word.portuguese === card.infinitive)).map(card => ({
    id: `general-vocabulary:verb:${card.infinitive}`,
    partOfSpeech: "verb" as const,
    portuguese: card.infinitive,
    translation: card.translation,
    editorialStatus: "needs-review" as const,
    existingCardId: card.id,
    integrationStatus: "linked-existing-card" as const,
  })),
];
