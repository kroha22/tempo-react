import {spaceWords} from "./space-vocabulary.ts";
export type SpatialObject="cat"|"book"|"bag";
export type SpatialPlace="inside"|"above"|"below"|"left"|"right";
export type PlacementTask={id:string;object:SpatialObject;places:readonly SpatialPlace[];wordId:string;pt:string;ru:string};
const ids={inside:"study:chunk:dentro-de",above:"study:chunk:em-cima-de",below:"study:chunk:debaixo-de",beside:"study:chunk:ao-lado-de"} as const;
export const placementTasks:readonly PlacementTask[]=[
  {id:"cat-inside",object:"cat",places:["inside"],wordId:ids.inside,pt:"Põe o gato dentro da caixa.",ru:"Поставь кота внутрь коробки."},
  {id:"book-above",object:"book",places:["above"],wordId:ids.above,pt:"Põe o livro em cima da caixa.",ru:"Положи книгу на коробку."},
  {id:"bag-beside",object:"bag",places:["left","right"],wordId:ids.beside,pt:"Põe a mochila ao lado da caixa.",ru:"Поставь рюкзак рядом с коробкой."},
  {id:"cat-below",object:"cat",places:["below"],wordId:ids.below,pt:"Põe o gato debaixo da caixa.",ru:"Поставь кота под коробку."},
  {id:"book-inside",object:"book",places:["inside"],wordId:ids.inside,pt:"Põe o livro dentro da caixa.",ru:"Положи книгу внутрь коробки."},
  {id:"cat-beside",object:"cat",places:["left","right"],wordId:ids.beside,pt:"Põe o gato ao lado da caixa.",ru:"Поставь кота рядом с коробкой."},
];
export type GridPoint={x:number;y:number};
export type GridDirection="right"|"down"|"left"|"up";
export type GridCommand={direction:GridDirection;count:number};
export type DictationTask={id:string;size:number;start:GridPoint;commands:readonly GridCommand[]};
export const directionWords={right:spaceWords.find(word=>word.id==="vocabulary:space:direita")!,left:spaceWords.find(word=>word.id==="vocabulary:space:esquerda")!,up:spaceWords.find(word=>word.id==="vocabulary:space:cima")!,down:spaceWords.find(word=>word.id==="vocabulary:space:baixo")!};
export const dictationTasks:readonly DictationTask[]=[
  {id:"square",size:5,start:{x:1,y:1},commands:[{direction:"right",count:2},{direction:"down",count:2},{direction:"left",count:2},{direction:"up",count:2}]},
  {id:"rectangle",size:5,start:{x:0,y:1},commands:[{direction:"right",count:3},{direction:"down",count:2},{direction:"left",count:3},{direction:"up",count:2}]},
  {id:"step",size:5,start:{x:1,y:1},commands:[{direction:"right",count:2},{direction:"down",count:1},{direction:"left",count:1},{direction:"down",count:1},{direction:"left",count:1},{direction:"up",count:2}]},
];
export function commandText(command:GridCommand,ru=false){return ru?`${command.count} ${command.count===1?"клетка":"клетки"} ${directionWords[command.direction].translation.toLowerCase()}`:`${["","Uma casa","Duas casas","Três casas"][command.count]} ${directionWords[command.direction].label}.`;}
