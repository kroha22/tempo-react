import { houseWords } from "./house.ts";
import { vocabularySets, type VocabularyGroup, type VocabularyWord } from "./vocabulary-model.ts";
import { generateOddTasks } from "../practice/odd-one-out.ts";

export type PracticeWord = VocabularyWord;
const extraEntries = [
  ["jardim", "o jardim", "Сад"],
  ["mesa-de-cabeceira", "a mesa de cabeceira", "Прикроватная тумбочка"],
  ["mesa-de-jardim", "a mesa de jardim", "Садовый стол"],
  ["guarda-fatos", "o guarda-fatos", "Шкаф для одежды"],
  ["cama", "a cama", "Кровать"],
  ["tapete", "o tapete", "Ковёр"],
  ["secretaria", "a secretária", "Письменный стол"],
  ["tacho", "o tacho", "Кастрюля"],
  ["talheres", "os talheres", "Столовые приборы"],
  ["chuveiro", "o chuveiro", "Душ"],
  ["lava-louca", "o lava-louça", "Кухонная мойка"],
  ["cadeiras", "as cadeiras", "Стулья"],
  ["mesa", "a mesa", "Стол"],
  ["sofa", "o sofá", "Диван"],
  ["televisao", "a televisão", "Телевизор"],
  ["aparelhagem", "a aparelhagem", "Музыкальный центр"],
  ["comoda", "a cómoda", "Комод"],
  ["sanita", "a sanita", "Унитаз"],
  ["estante-de-livros", "a estante de livros", "Книжный стеллаж"],
  ["carro", "o carro", "Машина"],
  ["bicicleta", "a bicicleta", "Велосипед"],
  ["caixa-de-ferramentas", "a caixa de ferramentas", "Ящик с инструментами"],
  ["trotinete", "a trotinete", "Самокат"],
  ["toalha", "a toalha", "Полотенце"],
  ["espelho", "o espelho", "Зеркало"],
  ["prato", "o prato", "Тарелка"],
  ["banheira", "a banheira", "Ванна"],
] as const;

// Shared vocabulary for recognition and word hints; original image/card IDs stay intact.
export const housePracticeWords: readonly PracticeWord[] = [
  ...houseWords.map(({ id, label, translation }) => ({ id, label, translation })),
  ...extraEntries.map(([slug, label, translation]) => ({ id: `house-${slug}`, label, translation })),
];
export function practiceWord(id: string): PracticeWord {
  const word = housePracticeWords.find(word => word.id === id);
  if (!word) throw new Error(`Unknown house vocabulary: ${id}`);
  return word;
}

const kitchenBath = new Set(["tacho", "talheres", "lava-louca", "chuveiro", "sanita", "toalha", "espelho", "prato", "banheira"].map(slug => `house-${slug}`));
const gardenTransport = new Set(["grelhador", "relva", "guarda-sol", "jardim", "mesa-de-jardim", "carro", "bicicleta", "caixa-de-ferramentas", "trotinete"].map(slug => `house-${slug}`));
const furnishings = new Set(["cortina", "persiana", "mesa-de-cabeceira", "guarda-fatos", "cama", "tapete", "secretaria", "cadeiras", "mesa", "sofa", "televisao", "aparelhagem", "comoda", "estante-de-livros"].map(slug => `house-${slug}`));
export const housePracticeBlocks = [
  { id: "home-rooms", title: "Комнаты и части дома", words: housePracticeWords.filter(word => !kitchenBath.has(word.id) && !gardenTransport.has(word.id) && !furnishings.has(word.id)).map(word => word.id) },
  { id: "home-furniture", title: "Мебель и техника", words: housePracticeWords.filter(word => furnishings.has(word.id)).map(word => word.id) },
  { id: "kitchen-bath", title: "Посуда и ванная", words: housePracticeWords.filter(word => kitchenBath.has(word.id)).map(word => word.id) },
  { id: "garden-transport", title: "Сад и транспорт", words: housePracticeWords.filter(word => gardenTransport.has(word.id)).map(word => word.id) },
] as const;
export const housePracticePacks: readonly (readonly string[])[] = housePracticeBlocks.map(block => block.words);

