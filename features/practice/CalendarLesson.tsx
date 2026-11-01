"use client";
import {useEffect,useRef,useState} from "react";
import {calendarLessons} from "../content/calendar";
import {calendarPortuguese} from "../content/calendar-language";
import {calendarTranslations,calendarGlossary} from "../content/calendar-translations";
import {learningCatalog} from "../content/learning-catalog";
import {MonthKnuckles} from "./MonthKnuckles";
import {ClockLesson} from "./ClockLesson";
import {UsagePractice} from "./UsagePractice";
import {LessonText,LessonTextContext} from "./LessonText";
import {useTextHelp} from "./LessonHelp";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import styles from "./CalendarLesson.module.css";
import frame from "./CooperationLesson.module.css";

export function CalendarLesson({initialLessonId="hours",initialChildMode=false,active=true,onRoutine}:{initialLessonId?:string;initialChildMode?:boolean;active?:boolean;onRoutine:()=>void}){
  const [selected,setSelected]=useState(initialLessonId),[view,setView]=useState("learn");
  const {help,controls,popup,close}=useTextHelp(calendarTranslations,calendarGlossary,{simple:true});
  const heading=useRef<HTMLHeadingElement>(null),first=useRef(true);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[selected,view]);
  function select(id:string){setSelected(id);setView("learn");help.reset();}
  function changeView(id:string){setView(id);help.reset();}
  const lesson=calendarLessons.find(item=>item.id===selected);
  const practice=learningCatalog.usageModules.find(item=>item.id===`usage:calendar:${selected}`);
  const views=["learn","words",...(selected.startsWith("months-")?["knuckles"]:[]),"practice"];
  const names:Record<string,string>={learn:"Aprender",words:"Palavras",knuckles:"Os nós dos dedos",practice:"Praticar"};
  const current=views.indexOf(view);
  return <LessonTextContext value={help}><section className={styles.lesson} aria-label="Время и календарь: уроки" onKeyDown={e=>{if(e.key==="Escape")close();}} data-presentation={initialChildMode?"child":"adult"}>
    <h2 ref={heading} tabIndex={-1}><LessonText text="O tempo e o calendário" audio/></h2>
    {controls}
    <nav className={frame.steps} aria-label="Уроки времени и календаря"><button type="button" aria-pressed={selected==="hours"} onClick={()=>select("hours")}>1 · {help.translated?"Часы":"Horas"}</button>{calendarLessons.map((item,i)=><button type="button" key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{i+2} · {item.title.split(" — ")[help.translated?1:0]}</button>)}</nav>
    <div hidden={selected!=="hours"}><ClockLesson embedded/><button type="button" onClick={()=>select("week")}>{help.translated?"Дальше: дни недели →":"Seguinte: a semana →"}</button></div>
    {lesson&&practice&&<>
      <nav className={frame.views} aria-label="Блок календарного урока">{views.map(id=><button type="button" key={id} aria-pressed={view===id} onClick={()=>changeView(id)}>{help.translated?calendarTranslations[names[id]]:names[id]}</button>)}</nav>
      <div className={frame.frame}><button type="button" className={frame.previous} aria-label="Anterior — Назад" disabled={current===0} onClick={()=>changeView(views[current-1])}>‹</button><div key={lesson.id}>
        <h3><LessonText text={lesson.title.split(" — ")[0]} audio/></h3>
        <div hidden={view!=="learn"}><p><LessonText text={calendarPortuguese[lesson.id].intro} audio/></p><div className="house-feedback"><p><LessonText text={calendarPortuguese[lesson.id].explanation} audio/></p></div></div>
        <div hidden={view!=="words"}>{lesson.rows.length>0&&<dl>{lesson.rows.map(([pt,ru])=><div key={pt}><dt><CardSpeechButton text={pt} disabled={!active||view!=="words"}/><LessonText text={pt} translation={ru} keepPortuguese/></dt></div>)}</dl>}<div className="usage-examples">{practice.examples.map(example=><article key={example.id}><CardSpeechButton text={example.portuguese} disabled={!active||view!=="words"}/><LessonText text={example.portuguese} translation={example.translation} keepPortuguese/></article>)}</div></div>
        {selected.startsWith("months-")&&<div hidden={view!=="knuckles"}><MonthKnuckles/></div>}
        <div hidden={view!=="practice"}><UsagePractice compact keepStudyPortuguese portuguese={!help.translated} active={active&&view==="practice"} module={practice} onComplete={()=>{const i=calendarLessons.findIndex(item=>item.id===selected);select(calendarLessons[i+1]?.id??"hours");}} completionLabel={help.translated?"Следующий урок →":"Seguinte →"}/></div>
      </div><button type="button" className={frame.next} aria-label="Seguinte — Дальше" disabled={current===views.length-1} onClick={()=>changeView(views[current+1])}>›</button></div>
    </>}
    <p><button type="button" onClick={onRoutine}>{help.translated?"Мой день: время во фразах о распорядке →":"O meu dia · Usar as horas em frases →"}</button></p>
    {popup}
  </section></LessonTextContext>;
}
