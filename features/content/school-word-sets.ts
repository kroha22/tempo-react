import {preparationWords} from "./preparation-words";
import {preparationPhonics} from "./preparation-phonics";
import {catalogWords} from "./learning-catalog-view";
import type {WordLearningSet} from "./word-learning-library";
const groups=[
  ["reading","Letras e sons","Буквы и звуки",["letters","r-rr","s-ss","c-cedilla","s-z","g-gu","nasal","digraphs","x-sounds","clusters"]],
  ["time","O tempo e a ordem","Время и порядок",["hours","months","ordinals-first","ordinals-last","timeline"]],
  ["cooperation","Conversar e combinar","Общаемся и договариваемся",["cooperation"]],
  ["body","O corpo por dentro","Кости, мышцы и органы",["bones","organs"]],
  ["health","Cuidar de mim","Здоровье и привычки",["prevention","wellbeing"]],
] as const;
const strip=(text:string)=>text.toLocaleLowerCase("pt-PT").replace(/^(o|a|os|as) /,"");
export const schoolWordSets:WordLearningSet[]=groups.map(([slug,pt,title,units])=>{
  const words=units.flatMap(id=>[...preparationWords(id),...(preparationPhonics[id]??[]).map(entry=>catalogWords.find(word=>strip(word.label)===entry.word&&word.translation.toLocaleLowerCase("ru").replace(/[.!]$/,"")===entry.meaning)??{id:`phonics-word:${entry.word}`,label:entry.word,translation:entry.meaning})]);
  const unique=new Map<string,(typeof words)[number]>();for(const word of words){const key=`${strip(word.label)}:${word.translation.toLocaleLowerCase("ru")}`;if(!unique.has(key))unique.set(key,word);}
  return {id:`school:words:${slug}`,pt,title,cue:"Школьные темы",origin:"topics",kind:"words",audience:"all",aliases:units.map(id=>`school:words:${id}`),words:[...unique.values()]};
});
