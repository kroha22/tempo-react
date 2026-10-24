import type { VocabularyGroup, VocabularyWord } from "./vocabulary-model.ts";

// Existing Route expressions retain their original identities.
const entries = [
  ["study:chunk:dentro-de","dentro de","внутри","O gato está dentro da caixa.","Кот внутри коробки."],
  ["study:chunk:em-cima-de","em cima de","на, сверху на","O gato está em cima da caixa.","Кот на коробке."],
  ["study:chunk:debaixo-de","debaixo de","под","O gato está debaixo da caixa.","Кот под коробкой."],
  ["study:chunk:ao-lado-de","ao lado de","рядом с","O gato está ao lado da caixa.","Кот рядом с коробкой."],
  ["vocabulary:space:em-frente-de","em frente de","перед","O gato está em frente da caixa.","Кот перед коробкой."],
  ["vocabulary:space:atras-de","atrás de","за, позади","O gato está atrás da caixa.","Кот за коробкой."],
  ["vocabulary:space:longe-de","longe de","далеко от","O gato está longe da caixa.","Кот далеко от коробки."],
  ["vocabulary:space:entre","entre","между","O gato está entre as caixas.","Кот между коробками."],
  ["vocabulary:space:esquerda","para a esquerda","налево","Vou para a esquerda.","Я иду налево."],
  ["vocabulary:space:direita","para a direita","направо","Vou para a direita.","Я иду направо."],
  ["vocabulary:space:cima","para cima","вверх","A seta aponta para cima.","Стрелка направлена вверх."],
  ["vocabulary:space:baixo","para baixo","вниз","A seta aponta para baixo.","Стрелка направлена вниз."],
  ["vocabulary:space:frente","para a frente","вперёд","Dou um passo para a frente.","Я делаю шаг вперёд."],
  ["vocabulary:space:tras","para trás","назад","Dou um passo para trás.","Я делаю шаг назад."],
] as const;
export const spaceWords:VocabularyWord[]=entries.map(([id,label,translation,pt,ru])=>({id,label,translation,example:{pt,ru}}));
export function withSpaceIllustration(word:VocabularyWord):VocabularyWord {
  const index=entries.findIndex(([id])=>id===word.id);
  if(index<0)return word;
  return {...word,example:spaceWords[index].example,illustration:{src:"/images/vocabulary/space-drawn-v1.webp",column:index%4,row:Math.floor(index/4),grid:4}};
}
const locationHref="/learning/lessons/lesson%3Aa1-1%3Alocate-object";
export const spaceGroup:VocabularyGroup={id:"vocabulary-space",title:"Пространство и направления",subgroups:[
  {id:"space-positions",title:"Где находится?",sets:[{id:"space-positions",title:"Где находится?",words:entries.slice(0,8).map(([id])=>id),sourceHref:locationHref}]},
  {id:"space-directions",title:"Куда двигаться?",sets:[{id:"space-directions",title:"Куда двигаться?",words:entries.slice(8).map(([id])=>id)}]},
]};
