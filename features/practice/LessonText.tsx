"use client";
import {createContext,useContext,type ReactNode} from "react";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import styles from "./LessonText.module.css";

export type TextHelp={words:boolean;translated:boolean;listen:boolean;translations:Readonly<Record<string,string>>;glossary:Readonly<Record<string,string>>;select:(pt:string,ru:string)=>void;reset:()=>void};
export const LessonTextContext=createContext<TextHelp|null>(null);
export function useLessonText(){return useContext(LessonTextContext);}
export function LessonText({text,translation,audio=false}:{text:string;translation?:string;audio?:boolean}){
  const help=useLessonText();
  if(!help)return <>{text}</>;
  const ru=translation??help.translations[text];
  let content:ReactNode=<span lang="pt-PT">{text}</span>;
  if(help.translated&&ru)content=<span lang="ru">{ru}</span>;
  else if(help.words){
    const phrases=Object.keys(help.glossary).filter(key=>key.includes(" ")).sort((a,b)=>b.length-a.length);
    const escaped=phrases.map(p=>p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
    const pattern=new RegExp(`(${escaped.join("|")}|[\\p{L}]+(?:[-’'][\\p{L}]+)*)`,"giu");
    content=<span lang="pt-PT">{text.split(pattern).map((part,i)=>{const meaning=help.glossary[part.toLocaleLowerCase("pt-PT")];return meaning?<button key={i} type="button" className={styles.word} onClick={()=>help.select(part,meaning)} aria-label={`Перевод: ${part}`}>{part}</button>:part;})}</span>;
  }
  return <>{content}{audio&&help.listen&&<span className={styles.audio}><CardSpeechButton text={text}/></span>}</>;
}
