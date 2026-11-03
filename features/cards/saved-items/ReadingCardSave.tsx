"use client";
import {useRef,useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {readingCardChoices,type ReadingCardChoice} from "../../content/reading-cards";
import type {ReadingSource} from "../../content/reading-sources";
import {saveStudyItem} from "../../learning/progress/api";
import {EnsureCardsQueryScope,useCardsScope} from "../query/CardsQueryBoundary";
import {cardsKeys,useSavedItemsQuery} from "../query/queries";
import type {SourceRow} from "../api/saved-items-dto";
import type {loadSavedItems} from "../api/saved-items";

export function ReadingCardSave({pt,source}:{pt:string;source:ReadingSource}){
  const choices=readingCardChoices(pt);
  return <EnsureCardsQueryScope><div>{choices.length>1&&<p>Выберите значение:</p>}{choices.map(choice=><SaveChoice key={`${source.id}:${choice.studyItemId}`} choice={choice} source={source} multiple={choices.length>1}/>)}</div></EnsureCardsQueryScope>;
}
function SaveChoice({choice,source,multiple}:{choice:ReadingCardChoice;source:ReadingSource;multiple:boolean}){
  const scope=useCardsScope(),query=useSavedItemsQuery();
  const busy=useRef(false);
  const [intent]=useState(()=>({studyItemId:choice.studyItemId,sourceType:"lesson" as const,sourceId:source.id,...(source.unit?{sourceContextId:`unit:ga1:u${String(source.unit).padStart(2,"0")}`}:{ }),clientEventId:`card:${crypto.randomUUID()}`}));
  const mutation=useMutation({mutationFn:()=>saveStudyItem(intent,scope.controller.signal),onSuccess:async result=>{
    await scope.client.cancelQueries({queryKey:cardsKeys.savedItems(scope.scopeKey)});
    if(!scope.isActive())return;
    scope.client.setQueryData<Awaited<ReturnType<typeof loadSavedItems>>>(cardsKeys.savedItems(scope.scopeKey),data=>({items:[...(data?.items??[]).filter(item=>item.studyItemId!==result.item.studyItemId),result.item],sources:[...new Map([...(data?.sources??[]),...result.sources].map(row=>[JSON.stringify([row.studyItemId,row.sourceType,row.sourceId,row.sourceContextId??""]),row])).values()]}));
    await scope.client.invalidateQueries({queryKey:["cards",scope.scopeKey,"study-reviews"]});
  },onSettled:()=>{busy.current=false;}});
  const matches=(row:SourceRow)=>row.studyItemId===choice.studyItemId&&row.sourceType===intent.sourceType&&row.sourceId===intent.sourceId&&row.sourceContextId===intent.sourceContextId;
  const saved=query.data?.sources.some(matches)||mutation.data?.sources.some(matches);
  if(query.isError||scope.blocked)return <div><p role="alert">Не удалось загрузить карточки.</p><button type="button" onClick={()=>scope.blocked?scope.retryAccess():void query.refetch()}>Повторить загрузку</button></div>;
  return <div>{multiple&&<p lang="ru"><b lang="pt-PT">{choice.pt}</b> — {choice.ru}</p>}<button type="button" disabled={query.isPending||mutation.isPending||!!saved} onClick={()=>{if(busy.current)return;busy.current=true;mutation.mutate();}}>{query.isPending?"Загружаем…":mutation.isPending?"Сохраняем…":saved?"Уже в карточках ✓":mutation.isError?"Повторить сохранение":"В карточки"}</button>{saved&&<span role="status"> Сохранено · {source.title}</span>}{!saved&&query.data?.items.some(item=>item.studyItemId===choice.studyItemId)&&<small>Карточка уже есть. Добавим только источник урока.</small>}{mutation.isError&&<p role="alert">Не удалось сохранить. Повторите действие.</p>}</div>;
}
