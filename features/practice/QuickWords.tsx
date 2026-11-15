"use client";
import { useEffect, useRef, useState } from "react";
import { quickSetsFor } from "../content/quick-word-sets";
import { VocabularyCards } from "./VocabularyCards";
import { WordPairs } from "./WordPairs";
import { VocabularyWriting } from "./VocabularyWriting";
import { WordSearch } from "./WordSearch";
import { useProfileLearning } from "./profile-learning";
import styles from "./QuickWords.module.css";
import type {QuickSetKind} from "../content/quick-word-expansion";
import {QuickVerbDetails} from "./QuickVerbDetails";
import {searchWords} from "./word-search";

type Mode = "pairs" | "writing" | "search";
export function QuickWords({ child = false, onBack }: { child?: boolean; onBack: () => void }) {
  const screen = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = screen.current;
    if (dialog && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    return () => { if(dialog?.open && dialog.close) dialog.close(); };
  }, []);
  const learner = useProfileLearning();
  const isChild = learner?.profile.child ?? child;
  const sets = quickSetsFor(isChild);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter,setFilter]=useState<"all"|QuickSetKind>("all");
  const [stage,setStage]=useState<"cards"|"choice"|"training">("cards");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({preventScroll:true});
    screen.current?.scrollTo?.(0,0);
  }, [selected,stage]);
  const [mode, setMode] = useState<Mode>("pairs");
  const pack = sets.find(item => item.id === selected);
  const canSearch=!!pack&&pack.kind!=="phrases"&&searchWords(pack.words).length>=4;
  const visibleMode = !isChild ? "pairs" : mode;
  function back() { if(pack&&stage==="training")setStage("choice");else if(pack) setSelected(null); else onBack(); }
  return <dialog ref={screen} className={styles.screen} aria-label="Учить слова" onCancel={event => {event.preventDefault();back();}}><section className={styles.root}>
    <header className={styles.header}><button type="button" className={styles.back} aria-label={pack ? stage==="training"?"Назад":"Все наборы" : "К урокам"} onClick={back}>←</button><h1 ref={heading} tabIndex={-1}>{pack ? pack.title : "Учить слова"}</h1></header>
    {!pack ? <><div className={styles.modes} role="group" aria-label="Вид подборок">{(["all","words","verbs","phrases"] as const).map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{({all:"Все",words:"Слова",verbs:"Глаголы",phrases:"Фразы"})[value]}</button>)}</div><div className={styles.grid}>{sets.filter(item=>filter==="all"||item.kind===filter).map((item, index) => <button type="button" className={styles.pack} data-tone={index % 5} key={item.id} onClick={() => { setSelected(item.id); setStage("cards"); setMode("pairs"); screen.current?.scrollTo?.(0,0); }}><strong lang="pt-PT">{item.pt}</strong><span>{item.title}</span><small>{item.words.length} карточек</small></button>)}</div></> : <>
      {stage==="training"&&isChild&&<div className={styles.modes} role="group" aria-label="Тренировка">{(["pairs", "writing", ...(canSearch ? ["search"] as const : [])] as const).map(value => <button type="button" key={value} aria-pressed={visibleMode === value} onClick={() => setMode(value)}>{({pairs:"↔ Пары",writing:"✎ Написать",search:"⌕ Поиск"})[value]}</button>)}</div>}
      {stage==="choice"&&<div className={styles.choices}><button type="button" onClick={()=>setStage("cards")}>Повторить</button><button type="button" onClick={()=>{setMode("pairs");setStage("training");}}>Тренировать</button></div>}
      {stage==="cards"&&(pack.id==="child-classroom"||pack.id==="child-friends"||pack.id==="adult-everyday"||pack.id==="adult-small-talk")&&<p className={styles.cue}>{pack.cue}</p>}
      <div key={pack.id} className={styles.exercise}>
        {stage==="cards"&&<VocabularyCards words={pack.words} onComplete={()=>setStage("choice")} textOnly={!pack.words.some(word=>word.illustration)} renderDetails={pack.kind==="verbs"?word=><QuickVerbDetails key={word.id} wordId={word.id} active/>:undefined}/> }
        {stage==="training"&&visibleMode === "pairs" && <WordPairs key={pack.id} words={pack.words} blocks={[{ id: `quick:${pack.id}`, title: pack.title, words: pack.words.map(word => word.id) }]} embedded minimal maxVisible={4} onComplete={()=>setStage("choice")}/>}
        {stage==="training"&&isChild && visibleMode === "writing" && <VocabularyWriting words={pack.words} title={pack.title} phrases={pack.kind==="phrases"}/>}
        {stage==="training"&&isChild && visibleMode === "search" && canSearch && <WordSearch words={pack.words} title={pack.title} embedded/>}
      </div>
    </>}
  </section></dialog>;
}
