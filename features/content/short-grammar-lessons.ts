import type { LessonPracticeTarget } from "../practice/practice-types.ts";

export type Example = { pt: string; ru: string };
export type FormRow = { label: string; value: string };
export type ShortGrammarLesson = {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  rule: string;
  formula?: string;
  markers?: string[];
  forms?: FormRow[];
  examples: Example[];
  practice?: LessonPracticeTarget;
  quiz: { prompt: string; options: string[]; answer: number; explanation: string };
};

export const shortGrammarLessons: ShortGrammarLesson[] = [
  {
    id: "ser", chapter: "Настоящее", title: "SER", subtitle: "Кто? Что? Откуда?",
    rule: "SER называет человека или предмет: кто он, откуда, кем работает, из чего сделан. С ним также говорим о времени и устойчивых характеристиках.",
    formula: "кто/что + форма SER + характеристика",
    forms: [
      { label: "eu", value: "sou" }, { label: "tu", value: "és" }, { label: "ele / ela / você", value: "é" },
      { label: "nós", value: "somos" }, { label: "vocês", value: "são" }, { label: "eles / elas", value: "são" },
    ],
    examples: [
      { pt: "A Inês é arquiteta.", ru: "Инеш — архитектор." },
      { pt: "Somos de Braga.", ru: "Мы из Браги." },
      { pt: "A mesa é de madeira.", ru: "Стол деревянный." },
    ],
    practice: { kind: "being", beingVerb: "ser" },
    quiz: { prompt: "O Rui ___ português.", options: ["é", "está", "tem"], answer: 0, explanation: "Говорим о происхождении — нужна форма é от SER." },
  },
  {
    id: "estar", chapter: "Настоящее", title: "ESTAR", subtitle: "Где? В каком состоянии?",
    rule: "ESTAR показывает местоположение, состояние сейчас или результат изменения. Это не просто «временно»: закрытая дверь тоже está fechada.",
    formula: "кто/что + форма ESTAR + состояние или место",
    forms: [
      { label: "eu", value: "estou" }, { label: "tu", value: "estás" }, { label: "ele / ela / você", value: "está" },
      { label: "nós", value: "estamos" }, { label: "vocês", value: "estão" }, { label: "eles / elas", value: "estão" },
    ],
    examples: [
      { pt: "Estou cansada hoje.", ru: "Сегодня я устала." },
      { pt: "As chaves estão na mochila.", ru: "Ключи в рюкзаке." },
      { pt: "A janela está aberta.", ru: "Окно открыто." },
    ],
    practice: { kind: "being", beingVerb: "estar" },
    quiz: { prompt: "Nós ___ no centro.", options: ["somos", "estamos", "temos"], answer: 1, explanation: "Местоположение выражаем ESTAR: estamos." },
  },
  {
    id: "ser-estar", chapter: "Настоящее", title: "SER или ESTAR?", subtitle: "Характеристика и состояние",
    rule: "SER говорит, что это за человек или предмет. ESTAR — где он и как себя чувствует или выглядит в конкретной ситуации. Некоторые прилагательные меняют смысл вместе с глаголом.",
    markers: ["SER: профессия, происхождение, материал", "ESTAR: место, состояние, результат"],
    examples: [
      { pt: "A Marta é alegre.", ru: "Марта жизнерадостная." },
      { pt: "Hoje a Marta está alegre.", ru: "Сегодня Марта в хорошем настроении." },
      { pt: "O café é bom, mas está frio.", ru: "Кофе хороший, но он остыл." },
    ],
    practice: { kind: "being", beingVerb: "ser" },
    quiz: { prompt: "A sopa ___ quente agora.", options: ["é", "está", "são"], answer: 1, explanation: "Температура в данный момент — está." },
  },
  {
    id: "estar-a", chapter: "Настоящее", title: "ESTAR A + infinitivo", subtitle: "Действие прямо сейчас",
    rule: "В европейском португальском действие в процессе строится через ESTAR A и инфинитив. Изменяется только ESTAR, основной глагол остаётся в начальной форме.",
    formula: "ESTAR + a + infinitivo",
    markers: ["agora", "neste momento", "hoje"],
    forms: [
      { label: "eu", value: "estou a trabalhar" }, { label: "tu", value: "estás a trabalhar" },
      { label: "ele / ela", value: "está a trabalhar" }, { label: "nós", value: "estamos a trabalhar" },
      { label: "vocês", value: "estão a trabalhar" }, { label: "eles / elas", value: "estão a trabalhar" },
    ],
    examples: [
      { pt: "Estou a preparar o jantar.", ru: "Я сейчас готовлю ужин." },
      { pt: "O que estás a fazer?", ru: "Что ты сейчас делаешь?" },
      { pt: "Eles estão a falar baixo.", ru: "Они сейчас тихо разговаривают." },
    ],
    practice: { kind: "action", actionUse: "now" },
    quiz: { prompt: "A Ana ___ um livro neste momento.", options: ["lê", "está a ler", "é a ler"], answer: 1, explanation: "Действие идёт neste momento: está a ler." },
  },
  {
    id: "present-ar", chapter: "Настоящее", title: "Правильные -AR", subtitle: "Самая большая группа",
    rule: "Убираем -AR и добавляем окончание по лицу. Эти формы описывают привычки, факты и регулярные действия.",
    formula: "fal-ar → fal- + окончание",
    forms: [
      { label: "eu", value: "falo" }, { label: "tu", value: "falas" }, { label: "ele / ela", value: "fala" },
      { label: "nós", value: "falamos" }, { label: "vocês", value: "falam" }, { label: "eles / elas", value: "falam" },
    ],
    examples: [
      { pt: "Trabalho em casa às sextas.", ru: "По пятницам я работаю дома." },
      { pt: "Falamos português na aula.", ru: "На уроке мы говорим по-португальски." },
      { pt: "A Leonor estuda música.", ru: "Леонор изучает музыку." },
    ],
    practice: { kind: "group", group: "ar", tense: "present" },
    quiz: { prompt: "Nós ___ no Porto.", options: ["moro", "moramos", "moram"], answer: 1, explanation: "С nós у правильного -AR окончание -amos: moramos." },
  },
  {
    id: "present-er", chapter: "Настоящее", title: "Правильные -ER", subtitle: "Основа плюс окончание",
    rule: "Убираем -ER. В формах eu, tu и ele слышим e; с nós появляется -emos, а во множественном числе — -em.",
    formula: "com-er → com- + окончание",
    forms: [
      { label: "eu", value: "como" }, { label: "tu", value: "comes" }, { label: "ele / ela", value: "come" },
      { label: "nós", value: "comemos" }, { label: "vocês", value: "comem" }, { label: "eles / elas", value: "comem" },
    ],
    examples: [
      { pt: "Bebo café sem açúcar.", ru: "Я пью кофе без сахара." },
      { pt: "Aprendemos depressa.", ru: "Мы быстро учимся." },
      { pt: "Os miúdos comem cedo.", ru: "Дети едят рано." },
    ],
    practice: { kind: "group", group: "er", tense: "present" },
    quiz: { prompt: "Tu ___ muito bem.", options: ["corres", "corre", "corremos"], answer: 0, explanation: "С tu у правильного -ER окончание -es: corres." },
  },
  {
    id: "present-er-irregular", chapter: "Настоящее", title: "Неправильные -ER", subtitle: "Запоминаем опорные формы",
    rule: "У частых -ER меняется основа или отдельные формы. Удобнее учить не одно eu, а короткий набор: eu, ele и nós.",
    forms: [
      { label: "fazer", value: "faço · faz · fazemos" }, { label: "dizer", value: "digo · diz · dizemos" },
      { label: "poder", value: "posso · pode · podemos" }, { label: "querer", value: "quero · quer · queremos" },
      { label: "ver", value: "vejo · vê · vemos" }, { label: "ler", value: "leio · lê · lemos" },
    ],
    examples: [
      { pt: "Faço exercício de manhã.", ru: "Я занимаюсь утром." },
      { pt: "Queres vir connosco?", ru: "Хочешь пойти с нами?" },
      { pt: "Não posso ficar hoje.", ru: "Я не могу сегодня остаться." },
    ],
    practice: { kind: "verb", verbKey: "fazer", tense: "present" },
    quiz: { prompt: "Eu ___ a verdade.", options: ["dizo", "digo", "diz"], answer: 1, explanation: "Форма eu от dizer — digo." },
  },
  {
    id: "present-ir", chapter: "Настоящее", title: "Глаголы -IR", subtitle: "Правильные формы и чередования",
    rule: "У правильных -IR окончания похожи на -ER, но с nós будет -imos. У некоторых частых глаголов меняется гласная основы: servir → sirvo, dormir → durmo.",
    forms: [
      { label: "eu", value: "abro" }, { label: "tu", value: "abres" }, { label: "ele / ela", value: "abre" },
      { label: "nós", value: "abrimos" }, { label: "vocês", value: "abrem" }, { label: "eles / elas", value: "abrem" },
    ],
    examples: [
      { pt: "Abrimos a loja às nove.", ru: "Мы открываем магазин в девять." },
      { pt: "Sirvo o almoço ao meio-dia.", ru: "Я подаю обед в полдень." },
      { pt: "O bebé dorme bem.", ru: "Малыш хорошо спит." },
    ],
    practice: { kind: "group", group: "ir", tense: "present" },
    quiz: { prompt: "Nós ___ a porta.", options: ["abrimos", "abremos", "abrem"], answer: 0, explanation: "С nós у abrir форма abrimos." },
  },
  {
    id: "present-ir-special", chapter: "Настоящее", title: "Особые -IR, -AIR, -UIR", subtitle: "Короткая карта исключений",
    rule: "Частые ir, vir, ouvir и pedir имеют свои опорные формы. У глаголов на -air и -uir важно услышать гласную: caio, saio, construo.",
    forms: [
      { label: "ir", value: "vou · vais · vai · vamos · vão" }, { label: "vir", value: "venho · vens · vem · vimos · vêm" },
      { label: "ouvir", value: "ouço · ouves · ouve · ouvimos · ouvem" }, { label: "pedir", value: "peço · pedes · pede · pedimos · pedem" },
      { label: "cair", value: "caio · cais · cai · caímos · caem" }, { label: "construir", value: "construo · constróis · constrói · construímos · constroem" },
    ],
    examples: [
      { pt: "Vou de metro para o trabalho.", ru: "Я езжу на работу на метро." },
      { pt: "Ouve-se música na rua.", ru: "На улице слышна музыка." },
      { pt: "Eles constroem casas pequenas.", ru: "Они строят небольшие дома." },
    ],
    practice: { kind: "verb", verbKey: "ir", tense: "present" },
    quiz: { prompt: "Eu ___ ajuda quando preciso.", options: ["pedo", "peço", "pido"], answer: 1, explanation: "Форма eu от pedir — peço." },
  },
  {
    id: "ir-plans", chapter: "Основные глаголы", title: "IR: идти и планировать", subtitle: "Куда идём и что собираемся делать",
    rule: "IR обозначает движение, а вместе с инфинитивом помогает говорить о планах. В конструкции будущего изменяется только IR, а смысловой глагол остаётся в начальной форме.",
    formula: "форма IR + infinitivo",
    markers: ["движение: vou ao mercado / vamos para casa", "план: vou trabalhar / vamos viajar", "подсказки: amanhã, logo, no fim de semana"],
    forms: [
      { label: "eu", value: "vou" }, { label: "tu", value: "vais" }, { label: "ele / ela / você", value: "vai" },
      { label: "nós", value: "vamos" }, { label: "vocês", value: "vão" }, { label: "eles / elas", value: "vão" },
    ],
    examples: [
      { pt: "Vou ao mercado.", ru: "Я иду на рынок." },
      { pt: "Vamos estudar português amanhã.", ru: "Завтра мы будем учить португальский." },
      { pt: "A Marta vai comprar pão.", ru: "Марта собирается купить хлеб." },
    ],
    practice: { kind: "ir" },
    quiz: { prompt: "Amanhã nós ___ visitar o Porto.", options: ["vamos", "vão", "estamos a"], answer: 0, explanation: "План на завтра строится через IR + infinitivo: vamos visitar." },
  },
  {
    id: "habit-now", chapter: "Настоящее", title: "Обычно или сейчас?", subtitle: "Presente и ESTAR A",
    rule: "Простое настоящее описывает привычку или факт. ESTAR A + infinitivo показывает действие, которое уже началось и идёт в этот момент.",
    markers: ["обычно: sempre, muitas vezes, todos os dias", "сейчас: agora, neste momento"],
    examples: [
      { pt: "Leio antes de dormir.", ru: "Я читаю перед сном." },
      { pt: "Estou a ler uma mensagem agora.", ru: "Я сейчас читаю сообщение." },
      { pt: "Trabalha em Lisboa, mas hoje está a trabalhar em casa.", ru: "Он работает в Лиссабоне, но сегодня работает из дома." },
    ],
    practice: { kind: "action", actionUse: "habit" },
    quiz: { prompt: "Silêncio! O bebé ___ agora.", options: ["dorme", "está a dormir", "dormiu"], answer: 1, explanation: "Agora и действие в процессе: está a dormir." },
  },
  {
    id: "ter", chapter: "Настоящее", title: "TER", subtitle: "Иметь, возраст и состояния",
    rule: "TER выражает обладание, возраст и многие физические состояния. По-португальски «мне 30 лет» буквально строится как «я имею 30 лет».",
    forms: [
      { label: "eu", value: "tenho" }, { label: "tu", value: "tens" }, { label: "ele / ela", value: "tem" },
      { label: "nós", value: "temos" }, { label: "vocês", value: "têm" }, { label: "eles / elas", value: "têm" },
    ],
    markers: ["ter fome — хотеть есть", "ter sede — хотеть пить", "ter frio/calor — мёрзнуть/испытывать жар", "ter medo — бояться"],
    examples: [
      { pt: "Tenho trinta anos.", ru: "Мне тридцать лет." },
      { pt: "Temos dois bilhetes.", ru: "У нас два билета." },
      { pt: "As crianças têm fome.", ru: "Дети хотят есть." },
    ],
    practice: { kind: "ter" },
    quiz: { prompt: "A Joana ___ vinte anos.", options: ["é", "está", "tem"], answer: 2, explanation: "Возраст выражаем с TER: tem vinte anos." },
  },
  {
    id: "reflexive", chapter: "Местоимения", title: "Возвратные глаголы", subtitle: "Действие направлено на себя",
    rule: "Возвратное местоимение согласуется с лицом. В утвердительной фразе европейского португальского оно часто стоит после глагола через дефис; отрицание переносит его перед глаголом.",
    forms: [
      { label: "eu", value: "levanto-me" }, { label: "tu", value: "levantas-te" }, { label: "ele / ela", value: "levanta-se" },
      { label: "nós", value: "levantamo-nos" }, { label: "vocês", value: "levantam-se" }, { label: "eles / elas", value: "levantam-se" },
    ],
    examples: [
      { pt: "Levanto-me às sete.", ru: "Я встаю в семь." },
      { pt: "A Sofia chama-se Sofia Costa.", ru: "Софию зовут София Кошта." },
      { pt: "Não me deito tarde.", ru: "Я не ложусь поздно." },
    ],
    quiz: { prompt: "Nós ___ cedo.", options: ["levantamos-nos", "levantamo-nos", "nos levantamos"], answer: 1, explanation: "Перед -nos конечная -s у формы nós исчезает: levantamo-nos." },
  },
  {
    id: "past", chapter: "Прошлое", title: "Прошедшее время", subtitle: "Событие или фон?",
    rule: "В португальском рассказ строится двумя планами. Pretérito Perfeito Simples сообщает, что произошло и завершилось. Pretérito Imperfeito показывает фон, состояние, процесс или повторяющуюся привычку.",
    markers: ["PPS: ontem, de repente, uma vez", "Imperfeito: antigamente, enquanto, todos os verões"],
    examples: [
      { pt: "Estava a ler quando o telefone tocou.", ru: "Я читал, когда зазвонил телефон." },
      { pt: "Fazia frio, por isso fechámos a janela.", ru: "Было холодно, поэтому мы закрыли окно." },
      { pt: "Enquanto dormiam, começou a chover.", ru: "Пока они спали, начался дождь." },
    ],
    practice: { kind: "group", group: "ar", tense: "past" },
    quiz: { prompt: "Eu ___ quando a Ana chegou.", options: ["cozinhei", "cozinhava", "cozinho"], answer: 1, explanation: "Длительный фон для события chegou — cozinhava." },
  },
];
