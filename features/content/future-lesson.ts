import { resolveConjugation } from "../conjugation/resolver.ts";
import type { PersonKey } from "../conjugation/data.ts";

export type FutureTask = {
  id: string; subject: string; person: PersonKey; action: string; verbs: readonly string[];
  times: readonly { text: string; translation: string }[]; timeIndex: number;
  punctuation: "." | "?"; translation: string;
};
// User-supplied exercise, page 112. The two choices are checked independently.
export const futureTasks: readonly FutureTask[] = [
  { id: "future-walk", subject: "O João e o Tiago", person: "eles", action: "passear juntos", verbs: ["vão", "vamos", "vais"], times: [{ text: "ontem", translation: "вчера" }, { text: "amanhã à tarde", translation: "завтра после обеда" }, { text: "antigamente", translation: "раньше, в прежние времена" }], timeIndex: 1, punctuation: ".", translation: "Жуан и Тиагу будут гулять вместе завтра после обеда." },
  { id: "future-football", subject: "Duarte, tu", person: "tu", action: "jogar futebol", verbs: ["vou", "vamos", "vais"], times: [{ text: "amanhã", translation: "завтра" }, { text: "no dia anterior", translation: "в предыдущий день" }, { text: "há cinco minutos", translation: "пять минут назад" }], timeIndex: 0, punctuation: "?", translation: "Дуарте, ты завтра будешь играть в футбол?" },
  { id: "future-skating", subject: "Olá! Vocês", person: "voces", action: "andar de patins", verbs: ["vão", "vamos", "vou"], times: [{ text: "no passado", translation: "в прошлом" }, { text: "depois das aulas", translation: "после уроков" }, { text: "anteriormente", translation: "ранее" }], timeIndex: 1, punctuation: "?", translation: "Привет! Вы будете кататься на роликах после уроков?" },
  { id: "future-film", subject: "A Teresa", person: "ele", action: "ver um filme", verbs: ["vou", "vamos", "vai"], times: [{ text: "no domingo passado", translation: "в прошлое воскресенье" }, { text: "na semana passada", translation: "на прошлой неделе" }, { text: "na próxima quinta-feira", translation: "в следующий четверг" }], timeIndex: 2, punctuation: ".", translation: "Тереза будет смотреть фильм в следующий четверг." },
];
export function futureForm(person: PersonKey) { return resolveConjugation({ verb: "ir", tense: "present", person }); }
export function checkFutureTask(task: FutureTask, verb: string | null, time: number | null) {
  return { verb: verb === futureForm(task.person), time: time === task.timeIndex };
}
export function futureSentence(task: FutureTask) { return `${task.subject} ${futureForm(task.person)} ${task.action} ${task.times[task.timeIndex].text}${task.punctuation}`; }
