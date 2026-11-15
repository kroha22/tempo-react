import {quickSetsFor} from "./quick-word-sets";
import type {QuickWordSet,QuickSetKind} from "./quick-word-expansion";
import {catalogGroups,catalogWords} from "./learning-catalog-view";
import {learningCatalog} from "./learning-catalog";
import {vocabularySets,type VocabularyWord} from "./vocabulary-model";
import {gramaticaVocabulary,vocabularyForUnit,vocabularyFront} from "./gramatica-vocabulary";
import {verbCards} from "../cards/data/verb-cards";
import {basicWordCards} from "../cards/data/basic-word-cards";
import {tempoPracticeDecks} from "../cards/data/tempo-decks";
import {vocabularyTitlesPt} from "./vocabulary-titles";
import {enrichWords} from "./quick-word-enrichment";

export type WordLearningSet=QuickWordSet&{origin:"topics"|"lessons"|"decks";aliases:readonly string[];pairId?:string;unit?:number};
const byId=new Map(catalogWords.map(word=>[word.id,word]));
export const bookWords=new Map(gramaticaVocabulary.map(entry=>[entry.studyItemId,byId.get(entry.studyItemId)??{
  id:entry.studyItemId,label:vocabularyFront(entry).split(" — ")[0],translation:entry.translation,example:entry.examples[0],
  ...(entry.noun&&!entry.noun.pluralOnly?{noun:{lemma:entry.lemma,article:entry.noun.article,plural:entry.noun.plural,pluralArticle:entry.noun.pluralArticle}}:{}),
} as VocabularyWord]));
function batches(words:readonly VocabularyWord[]){
  const size=Math.max(1,Math.ceil(words.length/8));
  return Array.from({length:size},(_,index)=>words.slice(Math.floor(index*words.length/size),Math.floor((index+1)*words.length/size)));
}
const meaning=new Map(learningCatalog.meanings.flatMap(item=>item.legacyWordIds.map(id=>[id,item.id])));
const signature=(words:readonly VocabularyWord[])=>[...new Set(words.map(word=>meaning.get(word.id)??word.id))].sort().join("|");
const alias:Record<string,string[]>={"collection:scene-set-farm":["farm-animals"],"collection:expansion-food-fruit":["fruit"],"collection:expansion-food-meals":["food"],"collection:clothing-basics":["clothes-basic","clothes-more"],"collection:scene-set-school":["backpack"]};
const legacySeen=new Set<string>();
const oldSets=catalogGroups.flatMap(group=>vocabularySets(group).filter(set=>!legacySeen.has(set.id)&&!!legacySeen.add(set.id)).map(set=>({set,group})));
const thematic:WordLearningSet[]=oldSets.flatMap(({set,group})=>alias[set.id]?[]:[set.words.map(id=>byId.get(id)!).filter(Boolean)].map((words,index,parts)=>({
  id:`library:${set.id}:${index}`,pt:vocabularyTitlesPt[set.title]??set.title,title:`${set.title}${parts.length>1?` · ${index+1}`:""}`,cue:group.title,
  words,kind:words.every(word=>/^v\d{4}$/.test(word.id))?"verbs":"words",audience:"all",origin:"topics",aliases:[set.id,group.id],pairId:parts.length===1?set.id:undefined,
})));
const lessons:WordLearningSet[]=Array.from({length:54},(_,i)=>i+1).flatMap(unit=>[vocabularyForUnit(unit).map(entry=>bookWords.get(entry.studyItemId)!)].map((words,index,parts)=>({
  id:`book:u${unit}:${index}`,pt:`Unidade ${unit}`,title:`Урок ${unit}${parts.length>1?` · ${index+1}`:""}`,cue:"Gramática Ativa",words,kind:"words",audience:"all",origin:"lessons",aliases:[`book:${unit}`],unit,
})));
const decks:WordLearningSet[]=[
  ...batches(verbCards.map(card=>byId.get(card.id)??{id:card.id,label:card.pt,translation:card.ru})).map((words,index)=>({id:`deck:verbs:${index}`,pt:`Verbos · ${index+1}`,title:`Глаголы · ${index+1}`,cue:"Частотная колода",words,kind:"verbs" as const,audience:"all" as const,origin:"decks" as const,aliases:["deck:verbs"]})),
  ...batches(basicWordCards.map(card=>byId.get(card.id)??byId.get(card.existingCardId??"")??{id:card.id,label:card.portuguese,translation:card.translation})).map((words,index)=>({id:`deck:basic:${index}`,pt:`Palavras · ${index+1}`,title:`Базовые слова · ${index+1}`,cue:"Прежний словарь",words,kind:"words" as const,audience:"all" as const,origin:"decks" as const,aliases:["deck:basic"]})),
  ...tempoPracticeDecks.flatMap(deck=>batches(deck.cards.map(card=>({id:card.id,label:card.portuguese,translation:card.russian}))).map((words,index,parts)=>({id:`deck:${deck.id}:${index}`,pt:deck.title,title:`${deck.title}${parts.length>1?` · ${index+1}`:""}`,cue:deck.description,words,kind:deck.category==="forms"?"verbs" as const:"phrases" as const,audience:"adult" as const,origin:"decks" as const,aliases:[`deck:${deck.id}`]}))),
];
const libraryCache=new Map<boolean,WordLearningSet[]>();
function combineRelated(sets:WordLearningSet[]){
  const titles:Record<string,[string,string]>={
    "Январь — июнь":["Os meses","Месяцы"],"Июль — декабрь":["Os meses","Месяцы"],
    "Моя семья":["A minha família","Семья и родственники"],"Родственники":["A minha família","Семья и родственники"],
    "Слушаем по очереди":["Conversar e chegar a acordo","Общение и договорённости"],"Чувства и границы":["Conversar e chegar a acordo","Общение и договорённости"],"Ищем общее решение":["Conversar e chegar a acordo","Общение и договорённости"],
    "Лицо и руки":["O corpo","Части тела"],"Тело и движение":["O corpo","Части тела"],"От головы до ног":["O corpo","Части тела"],
    "Овощи":["Legumes e ervas","Овощи и зелень"],"Ещё овощи и зелень":["Legumes e ervas","Овощи и зелень"],
    "Молочные продукты":["Laticínios e cereais","Молочные и зерновые продукты"],"Зерновые продукты":["Laticínios e cereais","Молочные и зерновые продукты"],
    "Масла и приправы":["Temperos e molhos","Приправы и соусы"],"Соусы":["Temperos e molhos","Приправы и соусы"],
  };
  const groups=new Map<string,WordLearningSet>();
  for(const set of sets){
    const title=set.origin==="topics"?titles[set.title]:undefined;
    const key=title?`related:${title[0]}`:set.id;
    const existing=groups.get(key);
    if(existing){existing.words=[...new Map([...existing.words,...set.words].map(word=>[meaning.get(word.id)??word.id,word])).values()];existing.aliases=[...new Set([...existing.aliases,...set.aliases,set.id])];existing.pairId=undefined;}
    else groups.set(key,title?{...set,pt:title[0],title:title[1]}:set);
  }
  return [...groups.values()];
}
export function wordLibraryFor(child:boolean):WordLearningSet[]{
  const cached=libraryCache.get(child);if(cached)return cached;
  const originals=quickSetsFor(child);
  const merged:Record<string,string>={"colors-more":"colors-basic","clothes-more":"clothes-basic"};
  const quick:WordLearningSet[]=originals.filter(set=>!merged[set.id]).map(set=>{
    const siblings=originals.filter(other=>merged[other.id]===set.id);
    return {...set,title:set.id==="colors-basic"?"Цвета":set.id==="clothes-basic"?"Одежда":set.title,
      words:enrichWords(set.id,[...set.words,...siblings.flatMap(other=>other.words)]),origin:"topics",aliases:[set.id,...siblings.map(other=>other.id),...Object.entries(alias).filter(([,ids])=>ids.includes(set.id)).map(([id])=>id)]};
  });
  const seen=new Map<string,WordLearningSet>();
  for(const set of [...quick,...thematic,...lessons,...decks.filter(set=>set.audience==="all"||set.audience===(child?"child":"adult"))]){
    if(!set.words.length)continue;
    // Lesson membership is retained as a source even when its words match a topic.
    const key=`${set.origin==="lessons"?`u${set.unit}:`:""}${signature(set.words)}`;
    const old=seen.get(key);
    if(old){old.aliases=[...new Set([...old.aliases,...set.aliases,set.id])];continue;}
    seen.set(key,{...set,words:[...new Map(set.words.map(word=>[word.id,word])).values()]});
  }
  const result=combineRelated([...seen.values()]);libraryCache.set(child,result);return result;
}
export function setsForSource(source:string,child:boolean){return wordLibraryFor(child).filter(set=>set.id===source||set.aliases.includes(source));}
export type {QuickSetKind};
