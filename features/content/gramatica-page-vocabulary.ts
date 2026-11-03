import {vocabularyDecisions,type VocabularyDecision} from "./gramatica-vocabulary-editorial.ts";

/** Manually checked against the local scan, PDF pages are one-based. No scan assets are shipped. */
export const presentBookPages = [
  { unit: 4, pdf: [11, 12], printed: [12, 13] }, { unit: 5, pdf: [13, 14], printed: [14, 15] },
  { unit: 6, pdf: [15, 16], printed: [16, 17] }, { unit: 7, pdf: [17, 18], printed: [18, 19] },
  { unit: 8, pdf: [19, 20], printed: [20, 21] }, { unit: 9, pdf: [21, 22], printed: [22, 23] },
  { unit: 10, pdf: [23, 24], printed: [24, 25] }, { unit: 11, pdf: [25, 26], printed: [26, 27] },
  { unit: 12, pdf: [27, 28], printed: [28, 29] }, { unit: 13, pdf: [29, 30], printed: [30, 31] },
  { unit: 14, pdf: [31, 32], printed: [32, 33] }, { unit: 15, pdf: [33, 34], printed: [] as number[] },
  { unit: 16, pdf: [35, 36], printed: [36, 37] }, { unit: 17, pdf: [37, 38], printed: [] as number[] },
];
type PageWord = { unit: number; pt: string; ru: string; example: string; exampleRu: string; existing?: boolean };
const words: PageWord[] = [
  { unit: 6, pt: "descer", ru: "спускаться", example: "Desço as escadas.", exampleRu: "Я спускаюсь по лестнице." },
  { unit: 6, pt: "esquecer", ru: "забывать", example: "Esqueço sempre o nome.", exampleRu: "Я всегда забываю имя.", existing: true },
  { unit: 6, pt: "aquecer", ru: "нагревать", example: "Aqueço a sopa.", exampleRu: "Я разогреваю суп." },
  { unit: 6, pt: "parecer", ru: "казаться", example: "Hoje, pareço cansado.", exampleRu: "Сегодня я выгляжу уставшим." },
  { unit: 6, pt: "abranger", ru: "охватывать", example: "O curso abrange vários temas.", exampleRu: "Курс охватывает несколько тем." },
  { unit: 6, pt: "proteger", ru: "защищать", example: "Protejo os meus filhos.", exampleRu: "Я защищаю своих детей." },
  { unit: 8, pt: "despir", ru: "снимать одежду", example: "Dispo o casaco.", exampleRu: "Я снимаю пальто." },
  { unit: 8, pt: "seguir", ru: "следовать", example: "Sigo as instruções.", exampleRu: "Я следую указаниям." },
  { unit: 8, pt: "dirigir", ru: "руководить", example: "Dirijo a escola.", exampleRu: "Я руковожу школой." },
  { unit: 8, pt: "servir", ru: "подавать", example: "Sirvo o café.", exampleRu: "Я подаю кофе." },
  { unit: 8, pt: "traduzir", ru: "переводить текст", example: "Ela traduz o texto.", exampleRu: "Она переводит текст." },
  { unit: 8, pt: "conduzir", ru: "водить транспорт", example: "Ele conduz bem.", exampleRu: "Он хорошо водит." },
  { unit: 9, pt: "distribuir", ru: "раздавать", example: "Distribuo os livros.", exampleRu: "Я раздаю книги." },
  { unit: 9, pt: "construir", ru: "строить", example: "Eles constroem uma casa.", exampleRu: "Они строят дом.", existing: true },
  { unit: 9, pt: "destruir", ru: "разрушать", example: "O vento destrói a casa.", exampleRu: "Ветер разрушает дом.", existing: true },
  { unit: 9, pt: "substituir", ru: "заменять", example: "Ela substitui o professor.", exampleRu: "Она заменяет учителя." },
  {unit:12,pt:"ser",ru:"быть; являться",example:"A viagem foi boa.",exampleRu:"Поездка была хорошей."},
  {unit:12,pt:"ter",ru:"иметь",example:"Tive muito trabalho ontem.",exampleRu:"Вчера у меня было много работы."},
  ...["ir","estar"].map(pt=>({unit:12,pt,ru:{ir:"идти, ехать",estar:"находиться; быть в состоянии"}[pt]!,example:"",exampleRu:"",existing:true})),
  ...["comer","abrir","começar"].map(pt=>({unit:13,pt,ru:{comer:"есть",abrir:"открывать",começar:"начинать"}[pt]!,example:"",exampleRu:"",existing:true})),
  {unit:13,pt:"pagar",ru:"платить",example:"Pago a conta.",exampleRu:"Я оплачиваю счёт."},
  ...["dizer","trazer","fazer","querer","ver","vir","dar","saber","pôr","poder","cair","sair"].map(pt=>({unit:14,pt,ru:({dizer:"говорить, сказать",trazer:"приносить",fazer:"делать",querer:"хотеть",ver:"видеть",vir:"приходить",dar:"давать",saber:"знать; уметь",pôr:"класть, ставить",poder:"мочь",cair:"падать",sair:"выходить"} as Record<string,string>)[pt],example:"",exampleRu:"",existing:true})),
  {unit:15,pt:"vestir-se",ru:"одеваться",example:"Visto-me de manhã.",exampleRu:"Я одеваюсь утром."},
  ...["falar","comer","abrir","ser","ter","vir","pôr"].map(pt=>({unit:16,pt,ru:({falar:"говорить",comer:"есть",abrir:"открывать",ser:"быть",ter:"иметь",vir:"приходить",pôr:"класть, ставить"} as Record<string,string>)[pt],example:"",exampleRu:"",existing:true})),
  ...["costumar","usar","viajar","óculos"].map(pt=>({unit:17,pt,ru:{costumar:"иметь обыкновение",usar:"использовать; носить",viajar:"путешествовать",óculos:"очки"}[pt]!,example:"",exampleRu:"",existing:true})),
];
export const pageVocabularySources = words.map((w) => {
  const page = presentBookPages.find((p) => p.unit === w.unit)!;
  return { id: `source:ga1:page:u${String(w.unit).padStart(2, "0")}:${w.pt}`, unit: `GA1-U${String(w.unit).padStart(2, "0")}`, stage: "core" as const, pt: w.pt, ru: w.ru,
    source_status: "verified_book_page", tags: `GA1,U${w.unit},page-verified`, unique_key: w.pt,
    pdfPages: page.pdf, printedPages: page.printed, locator: "таблица форм и упражнения разворота" };
});
const existingEstar=vocabularyDecisions.find(d=>d.lemma==="estar")!;
export const pageVocabularyDecisions: VocabularyDecision[] = [...words.filter((w) => !w.existing).map((w):VocabularyDecision => ({ surfaces: [w.pt], lemma: w.pt, partOfSpeech: "verb", sense: "entry", translation: w.ru, example: { pt: w.example, ru: w.exampleRu } })),{...existingEstar,surfaces:["estar"]}];
