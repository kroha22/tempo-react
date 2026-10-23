import { foodPhotoIllustrationKeys } from "./food-photo-vocabulary.ts";
import type { VocabularyWord } from "./vocabulary-model.ts";

const firstKeys: readonly string[] = ["maca","banana","laranja","pera","cenoura","cebola","pepino","pimento","leite","queijo","iogurte","manteiga","pao","arroz","massa","aveia"];
// ImageGen kept the object order but not uniform vertical spacing. These bands
// follow actual white gutters, so the next row never bleeds into a word card.
const firstBands = [[0,305],[315,610],[615,925],[935,1235]] as const;
const secondBands = [[0,200],[205,395],[400,600],[605,795],[800,990],[995,1235]] as const;
export function foodIllustration(key: string): VocabularyWord["illustration"] {
  const second = (foodPhotoIllustrationKeys as readonly string[]).indexOf(key);
  const index = second >= 0 ? second : firstKeys.indexOf(key);
  if (index < 0) return undefined;
  const grid = second >= 0 ? 6 : 4;
  const row = Math.floor(index / grid), column = index % grid;
  const [top,bottom] = (second >= 0 ? secondBands : firstBands)[row];
  const x = Math.round(column * 1254 / grid);
  // A few objects are not centered in their nominal columns either.
  const adjusted: Readonly<Record<string,{x:number;width:number}>> = {
    agua:{x:836,width:164}, frango:{x:1010,width:244}, sardinha:{x:410,width:225}, iogurte:{x:645,width:280},
  };
  const horizontal = adjusted[key] ?? {x,width:Math.round((column+1)*1254/grid)-x};
  return {
    src: `/images/vocabulary/food-drawn-${second >= 0 ? "b" : "a"}-v1.webp`, column, row, grid,
    crop: {...horizontal,y:top,height:bottom-top,sourceWidth:1254,sourceHeight:1254},
  };
}
