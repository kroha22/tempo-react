import {groupTopicWordSets} from "./topic-navigation";
import type {WordLearningSet} from "./word-learning-library";
/** Presentation only: source sets, word IDs and review schedules remain unchanged. */
export function wordCollections(sets:readonly WordLearningSet[],child=false){
  const adultOnly=(id:string)=>id==="topic:reading"||id==="topic:vocabulary-cooperation"||id==="topic:vocabulary-clothing"||id==="foundation:hello";
  const registered=groupTopicWordSets(sets),primary=registered.filter(group=>!child||!adultOnly(group.id));
  const remaining=registered.filter(group=>group.id==="other"||(child&&adultOnly(group.id))).flatMap(group=>group.sets);
  // Preserve the existing child ordering: reading first, then original source-set order.
  const reading=registered.find(group=>group.id==="topic:reading")?.sets??[];
  const orderedRemaining=child?[...reading,...sets.filter(set=>!reading.includes(set)&&remaining.includes(set))]:remaining;
  const groups=new Map<string,{id:string;title:string;sets:WordLearningSet[]}>();
  for(const set of orderedRemaining){const title=set.id==="browse:essentials"?"Самое нужное":set.kind==="verbs"?"Глаголы и действия":/school|backpack|instructions|requests|child-/i.test([set.id,...set.aliases].join(" "))?"Школа, друзья и игры":set.kind==="phrases"?"Общение на каждый день":/цвет|одежд/i.test(set.title)?"Цвета и одежда":/животн|ферм|улиц|пляж|сад|дожд|рын|завтрак|парк/i.test(set.title)?"Мир вокруг нас":"Другие подборки";
    const old=groups.get(title);if(old)old.sets.push(set);else groups.set(title,{id:`collection:${set.id}`,title,sets:[set]});
  }
  return [...groups.values()].filter(group=>group.title==="Самое нужное").concat(primary.filter(group=>group.id!=="other").map(group=>({...group,title:group.id==="topic:vocabulary-calendar"?"Время и календарь":group.title})),[...groups.values()].filter(group=>group.title!=="Самое нужное"));
}
