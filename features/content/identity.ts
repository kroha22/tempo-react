import {identityExamples} from "./first-steps.ts";
import {generalVocabulary} from "./general-vocabulary.ts";
import {feelingWords} from "./feelings-lesson.ts";
import type {VocabularyWord} from "./vocabulary-model.ts";

const portrait=(index:number):NonNullable<VocabularyWord["illustration"]>=>({src:"/images/vocabulary/identity-portraits-v2.webp",grid:3,column:index%3,row:Math.floor(index/3)});
const sourceId=(partOfSpeech:"noun"|"adjective",lemma:string)=>generalVocabulary.find(word=>word.partOfSpeech===partOfSpeech&&word.portuguese===lemma)?.id??`vocabulary:${partOfSpeech}:${lemma}`;
const roles=[
  ["estudante","estudante","estudantes","estudantes","Учащийся / учащаяся"],
  ["professor","professora","professores","professoras","Учитель / учительница"],
  ["médico","médica","médicos","médicas","Врач"],
  ["cozinheiro","cozinheira","cozinheiros","cozinheiras","Повар"],
  ["engenheiro","engenheira","engenheiros","engenheiras","Инженер"],
  ["artista","artista","artistas","artistas","Художник / художница"],
] as const;
export function professionForm(lemma:string,gender:"male"|"female",plural=false):string {
  const role=roles.find(item=>item[0]===lemma);
  if(!role)throw new Error(`Unknown profession: ${lemma}`);
  return role[(plural?2:0)+(gender==="female"?1:0)];
}
export const professionWords:VocabularyWord[]=roles.map(([male,female,plural,femalePlural,translation],index)=>({
  id:sourceId("noun",male),label:`o ${male} / a ${female}`,translation,
  noun:{article:"o",lemma:male,plural,pluralArticle:"os"},
  acceptedAnswers:{pt:[male,female,`a ${female}`,`os ${plural}`,`as ${femalePlural}`],ru:translation.split(" / ")},
  illustration:portrait(index),example:{pt:`Sou ${female}.`,ru:["Я учащаяся.","Я учительница.","Я врач.","Я повар.","Я инженер.","Я художница."][index]},
}));
export const originWords:VocabularyWord[]=[
  {id:"vocabulary:identity:de-portugal",label:"de Portugal",translation:"Из Португалии",example:{pt:"Sou de Portugal.",ru:"Я из Португалии."},illustration:{src:"/images/vocabulary/origin-portugal.svg",row:0,column:0}},
  {id:"vocabulary:identity:do-brasil",label:"do Brasil",translation:"Из Бразилии",example:{pt:"Sou do Brasil.",ru:"Я из Бразилии."},illustration:{src:"/images/vocabulary/origin-brasil.svg",row:0,column:0}},
  {id:"vocabulary:identity:de-franca",label:"de França",translation:"Из Франции",example:{pt:"Sou de França.",ru:"Я из Франции."},illustration:{src:"/images/vocabulary/origin-franca.svg",row:0,column:0}},
];
// CALMO is the same adjective as in feelings: reuse its stable ID and picture.
export const characteristicWords:VocabularyWord[]=[
  feelingWords.find(word=>word.adjective?.lemma==="calmo")!,
  {id:sourceId("adjective","curioso"),label:"curioso / curiosa",translation:"Любознательный / любознательная",adjective:{lemma:"curioso",feminine:"curiosa"},acceptedAnswers:{pt:["curioso","curiosa"],ru:["любознательный","любознательная"]},illustration:portrait(7)},
  {id:sourceId("adjective","simpático"),label:"simpático / simpática",translation:"Приветливый / приветливая",adjective:{lemma:"simpático",feminine:"simpática"},acceptedAnswers:{pt:["simpático","simpática"],ru:["приветливый","приветливая"]},illustration:portrait(8)},
];
export const identityWords:readonly VocabularyWord[]=[...professionWords,...originWords,...characteristicWords];
export type IdentityTask={id:string;prompt:string;subject:string;verb:"sou"|"é"|"somos"|"são";ending:string;options:readonly string[];translation:string;verbHint:string;wordHint:string};
export type IdentitySet={id:string;title:string;ru:string;words:readonly VocabularyWord[];adultCue:string;childCue:string;examples:readonly {pt:string;ru:string}[];tasks:readonly IdentityTask[]};
export const identitySets:readonly IdentitySet[]=[
  {id:"identity:roles",title:"Papéis e profissões",ru:"Роли и профессии",words:professionWords,adultCue:"Представь себя или другого человека. Профессия необязательна: можно назвать роль учащегося или придумать персонажа.",childCue:"Ты можешь быть учащимся, а герои — врачом, поваром или художником. Рассказ можно придумать!",examples:identityExamples,tasks:[
    {id:"identity:role-eu",prompt:"Представься: «Я учащийся». Собери фразу.",subject:"Eu",verb:"sou",ending:"estudante",options:["professora","estudante","médico"],translation:"Я учащийся.",verbHint:"Для «я» (eu) нужна форма sou.",wordHint:"Учащийся — estudante. После SER называем роль без артикля."},
    {id:"identity:role-rita",prompt:"Рита — учительница. Представь её.",subject:"A Rita",verb:"é",ending:"professora",options:["professor","professora","cozinheira"],translation:"Рита — учительница.",verbHint:"Рита — она: используем é.",wordHint:"Учительница — professora, учитель — professor."},
    {id:"identity:role-doctors",prompt:"Руй и Мигел — врачи. Скажи: «Они врачи».",subject:"Eles",verb:"são",ending:"médicos",options:["médico","médicos","engenheiros"],translation:"Они врачи.",verbHint:"Для «они» (eles) нужна форма são.",wordHint:"Несколько врачей: médicos. После SER артикль здесь не нужен."},
  ]},
  {id:"identity:origin",title:"De onde sou?",ru:"Откуда я",words:originWords,adultCue:"Расскажи о происхождении человека. Страна происхождения и место, где человек находится сейчас, могут различаться.",childCue:"Придумай, откуда приехали герои. Флажок — подсказка к стране, а не к тому, где герой сейчас.",examples:[{pt:"De onde és? — Sou de Portugal.",ru:"Откуда ты? — Я из Португалии."},{pt:"A Ana é do Brasil.",ru:"Ана из Бразилии."},{pt:"Somos de França.",ru:"Мы из Франции."}],tasks:[
    {id:"identity:origin-eu",prompt:"Скажи от лица персонажа: «Я из Португалии».",subject:"Eu",verb:"sou",ending:"de Portugal",options:["do Brasil","de França","de Portugal"],translation:"Я из Португалии.",verbHint:"Происхождение: SER, для «я» — sou.",wordHint:"Из Португалии: de Portugal. Здесь название без артикля."},
    {id:"identity:origin-ana",prompt:"Ана из Бразилии. Собери фразу.",subject:"A Ana",verb:"é",ending:"do Brasil",options:["de Portugal","do Brasil","de França"],translation:"Ана из Бразилии.",verbHint:"Ана — она: é.",wordHint:"Из Бразилии: do Brasil. Do — сочетание de + o."},
    {id:"identity:origin-nos",prompt:"Скажи о группе: «Мы из Франции».",subject:"Nós",verb:"somos",ending:"de França",options:["de França","do Brasil","de Portugal"],translation:"Мы из Франции.",verbHint:"Для «мы» (nós) нужна форма somos.",wordHint:"Здесь используем de França — из Франции."},
  ]},
  {id:"identity:character",title:"Como sou?",ru:"Какой я",words:characteristicWords,adultCue:"Опиши привычную характеристику человека. Картинка помогает запомнить слово; одна поза не доказывает характер.",childCue:"Придумай характер героя: он спокойный, любознательный или приветливый? Одна картинка — только подсказка к слову.",examples:[{pt:"O Rui é calmo.",ru:"Руй спокойный по характеру."},{pt:"A Ana é curiosa.",ru:"Ана любознательная."},{pt:"Eles são simpáticos.",ru:"Они приветливые."}],tasks:[
    {id:"identity:character-rui",prompt:"Руй обычно спокойный по характеру. Расскажи об этом.",subject:"O Rui",verb:"é",ending:"calmo",options:["calma","calmo","curioso"],translation:"Руй спокойный по характеру.",verbHint:"Говорим о характеристике Руя: é от SER.",wordHint:"О Руе: calmo. О женщине: calma."},
    {id:"identity:character-ana",prompt:"Ана любознательная по характеру. Собери фразу.",subject:"A Ana",verb:"é",ending:"curiosa",options:["curioso","simpática","curiosa"],translation:"Ана любознательная.",verbHint:"Характеристика Аны: é.",wordHint:"Любознательная — curiosa, любознательный — curioso."},
    {id:"identity:character-eles",prompt:"Руй и Мигел приветливые. Скажи: «Они приветливые».",subject:"Eles",verb:"são",ending:"simpáticos",options:["simpático","simpáticos","calmos"],translation:"Они приветливые.",verbHint:"Для «они» нужна форма são.",wordHint:"О нескольких мужчинах: simpáticos, во множественном числе."},
  ]},
];
