"use client";
import { useEffect, useRef, useState } from "react";
import AdultLessons from "../AdultLessons";
import { EverydayLesson } from "../EverydayLesson";
import { VocabularyCards } from "../VocabularyCards";
import { VocabularyWriting } from "../VocabularyWriting";
import { pairVocabulary } from "../../content/vocabulary-catalog";
import { isPracticeStepComplete, nextPracticeStep, practicePlanChapters, practicePlanSteps, type PracticePlanStep } from "./model";
import { usePracticePlan } from "./PracticePlanContext";
import styles from "./ChildPracticePlan.module.css";

export function ChildPracticePlan({onOpenCatalog}:{onOpenCatalog:()=>void}) {
  const plan=usePracticePlan();
  const [current,setCurrent]=useState<string|null>(null),[attempt,setAttempt]=useState(0),[wordPhase,setWordPhase]=useState<"learn"|"write">("learn");
  const [filter,setFilter]=useState<"all"|"done"|"review">("all");
  const root=useRef<HTMLElement>(null);
  useEffect(()=>{root.current?.querySelector<HTMLHeadingElement>("h1")?.focus();},[current]);
  if(!plan)return null;
  const {progress}=plan;
  const completed=practicePlanSteps.filter(step=>isPracticeStepComplete(progress,step));
  const review=completed.filter(step=>progress.completed[step.id]?.needsReview);
  const recommended=nextPracticeStep(progress);
  const selected=practicePlanSteps.find(step=>step.id===current);
  const chapter=practicePlanChapters.find(item=>item.steps.some(step=>step.id===current));
  function open(step:PracticePlanStep){setCurrent(step.id);setAttempt(value=>value+1);setWordPhase("learn");plan!.visit(step.id);window.scrollTo(0,0);}
  if(selected){
    const done=isPracticeStepComplete(progress,selected);
    const after=practicePlanSteps.slice(practicePlanSteps.indexOf(selected)+1).find(step=>!isPracticeStepComplete(progress,step));
    const selectedWords=selected.kind==="words"?selected.wordIds.map(id=>pairVocabulary.find(word=>word.id===id)!):[];
    return <section ref={root} className={styles.plan} aria-label="Занятие моего плана">
      <header className={styles.lessonHeader}><button type="button" onClick={()=>setCurrent(null)}>‹ К моему плану</button><span>{chapter?.title}</span></header>
      <div className={styles.lessonContent} key={`${selected.id}:${attempt}`}>
        {selected.kind==="grammar"?<><h1 tabIndex={-1}>{selected.title}</h1><AdultLessons singleLesson activeLessonId={selected.lessonId} onLessonChange={()=>{}} onOpenPractice={()=>{}} onOpenConjugationOverview={()=>{}}/></>:selected.kind==="everyday"?<EverydayLesson lessonId={selected.lessonId}/>:<>
          <h1 tabIndex={-1}>{selected.title}</h1><p>Сначала посмотри карточки, затем напиши каждое слово по-португальски.</p>
          <nav className="vocabulary-modes" aria-label="Шаги словарного занятия"><button type="button" aria-pressed={wordPhase==="learn"} onClick={()=>setWordPhase("learn")}>Изучить слова</button><button type="button" aria-pressed={wordPhase==="write"} onClick={()=>setWordPhase("write")}>Написать слова</button></nav>
          <div hidden={wordPhase!=="learn"}><VocabularyCards words={selectedWords} active={wordPhase==="learn"}/><button type="button" onClick={()=>setWordPhase("write")}>Теперь напишем слова →</button></div>
          <div hidden={wordPhase!=="write"}><VocabularyWriting words={selectedWords} active={wordPhase==="write"}/></div>
        </>}
      </div>
      {done&&<aside className={styles.finished} aria-label="Занятие пройдено"><strong>✓ Занятие пройдено</strong>{progress.completed[selected.id].needsReview&&<span>Можно вернуться и повторить без подсказок.</span>}<button type="button" onClick={()=>after?open(after):setCurrent(null)}>{after?"Следующее занятие →":"К моему плану"}</button></aside>}
    </section>;
  }
  const recommendedChapter=practicePlanChapters.find(item=>item.steps.some(step=>step.id===recommended.id));
  return <section ref={root} className={styles.plan} aria-label="Мой план занятий">
    <header className={styles.intro}><span className="tempo-kicker">Шаг за шагом</span><h1 tabIndex={-1}>Мой план</h1><p>Небольшие занятия по порядку. К пройденным можно возвращаться.</p>
      <div className={styles.counter}><strong>{completed.length} из {practicePlanSteps.length}</strong><span>занятий пройдено</span></div>
      <progress aria-label="Пройденные занятия" value={completed.length} max={practicePlanSteps.length}/>
      <small>Сохраняется в этом браузере</small>
    </header>
    <div className={styles.continue}><span>{completed.length===practicePlanSteps.length?"Весь план пройден! Можно повторить любимое.":recommendedChapter?.title}</span><strong>{recommended.title}</strong><button type="button" className="house-primary" onClick={()=>open(recommended)}>{completed.length===practicePlanSteps.length?"Повторить занятие":completed.length||progress.lastStepId?"Продолжить":"Начать"} →</button></div>
    <nav className={styles.filters} aria-label="Показать занятия"><button type="button" aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>Все</button><button type="button" aria-pressed={filter==="done"} onClick={()=>setFilter("done")}>Пройденные · {completed.length}</button><button type="button" aria-pressed={filter==="review"} onClick={()=>setFilter("review")}>Повторить · {review.length}</button></nav>
    {filter!=="all"&&!(filter==="done"?completed:review).length&&<p role="status">{filter==="done"?"Здесь появятся пройденные занятия.":"Пока нет занятий, которые нужно повторить."}</p>}
    <div className={styles.chapters}>{practicePlanChapters.map((block,index)=>{
      const done=block.steps.filter(step=>isPracticeStepComplete(progress,step));
      const shown=block.steps.filter(step=>filter==="all"||isPracticeStepComplete(progress,step)&&(filter==="done"||progress.completed[step.id].needsReview));
      if(!shown.length)return null;
      return <details key={block.id} open={filter!=="all"||block.id===recommendedChapter?.id} className={styles.chapter}><summary><span className={styles.number}>{index+1}</span><span><strong>{block.title}</strong><small>{done.length} / {block.steps.length} пройдено</small></span></summary><p>{block.description}</p><ol>{shown.map(step=>{
        const passed=isPracticeStepComplete(progress,step);
        return <li key={step.id}><button type="button" aria-current={!passed&&step.id===recommended.id?"step":undefined} onClick={()=>open(step)}><span className={styles.check} aria-hidden="true">{passed?"✓":block.steps.indexOf(step)+1}</span><span><strong>{step.title}</strong><small>{passed?progress.completed[step.id].needsReview?"Пройдено · стоит повторить":"Пройдено · можно повторить":`${step.minutes} мин${step.id===recommended.id?" · следующий шаг":""}`}</small></span><span aria-hidden="true">›</span></button></li>;
      })}</ol></details>;
    })}</div>
    <button type="button" className={styles.catalog} onClick={onOpenCatalog}>Все уроки и свободная практика</button>
  </section>;
}
