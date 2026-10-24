import type { NounSeed } from "./topic-expansion.ts";
import type { VocabularyWord } from "./vocabulary-model.ts";

// Topic support: Estudo do Meio, 2.º ano, pp. 12–13 and 16–17.
// Original examples and artwork; the textbook pages are not published assets.
export const insideBodyNouns:readonly NounSeed[]=[
  ["coracao","o","coração","corações","Сердце","O coração bate.","Сердце бьётся."],
  ["pulmao","o","pulmão","pulmões","Лёгкое","Os pulmões ajudam-nos a respirar.","Лёгкие помогают нам дышать."],
  ["estomago","o","estômago","estômagos","Желудок","O estômago participa na digestão.","Желудок участвует в пищеварении."],
  ["rim","o","rim","rins","Почка","Os rins filtram o sangue.","Почки фильтруют кровь."],
  ["osso","o","osso","ossos","Кость","Os ossos dão apoio ao corpo.","Кости служат опорой для тела."],
  ["musculo","o","músculo","músculos","Мышца","Os músculos ajudam-nos a mover o corpo.","Мышцы помогают нам двигать телом."],
];
export const bodyIllustrationLabels:readonly string[]=[
  "a cabeça","o olho","a orelha","o ouvido","o nariz",
  "a boca","a língua","a mão","o braço","a perna",
  "o pé","o dedo","o joelho","a barriga","o coração",
  "o pulmão","o estômago","o rim","o osso","o músculo",
];
export function withBodyIllustration(word:VocabularyWord):VocabularyWord {
  const index=bodyIllustrationLabels.indexOf(word.label==="os pulmões"?"o pulmão":word.label);
  if(index<0)return word;
  const row=Math.floor(index/5),column=index%5;
  const [y,bottom]=[[0,250],[255,485],[495,730],[735,985]][row];
  const x=Math.round(column*1254/5);
  const paired=index===15?{label:"os pulmões",translation:"Лёгкие",acceptedAnswers:{pt:["o pulmão","os pulmões"],ru:["лёгкое","лёгкие"]}}:{};
  return {...word,...paired,illustration:{src:"/images/vocabulary/body-drawn-v2.webp",row,column,grid:5,crop:{x,y,width:Math.round((column+1)*1254/5)-x,height:bottom-y,sourceWidth:1254,sourceHeight:1254}}};
}
