export const childAvatars = [
  { id: "boy", name: "Мальчик", symbol: "👦" },
  { id: "fox", name: "Лисёнок", symbol: "🦊" },
  { id: "owl", name: "Совёнок", symbol: "🦉" },
  { id: "rabbit", name: "Зайчонок", symbol: "🐰" },
  { id: "bear", name: "Медвежонок", symbol: "🐻" },
] as const;
export type ChildAvatarId = typeof childAvatars[number]["id"];
