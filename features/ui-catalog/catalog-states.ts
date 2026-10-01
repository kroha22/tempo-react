export const catalogStates = [
  { id: "shared-ui", label: "Общие компоненты", description: "Кнопки, feedback и доступный выбор" },
  { id: "adult-practice", label: "Взрослый тренажёр", description: "Панель режима, правило и солнечные формы" },
  { id: "kids-map", label: "Детская карта", description: "Замки и входы в смысловые уроки" },
  { id: "ser-estar", label: "Урок SER / ESTAR", description: "Объяснение и солнечная схема" },
  { id: "action", label: "Обычно или сейчас", description: "Presente simples и estar a + infinitivo" },
  { id: "ter", label: "Урок TER", description: "Обладание, возраст и состояния" },
  { id: "quiz-feedback", label: "Ответ квиза", description: "Ошибка, правильный вариант и продолжение" },
] as const;

export type CatalogStateId = typeof catalogStates[number]["id"];

export function parseCatalogState(value: string | string[] | undefined): CatalogStateId | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return catalogStates.some((state) => state.id === candidate) ? candidate as CatalogStateId : null;
}
