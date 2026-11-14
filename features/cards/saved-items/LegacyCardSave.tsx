"use client";
import {useRef,useState} from "react";
import {useMutation,useQuery} from "@tanstack/react-query";
import {EnsureCardsQueryScope,useCardsScope} from "../query/CardsQueryBoundary";
import {cardsKeys,useSavedItemsQuery} from "../query/queries";
import {loadStudyReviews} from "../study-review/api";
import {saveStudyItem} from "../../learning/progress/api";
import type {SaveStudyItemInput} from "../../learning/progress/contracts";
import type {ReadingSource} from "../../content/reading-sources";
import {legacyCardGroups,legacyCardsHref} from "../../content/legacy-cards";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import type {loadSavedItems} from "../api/saved-items";

export function LegacyCardSave({studyItemId,source}:{studyItemId:string;source?:ReadingSource}){
  return <EnsureCardsQueryScope><ScopedSave studyItemId={studyItemId} source={source}/></EnsureCardsQueryScope>;
}
function ScopedSave(props:{studyItemId:string;source?:ReadingSource}){
  const scope=useCardsScope();return <Save key={`${scope.scopeKey}:${props.studyItemId}:${props.source?.id??"stored"}`} {...props}/>;
}
function Save({studyItemId,source}:{studyItemId:string;source?:ReadingSource}){
  const scope=useCardsScope(),items=useSavedItemsQuery(),reviewKey=["cards",scope.scopeKey,"study-reviews"] as const;
  const reviews=useQuery({queryKey:reviewKey,enabled:!scope.blocked,queryFn:({signal})=>loadStudyReviews(signal),staleTime:0});
  const busy=useRef(false),intent=useRef<SaveStudyItemInput|null>(null),[postConfirmed,setPostConfirmed]=useState(false);
  const mutation=useMutation({mutationFn:(command:SaveStudyItemInput)=>{if(!scope.isActive())throw new Error("Inactive cards scope");return saveStudyItem(command,scope.controller.signal);},
    onMutate:async()=>{await Promise.all([scope.client.cancelQueries({queryKey:cardsKeys.savedItems(scope.scopeKey)}),scope.client.cancelQueries({queryKey:reviewKey})]);},
    onSuccess:async result=>{
      await Promise.all([scope.client.cancelQueries({queryKey:cardsKeys.savedItems(scope.scopeKey)}),scope.client.cancelQueries({queryKey:reviewKey})]);
      if(!scope.isActive())return;
      scope.client.setQueryData<Awaited<ReturnType<typeof loadSavedItems>>>(cardsKeys.savedItems(scope.scopeKey),data=>({items:data?.items.some(item=>item.studyItemId===result.item.studyItemId)?data.items.map(item=>item.studyItemId===result.item.studyItemId?result.item:item):[...(data?.items??[]),result.item],sources:[...new Map([...(data?.sources??[]),...result.sources].map(row=>[JSON.stringify([row.studyItemId,row.sourceType,row.sourceId,row.sourceContextId??""]),row])).values()]}));
      setPostConfirmed(true);
      await reviews.refetch();
    },onSettled:()=>{busy.current=false;}});
  const item=items.data?.items.find(item=>item.studyItemId===studyItemId),existingSources=items.data?.sources.filter(row=>row.studyItemId===studyItemId)??[];
  const original=existingSources.find(row=>row.sourceType==="lesson"&&row.sourceId===source?.id&&!row.sourceContextId)??existingSources[0];
  const hasReview=reviews.data?.cards.some(row=>row.studyItemId===studyItemId);
  const retry=()=>{if(scope.blocked)scope.retryAccess();else void Promise.all([items.refetch(),reviews.refetch()]);};
  if(scope.blocked||items.isError||reviews.isError)return <div><p role="alert">{postConfirmed?"Карточка сохранена, но проверить расписание не удалось.":"Не удалось проверить карточку и расписание. Повторите проверку перед подключением."}</p><button type="button" onClick={retry}>Повторить проверку повторения</button></div>;
  if(items.isPending||reviews.isPending||items.isFetching||reviews.isFetching)return <button type="button" disabled>{postConfirmed?"Проверяем подключение…":"Проверяем карточку и повторение…"}</button>;
  if(hasReview)return <button type="button" disabled>Повторение подключено ✓</button>;
  if(postConfirmed)return <div><p role="status">Карточка сохранена. Подключение повторения ещё не подтверждено.</p><button type="button" onClick={retry}>Проверить подключение повторения</button></div>;
  if(!original&&!source){const group=legacyCardGroups.find(group=>group.ids.some(id=>id===studyItemId))!;return <LegacyLessonLink href={legacyCardsHref(group.id)}>Открыть слова и выбрать источник →</LegacyLessonLink>;}
  return <div><button type="button" disabled={mutation.isPending} onClick={()=>{
    if(busy.current||!scope.isActive())return;busy.current=true;
    intent.current??={studyItemId,...(original?{sourceType:original.sourceType,sourceId:original.sourceId,...(original.sourceContextId?{sourceContextId:original.sourceContextId}:{})}:{sourceType:"lesson",sourceId:source!.id}),clientEventId:`card:${crypto.randomUUID()}`};
    mutation.mutate(intent.current);
  }}>{mutation.isPending?"Подключаем…":mutation.isError?"Повторить подключение":item?"Подключить повторение":"В карточки"}</button>{item&&<small> Сохраним дату добавления и имеющийся источник. Это не оценка карточки.</small>}{mutation.isError&&<p role="alert">Не удалось подтвердить сохранение. Повторите то же действие.</p>}</div>;
}
