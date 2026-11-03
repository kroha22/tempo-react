import type {VocabularyDecision} from "./gramatica-vocabulary-editorial.ts";

/** One-based PDF locators, visually checked; cropped printed numbers are not inferred. */
export const futureBookPages=[
  {unit:24,pdf:[51,52],printed:[52,53]}, {unit:25,pdf:[53,54],printed:[54,55]},
  {unit:26,pdf:[55,56],printed:[56,57]}, {unit:27,pdf:[57,58],printed:[58,59]},
  {unit:28,pdf:[59,60],printed:[] as number[]}, {unit:29,pdf:[61,62],printed:[63]},
  {unit:30,pdf:[63,64],printed:[] as number[]},
];
const words:[number,string,string][]=[
  ...["dizer|говорить, сказать","fazer|делать","trazer|приносить","partir|отправляться","ter|иметь","pôr|класть, ставить"].map(row=>[24,...row.split("|")] as [number,string,string]),
  ...["dar|давать","ser|быть; являться","poder|мочь","dizer|говорить, сказать","fazer|делать","trazer|приносить"].map(row=>[25,...row.split("|")] as [number,string,string]),
  ...["vestir-se|одеваться","abrir|открывать","virar|поворачивать","ler|читать","pedir|просить","ouvir|слушать"].map(row=>[26,...row.split("|")] as [number,string,string]),
  ...["ser|быть; являться","estar|находиться; быть в состоянии","dar|давать","ir|идти, ехать","despir|снимать одежду","distribuir|раздавать"].map(row=>[27,...row.split("|")] as [number,string,string]),
  ...["chegar|прибывать","falar|говорить","ler|читать","ir|идти, ехать","ser|быть; являться","estar|находиться; быть в состоянии"].map(row=>[28,...row.split("|")] as [number,string,string]),
  ...["andar|идти","escrever|писать","fazer|делать","ler|читать","ouvir|слушать","traduzir|переводить текст"].map(row=>[29,...row.split("|")] as [number,string,string]),
  ...["há|есть, имеется","houve|было, произошло","havia|имелось, было","haverá|будет иметься","haver de|непременно сделать; намереваться","convicção|убеждённость"].map(row=>[30,...row.split("|")] as [number,string,string]),
];
export const futurePageVocabularySources=words.map(([unit,pt,ru])=>{
  const page=futureBookPages.find(row=>row.unit===unit)!;
  return {id:`source:ga1:page:u${String(unit).padStart(2,"0")}:${pt}`,unit:`GA1-U${unit}`,stage:"core" as const,pt,ru,source_status:"verified_book_page",tags:`GA1,U${unit},page-verified`,unique_key:pt,pdfPages:page.pdf,printedPages:page.printed,locator:"таблица форм, пояснения и упражнения разворота"};
});
export const futurePageVocabularyDecisions:VocabularyDecision[]=[{
  surfaces:["haver de"],lemma:"haver de",partOfSpeech:"chunk",sense:"intention",translation:"непременно сделать; намереваться",forms:["hei de","hás de","há de","havemos de","hão de"],example:{pt:"Havemos de voltar aqui.",ru:"Мы непременно ещё сюда вернёмся."},
}];
