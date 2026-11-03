type GrammarFoundation = { unit: number; title: string; summary: string; lessonId: string; practiceSlug?: string };
export const firstGrammarUnits: readonly GrammarFoundation[] = [
  { unit: 1, title: "SER · Кто я и откуда", summary: "Профессия, происхождение и характеристики", lessonId: "ser", practiceSlug:"identity-and-origin" },
  { unit: 2, title: "ESTAR · Где я и как себя чувствую", summary: "Местоположение и состояние", lessonId: "estar", practiceSlug:"location-and-state" },
  { unit: 3, title: "SER или ESTAR?", summary: "Характеристика и состояние в контексте", lessonId: "ser-estar", practiceSlug:"identity-or-state" },
  { unit: 4, title: "ESTAR A · Действие сейчас", summary: "Что происходит прямо сейчас", lessonId: "estar-a", practiceSlug: "action-in-progress" },
  { unit: 5, title: "Presente · -AR", summary: "Повседневные занятия и распорядок", lessonId: "present-ar", practiceSlug: "everyday-ar" },
  { unit: 6, title: "Presente · -ER", summary: "Еда, учёба и знакомство", lessonId: "present-er", practiceSlug: "everyday-er" },
  { unit: 7, title: "Неправильные -ER", summary: "Желания, возможности и частые действия", lessonId: "present-er-irregular", practiceSlug: "irregular-er-use" },
  { unit: 8, title: "Presente · -IR", summary: "Регулярные формы и чередования", lessonId: "present-ir", practiceSlug: "ir-alternations" },
  { unit: 9, title: "Особые -IR", summary: "Движение, просьбы, слух и сон", lessonId: "present-ir-special", practiceSlug: "movement-and-requests" },
  { unit: 10, title: "Обычно или сейчас?", summary: "Привычное действие и текущий процесс", lessonId: "habit-now", practiceSlug: "habit-and-current-action" },
  { unit: 11, title: "TER · Возраст, вещи и ощущения", summary: "Владение, семья, возраст и состояния", lessonId: "ter", practiceSlug: "possession-age-and-sensations" },
] as const;
export const wordBatchHref = (unit: number) => `/learning/gramatica-ativa/words/u${String(unit).padStart(2, "0")}`;
