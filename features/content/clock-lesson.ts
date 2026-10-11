import { normalizeVocabularyAnswer } from "./vocabulary-model.ts";

export type ClockTime = { hour: number; minute: number };
export type ClockTask = ClockTime & { id: string; phrase: string; translation: string; alternatives: readonly string[]; context?: string };
export const clockExamples: readonly ClockTask[] = [
  { id: "clock-one", hour: 1, minute: 0, phrase: "É uma hora.", translation: "Час ровно.", alternatives: ["é uma", "uma hora", "uma"] },
  { id: "clock-seven", hour: 7, minute: 0, phrase: "São sete horas.", translation: "Семь часов.", alternatives: ["são sete", "sete horas", "sete"] },
  { id: "clock-quarter", hour: 7, minute: 15, phrase: "São sete e um quarto.", translation: "Семь пятнадцать; четверть восьмого.", alternatives: ["são sete e quinze", "sete e um quarto", "sete e quinze"] },
  { id: "clock-half", hour: 7, minute: 30, phrase: "São sete e meia.", translation: "Семь тридцать; половина восьмого.", alternatives: ["são sete e trinta", "sete e meia", "sete e trinta"] },
  { id: "clock-thirty-five", hour: 7, minute: 35, phrase: "São sete e trinta e cinco.", translation: "Семь тридцать пять.", alternatives: ["sete e trinta e cinco", "são vinte e cinco para as oito", "vinte e cinco para as oito"] },
  { id: "clock-before", hour: 7, minute: 45, phrase: "É um quarto para as oito.", translation: "Без четверти восемь.", alternatives: ["um quarto para as oito", "são quinze para as oito", "quinze para as oito", "são sete e quarenta e cinco", "sete e quarenta e cinco"] },
  { id: "clock-five", hour: 8, minute: 5, phrase: "São oito e cinco.", translation: "Восемь часов пять минут.", alternatives: ["oito e cinco"] },
  { id: "clock-noon", hour: 12, minute: 0, phrase: "É meio-dia.", translation: "Полдень.", alternatives: ["meio-dia", "meio dia", "é meio dia", "são doze horas", "doze horas"], context: "День: время обеда." },
  { id: "clock-midnight", hour: 0, minute: 0, phrase: "É meia-noite.", translation: "Полночь.", alternatives: ["meia-noite", "meia noite", "é meia noite", "são zero horas", "zero horas"], context: "Ночь: начинается новый день." },
  { id: "clock-before-midnight", hour: 23, minute: 40, phrase: "São vinte para a meia-noite.", translation: "Без двадцати полночь.", alternatives: ["vinte para a meia-noite", "são onze e quarenta", "onze e quarenta", "são vinte e três e quarenta", "vinte e três e quarenta"], context: "Поздний вечер: скоро полночь." },
];
export const clockSetTasks: readonly ClockTask[] = [
  { id: "clock-set-twenty", hour: 6, minute: 40, phrase: "São vinte para as sete.", translation: "Без двадцати семь — 6:40.", alternatives: ["são seis e quarenta", "seis e quarenta", "vinte para as sete"] },
  { id: "clock-set-quarter", hour: 5, minute: 15, phrase: "São cinco e um quarto.", translation: "Пять пятнадцать — 5:15.", alternatives: ["são cinco e quinze", "cinco e quinze", "cinco e um quarto"] },
  { id: "clock-set-half", hour: 4, minute: 30, phrase: "São quatro e meia.", translation: "Четыре тридцать — 4:30.", alternatives: ["são quatro e trinta", "quatro e trinta", "quatro e meia"] },
];
export const clockReadTasks = [...clockExamples.slice(1, 7), ...clockExamples.slice(7)];
export function clockAngles(time: ClockTime) { return { hour: (time.hour % 12) * 30 + time.minute / 2, minute: time.minute * 6 }; }
export function sameClockTime(a: ClockTime, b: ClockTime) { return a.hour % 12 === b.hour % 12 && a.minute === b.minute; }
export function clockDigital(time: ClockTime) { return `${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}`; }
export function checkClockAnswer(task: ClockTask, value: string): "correct" | "numeric" | "wrong" | "empty" {
  const normalize = (text: string) => normalizeVocabularyAnswer(text).replace(/ horas e /g, " e ").replace(/ minutos$/, "");
  const normalized = normalize(value);
  if (!normalized) return "empty";
  if ([task.phrase, ...task.alternatives].some(answer => normalize(answer) === normalized)) return "correct";
  const match = normalized.match(/^(\d{1,2})[:.](\d{2})$/);
  if (match && Number(match[1]) < 24 && Number(match[2]) < 60 && sameClockTime(task, { hour: Number(match[1]), minute: Number(match[2]) })) return "numeric";
  return "wrong";
}
