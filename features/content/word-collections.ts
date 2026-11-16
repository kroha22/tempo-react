import {groupTopicWordSets} from "./topic-navigation";
import type {WordLearningSet} from "./word-learning-library";
/** Presentation only: source sets, word IDs and review schedules remain unchanged. */
export function wordCollections(sets:readonly WordLearningSet[],child=false){
  const registered=groupTopicWordSets(sets),primary=registered.filter(group=>!child||group.id!=="topic:reading");
  const remaining=registered.filter(group=>group.id==="other"||(child&&group.id==="topic:reading")).flatMap(group=>group.sets);
  const groups=new Map<string,{id:string;title:string;sets:WordLearningSet[]}>();
  for(const set of remaining){const title=set.id==="browse:essentials"?"Самое нужное":set.kind==="verbs"?"Глаголы и действия":/school|backpack|instructions|requests|child-/i.test([set.id,...set.aliases].join(" "))?"Школа, друзья и игры":set.kind==="phrases"?"Общение на каждый день":/цвет|одежд/i.test(set.title)?"Цвета и одежда":/животн|ферм|улиц|пляж|сад|дожд|рын|завтрак|парк/i.test(set.title)?"Мир вокруг нас":"Другие подборки";
    const old=groups.get(title);if(old)old.sets.push(set);else groups.set(title,{id:`collection:${set.id}`,title,sets:[set]});
  }
  return [...groups.values()].filter(group=>group.title==="Самое нужное").concat(primary.filter(group=>group.id!=="other").map(group=>({...group,title:group.id==="topic:vocabulary-calendar"?"Время и календарь":group.title})),[...groups.values()].filter(group=>group.title!=="Самое нужное"));
}
