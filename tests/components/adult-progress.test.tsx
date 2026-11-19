import {describe,it,expect} from "vitest";
import {readAdultProgress,type AdultProgressInput} from "../../features/learning/plan/adult-progress";
import {adultMaterialRole,adultRequiredLessons,validateAdultRequiredLessons} from "../../features/content/adult-route-lessons";
import {adultMaterialSources} from "../../features/content/adult-route-catalog";
import {emptyPracticePlanProgress} from "../../features/practice/plan/model";
import {emptyProfileLearning} from "../../features/practice/profile-learning";
import type {LearningProgress} from "../../features/learning/progress/dto";
import {greetingSets} from "../../features/content/greetings";
import {preparationUnits} from "../../features/content/test-preparation";
import {clothingWords} from "../../features/content/clothing";
const fresh=():AdultProgressInput=>({profile:{id:"adult-a",child:false},learning:{profileId:"adult-a",status:"ready",value:[]},practice:{profileId:"adult-a",status:"ready",value:emptyPracticePlanProgress()},activities:{profileId:"adult-a",status:"ready",value:emptyProfileLearning()}});
const row=(id:string,more:Partial<LearningProgress>={}):LearningProgress=>({lessonId:id,flowRevision:1,status:"finished",snapshot:null,canDoResult:"demonstrated",...more});
const state=(input:AdultProgressInput,key:string)=>readAdultProgress(input).materials.find(item=>item.key===key)!;

