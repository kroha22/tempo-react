"use client";
import {ActivityCompletion,ChildPresentation} from "./ActivityCompletion";
import {useState} from "react";
import {GreetingsLesson} from "./GreetingsLesson";
import {IdentityLesson} from "./IdentityLesson";
import {firstStepChecks} from "../content/first-steps";
import {SerEstarExplanation} from "./SerEstarExplanation";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {FeelingsLesson} from "./FeelingsLesson";
import {FamilyLesson} from "./FamilyLesson";
import styles from "./FirstSteps.module.css";
import {useProfileLearning} from "./profile-learning";

const titles=["Olá! — Приветствия и общение","Quem sou? — Кто я","SER / ESTAR — Характеристика и состояние","A minha família — Моя семья","Como me sinto? — Как я себя чувствую"];
export function FirstSteps({onBack,initialChildMode=false,topicStep}:{onBack:()=>void;initialChildMode?:boolean;topicStep?:0|1|2}) {
  const learner=useProfileLearning();
  const [localChild,setChild]=useState(initialChildMode),[step,setStep]=useState<number>(topicStep??0);
  const child=learner?.profile.child??localChild;
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [checked,setChecked]=useState<Record<string,boolean>>({});
  const check=firstStepChecks[Math.min(step,2)],answer=answers[check.id],revealed=checked[check.id],correct=answer===check.answer;
  if(step===3)return <FamilyLesson initialChildMode={child} onBack={()=>setStep(2)} onNext={()=>setStep(4)}/>;
  if(step===4)return <FeelingsLesson initialChildMode={child} onBack={()=>setStep(3)}/>;
  return <ChildPresentation value={child}><section className={styles.pilot} aria-label="Первые фразы" data-presentation={child?"child":"adult"}>
    <button type="button" className="pair-back" onClick={onBack}>‹ К темам</button>
    <header><span className="tempo-kicker">Aprender · Учимся</span><h1>{topicStep===undefined?"Знакомимся и рассказываем о себе":titles[step]}</h1>{!learner&&<div className={styles.switch} role="group" aria-label="Подача объяснения"><button type="button" aria-pressed={!child} onClick={()=>setChild(false)}>Для взрослых</button><button type="button" aria-pressed={child} onClick={()=>setChild(true)}>Для детей</button></div>}</header>
    {topicStep===undefined&&<><nav className={styles.steps} aria-label="Шаги первого занятия">{titles.map((title,index)=><button type="button" key={title} aria-current={step===index?"step":undefined} onClick={()=>setStep(index)}>{index+1}. {title}</button>)}</nav><h2>{titles[step]}</h2></>}
    {step===0?<GreetingsLesson child={child}/>:step===1?<IdentityLesson child={child}/>:<SerEstarExplanation childMode={child}/>}
    {(step===2||topicStep===undefined)&&<section className={styles.check} aria-label="Проверь себя"><h3>{child?"Попробуй сам":"Применим в новой ситуации"}</h3><p>{check.prompt}</p><div className={styles.options}>{check.options.map((option,index)=><button type="button" key={option} aria-pressed={answer===index} onClick={()=>{setAnswers({...answers,[check.id]:index});setChecked({...checked,[check.id]:false});}} lang="pt-PT">{option}</button>)}</div><button type="button" disabled={answer===undefined} onClick={()=>setChecked({...checked,[check.id]:true})}>Проверить</button>
    {revealed&&<p role="status">{correct?"✓ Верно. ":"Попробуй ещё раз. "}{check.feedback}</p>}
    {revealed&&correct&&(step<2&&topicStep===undefined?<button type="button" onClick={()=>setStep(step+1)}>Следующий шаг →</button>:<p>Можно повторить примеры или выбрать следующую тему.</p>)}</section>}
    {revealed&&<ActivityCompletion id={`foundation:${check.id}`} title={titles[step]} group="Первые фразы" correct={correct?1:0} total={1} child={child} scoreLabel="Верно"/>}
    {topicStep===undefined&&step===2&&revealed&&correct&&<button type="button" onClick={()=>setStep(3)}>Дальше: Моя семья →</button>}
    {step>0&&<aside className={styles.links} aria-label="Практика форм"><LegacyLessonLink href={`/learning/practice?verb=ser&tense=present${child?"&mode=kingdoms":""}`}>Потренировать SER →</LegacyLessonLink>{step===2&&<LegacyLessonLink href={`/learning/practice?verb=estar&tense=present${child?"&mode=kingdoms":""}`}>Потренировать ESTAR →</LegacyLessonLink>}</aside>}
  </section></ChildPresentation>;
}
