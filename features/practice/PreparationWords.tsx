"use client";
import {useRef,useState} from "react";
import {preparationKeywords} from "../content/preparation-support";
import {catalogWords} from "../content/learning-catalog-view";
import {WordPairs} from "./WordPairs";
import {WordSearch} from "./WordSearch";
import {LessonText} from "./LessonText";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import styles from "./TestPreparation.module.css";

export function PreparationWords({unitId,view="all"}:{unitId:string;view?:"all"|"words"|"games"}){
  const [pairs,setPairs]=useState(false),[search,setSearch]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const entries=preparationKeywords[unitId]??[];
  const words=entries.map(([label,translation],i)=>{
    const existing=catalogWords.find(word=>word.label===label&&word.translation.toLocaleLowerCase("ru").replace(/[.!]$/u,"")===translation.toLocaleLowerCase("ru"));
    return existing??{id:`prep-keyword:${unitId}:${i}`,label,translation};
  });
  return <section className={styles.embedded} aria-label="Слова и дополнительные задания">
    <h3 ref={heading} tabIndex={-1}><LessonText text={view==="games"?"Jogos com palavras":"Palavras úteis"} translation={view==="games"?"Игры со словами":"Полезные слова"}/></h3>
    {view!=="games"&&<div className={styles.keywordList}>{words.map(word=><span key={word.id}><CardSpeechButton text={word.label}/><LessonText text={word.label} translation={word.translation} keepPortuguese/></span>)}</div>}
    {view!=="words"&&<>
    <details onToggle={e=>{if(e.currentTarget.open)setPairs(true);}}><summary>🔗 <LessonText text="Liga as palavras" translation="Соедини пары" plain/></summary>{pairs&&<WordPairs embedded words={words} blocks={[{id:`prep-keywords:${unitId}`,title:"Palavras · Слова",words:words.map(w=>w.id)}]} completionLabel="К словам ↑" onComplete={()=>{heading.current?.focus();heading.current?.scrollIntoView?.({block:"start"});}}/>}</details>
    <details onToggle={e=>{if(e.currentTarget.open)setSearch(true);}}><summary>⌕ <LessonText text="Procura as palavras" translation="Найди слова" plain/></summary>{search&&<WordSearch embedded words={words} title="Palavras · Слова"/>}</details>
    </>}
  </section>;
}
