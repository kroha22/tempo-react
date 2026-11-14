import type {ProfileBackup} from "../../../github-pages/local-backup";

// Synthetic, fixed IDs and dates. No production catalogue imports or personal data.
export const browserNow=Date.UTC(2030,0,2,12);
export const introduction="lesson:a1-1:introduce-yourself";
export const ola="study:chunk:ola";
export const legacyGroups=[
  {label:"Знакомство · 5",source:introduction,ids:[ola,"study:chunk:como-te-chamas","study:chunk:chamo-me","study:chunk:sou-name","study:chunk:muito-prazer"]},
  {label:"Кто и как себя чувствует · 2",source:"lesson:a1-1:ser-estar-description-state",ids:["study:verb:ser:identity","study:verb:estar:state"]},
  {label:"Что у кого есть · 4",source:"lesson:a1-1:possession-and-presence",ids:["study:verb:ter:possession","study:noun:cama","study:noun:armario","study:noun:copo"]},
  {label:"Где расположено место · 6",source:"lesson:a1-1:ask-place-location",ids:["study:verb:ficar:location","study:chunk:onde-fica","study:noun:estacao","study:noun:hotel","study:noun:farmacia","study:noun:centro"]},
] as const;
export const legacyIds:readonly string[]=legacyGroups.flatMap(group=>[...group.ids]);

export function legacyBackup():ProfileBackup {
  const reviews=["study:verb:estar:state","study:ga1:verb:ser:entry"].map(studyItemId=>({
    studyItemId,reviewItemId:`saved:${studyItemId}`,version:1,reviewedAt:browserNow-1000,
    progress:{cardId:`saved:${studyItemId}`,due:browserNow+155_520_000,interval:1.8,ease:2.5,repetitions:1,lapses:0,lastGrade:2 as const},
  }));
  const sources:ProfileBackup["learning"]["sources"]=[
    ...legacyGroups.flatMap(group=>group.ids.map(studyItemId=>({studyItemId,sourceType:"lesson" as const,sourceId:group.source}))),
    {studyItemId:"study:noun:chave",sourceType:"lesson",sourceId:"lesson:a1-1:name-familiar-objects"},
    {studyItemId:"study:noun:livro",sourceType:"lesson",sourceId:"lesson:a1-1:name-familiar-objects"},
    {studyItemId:"study:noun:cadeira",sourceType:"lesson",sourceId:"lesson:a1-1:possession-and-presence"},
    {studyItemId:"study:ga1:verb:ser:entry",sourceType:"lesson",sourceId:"course:ga1:pt-pt",sourceContextId:"unit:ga1:u12"},
  ];
  // A real stored source may have a context and a different type; activation must keep it.
  sources.push({studyItemId:ola,sourceType:"scene",sourceId:"scene:qa:old-greeting",sourceContextId:"context:qa:keep"});
  return {
    format:"tempo-profile",version:1,exportedAt:browserNow,
    profile:{id:"qa-legacy-profile",name:"Synthetic legacy adult",child:false},
    browser:{version:1,plan:{version:1,lastStepId:null,completed:{}},cards:[{...reviews[0].progress,cardId:"v0001"}],learning:{version:1,lastTopicId:null,feelings:{viewed:[],practised:false,repeated:false,phase:"words"},activities:{}}},
    learning:{version:1,items:sources.filter(row=>row.sourceType==="lesson").map(row=>({studyItemId:row.studyItemId,savedAt:123})),sources,reviews,
      reviewReceipts:reviews.map((card,index)=>{const clientEventId=`review:00000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`;return {command:{studyItemId:card.studyItemId,clientEventId,grade:2,expectedVersion:0},result:{card,clientEventId,duplicate:false}};}),
      progress:[{lessonId:"lesson:a1-1:ser-estar-description-state",flowRevision:1,status:"finished",snapshot:{completed:true},canDoResult:"demonstrated",updatedAt:123}],
      events:[{clientEventId:"event:qa:keep",sessionId:"session:qa:keep",lessonId:"lesson:a1-1:ser-estar-description-state",correct:true}],
    },
  };
}
