import { generalVocabulary } from "./general-vocabulary.ts";
import type { GeneralVocabularyPartOfSpeech } from "./general-vocabulary-types.ts";

export type VocabularyLessonItem = {
  id: string;
  sourceEntryId: string;
  partOfSpeech: GeneralVocabularyPartOfSpeech;
  lemma: string;
  display: string;
  translation: string;
  examplePt: string;
  exampleRu: string;
  editorialStatus: "reviewed";
};

export type VocabularyLesson = {
  id: string;
  icon: string;
  title: string;
  description: string;
  canDo: string;
  examplePt: string;
  exampleRu: string;
  items: readonly VocabularyLessonItem[];
};

type ItemSeed = readonly [
  partOfSpeech: GeneralVocabularyPartOfSpeech,
  lemma: string,
  display: string,
  examplePt: string,
  exampleRu: string,
];

function lessonItem(lessonId: string, seed: ItemSeed): VocabularyLessonItem {
  const [partOfSpeech, lemma, display, examplePt, exampleRu] = seed;
  const source = generalVocabulary.find(
    (entry) => entry.partOfSpeech === partOfSpeech && entry.portuguese === lemma,
  );
  if (!source) throw new Error(`Missing vocabulary source entry: ${partOfSpeech}:${lemma}`);
  return {
    id: `vocabulary-lesson:${lessonId}:${source.id.split(":").at(-1)}`,
    sourceEntryId: source.id,
    partOfSpeech,
    lemma,
    display,
    translation: source.translation,
    examplePt,
    exampleRu,
    editorialStatus: "reviewed",
  };
}

function lesson(
  id: string,
  icon: string,
  title: string,
  description: string,
  canDo: string,
  examplePt: string,
  exampleRu: string,
  seeds: readonly ItemSeed[],
): VocabularyLesson {
  return {
    id: `vocabulary-lesson:${id}`,
    icon,
    title,
    description,
    canDo,
    examplePt,
    exampleRu,
    items: seeds.map((seed) => lessonItem(id, seed)),
  };
}

