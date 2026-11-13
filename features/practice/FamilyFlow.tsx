"use client";
import {useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {EnsureQueryScope} from "../../shared/query/SessionQueryBoundary";
import {familyFlowHref,familyFlowPhases,familyFlowTitles,type FamilyFlowPhase} from "../content/family-flow";
import {familyStudyItemIds,type FamilyCardTopic} from "../content/family-cards";
import {topicExpansion} from "../content/vocabulary-catalog";
import {FamilyCards} from "../cards/saved-items/FamilyCards";
import {StudyReview} from "../cards/study-review/StudyReview";
import {FamilyLesson} from "./FamilyLesson";
import {FamilyExplanation} from "./FamilyExplanation";
import {VocabularyWriting} from "./VocabularyWriting";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import {usePracticePlan} from "./plan/PracticePlanContext";
import styles from "./TimeDayFlow.module.css";

const titles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
const topics=["close","relatives"] as const;
const wordSets={close:["mae","pai","irmao","irma","avo-f","avo-m"].map(key=>topicExpansion.byKey.get(key)!),relatives:["tio","tia","primo","prima","filho","filha"].map(key=>topicExpansion.byKey.get(key)!)};
type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
export function FamilyFlow({topic:requestedTopic,phase:requestedPhase,related:requestedRelated,renderRelated,onBack}:{topic?:string;phase?:string;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const topic:FamilyCardTopic=requestedTopic==="relatives"?"relatives":"close",phase=familyFlowPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/family")?requestedRelated:undefined;
  return <EnsureQueryScope><Flow topic={topic} phase={phase} related={related} renderRelated={renderRelated} onBack={onBack}/></EnsureQueryScope>;
}
function Flow({topic,phase,related,renderRelated,onBack}:{topic:FamilyCardTopic;phase:FamilyFlowPhase;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),plan=usePracticePlan(),heading=useRef<HTMLHeadingElement>(null),relatedRoot=useRef<HTMLDivElement>(null);
  const [closePractice,setClosePractice]=useState<"phrases"|"writing">("phrases");
  const open=(nextTopic:FamilyCardTopic,nextPhase:FamilyFlowPhase)=>{const href=familyFlowHref(nextTopic,nextPhase);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href.startsWith("/learning/")&&!href.startsWith("/learning/family"))navigate?.(familyFlowHref(topic,phase,href));else navigate?.(href);};
  useEffect(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start"});}},[topic,phase,related]);
  const index=familyFlowPhases.indexOf(phase);
  return <section className={styles.flow} aria-label="Моя семья и близкие: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(topic,phase)}>← К уроку «Моя семья и близкие»</button>{renderRelated(related,()=>open(topic,phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
      {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
      <h1>Моя семья и близкие</h1><p>Расскажите о близких или о вымышленной семье. Объяснение, нужные слова, готовые задания и ваши карточки — в одном уроке.</p>
      <nav className={styles.nav} aria-label="Разделы семьи">{topics.map(id=><LegacyLessonLink key={id} current={topic===id} href={familyFlowHref(id)}>{familyFlowTitles[id]}</LegacyLessonLink>)}</nav>
      <nav className={styles.nav} aria-label="Шаги семейного флоу">{familyFlowPhases.map((id,i)=><LegacyLessonLink key={id} current={phase===id} href={familyFlowHref(topic,id)}>{i+1} · {titles[id]}</LegacyLessonLink>)}</nav>
      <h2 ref={heading} tabIndex={-1}>{familyFlowTitles[topic]} · {titles[phase]}</h2>
      <div className={styles.nav}>{index>0&&<LegacyLessonLink href={familyFlowHref(topic,familyFlowPhases[index-1])}>← Назад</LegacyLessonLink>}{index<3?<LegacyLessonLink href={familyFlowHref(topic,familyFlowPhases[index+1])}>Дальше: {titles[familyFlowPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:topic==="close"?<LegacyLessonLink href={familyFlowHref("relatives")}>Следующий раздел: Родственники →</LegacyLessonLink>:<LegacyLessonLink href={familyFlowHref()}>Вернуться к началу →</LegacyLessonLink>}</div>
      <div hidden={topic!=="close"||phase!=="practice"}><nav className={styles.nav} aria-label="Виды семейных заданий"><button type="button" aria-pressed={closePractice==="phrases"} onClick={()=>setClosePractice("phrases")}>Фразы о близких</button><button type="button" aria-pressed={closePractice==="writing"} onClick={()=>setClosePractice("writing")}>Написать 6 слов</button></nav></div>
      <RelatedLearningNavigation value={renderRelated?openRelated:navigate}>
        <div hidden={topic!=="close"||!(phase==="explanation"||(phase==="practice"&&closePractice==="phrases"))}><FamilyLesson flowPhase={phase==="practice"?"practice":"explanation"} active={topic==="close"&&phase==="practice"&&closePractice==="phrases"&&!related} onNext={()=>open("close","review")}/></div>
        <div hidden={topic!=="relatives"||phase!=="explanation"}><FamilyExplanation topic="relatives"/></div>
      </RelatedLearningNavigation>
      {topics.map(id=><div key={`writing:${id}`} hidden={topic!==id||phase!=="practice"||(id==="close"&&closePractice!=="writing")}><VocabularyWriting words={wordSets[id]} title={familyFlowTitles[id]} active={topic===id&&phase==="practice"&&(id!=="close"||closePractice==="writing")&&!related}/></div>)}
      {topics.map(id=><div key={`words:${id}`} hidden={topic!==id||phase!=="words"}><FamilyCards topic={id} embedded/></div>)}
      {phase==="review"&&<><p>Только сохранённые карточки семьи, когда наступает срок. Просмотр шагов и сохранение слов не засчитывают задания.</p><StudyReview studyItemIds={familyStudyItemIds} embedded/><details><summary>Результаты заданий семьи</summary><ul>{[["usage:family","Фразы о близких"],["practice:words:expansion-family-close","Письмо: близкие"],["practice:words:expansion-family-relatives","Письмо: родственники"]].map(([id,title])=>{const result=learner?.learning.activities?.[id],completion=plan?.progress.completed[id];return <li key={id}>{title}: {result?`${result.correct} / ${result.total}`:completion?.revision===1?`пройдено${completion.needsReview?" · стоит повторить":""} (без сохранённого счёта)`:"результата пока нет"}</li>;})}</ul></details></>}
    </div>
  </section>;
}
