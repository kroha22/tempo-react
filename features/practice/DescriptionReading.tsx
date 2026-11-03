"use client";
import type {ReactNode} from "react";
import {grammarReadingGlossary} from "../content/grammar-reading";
import {LessonText,LessonTextContext,useLessonText} from "./LessonText";
import {useTextHelp} from "./LessonHelp";
import styles from "./DescriptionReading.module.css";

/** Reuses lesson word help; presentation state never writes learning results. */
export function DescriptionReading({children}:{children:ReactNode}){
  const {help,controls,popup,close}=useTextHelp({},grammarReadingGlossary,{simple:true,translationLabel:"Показать объяснение по-русски",portugueseLabel:"Читать по-португальски"});
  return <LessonTextContext value={help}><div className={styles.reading} data-language={help.translated?"ru":"pt-PT"} onKeyDown={event=>{if(event.key==="Escape")close();}}>
    {controls}<p className={styles.hint}>{help.translated?"Полное объяснение по-русски.":"Нажмите на подчёркнутое слово: перевод и произношение."}</p>
    {children}{popup}
  </div></LessonTextContext>;
}
export function DescriptionParagraph({pt,ru}:{pt:string;ru:string}){
  return <p><LessonText text={pt} translation={ru}/></p>;
}
export function DescriptionExamples({examples}:{examples:readonly {pt:string;ru:string}[]}){
  const help=useLessonText();
  return <div className={styles.examples}>{examples.map(example=><p key={example.pt}><strong><LessonText text={example.pt}/></strong>{help?.translated&&<span lang="ru">{example.ru}</span>}</p>)}</div>;
}