export const houseVocabularyGroup: VocabularyGroup = {
  id: "vocabulary-house", title: "Дом и окружающие предметы",
  subgroups: housePracticeBlocks.map(block => ({ id: block.id, title: block.title, sets: [block] })),
};

export const housePlaces = [
  { id: "house-jardim", pt: ["jardim"], ru: ["сад", "садик"] },
  { id: "house-quarto", pt: ["quarto", "quarto de dormir"], ru: ["спальня", "спальная комната"] },
  { id: "house-cozinha", pt: ["cozinha"], ru: ["кухня"] },
  { id: "house-sala", pt: ["sala", "sala de estar"], ru: ["гостиная", "зал", "гостиная комната"] },
  { id: "house-garagem", pt: ["garagem"], ru: ["гараж"] },
  { id: "house-casa-de-banho", pt: ["casa de banho"], ru: ["ванная", "ванная комната", "санузел"] },
] as const;
export type OddTask = { id: string; words: readonly string[]; odd: string; place: string; explanation: string };
const ids = (...slugs: string[]) => slugs.map(slug => `house-${slug}`);
export const houseOddExample: OddTask = {
  id: "house-odd-example", words: ids("toalha", "espelho", "prato", "banheira", "sanita"), odd: "house-prato", place: "house-casa-de-banho",
  explanation: "Тарелка нужна для еды, а остальные предметы в этом примере — из ванной комнаты.",
};
// Overlapping furniture is allowed in several sets; distractors are explicitly reviewed.
export const houseRoomGroup: VocabularyGroup = {
  id: "vocabulary-house-places", title: "Предметы по комнатам",
  subgroups: [
    ["jardim", "Сад", ids("grelhador", "relva", "mesa-de-jardim", "guarda-sol"), ids("banheira", "sanita", "cama")],
    ["quarto", "Спальня", ids("mesa-de-cabeceira", "guarda-fatos", "cama", "tapete", "secretaria", "comoda"), ids("grelhador", "sanita", "lava-louca")],
    ["cozinha", "Кухня", ids("talheres", "lava-louca", "cadeiras", "mesa", "tacho", "prato"), ids("chuveiro", "banheira", "cama")],
    ["sala", "Гостиная", ids("sofa", "televisao", "aparelhagem", "estante-de-livros", "tapete"), ids("sanita", "lava-louca", "banheira")],
    ["garagem", "Гараж", ids("carro", "bicicleta", "caixa-de-ferramentas", "trotinete"), ids("banheira", "cama", "sanita")],
    ["casa-de-banho", "Ванная комната", ids("toalha", "espelho", "banheira", "sanita", "chuveiro"), ids("grelhador", "cama", "carro")],
  ].map(([slug, title, words, distractors]) => ({
    id: `house-room-${slug}`, title: title as string,
    sets: [{ id: `house-room-set-${slug}`, title: title as string, words: words as string[],
      oddOneOut: { answerWordId: `house-${slug}`, distractors: distractors as string[] } }],
  })),
};
export function makeHouseOddTasks(random: () => number): OddTask[] {
  return generateOddTasks(vocabularySets(houseRoomGroup), random);
}

export function normalizeHouseAnswer(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ё/g, "е").trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").trim();
}
export function checkHousePlace(placeId: string, answer: string): "pt" | "ru" | "wrong" | "empty" {
  const value = normalizeHouseAnswer(answer);
  if (!value) return "empty";
  const place = housePlaces.find(place => place.id === placeId);
  if (!place) return "wrong";
  const pt = value.replace(/^(o|a) /, "");
  if (place.pt.some(form => normalizeHouseAnswer(form) === pt)) return "pt";
  if (place.ru.some(form => normalizeHouseAnswer(form) === value)) return "ru";
  return "wrong";
}

export { makePairBoard, matchPair as matchHousePair, shufflePairWords as shuffleHouseWords, type PairBoard } from "../practice/word-pairs.ts";
