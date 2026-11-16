"use client";
import {useState} from "react";
import {FirstSteps} from "./FirstSteps";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {navigationTopic,topicWordsHref} from "../content/topic-navigation";
import styles from "./FirstSteps.module.css";
/** Reuse both existing lesson owners, including their original activity keys. */
export function IntroductionTopic({onBack}:{onBack:()=>void}){
  const [step,setStep]=useState<0|1>(0),topic=navigationTopic("foundation:hello")!;
  return <section aria-label={topic.title}><p className="tempo-kicker">{topic.title}</p>
    <nav className={styles.steps} aria-label="Уроки знакомства"><button type="button" aria-pressed={step===0} onClick={()=>setStep(0)}>Приветствия</button><button type="button" aria-pressed={step===1} onClick={()=>setStep(1)}>Рассказать о себе</button></nav>
    <nav aria-label="Материалы знакомства"><LegacyLessonLink href={topicWordsHref(topic.id)}>Учить слова: {topic.title} →</LegacyLessonLink><p><LegacyLessonLink href="/learning/practice?lesson=ser-estar">SER / ESTAR · отдельный урок →</LegacyLessonLink></p></nav>
    {([0,1] as const).map(index=><div hidden={step!==index} key={index}><FirstSteps topicStep={index} onBack={onBack} backLabel="← Назад"/></div>)}
  </section>;
}
