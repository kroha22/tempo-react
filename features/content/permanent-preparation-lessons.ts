import {preparationUnits} from "./test-preparation";

export const schoolLessonSections=[
  {topicId:"topic:vocabulary-calendar",title:"Время и мой день",unitIds:["hours","months"],existingTopic:true},
  {topicId:"topic:school-ordinals",title:"Порядковые числительные",unitIds:["ordinals-first","ordinals-last"],existingTopic:false},
  {topicId:"topic:vocabulary-cooperation",title:"Сотрудничество и общение",unitIds:["cooperation"],existingTopic:true},
  {topicId:"topic:vocabulary-body",title:"Тело: кости, мышцы и органы",unitIds:["bones","organs"],existingTopic:true},
  {topicId:"topic:school-health",title:"Здоровье и привычки",unitIds:["prevention","wellbeing"],existingTopic:false},
  {topicId:"topic:school-timeline",title:"Линия времени",unitIds:["timeline"],existingTopic:false},
] as const;
export type SchoolLessonSection=typeof schoolLessonSections[number];
// Navigation keys only: existing unit IDs and activity progress keys are unchanged.
export const permanentLessonTopic=(unitId:string)=>`lesson:preparation:${unitId}`;
export function permanentLessonForTopic(topicId?:string|null){
  return preparationUnits.find(unit=>schoolLessonSections.some(section=>section.unitIds.some(id=>id===unit.id))&&permanentLessonTopic(unit.id)===topicId);
}
export function sectionForUnit(unitId:string){return schoolLessonSections.find(section=>section.unitIds.some(id=>id===unitId));}
