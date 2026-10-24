"use client";
import {useRef,useState} from "react";
import {feelingWords} from "../content/feelings-lesson";
import {learningCatalog} from "../content/learning-catalog";
import {VocabularyCards} from "./VocabularyCards";
import {UsagePractice} from "./UsagePractice";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./FirstSteps.module.css";
import {TopicRewards} from "./TopicRewards";
import {ChildLessonResult} from "./ChildProfile";
import {useProfileLearning,emptyProfileLearning,type ProfileLearning,type TopicPhase} from "./profile-learning";

const usage=learningCatalog.usageModules.find(item=>item.id==="usage:feelings")!;
const reviewUsage={...usage,title:"Повторение: ESTAR",situation:"Повтори фразы без примеров. Можно пробовать несколько раз.",examples:[],exercises:[...usage.exercises].reverse()};
export function FeelingsLesson({initialChildMode=false,onBack}:{initialChildMode?:boolean;onBack?:()=>void}) {
  const learner=useProfileLearning();
  const collection=useRef<HTMLDivElement>(null);
  const [localChild,setChild]=useState(initialChildMode),[localProgress,setLocalProgress]=useState(emptyProfileLearning().feelings);
  const child=learner?.profile.child??localChild;
  const {viewed,practised,repeated,phase}=learner?.learning.feelings??localProgress;
  function saveProgress(change:(current:ProfileLearning["feelings"])=>ProfileLearning["feelings"]){if(learner)return learner.update(current=>({...current,lastTopicId:"topic:people",feelings:change(current.feelings)}));setLocalProgress(change);return true;}
  function setPhase(next:TopicPhase){saveProgress(current=>({...current,phase:next}));}
  const [review,setReview]=useState(false),[round,setRound]=useState(0),[notice,setNotice]=useState("");
  const [result,setResult]=useState<{correct:number;total:number;saved:boolean}|null>(null);
  const wordsDone=viewed.length===feelingWords.length,practiceDone=wordsDone&&practised;
  const currentUsage=review?reviewUsage:usage;
  const contextualUsage={...currentUsage,relatedLinks:currentUsage.relatedLinks.map(link=>child?{...link,href:`${link.href}&mode=kingdoms`}:link)};
  function finishRun(result:{correct:number;total:number}){
    if(child)setResult({...result,saved:result.correct!==result.total});
    if(result.correct!==result.total){setNotice("Посмотри ответы и попробуй снова. Уже полученные отметки остаются.");return;}
    const saved=saveProgress(current=>({...current,...(review?{repeated:true}:{practised:true})}));
    if(child)setResult({...result,saved});
    if(saved)setNotice(review?"Повторение пройдено — третья отметка получена!":wordsDone?"Фразы готовы — отметка за практику получена!":"Фразы пройдены. Открой переводы всех слов, чтобы завершить первые два этапа.");
  }
  return <section className={styles.pilot} aria-label="Как я себя чувствую: слова и ESTAR" data-presentation={child?"child":"adult"}>
    {onBack&&<button type="button" className="pair-back" onClick={onBack}>‹ К семье</button>}
    <span className="tempo-kicker">Como me sinto? · Как я себя чувствую</span><h2>Говорим о состоянии</h2>
    {!learner&&<div className={styles.switch} role="group" aria-label="Подача урока о состояниях"><button type="button" aria-pressed={!child} onClick={()=>setChild(false)}>Для взрослых</button><button type="button" aria-pressed={child} onClick={()=>setChild(true)}>Для детей</button></div>}
    <p>{child?"Посмотри на героя: он радуется, грустит или устал? Расскажи о нём.":"Назовём состояние: Estou… — я, está… — он или она."} Можно говорить о себе или о персонаже.</p>
    <div ref={collection} tabIndex={-1}><TopicRewards child={child} earned={[wordsDone,practiceDone,practiceDone&&repeated]} wordCount={viewed.length} persistent={!!learner}/></div>
    {notice&&<p role="status">{notice}</p>}
    <nav className={styles.steps} aria-label="Шаги урока о состояниях">{([["words","Palavras — Слова"],["examples","Frases — Примеры"],["practice","Pratica — Попробуй"]] as const).map(([id,title])=><button type="button" key={id} aria-current={phase===id?"step":undefined} onClick={()=>setPhase(id)}>{title}</button>)}</nav>
    <div hidden={phase!=="words"}><VocabularyCards words={feelingWords} active={phase==="words"} onReveal={id=>{if(viewed.includes(id))return;if(saveProgress(current=>({...current,viewed:[...new Set([...current.viewed,id])]}))&&viewed.length+1===feelingWords.length)setNotice("Все шесть слов просмотрены — отметка за знакомство получена!");}}/><button type="button" onClick={()=>setPhase("examples")}>К фразам с ESTAR →</button></div>
    <div hidden={phase!=="examples"}><div className={styles.examples}>{usage.examples.map(example=><article key={example.id}><strong lang="pt-PT">{example.portuguese}</strong><span>{example.translation}</span></article>)}</div>
      <p><b lang="pt-PT">Estou cansado / cansada.</b> — Я устал / устала. Так же: nervoso / nervosa, calmo / calma, pronto / pronta. <b lang="pt-PT">Feliz</b> и <b lang="pt-PT">triste</b> не меняются по роду.</p>
      <p><b lang="pt-PT">Como estás? — Estou bem.</b> Как ты? — У меня всё хорошо. <b lang="pt-PT">Estás pronto / pronta?</b> — Ты готов / готова?</p>
      <LegacyLessonLink href="/learning/practice?lesson=ser-estar">SER / ESTAR: общее объяснение и формы →</LegacyLessonLink>
      <button type="button" onClick={()=>setPhase("practice")}>Попробовать составить фразы →</button>
    </div>
    <div hidden={phase!=="practice"||!!(child&&result)}><UsagePractice key={round} module={contextualUsage} active={phase==="practice"&&!(child&&result)} onRunComplete={finishRun}/></div>
    {child&&result&&phase==="practice"&&<ChildLessonResult {...result} saved={result.saved||(!learner?.savingError&&(review?repeated:practised))} onContinue={()=>{setResult(null);setPhase("words");if(learner?.openAlbum)learner.openAlbum();else collection.current?.focus();}} onRetry={()=>{setResult(null);setRound(value=>value+1);setPhase("practice");}}/>}
    {practiceDone&&!repeated&&<button type="button" onClick={()=>{setResult(null);setReview(true);setRound(value=>value+1);setPhase("practice");setNotice("Повторение: теперь без примеров-подсказок.");}}>Повторить без примеров →</button>}
  </section>;
}
