"use client";

import { useState } from "react";
import { bodyFunctions, everydayLessons, preferenceFoods, preferencePeople, preferenceSentence, type EverydayLessonId } from "../content/everyday-lessons";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";
import styles from "./EverydayLesson.module.css";
import { usePracticePlan } from "./plan/PracticePlanContext";

export function EverydayLesson({ lessonId }: { lessonId: EverydayLessonId }) {
  const plan=usePracticePlan();
  const lesson=everydayLessons[lessonId];
  const [mode,setMode]=useState<"learn"|"check">("learn");
  const [person,setPerson]=useState(0),[food,setFood]=useState(0),[negative,setNegative]=useState(false),[body,setBody]=useState(0);
  const [step,setStep]=useState(0),[choice,setChoice]=useState<string|null>(null),[checked,setChecked]=useState(false),[score,setScore]=useState(0);
  const sentence=lessonId==="likes"?preferenceSentence(person,food,negative):bodyFunctions[body];
  const task=lesson.checks[step];
  function restart(){setStep(0);setChoice(null);setChecked(false);setScore(0);setMode("check");}
  return <section className={`house-activity ${styles.lesson}`} aria-label={lesson.title}>
    <header className={styles.heading}><div><span className="tempo-kicker">Слова в жизни</span><h1 tabIndex={-1}>{lesson.title}</h1></div><SpeechHelpButton /></header>
    <p>{lesson.canDo}</p>
    <nav className="vocabulary-modes" aria-label="Этап урока"><button type="button" aria-pressed={mode==="learn"} onClick={()=>setMode("learn")}>Разобраться</button><button type="button" aria-pressed={mode==="check"} onClick={()=>setMode("check")}>Потренироваться</button></nav>
    {mode==="learn"?<>
      {lessonId==="likes"?<div className={styles.builder}>
        <div className={styles.options} role="group" aria-label="Кто говорит">{preferencePeople.map((item,index)=><button type="button" key={item.id} aria-pressed={person===index} onClick={()=>setPerson(index)}>{item.label}</button>)}</div>
        <div className={styles.options} role="group" aria-label="Предпочтение"><button type="button" aria-pressed={!negative} onClick={()=>setNegative(false)}>Нравится</button><button type="button" aria-pressed={negative} onClick={()=>setNegative(true)}>Не нравится</button></div>
        <div className={styles.foods} role="group" aria-label="Выбери продукт">{preferenceFoods.map((item,index)=><button type="button" key={item.wordId} aria-pressed={food===index} onClick={()=>setFood(index)}><span aria-hidden="true">{item.symbol}</span><span lang="pt-PT">{item.phrase}</span></button>)}</div>
      </div>:<div className={styles.bodyTiles} role="group" aria-label="Части тела и действия">{bodyFunctions.map((item,index)=><button type="button" key={item.wordId} aria-pressed={body===index} onClick={()=>setBody(index)}><SenseIcon name={item.icon}/><strong lang="pt-PT">{item.part}</strong><span lang="pt-PT">→ {item.action}</span></button>)}</div>}
      <div className={styles.sentence} aria-live="polite"><div><strong lang="pt-PT">{sentence.pt}</strong><span>{sentence.ru}</span></div><CardSpeechButton text={sentence.pt} /></div>
      <details className={styles.rule}><summary>Как это устроено</summary><p>{lesson.rule}</p></details>
      <button type="button" className="house-primary" onClick={restart}>Попробовать самому</button>
    </>:!task?<div className={styles.summary} role="status"><h2>Практика пройдена!</h2><p>Верно с первой попытки: {score} из {lesson.checks.length}</p><button type="button" onClick={restart}>Повторить</button><button type="button" onClick={()=>setMode("learn")}>Вернуться к примерам</button></div>:<form className={styles.task} onSubmit={event=>{event.preventDefault();if(!choice)return;if(checked){if(step===lesson.checks.length-1)plan?.complete(`practice:everyday:${lessonId}`,score<lesson.checks.length);setStep(step+1);setChoice(null);setChecked(false);}else{setChecked(true);if(choice===task.answer)setScore(score+1);}}}>
      <span>{step+1} / {lesson.checks.length}</span><h2>{task.prompt}</h2>
      {(task.before||task.after)&&<p className={styles.gap} lang="pt-PT">{task.before}<strong>{choice??"…"}</strong>{task.after}</p>}
      <div className={styles.answers} role="group" aria-label="Варианты ответа">{task.options.map(option=><button type="button" key={option} lang="pt-PT" disabled={checked} aria-pressed={choice===option} onClick={()=>setChoice(option)}>{option}</button>)}</div>
      {checked&&<div className={styles.feedback} role="status"><strong>{choice===task.answer?"Верно!":"Правильный ответ: "+task.answer}</strong><p>{task.explanation}</p><CardSpeechButton text={`${task.before}${task.answer}${task.after}`} /></div>}
      <button className="house-primary" type="submit" disabled={!choice}>{checked?step===lesson.checks.length-1?"Завершить":"Дальше":"Проверить"}</button>
    </form>}
  </section>;
}

function SenseIcon({name}:{name:string}) {
  const paths:Record<string,string>={eye:"M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16Z M20 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0",ear:"M9 12a8 8 0 1 1 14 5c-3 3-4 3-4 7a4 4 0 0 1-8 0 M13 13a4 4 0 1 1 7 3l-4 4",nose:"M17 5 11 22q4 6 10 0 M10 23H7 M22 23h3",tongue:"M5 11q11-9 22 0l-4 11H9Z M11 16v8a5 5 0 0 0 10 0v-8 M16 18v5",hand:"M10 18V8a2 2 0 0 1 4 0v8-11a2 2 0 0 1 4 0v11-9a2 2 0 0 1 4 0v10-5a2 2 0 0 1 4 0v11q-1 7-9 7-5 0-8-5l-5-7q1-4 4-1Z",mouth:"M4 16q12-15 24 0-12 15-24 0Z M4 16h24"};
  return <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]}/></svg>;
}
