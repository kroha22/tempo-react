export type GeneralVocabularyPartOfSpeech = "verb" | "noun" | "adjective" | "adverb-or-other";

export type GeneralVocabularySourceEntry = {
  id: string;
  partOfSpeech: GeneralVocabularyPartOfSpeech;
  portuguese: string;
  translation: string;
  editorialStatus: "needs-review";
};

export type GeneralVocabularySourceMetadata = {
  title: string;
  sourceFileName: string;
  sourceSha256: string;
  claimedEntryCount: number;
  actualEntryCount: number;
};

export type GeneralVocabularyIntegrationStatus =
  | "linked-existing-card"
  | "needs-verb-review"
  | "needs-noun-morphology"
  | "unsupported-card-type";

export type GeneralVocabularyEntry = GeneralVocabularySourceEntry & {
  existingCardId?: string;
  integrationStatus: GeneralVocabularyIntegrationStatus;
};
