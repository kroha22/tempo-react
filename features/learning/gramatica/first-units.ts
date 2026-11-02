export const firstGrammarUnits = [
  { unit: 1, title: "SER · Кто я и откуда", summary: "Профессия, происхождение и характеристики", lessonId: "ser" },
  { unit: 2, title: "ESTAR · Где я и как себя чувствую", summary: "Местоположение и состояние", lessonId: "estar" },
  { unit: 3, title: "SER или ESTAR?", summary: "Характеристика и состояние в контексте", lessonId: "ser-estar" },
] as const;
export const wordBatchHref = (unit: number) => `/learning/gramatica-ativa/words/u${String(unit).padStart(2, "0")}`;
