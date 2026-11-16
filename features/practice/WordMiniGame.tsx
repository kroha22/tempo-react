"use client";
import {useState} from "react";
import type {VocabularyWord} from "../content/vocabulary-model";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {ActivityCompletion} from "./ActivityCompletion";
import {wordActivityId} from "./learning-rewards";
import styles from "./QuickWords.module.css";

export function letterGameWords(words:readonly VocabularyWord[]){return words.filter(word=>/^\p{L}{3,18}$/u.test(word.label.replace(/^(o|a|os|as) /,"")));}
function phraseOptions(words:readonly VocabularyWord[]){return words.some(word=>/\s/.test(word.label.replace(/^(o|a|os|as) /,"")));}
export function listeningGameWords(words:readonly VocabularyWord[]){const phrases=phraseOptions(words),seen=new Set<string>();return words.filter(word=>{const key=phrases?word.label:word.translation;return !seen.has(key)&&!!seen.add(key);});}
function rotate<T>(items:T[],index:number){const offset=index%items.length;return [...items.slice(offset),...items.slice(0,offset)];}
export function WordMiniGame({words,mode,child,onComplete,onMistake}:{words:readonly VocabularyWord[];mode:"letters"|"listening";child:boolean;onMistake?:(id:string)=>void;onComplete:()=>void}){
  const tasks=mode==="letters"?letterGameWords(words):listeningGameWords(words);
  const [index,setIndex]=useState(0),[selected,setSelected]=useState<string|null>(null),[missed,setMissed]=useState(false),[correct,setCorrect]=useState(0),[finished,setFinished]=useState(false);
  const word=tasks[index];
  if(!word||tasks.length<2)return <p>Для этой игры нужно больше разных слов. Выбери пары.</p>;
  const lemma=word.label.replace(/^(o|a|os|as) /,"");
  const position=Math.floor(lemma.length/2),letter=lemma[position];
  const target=mode==="letters"?letter:word.id;
  const distractors=mode==="letters"?[..."aertiosmnp"].filter(value=>value!==letter).slice(index%5,index%5+2):tasks.filter(other=>other.id!==word.id).slice(0,3).map(other=>other.id);
  const options=rotate([target,...distractors],index+1);
  const resolved=selected===target;
  const title=mode==="letters"?"Вставь букву":"Послушай и выбери";
  const phrases=phraseOptions(tasks);
  function answer(value:string){if(resolved)return;setSelected(value);if(value!==target){if(!missed)onMistake?.(word.id);setMissed(true);}else if(!missed)setCorrect(score=>score+1);}
  function next(){if(index===tasks.length-1)setFinished(true);else{setIndex(value=>value+1);setSelected(null);setMissed(false);}}
  if(finished)return <ActivityCompletion id={wordActivityId(mode,tasks.map(word=>word.id))} title={title} group="Слова и игры" correct={correct} total={tasks.length} child={child}><p role="status">Готово · {correct} / {tasks.length}</p><button type="button" onClick={onComplete}>Готово</button></ActivityCompletion>;
  return <section className={styles.miniGame} aria-label={title}>
    <small>{index+1} / {tasks.length}</small>
    <h2>{mode==="letters"?"Que letra falta?":"Ouve e escolhe"}</h2>
    {mode==="letters"?<>{word.illustration&&<VocabularyIllustration illustration={word.illustration}/>}<p>{word.translation}</p><strong className={styles.letterPrompt} lang="pt-PT">{lemma.slice(0,position)}<span>{resolved?letter:"_"}</span>{lemma.slice(position+1)}</strong></>:<CardSpeechButton key={word.id} text={word.label} label="Послушать задание" announceText={false}>▶ Послушать</CardSpeechButton>}
    <div className={styles.gameOptions}>{options.map(value=>{const option=tasks.find(item=>item.id===value);return <button type="button" key={value} aria-pressed={selected===value} disabled={resolved} data-result={selected===value?(resolved?"correct":"wrong"):undefined} onClick={()=>answer(value)}>{mode==="letters"?value:<>{option?.illustration&&<VocabularyIllustration illustration={option.illustration}/>}<span lang={phrases?"pt-PT":"ru"}>{phrases?option?.label:option?.translation}</span></>}</button>;})}</div>
    <div role="status" className={styles.gameFeedback}>{selected&&(resolved?<>✓ Верно! <strong lang="pt-PT">{word.label}</strong><CardSpeechButton text={word.label}/></>:"Попробуй ещё раз")}</div>
    {resolved&&<button type="button" onClick={next}>{index===tasks.length-1?"Завершить":"Дальше"}</button>}
  </section>;
}
