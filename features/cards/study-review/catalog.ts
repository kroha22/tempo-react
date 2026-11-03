import { gramaticaVocabulary, vocabularyFront, vocabularyHref } from "../../content/gramatica-vocabulary.ts";
import { gramaticaLessons,allGramaticaLessons } from "../../content/gramatica-ativa.ts";
import { verbCards } from "../data/verb-cards.ts";
import { hasLowerPresentationPriority } from "../scheduler.ts";
import {readingStudyItems,readingRu,readingCardChoices} from "../../content/reading-cards.ts";
import {grammarReading,grammarReadingGlossary} from "../../content/grammar-reading.ts";

export type StudyReviewCard = {
  studyItemId: string; front: string; back: string; examples: { pt: string; ru: string }[]; units: number[]; lowerPriority: boolean;
};
const cards = new Map<string, StudyReviewCard>();
const frequencyByInfinitive = new Map(verbCards.map((card) => [card.pt, card]));
for (const entry of gramaticaVocabulary) {
  const frequency = entry.partOfSpeech === "verb" ? frequencyByInfinitive.get(entry.lemma) : undefined;
  cards.set(entry.studyItemId, { studyItemId: entry.studyItemId, front: vocabularyFront(entry), back: entry.translation, examples: entry.examples, units: [...entry.units], lowerPriority: frequency ? hasLowerPresentationPriority(frequency) : false });
}
for (const lesson of gramaticaLessons) for (const word of lesson.vocabulary) {
  const studyItemId = `study:chunk:ga1:${word.slug}`;
  const existing = cards.get(studyItemId);
  if (existing) { existing.units = [...new Set([...existing.units, lesson.unit])].sort((a, b) => a - b); continue; }
  cards.set(studyItemId, { studyItemId, front: word.pt, back: word.ru, examples: [{ pt: word.example, ru: word.exampleRu }], units: [lesson.unit], lowerPriority: false });
}
for(const item of readingStudyItems){
  const text=item.display.type==="chunk"?item.display.text:"";
  cards.set(item.id,{studyItemId:item.id,front:text,back:readingRu[item.display.translationKey],examples:[],units:[],lowerPriority:false});
}
// Add explanation appearances without removing the dictionary's original 54-unit links.
for(const lesson of allGramaticaLessons){
  const reading=grammarReading[lesson.slug];if(!reading)continue;
  const text=`${reading.goal} ${reading.rule} ${lesson.examples.map(example=>example.pt).join(" ")}`;
  for(const form of Object.keys(grammarReadingGlossary)){
    const escaped=form.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    if(!new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`,"iu").test(text))continue;
    for(const choice of readingCardChoices(form)){const card=cards.get(choice.studyItemId);if(card&&!card.units.includes(lesson.unit))card.units.push(lesson.unit);}
  }
}
export const studyReviewCards = [...cards.values()];
export const studyReviewCardById = new Map(cards);
export const reviewHref = (unit?: number) => `/learning/gramatica-ativa/review${unit ? `/u${String(unit).padStart(2, "0")}` : ""}`;
export { vocabularyHref };
