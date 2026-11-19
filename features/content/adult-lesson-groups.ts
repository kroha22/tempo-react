import {adultRequiredLessons} from "./adult-route-lessons.ts";
import type {AdultRouteBlockKey} from "./adult-route.ts";

export type AdultLessonGroup = Readonly<{title:string;lessons:readonly string[]}>;
// Presentation boundaries only. The original required sequence owns all identities.
const boundaries:Readonly<Record<AdultRouteBlockKey,readonly (readonly [string,number])[]>>={
  B01:[["Знакомство",2]],
  B02:[["Близкие",2],["Описание",2]],
  B03:[["Где находится",1],["Применение",1]],
  B04:[["Время",2],["Обычный день",2],["Возвратные действия",1],["Сейчас или обычно",2]],
  B05:[["Еда",3],["Предпочтения",3],["Просьба и покупка",2]],
  B06:[["Направления",1],["Движение",1]],
  B07:[["Части тела",1],["Действия",2]],
  B08:[["Общение",2],["Инструкции",3],["Проверка основы",1]],
  B09:[["Ближайшее действие",2],["Прогноз и пожелания",3]],
  B10:[["События",3],["Фон и события",4],["Связи и опыт",3]],
};
export function adultLessonGroups(block:AdultRouteBlockKey):readonly AdultLessonGroup[]{
  let start=0;
  return boundaries[block].map(([title,count])=>{
    const lessons=adultRequiredLessons[block].slice(start,start+count);start+=count;
    return {title,lessons};
  });
}
export function validateAdultLessonGroups():string[]{
  const errors:string[]=[];
  for(const block of Object.keys(boundaries) as AdultRouteBlockKey[]){
    const groups=adultLessonGroups(block),flat=groups.flatMap(group=>group.lessons);
    if(groups.some(group=>!group.title.trim()||!group.lessons.length))errors.push(`Empty lesson group: ${block}`);
    if(JSON.stringify(flat)!==JSON.stringify(adultRequiredLessons[block]))errors.push(`Group coverage mismatch: ${block}`);
    if(new Set(flat).size!==flat.length)errors.push(`Duplicate grouped lesson: ${block}`);
  }
  return errors;
}
