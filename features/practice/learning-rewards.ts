import { practicePlanSteps, isPracticeStepComplete, type PracticePlanProgress } from "./plan/model";
import type { ProfileLearning } from "./profile-learning";
import {greetingSets} from "../content/greetings";
import {identitySets} from "../content/identity";
import {learningCatalog} from "../content/learning-catalog";

export type RewardGroup = "Первые фразы" | "Слова и игры" | "Грамматика" | "Слова в жизни" | "Время и планы";
export type ActivityResult = { title: string; group: RewardGroup; correct: number; total: number };
export type RewardEntry = { id: string; title: string; group: RewardGroup; earned: boolean; hint: string; result?: ActivityResult };
const groups: readonly string[] = ["Первые фразы", "Слова и игры", "Грамматика", "Слова в жизни", "Время и планы"];
export function parseActivityResults(value: unknown): Record<string, ActivityResult> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid activity results");
  const entries = Object.entries(value);
  if (entries.length > 2000) throw new Error("Too many activity results");
  const result: Record<string, ActivityResult> = {};
  for (const [id, row] of entries) {
    const item = row as ActivityResult;
    if (!/^[a-zA-Z0-9:_-]{1,240}$/.test(id) || !item || typeof item.title !== "string" || !item.title.trim() || item.title.length > 180 || !groups.includes(item.group) || !Number.isInteger(item.total) || item.total < 1 || item.total > 1000 || !Number.isInteger(item.correct) || item.correct < 0 || item.correct > item.total) throw new Error("Invalid activity result");
    Object.defineProperty(result, id, { value: { title: item.title, group: item.group, correct: item.correct, total: item.total }, enumerable: true, writable: true, configurable: true });
  }
  return result;
}
export function recordActivity(current: ProfileLearning, id: string, result: ActivityResult): ProfileLearning {
  const validated = parseActivityResults({ [id]: result })[id];
  const previous = current.activities?.[id];
  // Keep the best full round. A shorter retry must never overwrite a whole lesson.
  const best = previous && (previous.total > validated.total || previous.total === validated.total && previous.correct >= validated.correct) ? previous : validated;
  return { ...current, activities: { ...current.activities, [id]: best } };
}
export function rewardAlbum(learning: ProfileLearning, plan: PracticePlanProgress): RewardEntry[] {
  const words = learning.feelings.viewed.length === 6;
  const practice = words && learning.feelings.practised;
  const entries: RewardEntry[] = [
    { id: "feelings:words", title: "Исследователь чувств", group: "Первые фразы", earned: words, hint: "Открой переводы всех шести слов о состоянии." },
    { id: "feelings:practice", title: "Мастер фраз ESTAR", group: "Первые фразы", earned: practice, hint: "Познакомься со словами и пройди три фразы без ошибок." },
    { id: "feelings:review", title: "Чувства: закрепил!", group: "Первые фразы", earned: practice && learning.feelings.repeated, hint: "Верно пройди повторение без примеров." },
    ...practicePlanSteps.map(step => ({ id: step.id, title: step.title, group: (step.kind === "grammar" ? "Грамматика" : step.kind === "words" ? "Слова и игры" : "Слова в жизни") as RewardGroup, earned: isPracticeStepComplete(plan, step), hint: "Пройди проверку этого занятия. С подсказками тоже можно — результат останется в альбоме." })),
    ...greetingSets.map(set=>({id:set.id,title:set.ru,group:"Первые фразы" as const,earned:false,hint:"Проверь все ответы в практике этого диалога."})),
    ...identitySets.map(set=>({id:set.id,title:set.ru+" · фразы с SER",group:"Первые фразы" as const,earned:false,hint:"Собери и проверь все фразы этого набора."})),
    ...learningCatalog.usageModules.filter(module=>module.id!=="usage:feelings").map(module=>({id:module.id,title:module.title,group:"Слова в жизни" as const,earned:false,hint:"Заверши все фразы этого блока."})),
    ...[{id:"clock:read",title:"Часы: назови время"},{id:"clock:set",title:"Часы: выставь стрелки"},{id:"future:ir-infinitivo",title:"Планы: IR + infinitivo"},...["fazer","dizer","ir","trazer"].map(verb=>({id:`past:${verb}`,title:`${verb.toUpperCase()} · прошедшее время`}))].map(item=>({...item,group:"Время и планы" as const,earned:false,hint:"Пройди полный круг упражнений этого урока."})),
  ];
  for (const [id, result] of Object.entries(learning.activities ?? {})) {
    const existing = entries.find(entry => entry.id === id);
    if (existing) { existing.earned = true; existing.result = result; }
    else entries.push({ id, title: result.title, group: result.group, earned: true, result, hint: "Заверши все задания этого блока." });
  }
  return entries;
}
// Stable across ordering and rerenders, including subsets used in a review round.
export function wordActivityId(kind: string, ids: readonly string[]) {
  const text = [...new Set(ids)].sort().join("|");
  if(kind==="writing"){
    const step=practicePlanSteps.find(step=>step.kind==="words"&&[...step.wordIds].sort().join("|")===text);
    if(step)return step.id;
  }
  let a = 2166136261, b = 5381;
  for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ text.charCodeAt(i); }
  return `${kind}:${(a >>> 0).toString(36)}:${(b >>> 0).toString(36)}`;
}
