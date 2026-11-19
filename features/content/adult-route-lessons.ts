import {adultMaterialKey,adultRouteMaterials,type AdultRouteBlockKey} from "./adult-route.ts";

/** Ordered core practice, not new content IDs. Optional references stay in the inventory.
 * A passed core is not mastery of the whole block; planned grammar is later extension.
 */
export const adultRequiredLessons: Readonly<Record<AdultRouteBlockKey,readonly string[]>> = {
  B01:["topic/foundation:hello","book/U01"],
  B02:["practice-step/practice:words:expansion-family-close","practice-step/practice:words:expansion-family-relatives","book/U11","book/U03"],
  B03:["book/U02","route/checkpoint:a1-1:new-room"],
  B04:["preparation/hours","preparation/months","book/U05","book/U08","book/U15","book/U04","book/U10"],
  B05:["practice-step/practice:words:expansion-food-fruit","practice-step/practice:words:expansion-food-meals","practice-step/practice:words:expansion-food-table","book/U06","practice-step/practice:everyday:likes","book/U07","book/U20","topic/topic:vocabulary-clothing"],
  B06:["topic/topic:city","book/U09"],
  B07:["practice-step/practice:words:expansion-body-face","practice-step/practice:words:expansion-body-movement","practice-step/practice:everyday:body"],
  B08:["topic/topic:work","preparation/cooperation","book/U26","book/U27","book/U28","checkpoint/lesson:ga1:review-foundations"],
  B09:["short-grammar/ir-plans","book/U23","book/U24","book/U25","book/U30"],
  B10:["book/U12","book/U13","book/U14","book/U16","book/U17","book/U18","book/U19","book/U21","book/U22","book/U29"],
};
export function adultMaterialRole(key:string):"required"|"extension"|"optional" {
  if(Object.values(adultRequiredLessons).some(keys=>keys.includes(key)))return "required";
  const ref=adultRouteMaterials.find(ref=>adultMaterialKey(ref)===key);
  return ref?.kind==="book"&&Number(ref.sourceId.slice(1))>=31?"extension":"optional";
}
export function validateAdultRequiredLessons():string[] {
  const errors:string[]=[],seen=new Set<string>();
  for(const [block,keys] of Object.entries(adultRequiredLessons))for(const key of keys){
    const ref=adultRouteMaterials.find(ref=>adultMaterialKey(ref)===key);
    if(!ref||ref.block!==block)errors.push(`Invalid required placement: ${block}/${key}`);
    if(seen.has(key))errors.push(`Duplicate required lesson: ${key}`);
    if(ref?.kind==="book"&&Number(ref.sourceId.slice(1))>=31)errors.push(`Planned core: ${key}`);
    seen.add(key);
  }
  return errors;
}
