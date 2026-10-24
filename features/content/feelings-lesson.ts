import {generalVocabulary} from "./general-vocabulary.ts";
import {beingContent} from "./first-steps.ts";
import type {VocabularyWord,VocabularyGroup} from "./vocabulary-model.ts";
import type {UsageModule} from "./learning-model.ts";

export const feelingTargets=[
  {key:"feliz",female:"feliz",ru:"Радостный / радостная",pt:"Estou feliz.",translation:"Я рад / рада."},
  {key:"triste",female:"triste",ru:"Грустный / грустная",pt:"Estou triste.",translation:"Мне грустно."},
  {key:"cansado",female:"cansada",ru:"Уставший / уставшая",pt:"O Rui está cansado.",translation:"Руй устал."},
  {key:"nervoso",female:"nervosa",ru:"Взволнованный / взволнованная",pt:"A Rita está nervosa.",translation:"Рита волнуется."},
  {key:"calmo",female:"calma",ru:"Спокойный / спокойная",pt:beingContent.estar.example.pt,translation:beingContent.estar.example.ru},
  {key:"pronto",female:"pronta",ru:"Готовый / готовая",pt:"Estou pronto para sair.",translation:"Я готов выйти."},
] as const;
export const feelingWords:VocabularyWord[]=feelingTargets.map((target,index)=>({
  id:generalVocabulary.find(word=>word.partOfSpeech==="adjective"&&word.portuguese===target.key)?.id??`vocabulary:adjective:${target.key}`,
  label:target.key===target.female?target.key:`${target.key} / ${target.female}`,translation:target.ru,
  adjective:{lemma:target.key,feminine:target.female},acceptedAnswers:{pt:[target.key,target.female],ru:target.ru.split(" / ")},
  example:{pt:target.pt,ru:target.translation},illustration:{src:"/images/vocabulary/feelings-boy-glasses-v2.webp",row:Math.floor(index/3),column:index%3,crop:{x:(index%3)*418,y:index<3?20:600,width:418,height:index<3?570:610,sourceWidth:1254,sourceHeight:1254}},
}));
export function withFeelingIllustration(word:VocabularyWord):VocabularyWord {
  const reviewed=feelingWords.find(item=>item.id===word.id);
  return reviewed?{...word,...reviewed}:word;
}
export const feelingsGroup:VocabularyGroup={id:"vocabulary-feelings",title:"Как я себя чувствую",subgroups:[{id:"feelings-now",title:"Как я себя чувствую",sets:[{id:"feelings-now",title:"Как я себя чувствую",words:feelingWords.map(word=>word.id)}]}]};
export function buildFeelingsUsage(meaningFor:(wordId:string)=>string):UsageModule {
  const meanings=feelingWords.map(word=>meaningFor(word.id));
  return {id:"usage:feelings",title:"Como me sinto? — Как я себя чувствую",situation:"Выбери состояние и соедини его с ESTAR. Estou — я, estás — ты, está — он/она. Можно отвечать о персонаже.",collectionIds:["collection:feelings-now"],newMeaningIds:meanings.slice(0,2),reviewedMeaningIds:meanings.slice(2),recognitionOnly:["estou","estás","está","para sair"],
    examples:feelingTargets.map((target,index)=>({id:`example:feelings:${target.key}`,portuguese:target.pt,translation:target.translation,meaningIds:[meanings[index]],grammarTopicIds:["grammar:present"]})),
    exercises:[
      {id:"cloze:feelings-eu",prompt:"Я сейчас рад / рада. Выбери форму для «я».",before:"",after:" feliz.",correctOptionId:"feelings-estou",feedback:"Estou feliz. — Я рад / рада. С EU: estou.",options:[{id:"feelings-estou",text:"Estou",meaningId:meanings[0]},{id:"feelings-esta",text:"Está",meaningId:meanings[0]},{id:"feelings-sou",text:"Sou",meaningId:meanings[0]}]},
      {id:"cloze:feelings-gender",prompt:"Рита устала. Как закончить фразу о Рите?",before:"A Rita está ",after:".",correctOptionId:"feelings-cansada",feedback:"A Rita está cansada. — Рита устала. О Рите: cansada.",options:[{id:"feelings-cansada",text:"cansada",meaningId:meanings[2]},{id:"feelings-cansado",text:"cansado",meaningId:meanings[2]}]},
      {id:"cloze:feelings-transfer",prompt:"Сегодня Мигел волнуется перед выступлением. Выбери фразу.",before:"",after:"",correctOptionId:"feelings-miguel-estar",feedback:"O Miguel está nervoso. — Мигел волнуется. Это его состояние сейчас: ESTAR.",options:[{id:"feelings-miguel-estar",text:"O Miguel está nervoso.",meaningId:meanings[3]},{id:"feelings-miguel-ser",text:"O Miguel é nervoso.",meaningId:meanings[3]},{id:"feelings-miguel-eu",text:"O Miguel estou nervoso.",meaningId:meanings[3]}]},
    ],relatedLinks:[{id:"feelings-estar",label:"ESTAR: формы и практика",href:"/learning/practice?verb=estar&tense=present",kind:"practice"}],
  };
}
