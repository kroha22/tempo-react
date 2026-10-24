export const childAvatars = [
  { id: "boy", name: "Мальчик в очках", symbol: "" },
  { id: "fox", name: "Лисёнок", symbol: "🦊" },
  { id: "owl", name: "Совёнок", symbol: "🦉" },
  { id: "rabbit", name: "Зайчонок", symbol: "🐰" },
  { id: "bear", name: "Медвежонок", symbol: "🐻" },
] as const;
export type ChildAvatarId = typeof childAvatars[number]["id"];
