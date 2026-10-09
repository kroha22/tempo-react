import { allVerbKeys, people, verbs, type Tense, type VerbGroup } from "../../conjugation/data.ts";

export type TempoPracticeCard = { id: string; portuguese: string; spokenPortuguese: string; russian: string; prompt: string; hint: string; kind: "expression" | "form" };
export type TempoPracticeDeck = { id: string; title: string; description: string; category: "phrases" | "forms"; cards: readonly TempoPracticeCard[]; group?: VerbGroup };

const phrasePacks: { id: string; title: string; description: string; phrases: readonly (readonly [string, string, string])[] }[] = [
  { id: "social", title: "Знакомство и общение", description: "Рассказать о себе и поддержать разговор", phrases: [
    ["recent-resident", "Vivo aqui há pouco tempo.", "Я недавно здесь живу."],
    ["informal-address", "Pode tratar-me por tu.", "Можете обращаться ко мне на «ты»."],
    ["daily-study", "Estudo um pouco de português todos os dias.", "Я каждый день немного учу португальский."],
    ["speak-slowly", "Prefiro falar devagar para não me enganar.", "Я предпочитаю говорить медленно, чтобы не ошибиться."],
    ["spell-surname", "Como se escreve o seu apelido?", "Как пишется ваша фамилия?"],
    ["time-to-chat", "Hoje tenho tempo para conversar.", "Сегодня у меня есть время поговорить."],
    ["know-neighborhood", "Ainda não conheço bem esta zona.", "Я ещё плохо знаю этот район."],
    ["coffee-tomorrow", "Podemos tomar um café amanhã?", "Можем выпить кофе завтра?"],
  ] },
  { id: "transport", title: "Город и дорога", description: "Остановки, пересадки и путь пешком", phrases: [
    ["next-bus", "O próximo autocarro passa daqui a dez minutos.", "Следующий автобус будет через десять минут."],
    ["stop-near-market", "Esta paragem fica perto do mercado.", "Эта остановка находится недалеко от рынка."],
    ["change-line", "Tenho de mudar de linha nesta estação?", "Мне нужно пересесть на другую линию на этой станции?"],
    ["top-up-pass", "Quero carregar o meu passe.", "Я хочу пополнить проездной."],
    ["exit-across-street", "A saída fica do outro lado da rua.", "Выход находится на другой стороне улицы."],
    ["walk-to-library", "Posso ir a pé até à biblioteca?", "Можно дойти пешком до библиотеки?"],
    ["next-stop", "Vou sair na paragem seguinte.", "Я выйду на следующей остановке."],
    ["late-train", "Hoje o comboio está atrasado.", "Сегодня поезд опаздывает."],
  ] },
  { id: "cafe", title: "Кафе и еда", description: "Выбрать еду, попросить и оплатить", phrases: [
    ["soup-and-water", "Vou querer uma sopa e um copo de água.", "Я возьму суп и стакан воды."],
    ["seat-by-window", "Podemos sentar-nos junto à janela?", "Можем сесть возле окна?"],
    ["walnut-ingredient", "Este prato leva nozes?", "В этом блюде есть грецкие орехи?"],
    ["coffee-no-sugar", "Prefiro o café sem açúcar.", "Я предпочитаю кофе без сахара."],
    ["extra-napkin", "Pode trazer mais um guardanapo?", "Можете принести ещё одну салфетку?"],
    ["hot-soup", "A sopa está muito quente.", "Суп очень горячий."],
    ["split-bill", "Vamos dividir a conta.", "Давайте разделим счёт."],
    ["cheese-sandwich", "Para mim, uma sandes de queijo.", "Мне сэндвич с сыром."],
  ] },
  { id: "shopping", title: "Покупки и оплата", description: "Размеры, цены, чек и пакет", phrases: [
    ["lighter-coat", "Estou à procura de um casaco mais leve.", "Я ищу более лёгкую куртку."],
    ["different-size", "Há este modelo noutro tamanho?", "Есть эта модель другого размера?"],
    ["try-shoes", "Posso experimentar estes sapatos?", "Можно примерить эти ботинки?"],
    ["discount-included", "Este preço já inclui o desconto?", "Эта цена уже учитывает скидку?"],
    ["part-cash", "Posso pagar uma parte em dinheiro?", "Можно оплатить часть наличными?"],
    ["carry-bag", "Preciso de um saco para levar isto.", "Мне нужен пакет, чтобы унести это."],
    ["keep-receipt", "Guardo o recibo para poder trocar o artigo.", "Я сохраню чек, чтобы можно было обменять товар."],
    ["closing-time", "A loja fecha daqui a meia hora.", "Магазин закрывается через полчаса."],
  ] },
  { id: "home", title: "Жильё и быт", description: "Вещи дома и небольшие просьбы", phrases: [
    ["key-on-table", "A chave ficou em cima da mesa.", "Ключ остался на столе."],
    ["open-window", "É preciso abrir a janela um pouco.", "Нужно немного открыть окно."],
    ["washing-finished", "A máquina de lavar já terminou.", "Стиральная машина уже закончила работать."],
    ["books-on-shelf", "Vou pôr os livros na estante.", "Я поставлю книги на стеллаж."],
    ["lamp-not-working", "Esta lâmpada deixou de funcionar.", "Эта лампа перестала работать."],
    ["clean-kitchen", "Hoje vamos limpar a cozinha.", "Сегодня мы уберём кухню."],
    ["lower-volume", "Pode baixar um pouco o volume?", "Можете немного убавить громкость?"],
    ["extra-chair", "Há espaço para mais uma cadeira.", "Есть место для ещё одного стула."],
  ] },
  { id: "study", title: "Учёба и просьбы", description: "Уточнить, повторить и объяснить", phrases: [
    ["read-again", "Vou ler a frase mais uma vez.", "Я прочитаю фразу ещё раз."],
    ["last-word", "Não percebi a última palavra.", "Я не понял последнее слово."],
    ["another-example", "Pode dar outro exemplo?", "Можете привести другой пример?"],
    ["answer-in-notebook", "Escrevi a resposta no caderno.", "Я записал ответ в тетрадь."],
    ["thinking-time", "Preciso de mais um minuto para pensar.", "Мне нужна ещё одна минута, чтобы подумать."],
    ["compare-answers", "Vamos comparar as duas respostas.", "Давайте сравним два ответа."],
    ["past-form", "Esta forma usa-se no passado.", "Эта форма используется в прошедшем времени."],
    ["other-words", "Já consigo explicar isto por outras palavras.", "Я уже могу объяснить это другими словами."],
  ] },
];

