"use client";
import {useState} from "react";
import type {VocabularyWord} from "../content/vocabulary-model";
import {makeMemoryBoard,memoryWords,type MemoryCard} from "./word-memory";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {ActivityCompletion} from "./ActivityCompletion";
import {wordActivityId} from "./learning-rewards";
import styles from "./QuickWords.module.css";

export function WordMemory({words,child,attempt=0,onMistake,onComplete}:{words:readonly VocabularyWord[];child:boolean;attempt?:number;onMistake?:(id:string)=>void;onComplete:()=>void}){
  const tasks=memoryWords(words),board=makeMemoryBoard(tasks,attempt);
  const [open,setOpen]=useState<string[]>([]),[matched,setMatched]=useState<string[]>([]),[missed,setMissed]=useState<string[]>([]),[lastMatch,setLastMatch]=useState<string|null>(null);
  const revealed=board.filter(card=>open.includes(card.id)),mismatch=open.length===2;
  const spokenWord=revealed.find(card=>card.side==="pt")?.word??tasks.find(word=>word.id===lastMatch);
  if(tasks.length<2)return <p>Для «Мемори» нужно хотя бы два разных слова.</p>;
  function reveal(card:MemoryCard){
    if(mismatch||matched.includes(card.word.id))return;
    if(open.includes(card.id)){setOpen([]);setLastMatch(null);return;}
    if(revealed[0]?.side===card.side)return;
    setLastMatch(null);
    if(!revealed.length){setOpen([card.id]);return;}
    if(revealed[0].word.id===card.word.id){setMatched(value=>[...value,card.word.id]);setOpen([]);setLastMatch(card.word.id);return;}
    const wrong=[revealed[0].word.id,card.word.id];
    for(const id of wrong)if(!missed.includes(id))onMistake?.(id);
    setMissed(value=>[...new Set([...value,...wrong])]);setOpen(value=>[...value,card.id]);
  }
  const clean=tasks.filter(word=>!missed.includes(word.id)).length;
  if(matched.length===tasks.length)return <ActivityCompletion id={wordActivityId("memory",tasks.map(word=>word.id))} title="Мемори" group="Слова и игры" correct={clean} total={tasks.length} child={child} scoreLabel="Пары без ошибок"><p role="status">Все пары найдены · без ошибок {clean} / {tasks.length}</p><button type="button" onClick={onComplete}>К активностям</button></ActivityCompletion>;
  return <section className={`${styles.miniGame} ${styles.memoryGame}`} aria-label="Мемори">
    <h2 lang="pt-PT">Encontra os pares</h2><p>Открой слово и картинку или перевод · {matched.length} / {tasks.length}</p>
    <div className={styles.memoryBoard} role="group" aria-label="Карточки мемори">{board.map((card,index)=>{
      const found=matched.includes(card.word.id),visible=found||open.includes(card.id),picture=card.side==="meaning"&&!!card.word.illustration;
      const label=card.side==="pt"?`Слово: ${card.word.label}`:`${picture?"Картинка":"Перевод"}: ${card.word.translation}`;
      return <button type="button" key={card.id} className={styles.memoryCard} aria-label={visible?`${found?"Найдена пара. ":""}${label}`:`Карточка ${index+1}: ${card.side==="pt"?"слово":picture?"картинка":"перевод"}`} aria-pressed={open.includes(card.id)} disabled={found||mismatch||!!revealed.length&&revealed[0].side===card.side&&!open.includes(card.id)} data-found={found} data-open={visible} onClick={()=>reveal(card)}>
        {visible?<>{card.side==="pt"?<span lang="pt-PT">{card.word.label}</span>:card.word.illustration?<VocabularyIllustration illustration={card.word.illustration}/>:<span lang="ru">{card.word.translation}</span>}{found&&<small aria-hidden="true">✓</small>}</>:<span aria-hidden="true">{card.side==="pt"?"PT":picture?"◇":"RU"}</span>}
      </button>;
    })}</div>
    <div role="status" className={styles.memoryFeedback}>{mismatch?"Не пара. Посмотри и закрой карточки.":lastMatch?"✓ Пара найдена!":open.length?"Найди вторую карточку":"Выбери карточку"}{spokenWord&&<CardSpeechButton text={spokenWord.label}/>}</div>
    {mismatch&&<button type="button" onClick={()=>setOpen([])}>Закрыть карточки</button>}
  </section>;
}
