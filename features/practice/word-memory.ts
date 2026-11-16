import type {VocabularyWord} from "../content/vocabulary-model";

const textKey=(text:string)=>text.normalize("NFC").trim().toLocaleLowerCase("pt-PT");
export function memoryWords(words:readonly VocabularyWord[]){
  const ids=new Set<string>(),labels=new Set<string>(),meanings=new Set<string>(),translations=new Set<string>();
  return words.filter(word=>{
    const art=word.illustration;
    const meaning=art?`image:${art.src}:${art.column}:${art.row}:${art.grid??1}:${JSON.stringify(art.crop??null)}`:`text:${textKey(word.translation)}`;
    const label=textKey(word.label);
    const translation=textKey(word.translation);
    if(!label||!translation||ids.has(word.id)||labels.has(label)||meanings.has(meaning)||translations.has(translation))return false;
    ids.add(word.id);labels.add(label);meanings.add(meaning);translations.add(translation);return true;
  });
}
export function canPlayWordMemory(set:{id:string;aliases:readonly string[];kind:string},words:readonly VocabularyWord[]){
  return set.kind==="words"&&/food|fruit|farm|animal|clothes|clothing/i.test([set.id,...set.aliases].join(" "))&&memoryWords(words).length>=2;
}
export type MemoryCard={id:string;word:VocabularyWord;side:"pt"|"meaning"};
export function makeMemoryBoard(words:readonly VocabularyWord[],attempt=0):MemoryCard[]{
  const tasks=memoryWords(words);
  const cards=tasks.flatMap(word=>(["pt","meaning"] as const).map(side=>({id:`${word.id}:${side}`,word,side})));
  let seed=Array.from(`${tasks.map(word=>word.id).join(":")}:${attempt}`).reduce((value,char)=>(Math.imul(value,31)+char.codePointAt(0)!)>>>0,17);
  for(let index=cards.length-1;index>0;index--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const other=seed%(index+1);[cards[index],cards[other]]=[cards[other],cards[index]];}
  return cards;
}
