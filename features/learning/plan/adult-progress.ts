import {adultMaterialKey,adultRouteBlocks,adultRouteMaterials} from "../../content/adult-route.ts";
import {adultRequiredLessons} from "../../content/adult-route-lessons.ts";
import {adultMaterialSources} from "../../content/adult-route-catalog.ts";
import {allGramaticaLessons} from "../../content/gramatica-ativa.ts";
import {preparationUnits} from "../../content/test-preparation.ts";
import {practicePlanSteps,type PracticePlanProgress} from "../../practice/plan/model.ts";
import type {ProfileLearning} from "../../practice/profile-learning.tsx";
import type {LearningProgress} from "../progress/dto.ts";
import {greetingSets} from "../../content/greetings.ts";
import {firstVerticalSliceContentPack} from "../../content/manifest.ts";
import {clothingWords} from "../../content/clothing.ts";

export type ProfileRead<T> = {profileId:string;status:"ready";value:T}|{profileId:string;status:"loading"|"error"};
export type AdultProgressInput = {
  profile:{id:string;child:boolean};
  learning:ProfileRead<readonly LearningProgress[]>;
  practice:ProfileRead<PracticePlanProgress>;
  activities:ProfileRead<ProfileLearning>;
  routeMode?:"assessed"|"legacy-practice";
};
export type AdultMaterialResult = {key:string;state:"new"|"active"|"done"|"review"|"unknown"|"untracked";updatedAt?:number;reason:string;previouslyDemonstrated?:boolean};

