import { catalogWords } from "./learning-catalog-view";
import {studyVocabularyGroups} from "./vocabulary-catalog";
import { verbCards } from "../cards/data/verb-cards";
import { verbs } from "../conjugation/data";
import {enrichWords} from "./quick-word-enrichment";
import {vocabularySets,type VocabularyWord} from "./vocabulary-model";

export type QuickSetKind = "words" | "verbs" | "phrases";
export type QuickWordSet = {id:string;pt:string;title:string;cue:string;audience:"all"|"adult"|"child";kind:QuickSetKind;words:readonly VocabularyWord[]};
function sharedWords(setId:string):readonly VocabularyWord[] {
  const source=studyVocabularyGroups.flatMap(vocabularySets).find(set=>set.id===setId);
  if(!source)throw new Error(`Missing shared vocabulary set: ${setId}`);
  return source.words.map(id=>{
    const word=catalogWords.find(word=>word.id===id);
    if(!word)throw new Error(`Missing shared vocabulary word: ${id}`);
    return word;
  });
}
export const quickColorSeeds = [
  ["vermelho","vermelha","Красный","#da4147"], ["azul","azul","Синий","#3785cf"],
  ["verde","verde","Зелёный","#4c9b58"], ["amarelo","amarela","Жёлтый","#f6d44a"],
  ["branco","branca","Белый","#fff"], ["preto","preta","Чёрный","#252a31"],
  ["laranja","laranja","Оранжевый","#f2943c"], ["rosa","rosa","Розовый","#ed9db8"],
  ["roxo","roxa","Фиолетовый","#9065bb"], ["castanho","castanha","Коричневый","#976548"],
  ["cinzento","cinzenta","Серый","#8d9398"], ["bege","bege","Бежевый","#dbc7a4"],
] as const;
export const quickColorWords:readonly VocabularyWord[]=quickColorSeeds.map(([lemma,feminine,translation],index)=>({
  id:`vocabulary:color:${lemma}`,label:lemma,translation,adjective:{lemma,feminine},
  acceptedAnswers:{pt:[lemma,feminine],ru:[translation]},illustration:{src:"/images/vocabulary/basic-colors.svg",grid:4,row:Math.floor(index/4),column:index%4},
}));

