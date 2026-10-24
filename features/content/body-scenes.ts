import {pairVocabulary} from "./vocabulary-catalog.ts";
import {publicAssetPath} from "./public-asset.ts";
import type {ImageMatchingDefinition} from "../practice/image-matching.ts";

type Point=readonly [label:string,x:number,y:number];
function scene(id:string,title:string,alt:string,width:number,height:number,points:readonly Point[]):ImageMatchingDefinition {
  const words=points.map(([label])=>{
    const word=pairVocabulary.find(word=>word.label===label);
    if(!word)throw new Error(`Unknown body word: ${label}`);
    return word;
  });
  return {id:`image-body-${id}`,title,titleLang:"pt-PT",image:{src:publicAssetPath(`/images/scenes/body-${id}-${id==="inside"?"v2":"v1"}.webp`),alt,width,height,crop:{x:0,y:0,width,height}},wordIds:words.map(word=>word.id),spots:points.map(([,x,y],i)=>({id:`body-${id}-${i}`,x,y,acceptedWordIds:[words[i].id]}))};
}
export const outsideBodyImage=scene("outside","Da cabeça aos pés","Части тела: человек в одежде и отдельная увеличенная кисть с пальцем",1086,1448,[
  ["a cabeça",490,173],["o braço",295,568],["a mão",174,761],["a barriga",490,653],
  ["a perna",594,1167],["o joelho",389,1008],["o pé",623,1351],["o dedo",908,142],
]);
export const insideBodyImage=scene("inside","Por dentro do corpo","Упрощённая схема сердца, лёгких, желудка и почек; кость и мышца показаны отдельно",1448,1086,[
  ["o coração",790,377],["os pulmões",585,330],["o estômago",799,571],["o rim",610,740],["o osso",168,470],["o músculo",1290,480],
]);
export const bodyImages=[outsideBodyImage,insideBodyImage];