export const vocabularyLessons = [
  lesson(
    "home",
    "⌂",
    "Дом и вещи",
    "6 существительных с артиклем и множественным числом",
    "Я могу назвать знакомые предметы дома.",
    "A chave está no apartamento.",
    "Ключ находится в квартире.",
    [
      ["noun", "apartamento", "o apartamento — os apartamentos", "Moro num apartamento pequeno.", "Я живу в небольшой квартире."],
      ["noun", "sala", "a sala — as salas", "A sala tem duas janelas.", "В гостиной два окна."],
      ["noun", "espelho", "o espelho — os espelhos", "O espelho está na sala.", "Зеркало находится в гостиной."],
      ["noun", "chave", "a chave — as chaves", "A chave está na mesa.", "Ключ лежит на столе."],
      ["noun", "teto", "o teto — os tetos", "O teto é branco.", "Потолок белый."],
      ["noun", "objeto", "o objeto — os objetos", "Este objeto é leve.", "Этот предмет лёгкий."],
    ],
  ),
  lesson(
    "work",
    "▦",
    "Работа и встречи",
    "Люди, места и события рабочего дня",
    "Я могу понять короткое сообщение о работе.",
    "A reunião é no escritório.",
    "Встреча проходит в офисе.",
    [
      ["noun", "emprego", "o emprego — os empregos", "Procuro um emprego novo.", "Я ищу новую работу."],
      ["noun", "escritório", "o escritório — os escritórios", "Trabalho num escritório pequeno.", "Я работаю в небольшом офисе."],
      ["noun", "empresa", "a empresa — as empresas", "A empresa fica no centro.", "Компания находится в центре."],
      ["noun", "reunião", "a reunião — as reuniões", "Temos uma reunião hoje.", "Сегодня у нас встреча."],
      ["noun", "salário", "o salário — os salários", "O salário chega no fim do mês.", "Зарплата приходит в конце месяца."],
      ["noun", "cliente", "o/a cliente — os/as clientes", "A cliente espera na sala.", "Клиентка ждёт в комнате."],
    ],
  ),
  lesson(
    "city",
    "⌖",
    "Город и дорога",
    "Ориентиры для прогулки и поездки",
    "Я могу назвать знакомые места в городе.",
    "A estação fica nesta avenida.",
    "Станция находится на этом проспекте.",
    [
      ["noun", "rua", "a rua — as ruas", "Esta rua é estreita.", "Эта улица узкая."],
      ["noun", "praça", "a praça — as praças", "Encontramo-nos na praça.", "Мы встречаемся на площади."],
      ["noun", "avenida", "a avenida — as avenidas", "A avenida é muito larga.", "Проспект очень широкий."],
      ["noun", "ponte", "a ponte — as pontes", "A ponte fica perto daqui.", "Мост находится недалеко отсюда."],
      ["noun", "estação", "a estação — as estações", "A estação fica no centro.", "Станция находится в центре."],
      ["noun", "paragem", "a paragem — as paragens", "A paragem é ao lado da loja.", "Остановка находится рядом с магазином."],
    ],
  ),
  lesson(
    "cooking",
    "◒",
    "Готовим еду",
    "6 действий, которые встречаются на кухне",
    "Я могу понять основные действия в простом рецепте.",
    "A Rita corta e mistura os legumes.",
    "Рита режет и смешивает овощи.",
    [
      ["verb", "cozer", "cozer", "Vou cozer as batatas.", "Я собираюсь сварить картофель."],
      ["verb", "fritar", "fritar", "Ela frita o peixe.", "Она жарит рыбу."],
      ["verb", "assar", "assar", "Vamos assar os legumes.", "Мы запечём овощи."],
      ["verb", "cortar", "cortar", "O Rui corta o pão.", "Руй режет хлеб."],
      ["verb", "misturar", "misturar", "A Rita mistura o arroz com os legumes.", "Рита смешивает рис с овощами."],
      ["verb", "provar", "provar", "Quero provar a sopa.", "Я хочу попробовать суп."],
    ],
  ),
  lesson(
    "health",
    "✚",
    "Здоровье и самочувствие",
    "Действия, связанные с дыханием и восстановлением",
    "Я могу понять простую фразу о самочувствии.",
    "Preciso de respirar devagar e relaxar.",
    "Мне нужно медленно дышать и расслабиться.",
    [
      ["verb", "respirar", "respirar", "Respiro devagar.", "Я дышу медленно."],
      ["verb", "relaxar", "relaxar", "Preciso de relaxar.", "Мне нужно расслабиться."],
      ["verb", "tossir", "tossir", "O Rui está a tossir.", "Руй сейчас кашляет."],
      ["verb", "espirrar", "espirrar", "Ela espirra muito hoje.", "Сегодня она много чихает."],
      ["verb", "curar", "curar", "Este remédio ajuda a curar a doença.", "Это лекарство помогает вылечить болезнь."],
      ["verb", "sarar", "sarar", "A ferida está a sarar.", "Рана заживает."],
    ],
  ),
  lesson(
    "people",
    "☺",
    "Люди и состояния",
    "Прилагательные для короткого описания человека",
    "Я могу кратко описать человека или его состояние.",
    "A Marta está feliz, mas o Rui está nervoso.",
    "Марта счастлива, а Руй нервничает.",
    [
      ["adjective", "feliz", "feliz", "A Marta está feliz.", "Марта счастлива."],
      ["adjective", "ocupado", "ocupado / ocupada", "Hoje estou ocupada.", "Сегодня я занята."],
      ["adjective", "livre", "livre", "A sala está livre.", "Комната свободна."],
      ["adjective", "nervoso", "nervoso / nervosa", "O Rui está nervoso.", "Руй нервничает."],
      ["adjective", "gentil", "gentil", "A cliente é muito gentil.", "Клиентка очень любезная."],
      ["adjective", "educado", "educado / educada", "O Pedro é educado.", "Педру воспитанный."],
    ],
  ),
  lesson(
    "communication",
    "◌",
    "Разговор и понимание",
    "6 глаголов для диалога и объяснений",
    "Я могу понять, что происходит в коротком разговоре.",
    "Ela explica e eu respondo.",
    "Она объясняет, а я отвечаю.",
    [
      ["verb", "dizer", "dizer", "Quero dizer uma coisa.", "Я хочу кое-что сказать."],
      ["verb", "responder", "responder", "Eu respondo à pergunta.", "Я отвечаю на вопрос."],
      ["verb", "explicar", "explicar", "Podes explicar outra vez?", "Можешь объяснить ещё раз?"],
      ["verb", "entender", "entender", "Agora entendo a resposta.", "Теперь я понимаю ответ."],
      ["verb", "conversar", "conversar", "Conversamos depois da reunião.", "Мы разговариваем после встречи."],
      ["verb", "contar", "contar", "Ela conta uma história curta.", "Она рассказывает короткую историю."],
    ],
  ),
  lesson(
    "movement",
    "➜",
    "Движение и поездки",
    "Глаголы маршрута и перемещения",
    "Я могу понять короткое описание маршрута.",
    "Chegamos à estação e depois vamos viajar.",
    "Мы прибываем на станцию, а затем отправляемся в поездку.",
    [
      ["verb", "chegar", "chegar", "Chego a casa às oito.", "Я прихожу домой в восемь."],
      ["verb", "voltar", "voltar", "Voltamos amanhã.", "Мы возвращаемся завтра."],
      ["verb", "subir", "subir", "Ela sobe as escadas.", "Она поднимается по лестнице."],
      ["verb", "descer", "descer", "O Rui desce no centro.", "Руй выходит в центре."],
      ["verb", "caminhar", "caminhar", "Gosto de caminhar pela cidade.", "Мне нравится гулять по городу."],
      ["verb", "viajar", "viajar", "Vamos viajar de comboio.", "Мы поедем на поезде."],
    ],
  ),
] as const satisfies readonly VocabularyLesson[];

export function validateVocabularyLessons(lessons: readonly VocabularyLesson[] = vocabularyLessons): string[] {
  const errors: string[] = [];
  const lessonIds = new Set<string>();
  const itemIds = new Set<string>();
  for (const current of lessons) {
    if (lessonIds.has(current.id)) errors.push(`Duplicate vocabulary lesson ID: ${current.id}`);
    lessonIds.add(current.id);
    if (current.items.length < 4 || current.items.length > 8) {
      errors.push(`Vocabulary lesson ${current.id} must contain 4-8 items`);
    }
    for (const item of current.items) {
      if (itemIds.has(item.id)) errors.push(`Duplicate vocabulary lesson item ID: ${item.id}`);
      itemIds.add(item.id);
      if (!generalVocabulary.some((entry) => entry.id === item.sourceEntryId && entry.portuguese === item.lemma)) {
        errors.push(`Unknown source for vocabulary lesson item: ${item.id}`);
      }
      if (!item.display.trim() || !item.examplePt.trim() || !item.exampleRu.trim()) {
        errors.push(`Incomplete vocabulary lesson item: ${item.id}`);
      }
    }
  }
  return errors;
}