type VerbSeed=readonly [infinitive:string,pt:string,ru:string];
const verbSeeds:readonly VerbSeed[]=[
  ["ser","Sou de Portugal.","Я из Португалии."],
  ["estar","Estou em casa.","Я дома."],
  ["ter","Tenho um livro.","У меня есть книга."],
  ["ir","Vou para casa.","Я иду домой."],
  ["vir","Venho da escola.","Я иду из школы."],
  ["fazer","Faço o jantar.","Я готовлю ужин."],
  ["poder","Posso entrar?","Можно войти?"],
  ["querer","Quero brincar.","Я хочу поиграть."],
  ["saber","Sei nadar.","Я умею плавать."],
  ["dizer","Digo olá.","Я говорю «привет»."],
  ["dar","Dou água ao gato.","Я даю коту воду."],
  ["ver","Vejo um cão.","Я вижу собаку."],
  ["ler","Leio um livro.","Я читаю книгу."],
  ["ouvir","Ouço música.","Я слушаю музыку."],
  ["pôr","Ponho o livro na mesa.","Я кладу книгу на стол."],
  ["trazer","Trago a mochila.","Я приношу рюкзак."],
  ["sair","Saio de casa.","Я выхожу из дома."],
  ["pedir","Peço ajuda.","Я прошу помощи."],
  ["dormir","Durmo bem.","Я хорошо сплю."],
  ["sentir","Sinto frio.","Мне холодно."],
];
export type QuickVerbSupport={forms:readonly {label:string;value:string}[];example:{pt:string;ru:string};firstPerson:string};
export const quickVerbSupport:Record<string,QuickVerbSupport>={};
const translations:Record<string,string>={ser:"Быть: кто или что",estar:"Быть: как или где",ter:"Иметь",ir:"Идти / ехать",vir:"Приходить / приезжать",fazer:"Делать",poder:"Мочь",querer:"Хотеть"};
const pronouns=[ ["eu","eu"],["tu","tu"],["ele","ele / ela"],["nos","nós"],["voces","vocês"],["eles","eles / elas"] ] as const;
// Presente do indicativo. Existing trainer tables remain the owner when available.
// Supplemental tables checked against Infopédia (Porto Editora), verb entries.
const supplementalPresent:Record<string,readonly [string,string,string,string,string,string]>={
  vir:["venho","vens","vem","vimos","vêm","vêm"],
  poder:["posso","podes","pode","podemos","podem","podem"],
  querer:["quero","queres","quer","queremos","querem","querem"],
  saber:["sei","sabes","sabe","sabemos","sabem","sabem"],
  dar:["dou","dás","dá","damos","dão","dão"],
  ver:["vejo","vês","vê","vemos","veem","veem"],
  ler:["leio","lês","lê","lemos","leem","leem"],
  ouvir:["ouço","ouves","ouve","ouvimos","ouvem","ouvem"],
  pôr:["ponho","pões","põe","pomos","põem","põem"],
  sair:["saio","sais","sai","saímos","saem","saem"],
  pedir:["peço","pedes","pede","pedimos","pedem","pedem"],
  dormir:["durmo","dormes","dorme","dormimos","dormem","dormem"],
  sentir:["sinto","sentes","sente","sentimos","sentem","sentem"],
};
// Keep the original eight seeds and enrichment's canonical IDs for the other twelve.
export const quickIrregularWords:readonly VocabularyWord[]=verbSeeds.slice(0,8).map(([infinitive])=>{
  const source=verbCards.find(card=>card.pt===infinitive)!;
  if(!source)throw new Error(`Missing canonical verb: ${infinitive}`);
  const canonical=catalogWords.find(word=>word.id===source.id);
  const word=canonical??{id:source.id,label:source.pt,translation:translations[infinitive]};
  return word;
});
for(const word of enrichWords("basic-irregular",quickIrregularWords)){
  const seed=verbSeeds.find(([infinitive])=>infinitive===word.label);
  if(!seed)throw new Error(`Missing essential verb example: ${word.label}`);
  const [infinitive,pt,ru]=seed,conjugation=verbs[infinitive as keyof typeof verbs];
  const supplemental=supplementalPresent[infinitive];
  if(!conjugation&&!supplemental)throw new Error(`Missing essential verb forms: ${infinitive}`);
  const forms=pronouns.map(([person,label],index)=>({label,value:conjugation?.forms.present[person]??supplemental[index]}));
  quickVerbSupport[word.id]={forms,firstPerson:forms[0].value,example:{pt,ru}};
}
const set=(id:string,pt:string,title:string,words:readonly VocabularyWord[],kind:QuickSetKind="words"):QuickWordSet=>({id,pt,title,words,kind,audience:"all",cue:""});
const clothes=sharedWords("clothing-basics");
export const quickExpansionSets:readonly QuickWordSet[]=[
  set("basic-irregular","Verbos essenciais","Основные неправильные",quickIrregularWords,"verbs"),
  set("colors-basic","As cores","Основные цвета",quickColorWords.slice(0,6)),
  set("colors-more","Mais cores","Ещё цвета",quickColorWords.slice(6)),
  set("farm-animals","Na quinta","Животные фермы",sharedWords("scene-set-farm")),
  set("fruit","A fruta","Фрукты",sharedWords("expansion-food-fruit")),
  set("food","Comer e beber","Продукты и напитки",sharedWords("expansion-food-meals")),
  set("clothes-basic","A roupa","Одежда на каждый день",clothes.slice(0,6)),
  set("clothes-more","Mais roupa","Ещё одежда",[...clothes.slice(6),...clothes.slice(0,2)]),
];
