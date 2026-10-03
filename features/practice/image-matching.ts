export type ImageMatchingDefinition = {
  id: string;
  title: string;
  titleLang?: "pt-PT" | "ru";
  image: { src: string; alt: string; width: number; height: number; crop: { x: number; y: number; width: number; height: number } };
  wordIds: readonly string[];
  spots: readonly { id: string; x: number; y: number; acceptedWordIds: readonly string[] }[];
  cardsHref?: string;
};
export type ImageAnswers = Readonly<Record<string, string>>;

export function placeImageWord(answers: ImageAnswers, spotId: string, wordId: string): ImageAnswers {
  return { ...Object.fromEntries(Object.entries(answers).filter(([spot, word]) => spot !== spotId && word !== wordId)), [spotId]: wordId };
}
export function checkImageAnswers(definition: ImageMatchingDefinition, answers: ImageAnswers) {
  return definition.spots.map(spot => ({ id: spot.id, status: !answers[spot.id] ? "empty" : spot.acceptedWordIds.includes(answers[spot.id]) ? "correct" : "wrong" } as const));
}
