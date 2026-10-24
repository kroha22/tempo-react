import type { VocabularyWord } from "./vocabulary-model.ts";

export const everydayIllustrationLabels: readonly string[] = [
  "a mochila","o caderno","o lápis","a caneta","o livro",
  "a borracha","a régua","a camisola","o casaco","o cachecol",
  "as calças","os calções","a saia","o pijama","a blusa",
  "o vestido","os sapatos","a vaca","o cavalo","o gato",
  "o porco","a ovelha","a galinha","o pato",
];
const bands = [[0,245],[255,490],[500,735],[745,985],[990,1235]] as const;
/** Reuse the illustration across existing aliases without replacing their IDs. */
export function withEverydayIllustration(word: VocabularyWord): VocabularyWord {
  const index = everydayIllustrationLabels.indexOf(word.label);
  if (index < 0) return word;
  const row = Math.floor(index/5), column = index%5;
  const [y,bottom] = bands[row];
  const left = Math.round(column*1254/5), right = Math.round((column+1)*1254/5);
  const horizontal = word.label === "a vaca" ? {x:500,width:246} : word.label === "o cavalo" ? {x:754,width:246} : {x:left,width:right-left};
  return {...word,illustration:{src:"/images/vocabulary/everyday-drawn-v1.webp",row,column,grid:5,crop:{...horizontal,y,height:bottom-y,sourceWidth:1254,sourceHeight:1254}}};
}
