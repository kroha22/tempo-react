"use client";
import {useState} from "react";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import type {TextHelp} from "./LessonText";
import styles from "./CooperationLesson.module.css";

export function useTextHelp(translations:Readonly<Record<string,string>>,glossary:Readonly<Record<string,string>>,options?:{simple?:boolean}){
  const [words,setWords]=useState(options?.simple??false),[translated,setTranslated]=useState(false),[listen,setListen]=useState(false);
  const [selected,setSelected]=useState<{pt:string;ru:string}|null>(null);
  function reset(){setTranslated(false);setSelected(null);}
  const ignored=new Set("o a os as um uma uns umas de do da dos das em no na nos nas com por para e ou ao aos à às".split(" "));
  const hintGlossary=options?.simple?Object.fromEntries(Object.entries(glossary).filter(([word])=>word.length>1&&!ignored.has(word.toLocaleLowerCase("pt-PT")))):glossary;
  const help:TextHelp={words:options?.simple?true:words,translated,listen:options?.simple?false:listen,translations,glossary:hintGlossary,select:(pt,ru)=>setSelected({pt,ru}),reset};
  const controls=<div className={styles.help} role="group" aria-label="Подсказки и перевод">{!options?.simple&&<button type="button" aria-pressed={words} onClick={()=>{setWords(!words);setSelected(null);}}>Слова</button>}<button type="button" aria-pressed={translated} onClick={()=>{setTranslated(!translated);setSelected(null);}}>⇄ Перевод</button>{!options?.simple&&<button type="button" aria-pressed={listen} onClick={()=>setListen(!listen)}>Слушать</button>}</div>;
  const popup=selected&&<aside className={styles.popup} role="dialog" aria-label="Перевод слова"><CardSpeechButton text={selected.pt}/><p><b lang="pt-PT">{selected.pt}</b> — <span lang="ru">{selected.ru}</span></p><button type="button" aria-label="Закрыть подсказку" onClick={()=>setSelected(null)}>×</button></aside>;
  return {help,controls,popup,close:()=>setSelected(null)};
}
