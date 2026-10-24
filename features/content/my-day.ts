import {verbCards} from "../cards/data/verb-cards.ts";
import type {VocabularyGroup,VocabularyWord} from "./vocabulary-model.ts";
import type {UsageModule} from "./learning-model.ts";

export const myDayEvents = [
  {id:"wake",verb:"acordar",hour:7,minute:0,time:"às sete",phrase:"Acordo às sete.",ru:"Я просыпаюсь в семь."},
  {id:"breakfast",verb:"tomar",hour:7,minute:30,time:"às sete e meia",phrase:"Tomo o pequeno-almoço às sete e meia.",ru:"Я завтракаю в половине восьмого."},
  {id:"school",verb:"ir",hour:8,minute:0,time:"às oito",phrase:"Vou para a escola às oito.",ru:"Я иду в школу в восемь."},
  {id:"study",verb:"estudar",hour:9,minute:0,time:"às nove",phrase:"Estudo às nove.",ru:"Я занимаюсь в девять."},
  {id:"home",verb:"voltar",hour:17,minute:0,time:"às cinco da tarde",phrase:"Volto para casa às cinco da tarde.",ru:"Я возвращаюсь домой в пять вечера."},
  {id:"rest",verb:"descansar",hour:21,minute:0,time:"às nove da noite",phrase:"Descanso às nove da noite.",ru:"Я отдыхаю в девять вечера."},
] as const;
export const myDayVerbWords:VocabularyWord[]=myDayEvents.map(event=>{
  const card=verbCards.find(card=>card.pt===event.verb);
  if(!card)throw new Error(`Missing daily verb ${event.verb}`);
  return {id:card.id,label:card.pt,translation:card.ru};
});
export const myDayTimeWords:VocabularyWord[]=myDayEvents.map(event=>({id:`vocabulary:day-time:${event.id}`,label:event.time,translation:`в ${event.hour===17?"пять вечера":event.hour===21?"девять вечера":event.minute===30?"половине восьмого":event.hour===7?"семь":event.hour===8?"восемь":"девять"}`,example:{pt:event.phrase,ru:event.ru}}));
export const myDayGroup:VocabularyGroup={id:"vocabulary-my-day",title:"Мой день",subgroups:[
  {id:"my-day-actions",title:"Действия в течение дня",sets:[{id:"my-day-actions",title:"Действия в течение дня",words:myDayVerbWords.map(word=>word.id)}]},
  {id:"my-day-times",title:"Во сколько?",sets:[{id:"my-day-times",title:"Во сколько?",words:myDayTimeWords.map(word=>word.id)}]},
]};
export function buildMyDayUsage(meaningFor:(wordId:string)=>string):UsageModule {
  const times=myDayTimeWords.map(word=>meaningFor(word.id));
  return {
    id:"usage:my-day",title:"O meu dia — Мой день",situation:"Расскажи, во сколько ты что делаешь. Посмотри примеры, затем выбери подходящее выражение времени по цифрам.",collectionIds:["collection:my-day-actions","collection:my-day-times"],newMeaningIds:times,reviewedMeaningIds:myDayVerbWords.map(word=>meaningFor(word.id)),recognitionOnly:["tomo o pequeno-almoço","para a escola","para casa","da tarde","da noite"],
    examples:myDayEvents.map((event,index)=>({id:`example:my-day:${event.id}`,portuguese:event.phrase,translation:event.ru,meaningIds:[times[index],meaningFor(myDayVerbWords[index].id)],grammarTopicIds:["grammar:present"]})),
    exercises:myDayEvents.slice(0,3).map(event=>({id:`cloze:my-day:${event.id}`,prompt:`${String(event.hour).padStart(2,"0")}:${String(event.minute).padStart(2,"0")} — ${event.ru}`,before:event.phrase.slice(0,event.phrase.indexOf(event.time)),after:".",correctOptionId:`day-time:${event.id}`,feedback:`${event.phrase} — ${event.ru}`,options:myDayEvents.slice(0,3).map((option,i)=>({id:`day-time:${option.id}`,text:option.time,meaningId:times[i]}))})),
    relatedLinks:[{id:"day-grammar-present",label:"Грамматика: настоящее время",href:"/learning/conjugation",kind:"grammar"},...myDayEvents.map(event=>({id:`day-verb:${event.verb}`,label:`${event.verb} — настоящее время`,href:`/learning/practice?verb=${event.verb}&tense=present`,kind:"practice" as const}))],
  };
}
