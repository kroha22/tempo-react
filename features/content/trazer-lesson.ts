import { resolveConjugation } from "../conjugation/resolver.ts";
import type { PersonKey } from "../conjugation/data.ts";

export const trazerLesson = {
  id: "practice:trazer:preterito-perfeito", title: "TRAZER · Pretérito Perfeito",
  instruction: "Aprende as formas do verbo trazer no Pretérito Perfeito e faz o exercício.",
  exercises: [
    { id: "trazer-books", person: "eu", before: "Ontem, eu", after: "o livro para a aula.", translation: "Вчера я принёс / принесла книгу на урок." },
    { id: "trazer-ball", person: "tu", before: "Tu", after: "a bola para o parque ontem.", translation: "Ты вчера принёс / принесла мяч в парк." },
    { id: "trazer-water", person: "ele", before: "A Ana", after: "água para todos.", translation: "Ана принесла воду для всех." },
    { id: "trazer-fruit", person: "nos", before: "Nós", after: "fruta para o piquenique.", translation: "Мы принесли фрукты на пикник." },
    { id: "trazer-notebooks", person: "voces", before: "Vocês", after: "os cadernos para a aula.", translation: "Вы принесли тетради на урок." },
    { id: "trazer-flowers", person: "eles", before: "Os meus amigos", after: "flores para a festa.", translation: "Мои друзья принесли цветы на праздник." },
  ] satisfies readonly { id: string; person: PersonKey; before: string; after: string; translation: string }[],
} as const;

export function trazerAnswer(person: PersonKey) {
  return resolveConjugation({ verb: "trazer", tense: "past", person });
}
export function checkTrazerAnswer(person: PersonKey, value: string) {
  return value.trim().toLowerCase() === trazerAnswer(person);
}
