import type {Example,StudyItem} from "./types.ts";

// Bounded A02.1 edits. Keep old shared examples and all target/flow identities.
const repairs=[
  ["study:verb:estar:state","O Rui está calmo.","Сейчас Руй спокоен."],
  ["study:verb:ter:possession","A Rita tem uma chave.","У Риты есть ключ."],
  ["study:noun:chave","A chave está aqui.","Ключ здесь."],
  ["study:noun:livro","Estou a ler um livro.","Я читаю книгу."],
  ["study:noun:cadeira","A cadeira está ao lado da mesa.","Стул стоит рядом со столом."],
  ["study:noun:cama","A cama está no quarto.","Кровать находится в спальне."],
  ["study:noun:armario","O armário está no quarto.","Шкаф находится в спальне."],
  ["study:noun:copo","O copo está na mesa.","Стакан на столе."],
  ["study:noun:hotel","O hotel fica no centro.","Отель находится в центре."],
  ["study:noun:farmacia","A farmácia fica ao lado do hotel.","Аптека находится рядом с отелем."],
  ["study:chunk:onde-fica","Onde fica a farmácia?","Где находится аптека?"],
] as const;
export const legacyExampleIds=new Map<string,string>(repairs.map(([id])=>[id,`example:legacy-srs:${id.slice(6).replaceAll(":","-")}`]));
export const legacyExampleRu:Record<string,string>={};
export const legacyExamples:Example[]=repairs.map(([studyItemId,pt,ru])=>{
  const id=legacyExampleIds.get(studyItemId)!,translationKey=`${id}.ru`;
  legacyExampleRu[translationKey]=ru;
  return {id,kind:"example",schemaVersion:1,contentRevision:1,status:"reviewed",locale:"pt-PT",text:pt,normalizedText:pt.toLocaleLowerCase("pt-PT"),translationKey,targetIds:[studyItemId],difficulty:"entry",presentationProfileIds:["adult"],quality:{ptPtReviewed:true,translationReviewedLocales:["ru"],naturalness:"acceptable",synthetic:true}};
});
export function repairLegacyExample(item:StudyItem):StudyItem{
  const exampleId=legacyExampleIds.get(item.id);
  return exampleId?{...item,defaultExampleId:exampleId,contentRevision:2}:item;
}
