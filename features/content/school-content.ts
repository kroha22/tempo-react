import type { VocabularyWord } from "./vocabulary-model.ts";

export type SchoolInstructionCard = VocabularyWord & {
  readonly infinitive: string;
  readonly examplePt: string;
  readonly exampleRu: string;
};

// The card IDs deliberately reuse the 1,000-verb deck. The displayed form is
// the classroom instruction; the infinitive remains the canonical verb.
export const schoolInstructionCards: readonly SchoolInstructionCard[] = [
  { id: "v0083", infinitive: "ler", label: "ler", translation: "читать", examplePt: "Lê o texto.", exampleRu: "Прочитай текст." },
  { id: "v0062", infinitive: "escrever", label: "escrever", translation: "писать", examplePt: "Escreve no caderno.", exampleRu: "Пиши в тетради." },
  { id: "v0242", infinitive: "completar", label: "completar", translation: "дополнять", examplePt: "Completa a frase.", exampleRu: "Дополни фразу." },
  { id: "v0258", infinitive: "ligar", label: "ligar", translation: "соединять", examplePt: "Liga as palavras.", exampleRu: "Соедини слова." },
  { id: "v0682", infinitive: "assinalar", label: "assinalar", translation: "отмечать", examplePt: "Assinala a resposta certa.", exampleRu: "Отметь правильный ответ." },
  { id: "v0379", infinitive: "pintar", label: "pintar", translation: "раскрашивать", examplePt: "Pinta o desenho.", exampleRu: "Раскрась рисунок." },
  { id: "v0154", infinitive: "escolher", label: "escolher", translation: "выбирать", examplePt: "Escolhe uma opção.", exampleRu: "Выбери вариант." },
  { id: "v0091", infinitive: "responder", label: "responder", translation: "отвечать", examplePt: "Responde à pergunta.", exampleRu: "Ответь на вопрос." },
];

export const schoolInstructionWordIds = schoolInstructionCards.map((card) => card.id);
