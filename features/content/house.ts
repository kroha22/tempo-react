import type { NounStudyItem } from "./types";
import { checkImageAnswers, placeImageWord, type ImageMatchingDefinition } from "../practice/image-matching.ts";

// User-supplied worksheet. Stable semantic IDs do not depend on numbering.
type HouseWord = {
  id: string;
  number: number;
  label: string;
  display: NounStudyItem["display"];
  translation: string;
  example: string;
  exampleTranslation: string;
  point: readonly [number, number];
};

type Entry = readonly [slug: string, article: "o" | "a", lemma: string, plural: string, translation: string, example: string, exampleTranslation: string, x: number, y: number, label?: string];
const entries: readonly Entry[] = [
  ["telhado", "o", "telhado", "telhados", "Крыша", "O telhado é vermelho.", "Крыша красная.", 445, 225],
  ["chamine", "a", "chaminé", "chaminés", "Дымоход, дымовая труба", "A chaminé fica no telhado.", "Дымовая труба находится на крыше.", 841, 154],
  ["janela", "a", "janela", "janelas", "Окно", "A janela está aberta.", "Окно открыто.", 663, 189],
  ["cortina", "a", "cortina", "cortinas", "Штора", "A cortina é verde.", "Штора зелёная.", 807, 343],
  ["persiana", "a", "persiana", "persianas", "Жалюзи", "A persiana está fechada.", "Жалюзи закрыты.", 488, 356],
  ["varanda", "a", "varanda", "varandas", "Балкон", "Há uma cadeira na varanda.", "На балконе есть стул.", 943, 391],
  ["quarto", "o", "quarto", "quartos", "Спальня", "A cama está no quarto.", "Кровать находится в спальне.", 754, 435],
  ["casa-de-banho", "a", "casa de banho", "casas de banho", "Ванная комната", "A casa de banho fica ao lado do quarto.", "Ванная комната находится рядом со спальней.", 630, 424],
  ["sala", "a", "sala", "salas", "Гостиная", "Estamos na sala.", "Мы в гостиной.", 629, 613],
  ["cozinha", "a", "cozinha", "cozinhas", "Кухня", "O frigorífico está na cozinha.", "Холодильник находится на кухне.", 436, 606],
  ["escritorio", "o", "escritório", "escritórios", "Рабочий кабинет", "Há uma secretária no escritório.", "В кабинете есть письменный стол.", 454, 416],
  ["escada", "a", "escada", "escadas", "Лестница", "As escadas dão acesso à cave.", "По лестнице можно попасть в подвал.", 207, 710, "as escadas"],
  ["corrimao", "o", "corrimão", "corrimãos", "Перила, поручень", "O corrimão fica ao lado das escadas.", "Перила находятся сбоку от лестницы.", 258, 671],
  ["hall-de-entrada", "o", "hall de entrada", "halls de entrada", "Прихожая", "Há um espelho no hall de entrada.", "В прихожей есть зеркало.", 853, 600],
  ["res-do-chao", "o", "rés do chão", "rés do chão", "Первый этаж, на уровне земли", "A cozinha fica no rés do chão.", "Кухня находится на первом этаже, на уровне земли.", 914, 496],
  ["primeiro-andar", "o", "primeiro andar", "primeiros andares", "Второй этаж по русской нумерации", "O quarto fica no primeiro andar.", "Спальня находится на втором этаже по русской нумерации.", 912, 335],
  ["sotao", "o", "sótão", "sótãos", "Чердак", "Há caixas no sótão.", "На чердаке есть коробки.", 794, 225],
  ["cave", "a", "cave", "caves", "Подвал", "A máquina de lavar está na cave.", "Стиральная машина находится в подвале.", 628, 668],
  ["garagem", "a", "garagem", "garagens", "Гараж", "O carro está na garagem.", "Машина находится в гараже.", 209, 613],
  ["grelhador", "o", "grelhador", "grelhadores", "Гриль, мангал", "O grelhador está no jardim.", "Гриль находится в саду.", 959, 641],
  ["teto", "o", "teto", "tetos", "Потолок", "Há um candeeiro no teto.", "На потолке есть светильник.", 308, 494],
  ["relva", "a", "relva", "relvas", "Газон, трава", "A relva é verde.", "Трава зелёная.", 987, 687],
  ["lareira", "a", "lareira", "lareiras", "Камин", "A lareira fica na sala.", "Камин находится в гостиной.", 690, 503],
  ["guarda-sol", "o", "guarda-sol", "guarda-sóis", "Солнцезащитный зонт", "O guarda-sol está aberto.", "Солнцезащитный зонт раскрыт.", 1011, 573],
];

export const houseWords: readonly HouseWord[] = entries.map(([slug, article, lemma, plural, translation, example, exampleTranslation, x, y, label], index) => ({
  id: `house-${slug}`, number: index + 1, label: label ?? `${article} ${lemma}`,
  display: { type: "noun", lemma, definiteArticle: article, plural, pluralDefiniteArticle: article === "a" ? "as" : "os", translationKey: `house.${slug}.translation` },
  translation, example, exampleTranslation, point: [x, y],
}));

export const houseDeck = { id: "house-a-casa", title: "Дом — A casa", source: "/learning/house", image: "/house-illustration-v3.png" } as const;

// The revised illustration has its own geometry. Original worksheet points above
// are retained as provenance; language identities and correct answers are unchanged.
export const houseIllustration = {
  width: 1448, height: 1086,
  crop: { x: 0, y: 0, width: 1448, height: 1086 },
  points: {
    "house-telhado": [450, 220], "house-chamine": [1045, 100],
    "house-janela": [897, 145], "house-cortina": [1110, 360],
    "house-persiana": [515, 360], "house-varanda": [1265, 520],
    "house-quarto": [936, 551], "house-casa-de-banho": [735, 530],
    "house-sala": [602, 829], "house-cozinha": [1098, 830],
    "house-escritorio": [487, 560], "house-escada": [92, 997],
    "house-corrimao": [232, 960], "house-hall-de-entrada": [429, 826],
    "house-res-do-chao": [1235, 630], "house-primeiro-andar": [1220, 334],
    "house-sotao": [991, 270], "house-cave": [758, 1020],
    "house-garagem": [174, 826], "house-grelhador": [1250, 920],
    "house-teto": [185, 615], "house-relva": [1381, 1001],
    "house-lareira": [650, 628], "house-guarda-sol": [1375, 685],
  } as Record<string, readonly [number, number]>,
};
export type HouseAnswers = Readonly<Record<string, string>>;

export const houseImageActivity: ImageMatchingDefinition = {
  id: "image-house", title: "Vamos visitar uma casa!",
  image: { src: houseDeck.image, alt: "Дом в разрезе: чердак, комнаты, гараж, подвал и сад", ...houseIllustration },
  wordIds: houseWords.map(word => word.id),
  spots: houseWords.map(word => ({ id: word.id, x: houseIllustration.points[word.id][0], y: houseIllustration.points[word.id][1], acceptedWordIds: [word.id] })),
  cardsHref: "/cards/house",
};

export function placeHouseWord(answers: HouseAnswers, spotId: string, wordId: string): HouseAnswers {
  return placeImageWord(answers, spotId, wordId);
}

export function checkHouseAnswers(answers: HouseAnswers) {
  return checkImageAnswers(houseImageActivity, answers);
}
