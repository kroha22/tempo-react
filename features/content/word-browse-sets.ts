import {wordLibraryFor,type WordLearningSet} from "./word-learning-library";
import type {VocabularyWord} from "./vocabulary-model";
import {schoolWordSets} from "./school-word-sets";

const cache=new Map<boolean,WordLearningSet[]>();
const unique=(words:readonly VocabularyWord[])=>[...new Map(words.map(word=>[word.id,word])).values()];
function themedCatalog(sets:WordLearningSet[]){
  const titles:Record<string,[string,string]>={
    "Где находится?":["Onde está?","Где находится?"],"Движение и поездки":["Mover-se e viajar","Движение и поездки"],
    "Фрукты":["Fruta e bagas","Фрукты и ягоды"],"Ещё фрукты и ягоды":["Fruta e bagas","Фрукты и ягоды"],
    "Мясо и мясные продукты":["Carne e peixe","Мясо и рыба"],"Рыба и морепродукты":["Carne e peixe","Мясо и рыба"],
    "Продукты и напитки":["Alimentos e bebidas","Продукты и напитки"],"Молочные и зерновые продукты":["Alimentos e bebidas","Продукты и напитки"],
    "Просьбы в классе":["Pedir na escola","Просьбы в школе"],"Говорю с учителем":["Pedir na escola","Просьбы в школе"],"Можно мне?":["Pedir na escola","Просьбы в школе"],
    "С друзьями":["Amigos e jogos","Друзья и игры"],"Играем вместе":["Amigos e jogos","Друзья и игры"],
  };
  const groups=new Map<string,WordLearningSet>();
  for(const set of sets){const title=titles[set.title],key=title?.[0]??set.id,old=groups.get(key);
    if(old){const seen=new Set<string>();old.words=[...old.words,...set.words].filter(word=>{const key=`${word.label}\u0000${word.translation}`;if(seen.has(key))return false;seen.add(key);return true;});old.aliases=[...new Set([...old.aliases,...set.aliases,set.id])];old.pairId=undefined;}
    else groups.set(key,{...set,words:[...set.words],aliases:[...set.aliases],...(title?{pt:title[0],title:title[1]}:{}),...(title?.[1]==="Просьбы в школе"?{cue:"К учителю: вежливое обращение. Abra, por favor. — Откройте, пожалуйста."}:{})});
  }return [...groups.values()];
}
/** Room cards replace the old cross-room batches; original batches stay in the library. */
function regroupHome(sets:WordLearningSet[]){
  const furniture="library:collection:home-furniture:0";
  const kitchenBath="library:collection:kitchen-bath:0";
  const gardenTransport="library:collection:garden-transport:0";
  const replaced=new Set([furniture,kitchenBath,gardenTransport]);
  const rooms=sets.filter(set=>set.aliases.some(alias=>alias.startsWith("collection:house-room-set-")));
  const roomWordIds=new Set(rooms.flatMap(set=>set.words.map(word=>word.id)));
  const extras=(id:string)=>sets.find(set=>set.id===id)?.words.filter(word=>!roomWordIds.has(word.id))??[];
  return sets.filter(set=>!replaced.has(set.id)).map(set=>{
    const additions=set.id==="library:collection:house-room-set-quarto:0"?extras(furniture)
      :set.id==="library:collection:house-room-set-jardim:0"?extras(gardenTransport):[];
    if(!additions.length)return set;
    return {...set,words:unique([...set.words,...additions]),pairId:undefined};
  });
}

function regroupBody(sets:WordLearningSet[]){
  const inside=sets.find(set=>set.id==="library:collection:expansion-body-inside:0");
  const school=sets.find(set=>set.id==="school:words:body");
  if(!inside||!school)return sets;
  return sets.filter(set=>set!==inside).map(set=>set===school?{
    ...set,aliases:[...new Set([...set.aliases,inside.id,...inside.aliases])],
    words:unique([...set.words,...inside.words]),
  }:set);
}
/** Sources remain addressable in the library; the phone catalogue shows themes. */
export function wordBrowseSets(child:boolean){
  const cached=cache.get(child);if(cached)return cached;
  const library=wordLibraryFor(child);
  const sourceTopics=library.filter(set=>set.origin==="topics");
  const topics=regroupHome(themedCatalog(sourceTopics));
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
  const essentials=unique(sourceTopics.filter(set=>["hello","polite","basic-irregular",child?"backpack":"adult-everyday",child?"child-classroom":"adult-shopping"].includes(set.id)).flatMap(set=>set.words));
  const featured:WordLearningSet={id:"browse:essentials",pt:"O essencial",title:"Самые нужные слова и фразы",cue:"На каждый день",audience:"all",kind:"words",origin:"topics",aliases:[],words:essentials};
  const result=regroupBody([featured,...topics,...schoolWordSets,...decks.values()]);cache.set(child,result);return result;
}
