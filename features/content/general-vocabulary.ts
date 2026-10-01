import { verbCards } from "../cards/data/verb-cards.ts";
import {
  generalVocabularySourceEntries,
  generalVocabularySourceMetadata,
} from "./general-vocabulary.generated.ts";
import type {
  GeneralVocabularyEntry,
  GeneralVocabularyIntegrationStatus,
  GeneralVocabularyPartOfSpeech,
} from "./general-vocabulary-types.ts";

const verbCardIdByInfinitive = new Map(verbCards.map(card => [card.pt, card.id]));

function integrationFor(
  partOfSpeech: GeneralVocabularyPartOfSpeech,
  portuguese: string,
): { existingCardId?: string; integrationStatus: GeneralVocabularyIntegrationStatus } {
  if (partOfSpeech === "verb") {
    const existingCardId = verbCardIdByInfinitive.get(portuguese);
    return existingCardId
      ? { existingCardId, integrationStatus: "linked-existing-card" }
      : { integrationStatus: "needs-verb-review" };
  }
  if (partOfSpeech === "noun") return { integrationStatus: "needs-noun-morphology" };
  return { integrationStatus: "unsupported-card-type" };
}

/**
 * Editorial vocabulary source. It does not replace canonical StudyItems or
 * the v0001-v1000 deck. Themes and card surfaces reference these stable IDs.
 */
export const generalVocabulary: readonly GeneralVocabularyEntry[] = generalVocabularySourceEntries.map(entry => ({
  ...entry,
  ...integrationFor(entry.partOfSpeech, entry.portuguese),
}));

export { generalVocabularySourceMetadata };

export function validateGeneralVocabulary(entries: readonly GeneralVocabularyEntry[] = generalVocabulary): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const sourceKeys = new Set<string>();
  for (const entry of entries) {
    if (!entry.id.trim() || ids.has(entry.id)) errors.push(`Duplicate or empty general vocabulary ID: ${entry.id}`);
    ids.add(entry.id);
    const sourceKey = `${entry.partOfSpeech}:${entry.portuguese.toLocaleLowerCase("pt-PT")}`;
    if (sourceKeys.has(sourceKey)) errors.push(`Duplicate general vocabulary source entry: ${sourceKey}`);
    sourceKeys.add(sourceKey);
    if (!entry.portuguese.trim() || !entry.translation.trim()) errors.push(`Empty general vocabulary text: ${entry.id}`);
    if (entry.integrationStatus === "linked-existing-card" && !entry.existingCardId) errors.push(`Missing card link: ${entry.id}`);
    if (entry.existingCardId && !verbCards.some(card => card.id === entry.existingCardId && card.pt === entry.portuguese)) {
      errors.push(`Invalid card link: ${entry.id} -> ${entry.existingCardId}`);
    }
  }
  return errors;
}
