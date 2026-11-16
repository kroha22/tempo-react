"use client";
import {useState} from "react";
import type {VocabularyWord} from "../content/vocabulary-model";
import {foodSortingCategory,foodSortingOptions,foodSortingWords} from "../content/food-sorting";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {ActivityCompletion} from "./ActivityCompletion";
import {wordActivityId} from "./learning-rewards";
import styles from "./QuickWords.module.css";

export function FoodSorting({words,child,onMistake,onComplete}:{words:readonly VocabularyWord[];child:boolean;onMistake?:(id:string)=>void;onComplete:()=>void}){
  const tasks=foodSortingWords(words);
  const [index,setIndex]=useState(0),[selected,setSelected]=useState<string|null>(null),[missed,setMissed]=useState(false),[score,setScore]=useState(0),[finished,setFinished]=useState(false);
  const word=tasks[index],category=word&&foodSortingCategory(word);
  if(!word||!category)return <p>В этом раунде нет продуктов для сортировки.</p>;
  const resolved=selected===category.id;
  function answer(id:string){
    if(resolved)return;
    setSelected(id);
    if(id!==category!.id){if(!missed)onMistake?.(word.id);setMissed(true);}
    else if(!missed)setScore(value=>value+1);
  }
  function next(){if(index===tasks.length-1)setFinished(true);else{setIndex(value=>value+1);setSelected(null);setMissed(false);}}
  if(finished)return <ActivityCompletion id={wordActivityId("sorting",tasks.map(item=>item.id))} title="Сортировка еды" group="Слова и игры" correct={score} total={tasks.length} child={child}><p role="status">Готово · {score} / {tasks.length}</p><button type="button" onClick={onComplete}>К активностям</button></ActivityCompletion>;
  return <section className={`${styles.miniGame} ${styles.foodSorting}`} aria-label="Сортировка еды">
    <small>{index+1} / {tasks.length}</small><h2 lang="pt-PT">Agrupa os alimentos</h2><p>Выбери группу продукта</p>
    <div className={styles.foodPrompt}>{word.illustration&&<VocabularyIllustration illustration={word.illustration}/>}<strong lang="pt-PT">{word.label}</strong><CardSpeechButton text={word.label}/></div>
    <div className={styles.foodGroups}>{foodSortingOptions(word,index).map(option=><button type="button" key={option.id} aria-pressed={selected===option.id} disabled={resolved} data-result={selected===option.id?(resolved?"correct":"wrong"):undefined} onClick={()=>answer(option.id)}><strong lang="pt-PT">{option.label}</strong><small>{option.translation}</small></button>)}</div>
    <div role="status" className={styles.gameFeedback}>{selected&&(resolved?<>✓ Верно! <span lang="pt-PT">{word.label} → {category.label}</span></>:"Попробуй ещё раз")}</div>
    {resolved&&<button type="button" onClick={next}>{index===tasks.length-1?"Завершить":"Дальше"}</button>}
  </section>;
}