/** Pure projection of already decoded, profile-scoped legacy documents. No I/O or writes. */
export function readAdultProgress(input:AdultProgressInput) {
  const scoped=<T,>(read:ProfileRead<T>)=>!input.profile.child&&read.profileId===input.profile.id&&read.status==="ready"?read.value:undefined;
  const rows=scoped(input.learning),practice=scoped(input.practice),profile=scoped(input.activities);
  const sources=adultMaterialSources();
  const result=(key:string,state:AdultMaterialResult["state"],reason:string,updatedAt?:number):AdultMaterialResult=>({key,state,reason,...(updatedAt!==undefined?{updatedAt}:{})});
  function lesson(key:string,id:string,revision:number):AdultMaterialResult {
    if(!rows)return result(key,"unknown","learning-unavailable");
    const matches=rows.filter(row=>row.lessonId===id);
    if(matches.length>1)return result(key,"unknown","duplicate-learning-rows");
    const row=matches[0];
    if(!row)return result(key,"new","no-result");
    if(row.flowRevision!==revision)return result(key,"review","incompatible-revision");
    // A repeat session and a previously demonstrated outcome are distinct signals.
    if(row.snapshot?.grammar||row.status==="active")return {...result(key,"active","saved-session",row.updatedAt),previouslyDemonstrated:row.canDoResult==="demonstrated"};
    if(row.status==="finished")return result(key,row.canDoResult==="demonstrated"?"done":"review","assessed-result",row.updatedAt);
    return result(key,"new","not-started");
  }
  function step(key:string,id:string):AdultMaterialResult {
    if(!practice)return result(key,"unknown","practice-unavailable");
    const definition=practicePlanSteps.find(step=>step.id===id);
    if(!definition)return result(key,"untracked","no-step-owner");
    const saved=practice.completed[id];
    if(saved)return result(key,saved.revision===definition.revision&&!saved.needsReview?"done":"review","legacy-practice-result");
    return result(key,practice.lastStepId===id?"active":"new",practice.lastStepId===id?"legacy-pointer-no-timestamp":"no-result");
  }
  function activity(key:string,checks:readonly {id:string;total:number}[]):AdultMaterialResult {
    if(!profile)return result(key,"unknown","activities-unavailable");
    const saved=checks.map(check=>({check,saved:profile.activities?.[check.id]}));
    if(saved.every(({check,saved})=>saved&&saved.total===check.total&&saved.correct===check.total))return result(key,"done","full-practice-round");
    if(saved.some(({saved})=>saved))return result(key,"review","partial-or-incompatible-round");
    return result(key,"new","no-result");
  }
  const materials=adultRouteMaterials.map(ref=>{
    const key=adultMaterialKey(ref);
    if(ref.kind==="book"||ref.kind==="checkpoint"){
      const source=allGramaticaLessons.find(lesson=>ref.kind==="book"?!lesson.checkpoint&&lesson.unit===Number(ref.sourceId.slice(1)):lesson.id===ref.sourceId);
      return source?lesson(key,source.id,1):result(key,"untracked","planned-material");
    }
    if(ref.kind==="practice-step")return step(key,ref.sourceId);
    if(ref.kind==="short-grammar")return step(key,`practice:grammar:${ref.sourceId}`);
    if(ref.kind==="preparation"){
      const unit=preparationUnits.find(unit=>unit.id===ref.sourceId)!;
      return activity(key,[{id:`prep:${unit.id}`,total:unit.questions.length}]);
    }
    if(ref.kind==="route"){
      const definition=firstVerticalSliceContentPack.lessons.find(lesson=>lesson.id===ref.sourceId);
      const flow=firstVerticalSliceContentPack.flows.find(flow=>flow.id===definition?.flowId);
      const assessed=flow?lesson(key,ref.sourceId,flow.contentRevision):result(key,"untracked","no-flow-owner");
      if(input.routeMode==="legacy-practice"&&assessed.state!=="done"&&!assessed.previouslyDemonstrated){const round=activity(key,[{id:ref.sourceId,total:1}]);return {...round,reason:round.state==="done"?"legacy-route-practice":round.reason};}
      return assessed;
    }
    if(ref.kind==="topic"&&ref.sourceId==="foundation:hello")return activity(key,greetingSets.map(set=>({id:set.id,total:set.checks.length})));
    if(ref.kind==="topic"&&ref.sourceId==="topic:vocabulary-clothing")return activity(key,[{id:"image:image-clothing",total:clothingWords.length}]);
    if(ref.kind==="topic"&&(ref.sourceId==="topic:city"||ref.sourceId==="topic:work")){
      const setId=ref.sourceId==="topic:city"?"library:collection:pairs-city:0":"library:collection:pairs-verbs-study-work:0";
      const set=sources.find(source=>source.kind==="word-set"&&source.sourceId===setId)?.wordSets?.[0];
      return set?.pairId?activity(key,[{id:`pairs:${set.pairId}`,total:set.words.length}]):result(key,"unknown","missing-pair-owner");
    }
    if(ref.kind==="word-set"&&profile?.wordSession){
      const session=profile.wordSession,source=sources.find(source=>source.kind==="word-set"&&source.sourceId===ref.sourceId);
      if((ref.sourceId===session.setId||source?.aliases?.includes(session.setId))&&session.index<(source?.wordSets?.[0]?.words.length??0))return result(key,"active","saved-word-session",session.updatedAt);
    }
    return result(key,"untracked","no-completion-contract");
  });
  const byKey=new Map(materials.map(material=>[material.key,material]));
  const ordered=adultRouteBlocks.flatMap(block=>adultRequiredLessons[block.key]);
  const satisfied=(key:string)=>byKey.get(key)?.state==="done"||byKey.get(key)?.previouslyDemonstrated===true;
  const blocks=adultRouteBlocks.map(block=>({key:block.key,required:adultRequiredLessons[block.key].map(key=>byKey.get(key)!),coreDone:adultRequiredLessons[block.key].every(satisfied),gap:block.gap}));
  // No safe global chronology exists for legacy pointers. Dated learning sessions
  // win; undated pointers are fallback hints, never synthetic timestamps.
  const unavailable=input.profile.child||ordered.some(key=>byKey.get(key)?.state==="unknown");
  const wordSession=profile?.wordSession;
  const bookWords=wordSession?sources.find(source=>source.kind==="book"&&source.wordSets?.some(set=>set.id===wordSession.setId&&wordSession.index<set.words.length)):undefined;
  const wordCandidate=bookWords&&wordSession?result(adultMaterialKey(bookWords),"active","saved-word-session",wordSession.updatedAt):undefined;
  const dated=[...materials,...(wordCandidate?[wordCandidate]:[])].filter(item=>item.state==="active"&&item.updatedAt!==undefined&&Number.isFinite(item.updatedAt)&&item.updatedAt>=0).sort((a,b)=>b.updatedAt!-a.updatedAt!||a.key.localeCompare(b.key));
  const pointer=practice?.lastStepId?materials.find(item=>item.key===`practice-step/${practice.lastStepId}`&&item.state==="active"):undefined;
  const topic=profile?.lastTopicId?adultRouteMaterials.find(ref=>ref.kind==="topic"&&(ref.sourceId===profile.lastTopicId||sources.find(source=>adultMaterialKey(source)===adultMaterialKey(ref))?.aliases?.includes(profile.lastTopicId!))):undefined;
  const topicNext=topic?ordered.map(key=>byKey.get(key)!).find(item=>!satisfied(item.key)&&adultRouteMaterials.find(ref=>adultMaterialKey(ref)===item.key)?.block===topic.block):undefined;
  const undated=materials.find(item=>item.state==="active"&&item.updatedAt===undefined&&sources.some(source=>adultMaterialKey(source)===item.key&&source.href));
  const next=unavailable?undefined:dated[0]??pointer??topicNext??undated??ordered.map(key=>byKey.get(key)!).find(item=>!satisfied(item.key));
  const source=next?sources.find(source=>adultMaterialKey(source)===next.key):undefined;
  return {materials,blocks,status:unavailable?"unavailable" as const:next?"ready" as const:"complete" as const,
    continuation:next&&(source?.href||source?.kind==="word-set"||next.reason==="saved-word-session")?{key:next.key,kind:next.reason==="saved-word-session"?"words":"lesson",href:next.reason==="saved-word-session"?(source?.wordsHref??"/learning/quick-words"):source?.href??"/learning/quick-words",...(next.reason==="saved-word-session"?{initialSetId:wordSession?.setId}:{}),reason:dated[0]===next?"dated-session":pointer===next?"legacy-step-pointer":topicNext===next?"legacy-topic-pointer":undated===next?"undated-session":"next-core-lesson",state:next.state}:null};
}
