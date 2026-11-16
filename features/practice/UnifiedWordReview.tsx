"use client";
import {useEffect,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {EnsureQueryScope,useQueryScope} from "../../shared/query/SessionQueryBoundary";
import {useStudyReview} from "../cards/study-review/use-study-review";
import {loadStudyReviews} from "../cards/study-review/api";
import {studyReviewCardById} from "../cards/study-review/catalog";
import {useReviewSession} from "../cards/hooks/use-review-session";
import {useCardProgressQuery} from "../cards/query/queries";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import type {ReviewGrade} from "../cards/scheduler";
import styles from "./QuickWords.module.css";
import {useProfileLearning} from "./profile-learning";

export function WordReviewEntry({onOpen}:{onOpen:()=>void}){return <EnsureQueryScope><ReviewEntry onOpen={onOpen}/></EnsureQueryScope>;}
function ReviewEntry({onOpen}:{onOpen:()=>void}){
  const scope=useQueryScope(),verbs=useCardProgressQuery();
  const learner=useProfileLearning();
  const [clientNow]=useState(()=>Date.now());
  const words=useQuery({queryKey:["cards",scope.scopeKey,"study-reviews"],queryFn:({signal})=>loadStudyReviews(signal),enabled:!scope.blocked});
  const known=!!words.data&&!!verbs.data&&!words.isError&&!verbs.isError&&!scope.blocked;
  const now=words.data?.serverNow??clientNow;
  const due=known?words.data!.cards.filter(row=>!row.progress||row.progress.due<=now).length+verbs.data!.filter(row=>row.due<=clientNow).length:null;
  const total=new Set([...(learner?.learning.wordDeck??[]).map(row=>row.id),...(verbs.data??[]).map(row=>`legacy:${row.cardId}`),...(words.data?.cards??[]).map(row=>`study:${row.studyItemId}`)]).size;
  return <button type="button" className={styles.reviewEntry} onClick={onOpen}>{learner?`Моя колода · ${total}`:`Повторить сегодня${due!==null?` · ${due}`:""}`}</button>;
}
export function UnifiedWordReview(){return <EnsureQueryScope><Session/></EnsureQueryScope>;}
function Session(){
  const study=useStudyReview(),legacy=useReviewSession();
  const [pinned,setPinned]=useState<{owner:"study"|"legacy";count:number}|null>(null);
  useEffect(()=>{
    if(!pinned)return;
    const count=pinned.owner==="study"?study.count:legacy.sessionCount;
    if(count<=pinned.count)return;
    let active=true;queueMicrotask(()=>{if(active)setPinned(null);});return()=>{active=false;};
  },[pinned,study.count,legacy.sessionCount]);
  const legacyProgress=legacy.card?legacy.progress[legacy.card.id]:undefined;
  const legacyDue=legacyProgress&&legacyProgress.due<=legacy.now?legacyProgress.due:Infinity;
  const studyDue=study.active?(study.active.progress?.due??Number.MAX_SAFE_INTEGER):Infinity;
  const owner=pinned?.owner??(studyDue<=legacyDue&&studyDue!==Infinity?"study":legacyDue!==Infinity?"legacy":null);
  const card=owner==="study"&&study.active?studyReviewCardById.get(study.active.studyItemId):undefined;
  const front=owner==="study"?card?.front:legacy.card?.pt;
  const back=owner==="study"?card?.back:legacy.card?.ru;
  const current=owner==="study"?study:legacy;
  const loading=study.status==="loading"||legacy.status==="loading";
  const error=study.accessBlocked||["load-error","save-error","conflict"].includes(study.status)||["load-error","save-error"].includes(legacy.status)||study.refreshError||legacy.refreshError;
  function retry(){study.retry();if(legacy.refreshError)legacy.refresh();else legacy.retry();}
  function flip(){if(!owner)return;setPinned({owner,count:owner==="study"?study.count:legacy.sessionCount});current.flip();}
  return <section className={styles.review} aria-label="Личное повторение">
    {loading&&<p role="status">Загружаем повторение…</p>}
    {error&&<div role="alert">Не удалось подтвердить повторение. Сохранения не изменены.<button type="button" onClick={retry}>Повторить</button></div>}
    {!loading&&!error&&owner&&front&&<>
      <button type="button" className={styles.reviewCard} aria-label="Показать ответ" aria-expanded={current.flipped} disabled={current.status!=="ready"} onClick={flip}><strong lang="pt-PT">{front}</strong>{current.flipped&&<span lang="ru">{back}</span>}</button>
      <CardSpeechButton text={front}/>
      {current.flipped&&<div className={styles.grades} aria-label="Как вспомнилось?">{(["Не знаю","Сложно","Помню","Легко"] as const).map((label,grade)=><button type="button" key={label} disabled={current.status!=="ready"} onClick={()=>current.rate(grade as ReviewGrade)}>{label}</button>)}</div>}
      {current.status==="saving"&&<p role="status">Сохраняем…</p>}
    </>}
    {!loading&&!error&&!owner&&<p role="status">На сегодня всё</p>}
  </section>;
}
