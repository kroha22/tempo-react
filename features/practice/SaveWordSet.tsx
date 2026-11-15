"use client";
import {useRef,useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {EnsureQueryScope,useQueryScope} from "../../shared/query/SessionQueryBoundary";
import {saveStudyItem} from "../learning/progress/api";
import {loadSavedItems} from "../cards/api/saved-items";
import {cardsKeys,useSavedItemsQuery} from "../cards/query/queries";
import type {SaveStudyItemInput} from "../learning/progress/contracts";
import type {WordLearningSet} from "../content/word-learning-library";
import {familyCardWords} from "../content/family-cards";
import {foodProductWords} from "../content/food-cards";
import {bodyCardWords} from "../content/body-cards";
import {homeCardWords} from "../content/home-cards";
import {timeDayWords} from "../content/time-day";
import styles from "./QuickWords.module.css";

export function wordSetSaveTargets(set:WordLearningSet):Omit<SaveStudyItemInput,"clientEventId">[]{
  if(set.unit)return set.words.map(word=>({studyItemId:word.id,sourceType:"topic",sourceId:"course:ga1:pt-pt",sourceContextId:`unit:ga1:u${String(set.unit).padStart(2,"0")}`}));
  const bridges=[...familyCardWords.map(word=>({...word,sourceId:`lesson:family:${word.topic}`})),...foodProductWords.map(word=>({...word,sourceId:`lesson:food:${word.topic}`})),...bodyCardWords.map(word=>({...word,sourceId:`lesson:body:${word.topic}`})),...homeCardWords.map(word=>({...word,sourceId:`lesson:home:${word.topic}`})),...timeDayWords.map(word=>({...word,sourceId:`lesson:time-day:${word.topic}`}))];
  return set.words.flatMap(word=>{
    const bridge=bridges.find(row=>row.wordId===word.id||row.studyItemId===word.id);
    return bridge?[{studyItemId:bridge.studyItemId,sourceType:"lesson" as const,sourceId:bridge.sourceId}]:[];
  });
}
export function SaveWordSet({set}:{set:WordLearningSet}){
  const targets=wordSetSaveTargets(set);
  return targets.length?<EnsureQueryScope><Save key={set.id} targets={targets} total={set.words.length}/></EnsureQueryScope>:null;
}
function Save({targets,total}:{targets:Omit<SaveStudyItemInput,"clientEventId">[];total:number}){
  const scope=useQueryScope(),query=useSavedItemsQuery(),lock=useRef(false);
  const [jobs]=useState(()=>targets.map(target=>({...target,clientEventId:`card:${crypto.randomUUID()}`})));
  const [saved,setSaved]=useState(false);
  const mutation=useMutation({mutationFn:async()=>{
    await scope.client.cancelQueries({queryKey:cardsKeys.savedItems(scope.scopeKey)});
    for(const job of jobs){
      const result=await saveStudyItem(job,scope.controller.signal);
      if(!scope.isActive())return;
      scope.client.setQueryData<Awaited<ReturnType<typeof loadSavedItems>>>(cardsKeys.savedItems(scope.scopeKey),data=>({items:[...(data?.items??[]).filter(row=>row.studyItemId!==result.item.studyItemId),result.item],sources:[...new Map([...(data?.sources??[]),...result.sources].map(row=>[JSON.stringify(row),row])).values()]}));
    }
    if(scope.isActive()){setSaved(true);await scope.client.invalidateQueries({queryKey:["cards",scope.scopeKey,"study-reviews"]});}
  },onSettled:()=>{lock.current=false;}});
  return <div className={styles.saveSet}><button type="button" disabled={saved||scope.blocked||query.isPending||query.isError||mutation.isPending} onClick={()=>{if(lock.current)return;lock.current=true;mutation.mutate();}}>{saved?"В повторении ✓":mutation.isPending?"Сохраняем…":mutation.isError?"Повторить сохранение":jobs.length===total?"Добавить в повторение":`Добавить ${jobs.length} из ${total} в повторение`}</button>{(query.isError||scope.blocked)&&<button type="button" onClick={()=>scope.blocked?scope.retryAccess():void query.refetch()}>Проверить сохранения</button>}{mutation.isError&&<span role="alert">Сохранилась только часть набора. Повторите сохранение.</span>}</div>;
}
