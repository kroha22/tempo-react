import { catalogWords } from "./learning-catalog-view";
import { greetingSets } from "./greetings";
import { schoolInstructionCards } from "./school-content";
import { sceneWords } from "./picture-scenes";
import type { VocabularyWord } from "./vocabulary-model";

// A selection of canonical words, not another copy of the vocabulary catalogue.
// Whole classroom commands are chunks; they must not reuse infinitive card IDs.
const key = (text: string) => text.toLocaleLowerCase("pt-PT").replace(/[.!?…]/g, "").trim();
const words = new Map(catalogWords.map(word => [key(word.label), word]));
function phrase(id: string, label: string, translation: string): VocabularyWord {
  const existing = words.get(key(label));
  if (existing) return existing;
  const word = { id, label, translation };
  words.set(key(label), word);
  return word;
}
function greeting(setId: string) {
  return greetingSets.find(set => set.id === setId)!.phrases.map(item =>
    phrase(`${setId}:phrase:${key(item.pt).normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z]+/g, "-")}`, item.pt, item.ru));
}
// Register every existing greeting chunk before selecting smaller views of it.
greetingSets.forEach(set => greeting(set.id));
const starterSets = [
  { id: "hello", pt: "Olá e até amanhã", title: "Приветствия", cue: "Поздороваться и попрощаться", words: [...greeting("greetings:hello"), ...greeting("greetings:goodbye")] },
  { id: "polite", pt: "Por favor", title: "Вежливость и помощь", cue: "Попросить, поблагодарить, извиниться", words: [
    phrase("quick:por-favor", "Por favor.", "Пожалуйста (при просьбе)."),
    phrase("quick:obrigado", "Obrigado.", "Спасибо (говорит мужчина или мальчик)."),
    phrase("quick:obrigada", "Obrigada.", "Спасибо (говорит женщина или девочка)."),
    phrase("quick:de-nada", "De nada.", "Не за что."),
    phrase("quick:desculpa", "Desculpa.", "Извини (на ты)."),
    phrase("quick:com-licenca", "Com licença.", "Разрешите / извините (чтобы пройти)."),
    phrase("quick:help", "Preciso de ajuda.", "Мне нужна помощь."),
  ] },
  { id: "backpack", pt: "Na mochila", title: "В рюкзаке", cue: "Школьные принадлежности", words: sceneWords.filter(word => ["a mochila", "o caderno", "o lápis", "a caneta", "o livro", "a borracha", "a régua"].includes(word.label)).map(word => words.get(key(word.label)) ?? word) },
  { id: "instructions", pt: "Na aula", title: "Команды учителя", cue: "Понять, что нужно сделать", words: schoolInstructionCards.map(card => phrase(`school:instruction:${card.infinitive}`, card.examplePt, card.exampleRu)) },
  { id: "requests", pt: "Posso…?", title: "Просьбы в классе", cue: "Обратиться к учителю", words: [
    phrase("school:request:understand", "Não percebi.", "Я не понял / не поняла."),
    phrase("school:request:repeat", "Pode repetir, por favor?", "Повторите, пожалуйста (учителю)."),
    phrase("school:request:slow", "Pode falar mais devagar?", "Можете говорить медленнее?"),
    phrase("quick:help", "Preciso de ajuda.", "Мне нужна помощь."),
    phrase("school:request:toilet", "Posso ir à casa de banho?", "Можно в туалет?"),
    phrase("school:request:water", "Posso beber água?", "Можно попить воды?"),
    phrase("school:request:pencil", "Posso usar um lápis?", "Можно воспользоваться карандашом?"),
  ] },
] as const;
const phraseSet = (id: string, pt: string, title: string, cue: string, audience: "adult" | "child", entries: readonly (readonly [string, string, string])[]) => ({
  id, pt, title, cue, audience,
  words: entries.map(([slug, label, translation]) => phrase(`quick:phrase:${slug}`, label, translation)),
});
export const quickPhraseSets = [
  phraseSet("adult-everyday", "No dia a dia", "Бытовые просьбы", "Вежливое обращение к незнакомому взрослому", "adult", [
    ["open-formal", "Abra, por favor.", "Откройте, пожалуйста."],
    ["wait-formal", "Espere, por favor.", "Подождите, пожалуйста."],
    ["help-formal", "Pode ajudar-me?", "Можете мне помочь?"],
    ["repeat", "Pode repetir, por favor?", "Повторите, пожалуйста."],
    ["slow", "Pode falar mais devagar?", "Можете говорить медленнее?"],
    ["understand", "Não percebi.", "Я не понял / не поняла."],
  ]),
  phraseSet("adult-small-talk", "À conversa", "Небольшой разговор", "Разговор со знакомым на «ты»", "adult", [
    ["how-are-you", "Como estás?", "Как дела?"],
    ["well", "Estou bem.", "У меня всё хорошо."],
    ["and-you", "E tu?", "А ты?"],
    ["all-good", "Tudo bem?", "Всё хорошо?"],
    ["weather", "Está bom tempo!", "Хорошая погода!"],
    ["weekend-question", "Como foi o fim de semana?", "Как прошли выходные?"],
    ["see-tomorrow", "Até amanhã!", "До завтра!"],
    ["nice-weekend", "Bom fim de semana!", "Хороших выходных!"],
  ]),
  phraseSet("adult-shopping", "Nas compras", "В магазине и кафе", "Заказать, спросить цену и оплатить", "adult", [
    ["price", "Quanto custa?", "Сколько стоит?"],
    ["coffee", "Queria um café, por favor.", "Мне кофе, пожалуйста."],
    ["water-order", "Queria uma água, por favor.", "Мне воду, пожалуйста."],
    ["bill", "A conta, por favor.", "Счёт, пожалуйста."],
    ["card", "Posso pagar com cartão?", "Можно оплатить картой?"],
    ["only-that", "É só isso.", "Это всё (о покупке или заказе)."],
  ]),
  phraseSet("adult-plans", "Combinamos?", "Планы и встречи", "Договориться со знакомым на «ты»", "adult", [
    ["on-my-way", "Estou a caminho.", "Я в пути."],
    ["late", "Vou chegar atrasado.", "Я опоздаю (говорит мужчина)."],
    ["late-f", "Vou chegar atrasada.", "Я опоздаю (говорит женщина)."],
    ["hour", "A que horas?", "Во сколько?"],
    ["where-meet", "Onde nos encontramos?", "Где встретимся?"],
    ["tomorrow-can", "Amanhã posso.", "Завтра я могу."],
    ["today-cant", "Hoje não posso.", "Сегодня я не могу."],
    ["agreed", "Combinado!", "Договорились!"],
  ]),
  phraseSet("child-actions", "O que faço", "Что я делаю", "Короткие фразы о своём дне", "child", [
    ["go-school", "Vou para a escola.", "Я иду в школу."],
    ["go-home", "Vou para casa.", "Я иду домой."],
    ["reading", "Estou a ler.", "Я читаю."],
    ["writing", "Estou a escrever.", "Я пишу."],
    ["finished", "Já acabei.", "Я уже закончил / закончила."],
    ["want-play", "Quero brincar.", "Я хочу поиграть."],
  ]),
  phraseSet("child-classroom", "Com o professor", "Говорю с учителем", "Учителю: pode, abra, espere — вежливо, не на «ты»", "child", [
    ["understand", "Não percebi.", "Я не понял / не поняла."],
    ["repeat", "Pode repetir, por favor?", "Повторите, пожалуйста."],
    ["help-formal", "Pode ajudar-me?", "Можете мне помочь?"],
    ["what-do", "O que é para fazer?", "Что нужно сделать?"],
    ["open-formal", "Abra, por favor.", "Откройте, пожалуйста."],
    ["wait-formal", "Espere, por favor.", "Подождите, пожалуйста."],
  ]),
  phraseSet("child-permission", "Posso?", "Можно мне?", "Спросить разрешение в классе", "child", [
    ["enter", "Posso entrar?", "Можно войти?"],
    ["leave", "Posso sair?", "Можно выйти?"],
    ["toilet", "Posso ir à casa de banho?", "Можно в туалет?"],
    ["drink", "Posso beber água?", "Можно попить воды?"],
    ["pencil", "Posso usar um lápis?", "Можно воспользоваться карандашом?"],
    ["sit", "Posso sentar-me aqui?", "Можно сесть здесь?"],
  ]),
  phraseSet("child-friends", "Com os amigos", "С друзьями", "Другу на «ты»: podes, abre, espera", "child", [
    ["play-question", "Queres brincar?", "Хочешь поиграть?"],
    ["together", "Vamos juntos!", "Пойдём вместе!"],
    ["help-friend", "Podes ajudar-me?", "Можешь мне помочь?"],
    ["open-friend", "Abre, por favor.", "Открой, пожалуйста."],
    ["wait-friend", "Espera, por favor.", "Подожди, пожалуйста."],
    ["come-play", "Vem brincar!", "Приходи поиграть!"],
  ]),
  phraseSet("child-games", "Vamos jogar!", "Играем вместе", "Очередь, правила и совместная игра", "child", [
    ["my-turn", "É a minha vez.", "Моя очередь."],
    ["your-turn", "É a tua vez.", "Твоя очередь."],
    ["share", "Podemos partilhar.", "Мы можем поделиться."],
    ["again", "Outra vez!", "Ещё раз!"],
    ["won", "Ganhei!", "Я выиграл / выиграла!"],
    ["well-done", "Muito bem!", "Молодец! / Отлично!"],
    ["stop", "Podes parar, por favor?", "Можешь остановиться, пожалуйста?"],
    ["agreed", "Combinado!", "Договорились!"],
  ]),
];
export const quickWordSets = [...starterSets.map(set => ({...set, audience: ["backpack", "instructions", "requests"].includes(set.id) ? "child" as const : "all" as const})), ...quickPhraseSets];
export type QuickWordSet = (typeof quickWordSets)[number];
export function quickSetsFor(child: boolean) { return quickWordSets.filter(set => set.audience === "all" || set.audience === (child ? "child" : "adult")); }
