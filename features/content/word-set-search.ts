import type {WordLearningSet} from "./word-learning-library";

const index=new WeakMap<WordLearningSet,string>();
function normalize(text:string){
  return text.toLocaleLowerCase("pt-PT").normalize("NFD")
    .replace(/(\p{Script=Latin})\p{M}+/gu,"$1").normalize("NFC")
    .replace(/ё/g,"е").trim().replace(/\s+/g," ");
}

/** Search only the current catalogue; canonical sets and saved sessions stay untouched. */
export function wordSetMatchesSearch(set:WordLearningSet,query:string){
  const terms=normalize(query).split(" ").filter(Boolean);
  if(!terms.length)return true;
  let text=index.get(set);
  if(text===undefined){
    text=normalize([set.title,set.pt,set.cue,...set.words.flatMap(word=>[
      word.label,word.translation,...(word.acceptedAnswers?.pt??[]),...(word.acceptedAnswers?.ru??[]),
    ])].join(" "));
    index.set(set,text);
  }
  return terms.every(term=>text.includes(term));
}
