"use client";
import {useEffect,useRef,useState} from "react";
import {introductionConversations,checkConversation,emptyConversationEvidence,applyConversationCheck,conversationIndependent,type ConversationCheck,type ConversationEvidence} from "../content/introduction-conversation";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {introductionFamilyHref} from "../content/introduction-flow";
import styles from "./IntroductionConversation.module.css";

export function IntroductionConversation({active}:{active:boolean}){
  const [variant,setVariant]=useState(0),[mode,setMode]=useState<"guided"|"independent"|null>(null),[index,setIndex]=useState(0),[answer,setAnswer]=useState(""),[feedback,setFeedback]=useState<ConversationCheck|null>(null),[rows,setRows]=useState<ConversationEvidence[]>(()=>Array.from({length:8},emptyConversationEvidence)),[retry,setRetry]=useState<number[]|null>(null),[finished,setFinished]=useState(false),[russian,setRussian]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null),input=useRef<HTMLInputElement>(null),scenario=introductionConversations[variant];
  const [hintLevel,setHintLevel]=useState(0);
  const position=retry?retry[index]:index,turn=scenario.turns[position],evidence=rows[position];
  useEffect(()=>{if(active){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});}},[active,index,mode,finished,variant,retry]);
  const difficult=rows.flatMap((row,i)=>!conversationIndependent(row)||row.writing||row.courtesy?[i]:[]);
  function reset(){setVariant(current=>(current+1)%introductionConversations.length);setMode(null);setRows(Array.from({length:8},emptyConversationEvidence));setIndex(0);setAnswer("");setFeedback(null);setHintLevel(0);setRetry(null);setFinished(false);}
  function check(){if(!answer.trim()||evidence.done)return;const result=checkConversation(turn,answer);setFeedback(result);setRows(current=>current.map((row,i)=>i===position?applyConversationCheck(row,result):row));if(!result.accepted)input.current?.focus();}
  function next(){if(!evidence.done)return;if(index===(retry?.length??8)-1)setFinished(true);else{setIndex(current=>current+1);setAnswer("");setFeedback(null);setHintLevel(0);}}
  function help(){const level=Math.min(3,hintLevel+1);setHintLevel(level);setRows(current=>current.map((row,i)=>i===position?{...row,help:Math.max(row.help,level)}:row));}
  return <section className={styles.conversation} aria-label="Итоговый разговор знакомства">
    <h3 ref={heading} tabIndex={-1}>{finished?"Разговор завершён":mode?`${retry?"Повтор":"Реплика"} ${index+1} из ${retry?.length??8} · ${turn.title}`:"Знакомство перед занятием"}</h3>
    <p className={styles.note}>Попытка временная: после перезагрузки начнётся новый разговор. Карточки, повторение и прежние результаты не меняются.</p>
    {!mode?<><p lang={russian?"ru":"pt-PT"}>{russian?"Короткий разговор: познакомиться и немного рассказать о себе.":"Uma conversa curta: conhecer outra pessoa e falar um pouco de mim."}</p><button type="button" onClick={()=>setRussian(value=>!value)}>{russian?"Показать описание по-португальски":"Показать описание по-русски"}</button><p>{scenario.role}</p><div className={styles.actions}><button type="button" onClick={()=>setMode("guided")}>С подсказками</button><button type="button" onClick={()=>setMode("independent")}>Самостоятельно</button></div></>:finished?<>
      <p>{retry?"Тренировочный повтор завершён. Он не заменяет самостоятельную попытку.":mode==="independent"&&rows.every(conversationIndependent)?"Смысл всех восьми реплик передан самостоятельно.":"Разговор пройден с помощью или исправлениями. Повторите трудные реплики."}</p>
      <ul>{scenario.turns.map((item,i)=><li key={item.title}>{item.title}: {rows[i].help?"с помощью":rows[i].corrected?"исправлено":mode==="guided"?"тренировка":"самостоятельно"}{rows[i].writing?" · исправляли написание":""}{rows[i].courtesy?" · замечание к благодарности":""}</li>)}</ul>
      <p>Это результат разговора, не освоение всего B01, чтения или U36/U40.</p>
      <LegacyLessonLink href={introductionFamilyHref()}>Представить близкого →</LegacyLessonLink>
      <div className={styles.actions}>{difficult.length>0&&<button type="button" onClick={()=>{setRetry(difficult);setIndex(0);setAnswer("");setFeedback(null);setHintLevel(0);setFinished(false);setRows(current=>current.map((row,i)=>difficult.includes(i)?{...row,done:false}:row));}}>Повторить трудные реплики</button>}<button type="button" onClick={reset}>Новый разговор</button><LegacyLessonLink href="/learning/plan">К общему плану →</LegacyLessonLink></div>
    </>:<>
      <details><summary>Ваша роль и ситуация</summary><p>{scenario.role}</p></details>
      {turn.cue&&<p className={styles.cue}><span>Собеседник: </span><strong lang="pt-PT">{turn.cue}</strong></p>}
      <p>{turn.prompt}</p><form onSubmit={event=>{event.preventDefault();if(evidence.done)next();else check();}}><label>Ваша реплика<input ref={input} lang="pt-PT" autoComplete="off" autoCorrect="off" spellCheck={false} value={answer} disabled={evidence.done} onChange={event=>{setAnswer(event.target.value);setFeedback(null);}}/></label>
        {feedback&&<p role="status">{feedback.message}</p>}
        {hintLevel>0&&<p role="status">С помощью: {hintLevel===1?turn.hint:hintLevel===2?turn.prefix:<span lang="pt-PT">{turn.answer}</span>}</p>}
        <div className={styles.actions}><button type="submit" disabled={!answer.trim()}>{evidence.done?index===(retry?.length??8)-1?"Итог разговора":"Следующая реплика":"Проверить реплику"}</button>{!evidence.done&&hintLevel<3&&<button type="button" onClick={help}>{hintLevel===0?"Подсказка":hintLevel===1?"Начало реплики":"Показать образец"}</button>}</div>
      </form>
      {evidence.help>0&&<LegacyLessonLink href={turn.relatedHref}>Повторить объяснение →</LegacyLessonLink>}
      {retry&&<p>Это повтор после знакомства с ответами, а не новая самостоятельная попытка.</p>}
    </>}
  </section>;
}
