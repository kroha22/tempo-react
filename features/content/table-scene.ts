import { pairVocabulary } from "./vocabulary-catalog.ts";
import type { ImageMatchingDefinition } from "../practice/image-matching.ts";
import { publicAssetPath } from "./public-asset.ts";

// Six reviewed words from the existing table set; the cup, table and chair are context.
const targets=[
  ["o prato",739,567], ["o garfo",486,510], ["a faca",1000,512],
  ["a colher",1259,586], ["o copo",1140,350], ["o guardanapo",217,637],
] as const;
const words=targets.map(([label])=>{
  const word=pairVocabulary.find(word=>word.label===label);
  if(!word)throw new Error(`Missing table word: ${label}`);
  return word;
});
export const tableImageActivity:ImageMatchingDefinition={
  id:"image-table",title:"Pôr a mesa",titleLang:"pt-PT",
  image:{src:publicAssetPath("/images/scenes/table-v1.webp"),alt:"Накрываем на стол: тарелка, вилка, нож, ложка, стакан и салфетка",width:1448,height:1086,crop:{x:0,y:0,width:1448,height:1086}},
  wordIds:words.map(word=>word.id),
  spots:targets.map(([,x,y],index)=>({id:`table-${index}`,x,y,acceptedWordIds:[words[index].id]})),
};
