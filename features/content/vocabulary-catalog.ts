import { firstVerticalSliceContentPack as lessonContent } from "./manifest.ts";
import { houseVocabularyGroup, housePracticeWords, housePlaces, houseRoomGroup } from "./house-practice.ts";
import { vocabularySets, type VocabularyGroup } from "./vocabulary-model.ts";
import { verbCards } from "../cards/data/verb-cards.ts";
import { clothingWords, clothingGroup } from "./clothing.ts";
import { sceneWords, scenesGroup } from "./picture-scenes.ts";
import { schoolInstructionCards, schoolInstructionWordIds } from "./school-content.ts";
import type { PairBlock, PairWord } from "../practice/word-pairs.ts";

// IDs reference existing content. This registry does not own translations or review state.
const lessonWords: PairWord[] = lessonContent.studyItems.map(item => {
  const display = item.display;
  return { id: item.id, label: display.type === "noun" ? `${display.definiteArticle} ${display.lemma}` : display.type === "verb" ? display.infinitive : display.text, translation: lessonContent.locales.ru[display.translationKey] };
});
const lessonSource = (id: string) => `/learning/lessons/${encodeURIComponent(id)}`;
const lessonBlocks: PairBlock[] = [
  { id: "pairs-introductions", title: "Знакомство", words: ["study:chunk:ola", "study:chunk:como-te-chamas", "study:chunk:chamo-me", "study:chunk:sou-name", "study:chunk:muito-prazer"], sourceHref: lessonSource("lesson:a1-1:introduce-yourself") },
  { id: "pairs-familiar-objects", title: "Знакомые предметы", words: lessonWords.filter(word => word.id.startsWith("study:noun:") && !["estacao", "hotel", "farmacia", "centro"].some(slug => word.id === `study:noun:${slug}`)).map(word => word.id), sourceHref: "/learning/route" },
  { id: "pairs-location", title: "Где находится?", words: ["study:chunk:onde-esta", "study:chunk:dentro-de", "study:chunk:em-cima-de", "study:chunk:debaixo-de", "study:chunk:ao-lado-de"], sourceHref: lessonSource("lesson:a1-1:locate-object") },
  { id: "pairs-being-having", title: "Быть, иметь, есть", words: ["study:verb:ser:identity", "study:verb:estar:state", "study:verb:ter:possession", "study:chunk:ha-presence"], sourceHref: "/learning/route" },
  { id: "pairs-city", title: "Места в городе", words: ["study:noun:estacao", "study:noun:hotel", "study:noun:farmacia", "study:noun:centro", "study:chunk:onde-fica", "study:verb:ficar:location"], sourceHref: lessonSource("lesson:a1-1:ask-place-location") },
].map(block => ({ ...block, group: "Из уроков", sourceLabel: "Слова и выражения из маршрута" }));

// A bounded, manually reviewed selection; the remaining automatic dictionary glosses
// need editorial review before they can become beginner matching distractors.
const verbThemes = [
  ["movement", "Движение и поездки", "ir vir chegar sair entrar voltar andar correr subir descer viajar levar trazer parar"],
  ["communication", "Общение", "falar perguntar responder ouvir escrever ler explicar chamar"],
  ["study-work", "Работа и учёба", "trabalhar estudar ensinar pensar saber entender lembrar esquecer"],
  ["everyday-actions", "Повседневные действия", "procurar encontrar escolher ajudar usar abrir fechar fazer"],
  ["food-shopping", "Еда и покупки", "comer beber cozinhar comprar vender pagar pedir"],
  ["rest", "Отдых и свободное время", "dormir acordar descansar dançar nadar passear sorrir rir"],
  ["feelings", "Желания и чувства", "gostar querer sentir"],
] as const;
function verbId(infinitive: string): string {
  const word = verbCards.find(word => word.pt === infinitive);
  if (!word) throw new Error(`Unknown pair vocabulary verb: ${infinitive}`);
  return word.id;
}
const verbBlocks: PairBlock[] = verbThemes.map(([slug, title, infinitives]) => ({ id: `pairs-verbs-${slug}`, title, words: infinitives.split(" ").map(verbId), group: "Глаголы на каждый день", sourceLabel: "Из колоды глаголов", sourceHref: "/cards#cards" }));
const schoolInstructionBlock: PairBlock = {
  id: "pairs-school-instructions",
  title: "Инструкции на уроке",
  words: schoolInstructionWordIds,
  group: "Школа",
  sourceLabel: "Колода школьных инструкций",
  sourceHref: "/cards#cards",
};
const selectedVerbs = new Set(verbBlocks.flatMap(block => block.words));

export const pairVocabulary: readonly PairWord[] = [
  ...sceneWords,
  ...clothingWords,
  ...lessonWords,
  ...housePracticeWords.map(word => ({ ...word, acceptedAnswers: housePlaces.find(place => place.id === word.id) })),
  ...schoolInstructionCards,
  ...verbCards.filter(word => selectedVerbs.has(word.id) && !schoolInstructionWordIds.includes(word.id)).map(word => ({ id: word.id, label: word.pt, translation: word.ru })),
];
export const vocabularyGroups: readonly VocabularyGroup[] = [
  scenesGroup,
  clothingGroup,
  { id: "vocabulary-lessons", title: "Из уроков", subgroups: lessonBlocks.map(block => ({ id: block.id, title: block.title, sets: [block] })) },
  { id: "vocabulary-school", title: "Школа", subgroups: [{ id: "school-instructions", title: "На уроке", sets: [schoolInstructionBlock] }] },
  { ...houseVocabularyGroup, imageActivityIds: ["image-house"], subgroups: houseVocabularyGroup.subgroups.map(subgroup => ({ ...subgroup, sets: subgroup.sets.map(set => ({ ...set, sourceLabel: "Задания про дом", sourceHref: "/learning/house" })) })) },
  { id: "vocabulary-verbs", title: "Глаголы на каждый день", subgroups: verbBlocks.map(block => ({ id: block.id, title: block.title, sets: [block] })) },
];
export const studyVocabularyGroups: readonly VocabularyGroup[] = vocabularyGroups.map(group => group.id === houseVocabularyGroup.id
  ? { ...group, title: "Дом", subgroups: [...group.subgroups, ...houseRoomGroup.subgroups] }
  : group);

export const pairTopics: readonly PairBlock[] = vocabularyGroups.flatMap(group => vocabularySets(group).map(set => ({ ...set, group: group.title })));
