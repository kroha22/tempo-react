"use client";
import {useState} from "react";
import type {VocabularyWord} from "../content/vocabulary-model";
import {calendarDays,calendarMonths} from "../content/calendar";
import {letterGameWords} from "./WordMiniGame";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {ActivityCompletion} from "./ActivityCompletion";
import {wordActivityId} from "./learning-rewards";
import styles from "./QuickWords.module.css";

function shuffled<T>(items:T[],seed:string){
  let state=Array.from(seed).reduce((value,char)=>(Math.imul(value,31)+char.codePointAt(0)!)>>>0,17);
  const result=[...items];
  for(let index=result.length-1;index>0;index--){state=(Math.imul(state,1664525)+1013904223)>>>0;const other=state%(index+1);[result[index],result[other]]=[result[other],result[index]];}
  return result;
}

export function orderedCalendarWords(words:readonly VocabularyWord[]){
  const labels=words.map(word=>word.label);
  const order=[calendarDays,calendarMonths].find(rows=>labels.length>=2&&labels.every(label=>rows.some(([pt])=>pt===label)));
  return order?order.flatMap(([pt])=>words.filter(word=>word.label===pt)):[];
}
export function WordBuilder({words,mode,child,onMistake,onComplete}:{words:readonly VocabularyWord[];mode:"builder"|"sequence";child:boolean;onMistake?:(id:string)=>void;onComplete:()=>void}){
  const tasks=mode==="builder"?letterGameWords(words):orderedCalendarWords(words);
  const [index,setIndex]=useState(0),[chosen,setChosen]=useState<number[]>([]),[missed,setMissed]=useState(false),[score,setScore]=useState(0),[message,setMessage]=useState(""),[finished,setFinished]=useState(false);
  const word=tasks[index],title=mode==="builder"?"Собери слово":"По порядку";
  if(!word)return <p>Для этой игры пока нет слов.</p>;
  const letters=Array.from(word.label.replace(/^(o|a|os|as) /,""));
  // Each repeated letter has its own tile; the shuffle stays stable while answering.
  const tiles=mode==="builder"?shuffled(letters.map((label,id)=>({label,id})),word.id):shuffled(tasks.map((item,id)=>({label:item.label,id})),tasks.map(item=>item.id).join(":"));
  const resolved=mode==="builder"?chosen.length===letters.length&&chosen.map(id=>letters[id]).join("")===letters.join(""):chosen.includes(index);
  function pick(id:number){
    if(resolved)return;
    if(mode==="sequence"){
      if(id!==index){if(!missed)onMistake?.(word.id);setMissed(true);setMessage("Попробуй ещё раз");return;}
      setChosen(value=>[...value,id]);if(!missed)setScore(value=>value+1);setMessage("✓ Верно!");return;
    }
    setChosen(value=>[...value,id]);setMessage("");
  }
  function check(){if(chosen.map(id=>letters[id]).join("")!==letters.join("")){if(!missed)onMistake?.(word.id);setMissed(true);setMessage("Попробуй ещё раз");}else{if(!missed)setScore(value=>value+1);setMessage("✓ Верно!");}}
  // Builder advances only after explicit checking, not after merely filling tiles.
  const checked=resolved&&message==="✓ Верно!";
  function next(){if(index===tasks.length-1)setFinished(true);else{setIndex(value=>value+1);if(mode==="builder")setChosen([]);setMissed(false);setMessage("");}}
  if(finished)return <ActivityCompletion id={wordActivityId(mode,tasks.map(item=>item.id))} title={title} group="Слова и игры" correct={score} total={tasks.length} child={child}><p role="status">Готово · {score} / {tasks.length}</p><button type="button" onClick={onComplete}>Готово</button></ActivityCompletion>;
  return <section className={styles.miniGame} aria-label={title}><small>{index+1} / {tasks.length}</small><h2>{mode==="builder"?"Forma a palavra":"Põe por ordem"}</h2>
    {mode==="builder"?<>{word.illustration&&<VocabularyIllustration illustration={word.illustration}/>}<p>{word.translation}</p><CardSpeechButton text={word.label} label="Послушать слово" announceText={false}/><div className={styles.buildAnswer} aria-label="Ответ" lang="pt-PT">{chosen.map(id=>letters[id]).join("")||"…"}</div></>:<p>Нажимай по порядку: от первого до последнего в этом раунде.</p>}
    <div className={mode==="builder"?styles.letterTiles:styles.gameOptions}>{tiles.map(tile=><button type="button" key={tile.id} disabled={checked||chosen.includes(tile.id)} lang="pt-PT" onClick={()=>pick(tile.id)}>{tile.label}</button>)}</div>
    {mode==="builder"&&!checked&&<div className={styles.gameOptions}><button type="button" disabled={!chosen.length} onClick={()=>{setChosen(value=>value.slice(0,-1));setMessage("");}}>⌫ Убрать</button><button type="button" disabled={chosen.length!==letters.length} onClick={check}>Проверить</button></div>}
    {mode==="sequence"&&<div className={styles.buildAnswer} lang="pt-PT">{tasks.filter((_,id)=>chosen.includes(id)).map(item=>item.label).join(" → ")}</div>}
    <div role="status" className={styles.gameFeedback}>{message}{checked&&<CardSpeechButton text={word.label}/>}</div>{checked&&<button type="button" onClick={next}>{index===tasks.length-1?"Завершить":"Дальше"}</button>}
  </section>;
}
