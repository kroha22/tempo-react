import type { VocabularyWord } from "./vocabulary-model.ts";

export const tableIllustrationLabels:readonly string[]=[
  "a cesta","a batata","a cadeira","a mesa",
  "o prato","a chávena","a colher","o copo",
  "o peixe","a carne","o garfo","a faca",
  "o guardanapo","a chave","a caixa","a janela",
];
export function withTableIllustration(word:VocabularyWord):VocabularyWord {
  const index=tableIllustrationLabels.indexOf(word.label);
  if(index<0)return word;
  const row=Math.floor(index/4),column=index%4;
  const [y,bottom]=[[0,310],[320,610],[625,900],[915,1235]][row];
  const x=Math.round(column*1254/4);
  return {...word,illustration:{src:"/images/vocabulary/table-drawn-v1.webp",row,column,grid:4,crop:{x,y,width:Math.round((column+1)*1254/4)-x,height:bottom-y,sourceWidth:1254,sourceHeight:1254}}};
}