const phraseDecks: TempoPracticeDeck[] = phrasePacks.map(pack => ({
  id: `tempo:deck:phrases:${pack.id}`, title: pack.title, description: pack.description, category: "phrases",
  cards: pack.phrases.map(([key, portuguese, russian]) => ({ id: `tempo:phrase:${pack.id}:${key}`, portuguese, spokenPortuguese: portuguese, russian, prompt: portuguese, hint: "Фраза · Португалия", kind: "expression" })),
}));
const groupNames: Record<VerbGroup, string> = { ar: "-AR", er: "-ER", ir: "-IR", irregular: "Неправильные" };
const personNames = { eu: "я", tu: "ты", ele: "он / она", nos: "мы", voces: "вы", eles: "они" };
const pronouns = { eu: "eu", tu: "tu", ele: "ele / ela", nos: "nós", voces: "vocês", eles: "eles / elas" };
const formDecks: TempoPracticeDeck[] = (["ar", "er", "ir", "irregular"] as const).flatMap(group => (["present", "past"] as readonly Tense[]).map(tense => ({
  id: `tempo:deck:forms:${group}:${tense}`, title: `${groupNames[group]} · ${tense === "present" ? "Настоящее" : "Прошедшее"}`,
  description: tense === "present" ? "Presente: вспомни форму для местоимения" : "Pretérito perfeito: завершённое действие", category: "forms", group,
  cards: allVerbKeys.filter(key => verbs[key].group === group).flatMap(key => people.map(person => ({
    id: `tempo:form:${key}:${tense}:${person.key}`, portuguese: `${pronouns[person.key]} ${verbs[key].forms[tense][person.key]}`,
    spokenPortuguese: verbs[key].forms[tense][person.key],
    russian: `${personNames[person.key]} · ${verbs[key].translation}`, prompt: `${personNames[person.key]} · ${verbs[key].translation}`,
    hint: `${verbs[key].infinitive} · ${tense === "present" ? "Presente" : "Pretérito perfeito"}`, kind: "form" as const,
  }))),
})));
export const tempoPracticeDecks = [...phraseDecks, ...formDecks];
