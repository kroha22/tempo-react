import type { VocabularyGroup, VocabularyWord } from "./vocabulary-model.ts";

export const clothingWords: readonly VocabularyWord[] = [
  { id: "clothing-camisola", label: "a camisola", translation: "Джемпер" },
  { id: "clothing-casaco", label: "o casaco", translation: "Куртка" },
  { id: "clothing-cachecol", label: "o cachecol", translation: "Шарф" },
  { id: "clothing-calcas", label: "as calças", translation: "Брюки" },
  { id: "clothing-calcoes", label: "os calções", translation: "Шорты" },
  { id: "clothing-saia", label: "a saia", translation: "Юбка" },
  { id: "clothing-pijama", label: "o pijama", translation: "Пижама" },
  { id: "clothing-blusa", label: "a blusa", translation: "Блузка" },
  { id: "clothing-vestido", label: "o vestido", translation: "Платье" },
  { id: "clothing-sapatos", label: "os sapatos", translation: "Туфли" },
];
export const clothingGroup: VocabularyGroup = { id: "vocabulary-clothing", title: "Одежда", subgroups: [{ id: "clothing-everyday", title: "Повседневная одежда", sets: [{ id: "clothing-basics", title: "Одежда и обувь", words: clothingWords.map(word => word.id) }] }] };
