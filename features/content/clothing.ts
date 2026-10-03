import type { VocabularyGroup, VocabularyWord } from "./vocabulary-model.ts";
import type { ImageMatchingDefinition } from "../practice/image-matching.ts";
import { publicAssetPath } from "./public-asset.ts";

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

const clothingPoints: Record<string, readonly [number, number]> = {
  "clothing-camisola": [600, 220],
  "clothing-casaco": [1115, 235],
  "clothing-cachecol": [1340, 280],
  "clothing-calcas": [610, 535],
  "clothing-calcoes": [785, 495],
  "clothing-saia": [1030, 535],
  "clothing-pijama": [285, 715],
  "clothing-blusa": [775, 220],
  "clothing-vestido": [940, 270],
  "clothing-sapatos": [1148, 795],
};

export const clothingImageActivity: ImageMatchingDefinition = {
  id: "image-clothing",
  title: "Что сегодня надеть?",
  titleLang: "ru",
  image: {
    src: publicAssetPath("/images/scenes/clothing.webp"),
    alt: "Открытый гардероб с одеждой, пижамой, шарфом и туфлями",
    width: 1448,
    height: 1086,
    crop: { x: 0, y: 0, width: 1448, height: 1086 },
  },
  wordIds: clothingWords.map(word => word.id),
  spots: clothingWords.map(word => ({
    id: word.id,
    x: clothingPoints[word.id][0],
    y: clothingPoints[word.id][1],
    acceptedWordIds: [word.id],
  })),
};

export const clothingGroup: VocabularyGroup = {
  id: "vocabulary-clothing",
  title: "Одежда",
  imageActivityIds: [clothingImageActivity.id],
  subgroups: [{ id: "clothing-everyday", title: "Повседневная одежда", sets: [{ id: "clothing-basics", title: "Одежда и обувь", words: clothingWords.map(word => word.id) }] }],
};
