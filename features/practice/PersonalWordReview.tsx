"use client";
import {useRef,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {EnsureQueryScope,useQueryScope} from "../../shared/query/SessionQueryBoundary";
import {useProfileLearning} from "./profile-learning";
import {enrollPersonalWord,ratePersonalWord,type PersonalWord,type PersonalWordSeed} from "./personal-word-deck";
import type {WordLearningSet} from "../content/word-learning-library";
import type {VocabularyWord} from "../content/vocabulary-model";
import {wordSetSaveTargets} from "./SaveWordSet";
import {verbCards} from "../cards/data/verb-cards";
import {studyReviewCardById} from "../cards/study-review/catalog";
import {loadStudyReviews,gradeStudyReview} from "../cards/study-review/api";
import {saveStudyItem} from "../learning/progress/api";
import {loadCardProgress} from "../cards/api/progress";
import {useLocalCardProgress} from "../cards/query/LocalCardProgress";
import {useCardProgressQuery,useSaveReviewMutation} from "../cards/query/queries";
import {currentReviewTimestamp,scheduleReview,scheduleReviewProgress,intervalLabel,type ReviewGrade,type ReviewProgress} from "../cards/scheduler";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {UnifiedWordReview} from "./UnifiedWordReview";
import styles from "./QuickWords.module.css";
import {HttpError} from "../../shared/http/request-json";

export function personalWordSeed(word:VocabularyWord,set?:WordLearningSet):PersonalWordSeed{
  const verb=verbCards.find(card=>card.id===word.id);
  const bridge=set?wordSetSaveTargets({...set,words:[word]})[0]?.studyItemId:undefined;
  const study=bridge??(studyReviewCardById.has(word.id)?word.id:undefined);
  return {wordId:word.id,owner:verb?"legacy":study?"study":"word",targetId:verb?.id??study??word.id,front:word.label,back:word.translation};
}
/** Membership and errors live with the profile; existing review owners keep their schedules. */
export function usePersonalWords(){
  const learner=useProfileLearning();
  return {rows:learner?.learning.wordDeck??[],enabled:!!learner,addSet:(set:WordLearningSet)=>{
    const now=currentReviewTimestamp(),eventId=crypto.randomUUID();return learner?.update(current=>({...current,wordDeck:set.words.reduce((rows,word)=>enrollPersonalWord(rows,personalWordSeed(word,set),set.id,eventId,now),current.wordDeck??[])}))??false;
  },add:(word:VocabularyWord,set:WordLearningSet,mistake=false)=>{
    const now=Date.now(),eventId=crypto.randomUUID();
    return learner?.update(current=>({...current,wordDeck:enrollPersonalWord(current.wordDeck??[],personalWordSeed(word,set),set.id,eventId,now,mistake)}))??false;
  }};
}
export function PersonalWordReview(){return <EnsureQueryScope><Review/></EnsureQueryScope>;}
export function TopicWordRating({word,set}:{word:VocabularyWord;set:WordLearningSet}){return <EnsureQueryScope><TopicRating key={word.id} word={word} set={set}/></EnsureQueryScope>;}
function TopicRating({word,set}:{word:VocabularyWord;set:WordLearningSet}){
  const learner=useProfileLearning(),scope=useQueryScope(),local=useLocalCardProgress(),saveLegacy=useSaveReviewMutation();
  const [status,setStatus]=useState<"ready"|"saving"|"saved"|"error"|"conflict">("ready");
  const lock=useRef(false),job=useRef<(()=>Promise<void>)|null>(null);
  async function execute(){if(lock.current||!job.current)return;lock.current=true;setStatus("saving");try{await job.current();if(scope.isActive())setStatus("saved");}catch(error){if(scope.isActive())setStatus(error instanceof HttpError&&error.status===409?"conflict":"error");}finally{lock.current=false;}}
  function choose(grade:ReviewGrade){
    if(!learner||status!=="ready")return;
    const seed=personalWordSeed(word,set),at=currentReviewTimestamp(),eventId=crypto.randomUUID(),saveId=`card:${crypto.randomUUID()}`,reviewId=`review:${crypto.randomUUID()}`;
    let prepared:ReviewProgress|undefined,command:Parameters<typeof gradeStudyReview>[0]|undefined;
    job.current=async()=>{
      if(!scope.isActive())throw new Error("Inactive profile");
      if(!learner.update(current=>({...current,wordDeck:enrollPersonalWord(current.wordDeck??[],seed,set.id,eventId,at)})))throw new Error("Save failed");
      if(seed.owner==="legacy"){
        const card=verbCards.find(card=>card.id===seed.targetId)!;
        prepared??=scheduleReview(card,(await loadCardProgress(scope.controller.signal,local)).find(row=>row.cardId===card.id),grade,at);
        await saveLegacy.mutateAsync(prepared);
      }else if(seed.owner==="study"){
        await saveStudyItem({studyItemId:seed.targetId,sourceType:"topic",sourceId:"topic:word-practice",clientEventId:saveId},scope.controller.signal);
        if(!command){const fresh=await loadStudyReviews(scope.controller.signal),row=fresh.cards.find(row=>row.studyItemId===seed.targetId);if(!row)throw new Error("Missing review");command={studyItemId:seed.targetId,grade,expectedVersion:row.version,clientEventId:reviewId};}
        await gradeStudyReview(command,scope.controller.signal);
        await scope.client.invalidateQueries({queryKey:["cards",scope.scopeKey,"study-reviews"]});
      }else prepared??=scheduleReviewProgress(`word:${seed.targetId}`,learner.learning.wordDeck?.find(row=>row.id===`word:${seed.targetId}`)?.progress??undefined,grade,at);
      if(!scope.isActive()||!learner.update(current=>({...current,wordDeck:ratePersonalWord(current.wordDeck??[],`${seed.owner}:${seed.targetId}`,grade,at,prepared)})))throw new Error("Save failed");
    };void execute();
  }
  if(!learner)return null;
  return <div className={styles.grades} aria-label="Знаешь слово?">{status==="saved"?<span role="status">✓ В моей колоде</span>:status==="conflict"?<button type="button" onClick={()=>setStatus("ready")}>Карточка изменилась. Оценить ещё раз</button>:status==="error"?<button type="button" onClick={()=>void execute()}>Повторить сохранение</button>:<><button type="button" disabled={status==="saving"||scope.blocked} onClick={()=>choose(0)}>Не знаю</button><button type="button" disabled={status==="saving"||scope.blocked} onClick={()=>choose(2)}>Знаю</button></>}</div>;
}
function Review(){
  const learner=useProfileLearning(),scope=useQueryScope(),local=useLocalCardProgress(),legacy=useCardProgressQuery(),saveLegacy=useSaveReviewMutation();
  const study=useQuery({queryKey:["cards",scope.scopeKey,"study-reviews"],queryFn:({signal})=>loadStudyReviews(signal),enabled:!scope.blocked});
  const [all,setAll]=useState(false),[flipped,setFlipped]=useState(false),[pinned,setPinned]=useState<PersonalWord|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false),[now,setNow]=useState(()=>Date.now());
  const retry=useRef<(()=>Promise<void>)|null>(null),lock=useRef(false);
  const [conflict,setConflict]=useState(false);
  const stored=learner?.learning.wordDeck??[];
  const rows=[...stored];
  const addExisting=(seed:PersonalWordSeed)=>{const id=`${seed.owner}:${seed.targetId}`;if(!rows.some(row=>row.id===id))rows.push(enrollPersonalWord([],seed,"existing","existing",0)[0]);};
  for(const progress of legacy.data??[]){const card=verbCards.find(card=>card.id===progress.cardId);if(card)addExisting({wordId:card.id,owner:"legacy",targetId:card.id,front:card.pt,back:card.ru});}
  for(const row of study.data?.cards??[]){const card=studyReviewCardById.get(row.studyItemId);if(card)addExisting({wordId:row.studyItemId,owner:"study",targetId:row.studyItemId,front:card.front,back:card.back});}
  function progress(row:PersonalWord){return row.owner==="word"?row.progress:row.owner==="legacy"?legacy.data?.find(item=>item.cardId===row.targetId):study.data?.cards.find(item=>item.studyItemId===row.targetId)?.progress;}
  function predicted(row:PersonalWord,grade:ReviewGrade){const previous=progress(row)??undefined,verb=row.owner==="legacy"?verbCards.find(card=>card.id===row.targetId):undefined;return verb?scheduleReview(verb,previous,grade,now):scheduleReviewProgress(row.id,previous,grade,now,row.owner==="study"&&(studyReviewCardById.get(row.targetId)?.lowerPriority??false));}
  const due=rows.filter(row=>row.needsPractice||!progress(row)||progress(row)!.due<=now).sort((a,b)=>(a.needsPractice?-1:0)-(b.needsPractice?-1:0)||(progress(a)?.due??0)-(progress(b)?.due??0));
  const active=pinned??due[0];
  async function execute(job:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);setError(false);retry.current=job;try{await job();if(!scope.isActive())return;retry.current=null;setPinned(null);setFlipped(false);setNow(currentReviewTimestamp());}catch(error){if(scope.isActive()){setError(true);if(error instanceof HttpError&&error.status===409){retry.current=null;setConflict(true);}}}finally{lock.current=false;if(scope.isActive())setBusy(false);}}
  function rate(grade:ReviewGrade){
    if(!active||!learner)return;
    const row=active,at=currentReviewTimestamp();let prepared:ReviewProgress|undefined;
    let command:Parameters<typeof gradeStudyReview>[0]|undefined;
    const saveId=`card:${crypto.randomUUID()}`,reviewId=`review:${crypto.randomUUID()}`;
    void execute(async()=>{
      if(!scope.isActive())throw new Error("Inactive profile");
      if(row.owner==="legacy"){
        const card=verbCards.find(card=>card.id===row.targetId);if(!card)throw new Error("Unknown verb");
        prepared??=scheduleReview(card,(await loadCardProgress(scope.controller.signal,local)).find(item=>item.cardId===card.id),grade,at);
        await saveLegacy.mutateAsync(prepared);
      }else if(row.owner==="study"){
        await saveStudyItem({studyItemId:row.targetId,sourceType:"topic",sourceId:"topic:word-practice",clientEventId:saveId},scope.controller.signal);
        if(!command){const fresh=await loadStudyReviews(scope.controller.signal),version=fresh.cards.find(item=>item.studyItemId===row.targetId)?.version;if(version===undefined)throw new Error("Missing review");command={studyItemId:row.targetId,expectedVersion:version,grade,clientEventId:reviewId};}
        await gradeStudyReview(command,scope.controller.signal);
        await study.refetch();
      }else prepared??=scheduleReviewProgress(row.id,row.progress??undefined,grade,at);
      if(!scope.isActive()||!learner.update(current=>({...current,wordDeck:ratePersonalWord(current.wordDeck?.some(item=>item.id===row.id)?current.wordDeck:enrollPersonalWord(current.wordDeck??[],row,"existing",reviewId,at),row.id,grade,at,prepared)})))throw new Error("Save failed");
    });
  }
  if(!learner)return <UnifiedWordReview/>;
  const loading=legacy.isPending||study.isPending,loadError=legacy.isError||study.isError||scope.blocked;
  return <section className={styles.review} aria-label="Моя колода">
    <div className={styles.modes}><button type="button" aria-pressed={!all} onClick={()=>setAll(false)}>Повторить · {due.length}</button><button type="button" aria-pressed={all} onClick={()=>setAll(true)}>Все · {rows.length}</button></div>
    {loading&&<p role="status">Загружаем…</p>}
    {(loadError||error)&&<p role="alert">Не удалось сохранить или загрузить карточки. <button type="button" disabled={busy} onClick={()=>{if(retry.current)void execute(retry.current);else{setError(false);setConflict(false);setPinned(null);setFlipped(false);scope.retryAccess();void legacy.refetch();void study.refetch();}}}>{conflict?"Карточка изменилась. Обновить":"Повторить"}</button></p>}
    {!loading&&!loadError&&(all?<div className={styles.grid}>{rows.map(row=><button type="button" className={styles.pack} key={row.id} onClick={()=>{setPinned(row);setFlipped(false);setAll(false);}}><strong lang="pt-PT">{row.front}</strong><span>{row.back}</span><small>{row.errors?`Ошибок: ${row.errors} · `:""}{row.needsPractice||!progress(row)||progress(row)!.due<=now?"Повторить":`Через ${intervalLabel((progress(row)!.due-now)/86400000)}`}</small></button>)}</div>:active?<>
      <button type="button" className={styles.reviewCard} aria-label="Показать ответ" aria-expanded={flipped} disabled={busy||error} onClick={()=>{setPinned(active);setFlipped(true);}}><strong lang="pt-PT">{active.front}</strong>{flipped&&<span>{active.back}</span>}</button><CardSpeechButton text={active.front}/>
      {flipped&&<div className={styles.grades} aria-label="Как вспомнилось?">{["Не знаю","Сложно","Помню","Легко"].map((label,index)=><button type="button" key={label} disabled={busy||error} onClick={()=>rate(index as ReviewGrade)}>{label}<small>{intervalLabel(predicted(active,index as ReviewGrade).interval)}</small></button>)}</div>}
      {busy&&<p role="status">Сохраняем…</p>}
    </>:<p role="status">{rows.length?"На сегодня всё":"Добавляй слова из тем или игр"}</p>)}
  </section>;
}
