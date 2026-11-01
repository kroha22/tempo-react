"use client";
import {useEffect,useRef,useState} from "react";
import {cooperationLessons,cooperationPortuguese} from "../content/cooperation";
import {learningCatalog} from "../content/learning-catalog";
import {LessonText,LessonTextContext} from "./LessonText";
import {cooperationTranslations,cooperationGlossary} from "../content/cooperation-translations";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {UsagePractice} from "./UsagePractice";
import {publicAssetUrl} from "../../shared/public-asset";
import styles from "./CooperationLesson.module.css";

export function CooperationLesson({initialChildMode=false,active=true,onFeelings}:{initialChildMode?:boolean;active?:boolean;onFeelings:()=>void}){
  const [step,setStep]=useState(0);
  const [view,setView]=useState<"story"|"explanation"|"practice">("story");
  const [words,setWords]=useState(false);
  const [translated,setTranslated]=useState(false);
  const [listen,setListen]=useState(false);
  const [selected,setSelected]=useState<{pt:string;ru:string}|null>(null);
  function resetTranslation(){setTranslated(false);setSelected(null);}
  function changeView(next:"story"|"explanation"|"practice"){setView(next);resetTranslation();}
  const [completed,setCompleted]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const first=useRef(true);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[step,view]);
  function changeStep(next:number){setStep(next);changeView("story");setCompleted(false);}
  const lesson=cooperationLessons[step];
  const pt=cooperationPortuguese[lesson.id];
  function previous(){if(view==="practice")changeView("explanation");else if(view==="explanation")changeView("story");else if(step>0)changeStep(step-1);}
  function next(){if(view==="story")changeView("explanation");else if(view==="explanation")changeView("practice");else if(completed&&step<2)changeStep(step+1);}
  const practice=learningCatalog.usageModules.find(item=>item.id===`usage:cooperation:${lesson.id}`)!;
  const help={words,translated,listen,translations:cooperationTranslations,glossary:cooperationGlossary,select:(pt:string,ru:string)=>setSelected({pt,ru}),reset:resetTranslation};
  return <LessonTextContext value={help}><section onKeyDown={event=>{if(event.key==="Escape")setSelected(null);}} className={styles.lesson} aria-label="Общаемся и договариваемся: уроки">
    <h2 ref={heading} tabIndex={-1} lang="pt-PT"><LessonText text="Conversar e chegar a acordo" audio/></h2>
    <p className={styles.context}><LessonText text="Estudo do Meio · Material de apoio escolar" audio/></p>
    <div className={styles.help} role="group" aria-label="Подсказки и перевод"><button type="button" aria-pressed={words} onClick={()=>{setWords(!words);setSelected(null);}}>Слова</button><button type="button" aria-pressed={translated} onClick={()=>{setTranslated(!translated);setSelected(null);}}>⇄ Перевод</button><button type="button" aria-pressed={listen} onClick={()=>setListen(!listen)}>Слушать</button></div>
    <nav className={styles.steps} aria-label="Шаги общения">{cooperationLessons.map((item,i)=><button type="button" key={item.id} aria-pressed={i===step} onClick={()=>changeStep(i)}>{i+1} · {translated?item.title.split(" — ")[1]:item.title.split(" — ")[0]}</button>)}</nav>
    <nav className={styles.views} aria-label="Блок урока">{([["story","História"],["explanation","Aprender"],["practice","Praticar"]] as const).map(([id,label],i)=><button type="button" key={id} aria-pressed={view===id} onClick={()=>changeView(id)}>{i+1} · {translated?cooperationTranslations[label]:label}</button>)}</nav>
    <div className={styles.frame}>
    <button type="button" className={styles.previous} aria-label="Anterior — Назад" disabled={step===0&&view==="story"} onClick={previous}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
    <div key={lesson.id} className={styles.content}>
      <div hidden={view!=="story"}>
      <figure className={styles.scene}><svg viewBox={`${lesson.scene*2129/3} 0 ${2129/3} 739`} role="img" aria-label={lesson.caption.split(" — ")[0]}><image href={publicAssetUrl("/images/vocabulary/cooperation-story-v2.webp")} width="2129" height="739"/></svg><figcaption><LessonText text={lesson.caption.split(" — ")[0]} audio/></figcaption></figure>
      <h3><LessonText text={lesson.title.split(" — ")[0]} audio/></h3><p><LessonText text={initialChildMode?pt.story:pt.adult} audio/></p></div>
      <div hidden={view!=="explanation"}><h3><LessonText text="Como podemos chegar a acordo?" audio/></h3><div className="house-feedback"><p><LessonText text={pt.explanation} audio/></p></div>
      {lesson.id==="solution"&&<ol className={styles.process}><li><b lang="pt-PT"><LessonText text="Diálogo"/></b><span><LessonText text="Ouvir e compreender"/></span></li><li><b lang="pt-PT"><LessonText text="Negociação"/></b><span><LessonText text="Propor soluções"/></span></li><li><b lang="pt-PT"><LessonText text="Compromisso"/></b><span><LessonText text="Combinar e cumprir"/></span></li></ol>}
      <div className="usage-examples" aria-label="Примеры фраз">{practice.examples.map(example=><article key={example.id}><div><strong><LessonText text={example.portuguese} translation={example.translation}/></strong></div>{listen&&<CardSpeechButton text={example.portuguese} disabled={!active||view!=="explanation"}/>}</article>)}</div>
      </div>
      <div hidden={view!=="practice"}><UsagePractice compact portuguese={!translated} module={practice} active={active&&view==="practice"} onRunComplete={()=>setCompleted(true)} onComplete={()=>changeStep(step<2?step+1:0)} completionLabel={translated?(step<2?"Следующий шаг →":"Вернуться к истории →"):(step<2?"Seguinte →":"Voltar à história →")}/></div>
    </div>
    <button type="button" className={styles.next} aria-label="Seguinte — Дальше" disabled={view==="practice"&&(!completed||step===2)} onClick={next}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
    </div>
    <p><button type="button" onClick={onFeelings}>{translated?"Как я себя чувствую · Повторить слова →":"Como me sinto? · Rever palavras →"}</button></p>
    {selected&&<aside className={styles.popup} role="dialog" aria-label="Перевод слова"><CardSpeechButton text={selected.pt}/><p><b lang="pt-PT">{selected.pt}</b> — <span lang="ru">{selected.ru}</span></p><button type="button" aria-label="Закрыть подсказку" onClick={()=>setSelected(null)}>×</button></aside>}
  </section></LessonTextContext>;
}
