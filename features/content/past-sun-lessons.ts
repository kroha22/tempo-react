import type { PersonKey } from "../conjugation/data.ts";
import { resolveConjugation } from "../conjugation/resolver.ts";
import { trazerLesson } from "./trazer-lesson.ts";

export type SunVerb = "fazer" | "dizer" | "ir" | "trazer";
export type SunLesson = {
  verb: SunVerb; translation: string; example: string; exampleTranslation: string; note: string; vos: string;
  exercises: readonly { id: string; person: PersonKey; before: string; after: string; translation: string }[];
};
export const pastSunLessons: readonly SunLesson[] = [
  { verb: "fazer", translation: "делать", example: "Ontem, eu fiz o jantar.", exampleTranslation: "Вчера я приготовил / приготовила ужин.", note: "Обрати внимание: eu fiz, но ele / ela fez. Остальные формы начинаются с fiz-.", vos: "fizestes", exercises: [
    { id: "fazer-dinner", person: "eu", before: "Ontem, eu", after: "o jantar.", translation: "Вчера я приготовил / приготовила ужин." },
    { id: "fazer-homework", person: "tu", before: "Tu", after: "os trabalhos de casa ontem.", translation: "Ты вчера сделал / сделала домашнее задание." },
    { id: "fazer-cake", person: "ele", before: "A Ana", after: "um bolo.", translation: "Ана приготовила пирог." },
    { id: "fazer-drawing", person: "nos", before: "Nós", after: "um desenho na aula.", translation: "Мы нарисовали рисунок на уроке." },
    { id: "fazer-exercises", person: "voces", before: "Vocês", after: "os exercícios.", translation: "Вы выполнили упражнения." },
    { id: "fazer-lunch", person: "eles", before: "Os meus amigos", after: "o almoço.", translation: "Мои друзья приготовили обед." },
  ] },
  { verb: "dizer", translation: "говорить, сказать", example: "Ontem, eu disse a verdade.", exampleTranslation: "Вчера я сказал / сказала правду.", note: "Eu disse и ele / ela disse совпадают. Для vocês и eles / elas — disseram.", vos: "dissestes", exercises: [
    { id: "dizer-truth", person: "eu", before: "Ontem, eu", after: "a verdade.", translation: "Вчера я сказал / сказала правду." },
    { id: "dizer-morning", person: "tu", before: "Tu", after: "bom dia à professora.", translation: "Ты пожелал / пожелала учительнице доброго утра." },
    { id: "dizer-thanks", person: "ele", before: "O João", after: "obrigado.", translation: "Жуан сказал спасибо." },
    { id: "dizer-goodbye", person: "nos", before: "Nós", after: "adeus aos amigos.", translation: "Мы попрощались с друзьями." },
    { id: "dizer-yes", person: "voces", before: "Vocês", after: "sim.", translation: "Вы сказали да." },
    { id: "dizer-no", person: "eles", before: "Eles", after: "não.", translation: "Они сказали нет." },
  ] },
  { verb: "ir", translation: "идти, ехать", example: "Ontem, eu fui à escola.", exampleTranslation: "Вчера я ходил / ходила в школу.", note: "У IR и SER формы Pretérito Perfeito совпадают. Здесь говорим о поездках и походах: fui à escola — ходил(а) в школу.", vos: "fostes", exercises: [
    { id: "ir-school", person: "eu", before: "Ontem, eu", after: "à escola.", translation: "Вчера я ходил / ходила в школу." },
    { id: "ir-park", person: "tu", before: "Tu", after: "ao parque ontem.", translation: "Ты вчера ходил / ходила в парк." },
    { id: "ir-cinema", person: "ele", before: "A Ana", after: "ao cinema.", translation: "Ана ходила в кино." },
    { id: "ir-beach", person: "nos", before: "Nós", after: "à praia no domingo passado.", translation: "Мы ездили на пляж в прошлое воскресенье." },
    { id: "ir-market", person: "voces", before: "Vocês", after: "ao mercado.", translation: "Вы ходили на рынок." },
    { id: "ir-museum", person: "eles", before: "Os meus amigos", after: "ao museu.", translation: "Мои друзья ходили в музей." },
  ] },
  { verb: "trazer", translation: "приносить, привозить", example: "Ontem, eu trouxe um livro.", exampleTranslation: "Вчера я принёс / принесла книгу.", note: "Eu trouxe и ele / ela trouxe совпадают. Для vocês и eles / elas — trouxeram.", vos: "trouxestes", exercises: trazerLesson.exercises },
];
export function pastSunAnswer(verb: SunVerb, person: PersonKey) { return resolveConjugation({ verb, tense: "past", person }); }
