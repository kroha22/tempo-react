import {wordLibraryFor,type WordLearningSet} from "./word-learning-library";
import type {VocabularyWord} from "./vocabulary-model";
import {schoolWordSets} from "./school-word-sets";

const cache=new Map<boolean,WordLearningSet[]>();
const unique=(words:readonly VocabularyWord[])=>[...new Map(words.map(word=>[word.id,word])).values()];
/** Sources remain addressable in the library; the phone catalogue shows themes. */
export function wordBrowseSets(child:boolean){
  const cached=cache.get(child);if(cached)return cached;
  const library=wordLibraryFor(child);
  const topics=library.filter(set=>set.origin==="topics");
  const decks=new Map<string,WordLearningSet>();
  for(const set of library.filter(set=>set.origin==="decks")){
    const source=set.aliases.find(id=>id.startsWith("deck:"))??set.id;
    const old=decks.get(source);
    if(old){old.words=unique([...old.words,...set.words]);old.aliases=[...new Set([...old.aliases,...set.aliases,set.id])];}
    else decks.set(source,{...set,id:`browse:${source}`,pt:source==="deck:verbs"?"Todos os verbos":source==="deck:basic"?"Palavras do dia a dia":set.pt,title:source==="deck:verbs"?"Все глаголы":source==="deck:basic"?"Повседневный словарь":set.title.replace(/ · \d+$/,""),aliases:[...set.aliases,set.id]});
  }
  const basic=decks.get("deck:basic");
  // One reference dictionary also reaches vocabulary that only occurs in a lesson.
  if(basic)basic.words=unique([...basic.words,...library.filter(set=>set.origin==="lessons").flatMap(set=>set.words)]);
  const essentials=unique(topics.filter(set=>["hello","polite","basic-irregular",child?"backpack":"adult-everyday",child?"child-classroom":"adult-shopping"].includes(set.id)).flatMap(set=>set.words));
  const featured:WordLearningSet={id:"browse:essentials",pt:"O essencial",title:"Самые нужные слова и фразы",cue:"На каждый день",audience:"all",kind:"words",origin:"topics",aliases:[],words:essentials};
  const result=[featured,...topics,...schoolWordSets,...decks.values()];cache.set(child,result);return result;
}
