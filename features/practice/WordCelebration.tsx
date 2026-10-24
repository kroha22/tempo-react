import type { VocabularyWord } from "../content/vocabulary-model";
import { useEffect } from "react";
import { VocabularyIllustration } from "./VocabularyIllustration";
import styles from "./PracticeMotion.module.css";

/** Decorative feedback only; persistent results stay in each exercise's status text. */
export function WordCelebration({word,onFinish}:{word:VocabularyWord;onFinish:()=>void}) {
  useEffect(()=>{const timer=window.setTimeout(onFinish,1300);return()=>window.clearTimeout(timer);},[onFinish]);
  return <div aria-hidden="true" data-celebration={word.id} className={`${styles.burst} ${word.illustration?styles.withImage:""}`} onAnimationEnd={event=>{if(event.target===event.currentTarget)onFinish();}}>
    <span className={styles.label} lang="pt-PT">{word.label}</span>
    {word.illustration&&<span className={styles.image}><VocabularyIllustration illustration={word.illustration}/></span>}
    {[0,1,2,3].map(i=><i key={i} className={styles.spark}/>)}
  </div>;
}
