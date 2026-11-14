import type {BodyCardTopic} from "./body-cards.ts";
export const bodyFlowPhases=["explanation","words","practice","review"] as const;
export type BodyFlowPhase=typeof bodyFlowPhases[number];
export const bodyFlowHref=(topic:BodyCardTopic="face",phase:BodyFlowPhase="explanation",related?:string)=>`/learning/body?topic=${topic}&phase=${phase}${related?`&related=${encodeURIComponent(related)}`:""}`;
export const bodyIntroductions={
  face:[
    ["Consigo nomear partes do rosto e as mãos. Estudo oito palavras com o artigo e o plural.","Я могу назвать части лица и кисти рук. Изучаю восемь слов с артиклем и множественным числом."],
    ["A orelha é a parte exterior visível; o ouvido é o órgão da audição. Aqui, a língua é uma parte do corpo.","Orelha — видимая наружная часть уха; ouvido — орган слуха. Língua здесь означает часть тела."],
  ],
  movement:[
    ["Consigo nomear seis partes do corpo: o braço, a perna, o pé, o dedo, o joelho e a barriga.","Я могу назвать шесть частей тела: руку от плеча до кисти, ногу, ступню, палец, колено и живот."],
    ["A mão e o braço são partes diferentes. Lemos os exemplos e depois escrevemos as seis palavras.","Кисть и рука от плеча до кисти — разные части тела. Прочитаем примеры, затем напишем шесть слов."],
  ],
  feelings:[
    ["Consigo dizer como me sinto: Estou feliz. Estou triste. Também posso falar do estado de outra pessoa: O Rui está cansado.","Я могу сказать, как себя чувствую: я рад / рада, мне грустно. Можно назвать состояние другого человека: Руй устал."],
    ["Para falar do estado, usamos ESTAR: eu estou, tu estás, ele ou ela está. SER pode descrever uma característica: O Rui é calmo. O Rui está calmo fala do estado dele agora.","Для состояния используем ESTAR: eu estou, tu estás, ele/ela está. SER может описывать черту характера: Руй спокойный по характеру. O Rui está calmo сообщает о его состоянии сейчас."],
    ["Dizemos cansado ou cansada, nervoso ou nervosa, calmo ou calma, pronto ou pronta. Feliz e triste não mudam com o género. Como estás? — Estou bem.","Говорим cansado/cansada, nervoso/nervosa, calmo/calma, pronto/pronta. Feliz и triste не меняются по роду. Как ты? — У меня всё хорошо."],
  ],
} as const;
export const bodyGlossary:Readonly<Record<string,string>>={
  rosto:"лицо",mãos:"кисти рук",nomear:"называть",artigo:"артикль",plural:"множественное число",órgão:"орган",audição:"слух",exterior:"наружная",visível:"видимая",corpo:"тело",diferentes:"разные",escrevemos:"мы пишем",género:"род",estado:"состояние",característica:"черта; характеристика",sinto:"я чувствую",agora:"сейчас",bem:"хорошо (о самочувствии)",
  cabeça:"голова",cabeças:"головы",olho:"глаз",olhos:"глаза",orelha:"ушная раковина",orelhas:"ушные раковины",ouvido:"орган слуха",ouvidos:"органы слуха",nariz:"нос",narizes:"носы",boca:"рот",bocas:"рты",língua:"язык как часть тела",línguas:"языки как части тела",mão:"кисть",braço:"рука от плеча до кисти",braços:"руки от плеча до кисти",perna:"нога",pernas:"ноги",pé:"ступня",pés:"ступни",dedo:"палец",dedos:"пальцы",joelho:"колено",joelhos:"колени",barriga:"живот",barrigas:"животы",
  feliz:"радостный / радостная",triste:"грустный / грустная",cansado:"уставший",cansada:"уставшая",nervoso:"взволнованный",nervosa:"взволнованная",calmo:"спокойный",calma:"спокойная",pronto:"готовый",pronta:"готовая",
};
