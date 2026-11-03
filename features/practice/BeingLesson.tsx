"use client";
import AdultLessons from "./AdultLessons";
import PracticeScreen from "./PracticeScreen";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {beingHref,type BeingDestination} from "./being-navigation";
import {useProfileLearning} from "./profile-learning";
import styles from "./BeingLesson.module.css";

/** One explanation owner and two explicit form destinations; old URLs remain aliases. */
export function BeingLesson({view,verb,childMode=false}:BeingDestination&{childMode?:boolean}){
  const profile=useProfileLearning();
  const child=profile?.profile.child??childMode;
  return <section className={styles.lesson} aria-label="Урок SER и ESTAR">
    <nav className={styles.navigation} aria-label="Разделы урока SER и ESTAR">
      <LegacyLessonLink href={beingHref("explanation","ser",child)} current={view==="explanation"}>Объяснение и выбор глагола</LegacyLessonLink>
      {(["ser","estar"] as const).map(key=><LegacyLessonLink key={key} href={beingHref("forms",key,child)} current={view==="forms"&&verb===key}>Формы {key.toUpperCase()}</LegacyLessonLink>)}
    </nav>
    <h1 tabIndex={-1} className={view==="explanation"?"sr-only":undefined}>{view==="forms"?`Формы ${verb.toUpperCase()} · настоящее время`:"SER и ESTAR · объяснение и выбор"}</h1>
    <div hidden={view!=="explanation"}><AdultLessons singleLesson consolidateBeing showPractice activeLessonId="ser-estar" childMode={child} onLessonChange={()=>{}} onOpenPractice={()=>{}} onOpenConjugationOverview={()=>{}}/></div>
    {(["ser","estar"] as const).map(key=><div key={key} hidden={view!=="forms"||verb!==key}>
      <LegacyLessonLink className={styles.back} href={beingHref("explanation","ser",child)}>← К объяснению SER и ESTAR</LegacyLessonLink>
      <p>Здесь тренируем спряжение. Выбор между SER и ESTAR проверяется в объяснении урока.</p>
      <PracticeScreen initialVerbKey={key} initialTense="present" initialChildMode={child} initialChildStep="exercise" focusedBeing/>
    </div>)}
  </section>;
}
