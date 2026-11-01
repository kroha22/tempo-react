"use client";
import {useEffect,useRef,useState} from "react";
import {calendarMonths} from "../content/calendar";
import {knucklePages} from "../content/calendar-language";
import {LessonText,useLessonText} from "./LessonText";
import styles from "./CalendarLesson.module.css";

export function MonthKnuckles(){
  const [page,setPage]=useState(0);const help=useLessonText();const item=knucklePages[page];
  const heading=useRef<HTMLHeadingElement>(null),first=useRef(true);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[page]);
  const months=page===1?calendarMonths.slice(0,7):page===2?calendarMonths.slice(7):[];
  function move(next:number){setPage(next);help?.reset();}
  return <section className={styles.knuckles} aria-label="Счёт месяцев по костяшкам">
    <h4 ref={heading} tabIndex={-1}><LessonText text={item.title} translation={item.ruTitle} audio/></h4><p><LessonText text={item.pt} translation={item.ru} audio/></p>
    {!!months.length&&<ol className={styles.knuckleRow} start={page===1?1:8}>{months.map(([pt],i)=><li key={pt} data-raised={i%2===0}><span aria-hidden="true">{i%2===0?"●":"⌣"}</span><b><LessonText text={pt} audio/></b><strong>{i%2===0?31:pt==="fevereiro"?"28/29":30}</strong><small><LessonText text={i%2===0?"nó":"espaço"}/></small></li>)}</ol>}
    <div className="house-tools"><button type="button" disabled={page===0} onClick={()=>move(page-1)} aria-label="Предыдущая часть памятки">‹</button><span>{page+1} / {knucklePages.length}</span><button type="button" disabled={page===knucklePages.length-1} onClick={()=>move(page+1)} aria-label="Следующая часть памятки">›</button></div>
  </section>;
}
