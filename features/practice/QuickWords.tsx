"use client";
import { useEffect, useRef, useState } from "react";
import { quickSetsFor } from "../content/quick-word-sets";
import { VocabularyCards } from "./VocabularyCards";
import { WordPairs } from "./WordPairs";
import { VocabularyWriting } from "./VocabularyWriting";
import { WordSearch } from "./WordSearch";
import { useProfileLearning } from "./profile-learning";
import styles from "./QuickWords.module.css";

type Mode = "cards" | "pairs" | "writing" | "search";
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
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({preventScroll:true});
    screen.current?.scrollTo?.(0,0);
  }, [selected]);
  const [mode, setMode] = useState<Mode>("cards");
  const pack = sets.find(item => item.id === selected);
  const visibleMode = !isChild && mode !== "cards" && mode !== "pairs" ? "cards" : mode;
  function back() { if(pack) setSelected(null); else onBack(); }
  return <dialog ref={screen} className={styles.screen} aria-label="Учить слова" onCancel={event => {event.preventDefault();back();}}><section className={styles.root}>
    <header className={styles.header}><button type="button" className={styles.back} aria-label={pack ? "Все наборы" : "К урокам"} onClick={back}>←</button><h1 ref={heading} tabIndex={-1}>{pack ? pack.title : "Учить слова"}</h1></header>
    {!pack ? <div className={styles.grid}>{sets.map((item, index) => <button type="button" className={styles.pack} data-tone={index % 5} key={item.id} onClick={() => { setSelected(item.id); setMode("cards"); screen.current?.scrollTo?.(0,0); }}><strong lang="pt-PT">{item.pt}</strong><span>{item.title}</span><small>{item.words.length} карточек</small></button>)}</div> : <>
      <div className={styles.modes} role="group" aria-label="Занятие со словами">{(["cards", "pairs", ...(isChild ? ["writing", ...(pack.id === "backpack" ? ["search"] as const : [])] as const : [])] as const).map(value => <button type="button" key={value} aria-pressed={visibleMode === value} onClick={() => setMode(value)}>{({cards:"▣ Карточки",pairs:"↔ Пары",writing:"✎ Написать",search:"⌕ Поиск"})[value]}</button>)}</div>
      {(pack.id==="child-classroom"||pack.id==="child-friends"||pack.id==="adult-everyday"||pack.id==="adult-small-talk")&&<p className={styles.cue}>{pack.cue}</p>}
      <div key={pack.id} className={styles.exercise}>
        <div hidden={visibleMode !== "cards"}><VocabularyCards words={pack.words} active={visibleMode === "cards"} textOnly={!pack.words.some(word=>word.illustration)}/></div>
        {visibleMode === "pairs" && <WordPairs key={pack.id} words={pack.words} blocks={[{ id: `quick:${pack.id}`, title: pack.title, words: pack.words.map(word => word.id) }]} embedded maxVisible={4}/>}
        {isChild && visibleMode === "writing" && <VocabularyWriting words={pack.words} title={pack.title} phrases={pack.id !== "backpack"}/>}
        {isChild && visibleMode === "search" && pack.id === "backpack" && <WordSearch words={pack.words} title={pack.title} embedded/>}
      </div>
    </>}
  </section></dialog>;
}
