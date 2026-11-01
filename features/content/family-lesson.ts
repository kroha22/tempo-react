import type {UsageModule} from "./learning-model.ts";
import {professionWords,professionForm} from "./identity.ts";

export const familyPossessives=[
  {form:"meu",meaning:"мой",example:"o meu pai",translation:"мой папа",gender:"Мужской род"},
  {form:"minha",meaning:"моя",example:"a minha mãe",translation:"моя мама",gender:"Женский род"},
  {form:"teu",meaning:"твой",example:"o teu irmão",translation:"твой брат",gender:"Мужской род"},
  {form:"tua",meaning:"твоя",example:"a tua irmã",translation:"твоя сестра",gender:"Женский род"},
] as const;
export const familyPossessiveExamples=[
  {key:"pai",profession:"cozinheiro",pt:`O teu pai é ${professionForm("cozinheiro","male")}.`,ru:"Твой папа — повар."},
  {key:"irma",profession:"engenheiro",pt:`A tua irmã é ${professionForm("engenheiro","female")}.`,ru:"Твоя сестра — инженер."},
] as const;

export const closeFamilyKeys=["mae","pai","irmao","irma","avo-f","avo-m"] as const;
export const fictionalFamily=[
  {key:"mae",name:"Diana",phrase:`A mãe é ${professionForm("professor","female")}.`,translation:"Мама — учительница."},
  {key:"pai",name:"Pedro",phrase:`O pai é ${professionForm("professor","male")}.`,translation:"Папа — учитель."},
  {key:"irma",name:"Rita",phrase:"A Rita é estudante.",translation:"Рита — учащаяся."},
  {key:"irmao",name:"Miguel",phrase:"O Miguel é estudante.",translation:"Мигел — учащийся."},
  {key:"avo-f",name:"Rosa",phrase:`A avó é ${professionForm("médico","female")}.`,translation:"Бабушка — врач."},
  {key:"avo-m",name:"Manuel",phrase:`O avô é ${professionForm("professor","male")}.`,translation:"Дедушка — учитель."},
] as const;
export const familyExamples=[
  {key:"mae",pt:"A minha mãe é professora.",ru:"Моя мама — учительница."},
  {key:"pai",pt:"O meu pai é professor.",ru:"Мой папа — учитель."},
  {key:"irma",pt:"A minha irmã é estudante.",ru:"Моя сестра — учащаяся."},
  {key:"irmao",pt:"O meu irmão é estudante.",ru:"Мой брат — учащийся."},
] as const;
export function buildFamilyUsage(meaningFor:(key:string)=>string,professionMeaning:(wordId:string)=>string):UsageModule {
  const mother=meaningFor("mae"),father=meaningFor("pai"),sister=meaningFor("irma"),grandfather=meaningFor("avo-m");
  const roleMeaning=(lemma:string)=>professionMeaning(professionWords.find(word=>word.noun?.lemma===lemma)!.id);
  const cook=professionForm("cozinheiro","male"),femaleCook=professionForm("cozinheiro","female"),engineer=professionForm("engenheiro","female"),doctor=professionForm("médico","female");
  return {
    id:"usage:family",title:"Моя семья во фразах",situation:"Расскажи о своих близких или о семье собеседника: мой/моя — meu/minha, твой/твоя — teu/tua. Используй знакомые профессии и SER. Можно отвечать о вымышленной семье.",collectionIds:["collection:expansion-family-close"],newMeaningIds:[],reviewedMeaningIds:[...closeFamilyKeys.map(meaningFor),...professionWords.map(word=>professionMeaning(word.id))],recognitionOnly:["meu","minha","teu","tua","é","são"],
    examples:[...familyExamples.map(example=>({id:`example:family:${example.key}`,portuguese:example.pt,translation:example.ru,meaningIds:[meaningFor(example.key)],grammarTopicIds:["grammar:present"]})),...familyPossessiveExamples.map(example=>({id:`example:family:your-${example.key}`,portuguese:example.pt,translation:example.ru,meaningIds:[meaningFor(example.key),roleMeaning(example.profession)],grammarTopicIds:["grammar:present"]}))],
    exercises:[
      {id:"cloze:family-mae",prompt:"Как сказать «моя мама»?",before:"",after:"",correctOptionId:"family-mae",feedback:"A minha mãe — моя мама. Mãe — женского рода.",options:[{id:"family-mae",text:"a minha mãe",meaningId:mother},{id:"family-pai",text:"o meu pai",meaningId:father},{id:"family-irma",text:"a minha irmã",meaningId:sister}]},
      {id:"cloze:family-avo",prompt:"Мой дедушка — учитель. Выбери слово с правильным ударением.",before:"O meu ",after:" é professor.",correctOptionId:"family-avo-m",feedback:"O meu avô é professor. — Мой дедушка — учитель. Avô — дедушка; avó — бабушка.",options:[{id:"family-avo-m",text:"avô",meaningId:grandfather},{id:"family-avo-f",text:"avó",meaningId:meaningFor("avo-f")},{id:"family-irmao",text:"irmão",meaningId:meaningFor("irmao")}]},
      {id:"cloze:family-ser",prompt:"Моя мама — учительница. Дополни фразу.",before:"A minha mãe ",after:" professora.",correctOptionId:"family-e",feedback:"A minha mãe é professora. Роль или профессия: é от SER.",options:[{id:"family-e",text:"é",meaningId:mother},{id:"family-esta",text:"está",meaningId:mother},{id:"family-sou",text:"sou",meaningId:mother}]},
      {id:"cloze:family-transfer",prompt:"Теперь другая семья: папа Риты — учитель. Выбери целую фразу.",before:"",after:"",correctOptionId:"family-transfer-ser",feedback:"O pai da Rita é professor. — Папа Риты — учитель. Называем профессию через SER.",options:[{id:"family-transfer-ser",text:"O pai da Rita é professor.",meaningId:father},{id:"family-transfer-estar",text:"O pai da Rita está professor.",meaningId:father},{id:"family-transfer-sou",text:"O pai da Rita sou professor.",meaningId:father}]},
      {id:"cloze:family-meu-speaker",prompt:"Рита говорит о своём папе: «Мой папа — учитель». Выбери слово.",before:"O ",after:" pai é professor.",correctOptionId:"poss-meu",feedback:"O meu pai — мой папа. Pai — мужского рода, даже когда говорит Рита. Пол говорящего здесь не определяет форму.",options:[{id:"poss-minha",text:"minha",meaningId:father},{id:"poss-meu",text:"meu",meaningId:father},{id:"poss-teu",text:"teu",meaningId:father}]},
      {id:"cloze:family-tua",prompt:"Ты обращаешься к другу: «Твоя мама — врач». Дополни фразу.",before:"A ",after:` mãe é ${doctor}.`,correctOptionId:"poss-tua",feedback:"A tua mãe — твоя мама. Tua: обращаемся к собеседнику на «ты», mãe — женского рода.",options:[{id:"poss-teu",text:"teu",meaningId:mother},{id:"poss-minha",text:"minha",meaningId:mother},{id:"poss-tua",text:"tua",meaningId:mother}]},
      {id:"cloze:family-teu",prompt:"Скажи собеседнику: «Твой брат — учащийся».",before:"O ",after:" irmão é estudante.",correctOptionId:"poss-teu",feedback:"O teu irmão — твой брат. Teu относится к слову irmão, мужского рода.",options:[{id:"poss-teu",text:"teu",meaningId:meaningFor("irmao")},{id:"poss-tua",text:"tua",meaningId:meaningFor("irmao")},{id:"poss-meu",text:"meu",meaningId:meaningFor("irmao")}]},
      {id:"cloze:family-minha",prompt:"Мигел говорит о своей сестре: «Моя сестра — учащаяся».",before:"A ",after:" irmã é estudante.",correctOptionId:"poss-minha",feedback:"A minha irmã — моя сестра. Irmã — женского рода, поэтому minha и у Мигела, и у Риты.",options:[{id:"poss-meu",text:"meu",meaningId:sister},{id:"poss-tua",text:"tua",meaningId:sister},{id:"poss-minha",text:"minha",meaningId:sister}]},
      {id:"cloze:family-cook",prompt:"Твой папа — повар. Выбери слово из общего набора профессий.",before:"O teu pai é ",after:".",correctOptionId:"role-cook",feedback:`O teu pai é ${cook}. — Твой папа — повар. О папе: ${cook}; о маме: ${femaleCook}.`,options:[{id:"role-female-cook",text:femaleCook,meaningId:roleMeaning("cozinheiro")},{id:"role-cook",text:cook,meaningId:roleMeaning("cozinheiro")},{id:"role-teacher",text:professionForm("professor","male"),meaningId:roleMeaning("professor")}]},
      {id:"cloze:family-your-engineer",prompt:"Теперь о семье собеседника: «Твоя сестра — инженер». Выбери фразу.",before:"",after:"",correctOptionId:"family-your-engineer",feedback:`A tua irmã é ${engineer}. — Твоя сестра — инженер. Tua: твоя, потому что речь о сестре собеседника.`,options:[{id:"family-my-engineer",text:`A minha irmã é ${engineer}.`,meaningId:sister},{id:"family-your-engineer",text:`A tua irmã é ${engineer}.`,meaningId:sister},{id:"family-wrong-gender",text:`A teu irmã é ${engineer}.`,meaningId:sister}]},
    ],relatedLinks:[{id:"family-ser",label:"SER: формы и практика",href:"/learning/practice?verb=ser&tense=present",kind:"practice"},{id:"family-ter",label:"У меня есть / здесь есть",href:"/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence",kind:"lesson"}],
  };
}
