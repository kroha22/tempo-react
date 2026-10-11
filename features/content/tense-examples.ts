export type ExampleTense = "present" | "past" | "future";
type TenseExample = { id: string; cue: string; meaning: string; sentence: string; translation: string; kind: string };
export const tenseExamples: Record<ExampleTense, { title: string; explanation: string; items: readonly TenseExample[] }> = {
  present: {
    title: "Обычно делаю · привычки и факты",
    explanation: "Presente помогает рассказать о привычках и фактах. Это не все его значения: настоящее время также описывает состояния и другие ситуации.",
    items: [
      { id: "present-days", cue: "todos os dias", meaning: "каждый день", sentence: "Eu aprendo português todos os dias.", translation: "Я учу португальский каждый день.", kind: "Привычка" },
      { id: "present-tuesdays", cue: "todas as terças-feiras", meaning: "по вторникам", sentence: "Nós nadamos todas as terças-feiras.", translation: "Мы плаваем по вторникам.", kind: "Привычка" },
      { id: "present-twice", cue: "duas vezes por semana", meaning: "два раза в неделю", sentence: "Eu jogo futebol duas vezes por semana.", translation: "Я играю в футбол два раза в неделю.", kind: "Привычка" },
      { id: "present-always", cue: "sempre", meaning: "всегда", sentence: "Nós jantamos sempre em casa.", translation: "Мы всегда ужинаем дома.", kind: "Привычка" },
      { id: "present-never", cue: "nunca", meaning: "никогда", sentence: "Eu nunca bebo café.", translation: "Я никогда не пью кофе.", kind: "Привычка" },
      { id: "present-fact", cue: "um facto", meaning: "факт", sentence: "A Terra gira em torno do Sol.", translation: "Земля вращается вокруг Солнца.", kind: "Факт · без указания времени" },
    ],
  },
  past: {
    title: "Уже произошло · завершённые события",
    explanation: "В этих примерах Pretérito Perfeito показывает завершённые события. Выражение времени помогает понять, когда они произошли.",
    items: [
      { id: "past-yesterday", cue: "ontem", meaning: "вчера", sentence: "Ontem fiz o jantar.", translation: "Вчера я приготовил(а) ужин.", kind: "FAZER → fiz" },
      { id: "past-morning", cue: "ontem de manhã", meaning: "вчера утром", sentence: "Ontem de manhã disse olá à professora.", translation: "Вчера утром я поздоровался(-ась) с учительницей.", kind: "DIZER → disse" },
      { id: "past-week", cue: "na semana passada", meaning: "на прошлой неделе", sentence: "Na semana passada fui ao parque.", translation: "На прошлой неделе я ходил(а) в парк.", kind: "IR → fui" },
      { id: "past-days", cue: "há dois dias", meaning: "два дня назад", sentence: "Há dois dias trouxe um livro para a escola.", translation: "Два дня назад я принёс(-ла) книгу в школу.", kind: "TRAZER → trouxe" },
    ],
  },
  future: {
    title: "Ещё впереди · планы и будущие события",
    explanation: "Здесь используем ir + infinitivo. «В конце дня» и «когда-нибудь» понимаем вместе с предложением: сами по себе они не задают грамматическое время.",
    items: [
      { id: "future-tomorrow", cue: "amanhã", meaning: "завтра", sentence: "Amanhã vou brincar no jardim.", translation: "Завтра я буду играть в саду.", kind: "План" },
      { id: "future-week", cue: "na próxima semana", meaning: "на следующей неделе", sentence: "Na próxima semana vamos visitar a avó.", translation: "На следующей неделе мы навестим бабушку.", kind: "План" },
      { id: "future-month", cue: "no próximo mês", meaning: "в следующем месяце", sentence: "No próximo mês vou aprender a nadar.", translation: "В следующем месяце я буду учиться плавать.", kind: "План" },
      { id: "future-thursday", cue: "na próxima quinta-feira", meaning: "в следующий четверг", sentence: "Na próxima quinta-feira vamos jogar futebol.", translation: "В следующий четверг мы будем играть в футбол.", kind: "План" },
      { id: "future-end", cue: "no final do dia", meaning: "в конце дня", sentence: "Hoje, no final do dia, vou ler um livro.", translation: "Сегодня в конце дня я почитаю книгу.", kind: "План на сегодня" },
      { id: "future-oneday", cue: "um dia", meaning: "когда-нибудь · в этом примере", sentence: "Um dia vou visitar Portugal.", translation: "Когда-нибудь я побываю в Португалии.", kind: "Мечта" },
    ],
  },
};