describe("read-only adult core and continuation",()=>{
  it("reads the Pages Route practice separately from assessed Route completion",()=>{
    const input=fresh();if(input.activities.status!=="ready")throw Error();
    input.activities.value.activities={"checkpoint:a1-1:new-room":{title:"Новая комната",group:"Первые фразы",correct:1,total:1}};
    expect(state(input,"route/checkpoint:a1-1:new-room").state).toBe("new");
    input.routeMode="legacy-practice";
    expect(state(input,"route/checkpoint:a1-1:new-room")).toMatchObject({state:"done",reason:"legacy-route-practice"});
  });
  it("assigns a playable core to all blocks without compulsory planned units, dictionaries or duplicate short grammar",()=>{
    expect(validateAdultRequiredLessons()).toEqual([]);
    const sources=adultMaterialSources();
    for(const keys of Object.values(adultRequiredLessons)){
      expect(keys.length).toBeGreaterThan(0);
      for(const key of keys)expect(sources.find(source=>`${source.kind}/${source.sourceId}`===key)?.href).toBeTruthy();
    }
    expect(adultMaterialRole("book/U36")).toBe("extension");
    expect(adultMaterialRole("short-grammar/ser")).toBe("optional");
    expect(readAdultProgress(fresh()).continuation?.key).toBe("topic/foundation:hello");
  });

  it("requires exact full activity rounds and does not count words viewed, cards saved or a shorter round as completion",()=>{
    const input=fresh();if(input.activities.status!=="ready")throw Error();
    input.activities.value.wordDeck=[];
    input.activities.value.feelings.viewed=["irrelevant"];
    input.activities.value.activities={"prep:hours":{title:"Часы",group:"Слова в жизни",correct:1,total:1}};
    expect(state(input,"preparation/hours").state).toBe("review");
    for(const set of greetingSets)input.activities.value.activities[set.id]={title:set.ru,group:"Первые фразы",correct:set.checks.length,total:set.checks.length};
    expect(state(input,"topic/foundation:hello").state).toBe("done");
    expect(state(input,"book/U01").state).toBe("new");
  });

  it("keeps GA1, short practice and revisioned results independent; preserves a prior pass during repeat",()=>{
    const input=fresh();if(input.learning.status!=="ready"||input.practice.status!=="ready")throw Error();
    input.practice.value.completed["practice:grammar:ser"]={revision:1,needsReview:false};
    expect(state(input,"short-grammar/ser").state).toBe("done");expect(state(input,"book/U01").state).toBe("new");
    input.practice.value.completed["practice:grammar:ser"]={revision:2,needsReview:false};
    expect(state(input,"short-grammar/ser").state).toBe("review");
    input.learning.value=[row("lesson:ga1:identity-and-origin",{status:"active",updatedAt:10})];
    expect(state(input,"book/U01")).toMatchObject({state:"active",previouslyDemonstrated:true});
    input.learning.value=[row("lesson:ga1:identity-and-origin",{flowRevision:99})];
    expect(state(input,"book/U01").state).toBe("review");
  });

  it("uses actual dates before undated pointers, ignores stale pointers and never invents dates",()=>{
    const input=fresh();if(input.learning.status!=="ready"||input.practice.status!=="ready")throw Error();
    input.practice.value.lastStepId="practice:words:expansion-family-close";
    expect(readAdultProgress(input).continuation).toMatchObject({key:"practice-step/practice:words:expansion-family-close",reason:"legacy-step-pointer"});
    expect(state(input,"practice-step/practice:words:expansion-family-close").updatedAt).toBeUndefined();
    input.learning.value=[row("lesson:ga1:identity-and-origin",{status:"active",canDoResult:null,updatedAt:100}),row("lesson:ga1:past-core-verbs",{status:"active",canDoResult:null,updatedAt:200})];
    expect(readAdultProgress(input).continuation?.key).toBe("book/U12");
    input.learning.value=[];input.practice.value.lastStepId="practice:words:removed";
    expect(readAdultProgress(input).continuation?.key).toBe("topic/foundation:hello");
    input.practice.value.lastStepId="practice:grammar:ser";
    expect(readAdultProgress(input).continuation?.href).toBe("/learning/practice?lesson=ser");
    input.practice.value.lastStepId=null;
    input.learning.value=[row("lesson:ga1:past-core-verbs",{status:"active",canDoResult:null})];
    expect(readAdultProgress(input).continuation).toMatchObject({key:"book/U12",reason:"undated-session"});
  });

  it("resumes words without awarding topic/lesson completion",()=>{
    const input=fresh();if(input.activities.status!=="ready")throw Error();
    input.activities.value.wordSession={setId:"hello",stage:"cards",index:1,viewed:[],mode:"pairs",updatedAt:500};
    expect(readAdultProgress(input).continuation).toMatchObject({href:"/learning/quick-words",initialSetId:"hello"});
    expect(state(input,"topic/foundation:hello").state).toBe("new");
    input.activities.value.wordSession={...input.activities.value.wordSession,setId:"book:u1:0",index:0};
    expect(readAdultProgress(input).continuation).toMatchObject({href:"/learning/gramatica-ativa/words/u01",initialSetId:"book:u1:0"});
    expect(state(input,"book/U01").state).toBe("new");
  });

  it("finishes only the available core, without requiring optional/plan-only materials or claiming full block mastery",()=>{
    const input=fresh();if(input.learning.status!=="ready"||input.practice.status!=="ready"||input.activities.status!=="ready")throw Error();
    const sources=adultMaterialSources();
    for(const key of Object.values(adultRequiredLessons).flat()){
      const source=sources.find(source=>`${source.kind}/${source.sourceId}`===key)!;
      if(["book","route","checkpoint"].includes(source.kind))input.learning.value=[...input.learning.value,row((source.source as {id:string}).id)];
      if(source.kind==="practice-step"||source.kind==="short-grammar")input.practice.value.completed[source.kind==="practice-step"?source.sourceId:`practice:grammar:${source.sourceId}`]={revision:1,needsReview:false};
    }
    const full=(id:string,total:number)=>{
      if(input.activities.status!=="ready")throw Error();
      const activities=input.activities.value.activities??={};
      activities[id]={title:id,group:"Слова в жизни",correct:total,total};
    };
    for(const set of greetingSets)full(set.id,set.checks.length);
    for(const id of ["hours","months","cooperation"])full(`prep:${id}`,preparationUnits.find(unit=>unit.id===id)!.questions.length);
    full("image:image-clothing",clothingWords.length);
    for(const id of ["library:collection:pairs-city:0","library:collection:pairs-verbs-study-work:0"]){const set=sources.find(source=>source.kind==="word-set"&&source.sourceId===id)!.wordSets![0];full(`pairs:${set.pairId}`,set.words.length);}
    const output=readAdultProgress(input);expect(output.status).toBe("complete");expect(output.continuation).toBeNull();expect(output.blocks.every(block=>block.coreDone&&block.gap.length>0)).toBe(true);
    expect(state(input,"book/U36").state).toBe("untracked");
    input.learning.value=[...input.learning.value,input.learning.value[0]];
    expect(readAdultProgress(input).status).toBe("unavailable");
  });

  it("treats errors, loading, mixed profiles and child presentation as unavailable, not zero progress",()=>{
    for(const status of ["loading","error"] as const){const input=fresh();input.learning={profileId:"adult-a",status};expect(readAdultProgress(input)).toMatchObject({status:"unavailable",continuation:null});}
    const input=fresh();input.activities.profileId="adult-b";expect(readAdultProgress(input).status).toBe("unavailable");
    const child=fresh();child.profile.child=true;expect(readAdultProgress(child).continuation).toBeNull();
    expect(readAdultProgress(fresh()).status).toBe("ready");
  });

  it("uses a legacy topic alias as an undated hint and ignores an unknown topic",()=>{
    const input=fresh();if(input.activities.status!=="ready")throw Error();
    input.activities.value.lastTopicId="topic:vocabulary-my-day";
    expect(readAdultProgress(input).continuation).toMatchObject({key:"preparation/hours",reason:"legacy-topic-pointer"});
    input.activities.value.lastTopicId="topic:removed";
    expect(readAdultProgress(input).continuation?.key).toBe("topic/foundation:hello");
  });

  it("is deterministic and does not mutate historical documents or expose a second profile result",()=>{
    const input=fresh(),before=structuredClone(input);expect(readAdultProgress(input)).toEqual(readAdultProgress(input));expect(input).toEqual(before);
    const second=fresh();second.profile.id="adult-b";expect(readAdultProgress(second).status).toBe("unavailable");expect(readAdultProgress(input).continuation?.key).toBe("topic/foundation:hello");
  });
});
