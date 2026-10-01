import { verbCards } from "./data/verb-cards";

export type UnifiedCard = {
  reviewItemId: string;
  type: "verb" | "noun" | "chunk";
  front: string;
  back: string;
  source: string;
  legacyCardId?: string;
};

export function legacyDeckCards(): UnifiedCard[] {
  return verbCards.map((card) => ({ reviewItemId: card.id, legacyCardId: card.id, type: "verb", front: card.pt, back: card.ru, source: `Встроенная колода · № ${card.rank}` }));
}
