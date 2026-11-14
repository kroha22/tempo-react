import {legacySrsWords} from "./legacy-srs.ts";
import {routeLessonExperiences} from "./first-vertical-slice/route-extension.ts";
export const legacyCardGroupIds=["intro","being","presence","places"] as const;
export type LegacyCardGroup=typeof legacyCardGroupIds[number];
const rows=[
  {id:"intro",title:"Знакомство",sourceId:"lesson:a1-1:introduce-yourself",ids:["study:chunk:ola","study:chunk:como-te-chamas","study:chunk:chamo-me","study:chunk:sou-name","study:chunk:muito-prazer"]},
  {id:"being",title:"Кто и как себя чувствует",sourceId:"lesson:a1-1:ser-estar-description-state",ids:["study:verb:ser:identity","study:verb:estar:state"]},
  {id:"presence",title:"Что у кого есть",sourceId:"lesson:a1-1:possession-and-presence",ids:["study:verb:ter:possession","study:noun:cama","study:noun:armario","study:noun:copo"]},
  {id:"places",title:"Где расположено место",sourceId:"lesson:a1-1:ask-place-location",ids:["study:verb:ficar:location","study:chunk:onde-fica","study:noun:estacao","study:noun:hotel","study:noun:farmacia","study:noun:centro"]},
] as const;
export const legacyCardsHref=(group:LegacyCardGroup="intro",review=false)=>`/learning/legacy-cards?group=${group}${review?"&mode=review":""}`;
export const legacyCardGroups=rows.map(row=>{
  const lesson=routeLessonExperiences.find(lesson=>lesson.id===row.sourceId)!;
  return {...row,words:row.ids.map(id=>legacySrsWords.find(word=>word.studyItemId===id)!),source:{id:lesson.id,title:lesson.title,href:`/learning/lessons/${encodeURIComponent(lesson.id)}`}};
});
