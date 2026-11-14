"use client";
import {useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {EnsureQueryScope} from "../../shared/query/SessionQueryBoundary";
import {bodyFlowPhases,bodyFlowHref,type BodyFlowPhase} from "../content/body-flow";
import {bodyCardTopics,bodyCardTitles,bodyCardWords,bodyStudyItemIds,type BodyCardTopic} from "../content/body-cards";
import {topicExpansion} from "../content/vocabulary-catalog";
import {learningCatalog} from "../content/learning-catalog";
import {BodyCards} from "../cards/saved-items/BodyCards";
import {StudyReview} from "../cards/study-review/StudyReview";
import {BodyExplanation,BodyReadingContent} from "./BodyExplanation";
import {EverydayLesson} from "./EverydayLesson";
import {FeelingsLesson} from "./FeelingsLesson";
import {UsagePractice} from "./UsagePractice";
import {VocabularyWriting} from "./VocabularyWriting";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import {usePracticePlan} from "./plan/PracticePlanContext";
import styles from "./TimeDayFlow.module.css";
const titles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
const writingTopics=["face","movement"] as const;
const wordSets=Object.fromEntries(writingTopics.map(topic=>[topic,bodyCardWords.filter(word=>word.topic===topic).map(word=>topicExpansion.byKey.get(word.key)!)]));
const usage=learningCatalog.usageModules.find(module=>module.id==="usage:body-actions")!;
const results=[["practice:words:expansion-body-face","Письмо: лицо и руки"],["practice:words:expansion-body-movement","Письмо: тело и движение"],["practice:everyday:body","Части тела и действия"],["usage:body-actions","Две фразы COM"]];
type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
export function BodyFlow({topic:requestedTopic,phase:requestedPhase,related:requestedRelated,renderRelated,onBack}:{topic?:string;phase?:string;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const topic=bodyCardTopics.find(id=>id===requestedTopic)??"face",phase=bodyFlowPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/body")?requestedRelated:undefined;
  return <EnsureQueryScope><Flow topic={topic} phase={phase} related={related} renderRelated={renderRelated} onBack={onBack}/></EnsureQueryScope>;
}
function Flow({topic,phase,related,renderRelated,onBack}:{topic:BodyCardTopic;phase:BodyFlowPhase;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),plan=usePracticePlan(),heading=useRef<HTMLHeadingElement>(null),relatedRoot=useRef<HTMLDivElement>(null);
  const [practice,setPractice]=useState<"writing"|"check"|"phrases">("writing");
  const open=(nextTopic:BodyCardTopic,nextPhase:BodyFlowPhase)=>{const href=bodyFlowHref(nextTopic,nextPhase);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href==="/learning/everyday/body")open("face","explanation");else if(href.startsWith("/learning/")&&!href.startsWith("/learning/body"))navigate?.(bodyFlowHref(topic,phase,href));else navigate?.(href);};
  useEffect(()=>{const frame=requestAnimationFrame(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start",behavior:"instant"});}});return()=>cancelAnimationFrame(frame);},[topic,phase,related]);
  const index=bodyFlowPhases.indexOf(phase),topicIndex=bodyCardTopics.indexOf(topic);
  return <section className={styles.flow} aria-label="Тело и самочувствие: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(topic,phase)}>← К уроку «Тело и самочувствие»</button>{renderRelated(related,()=>open(topic,phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
      {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
      <h1>Тело и самочувствие</h1><p>Назовите части тела, расскажите о состоянии и повторите выбранные карточки.</p>
      <nav className={styles.nav} aria-label="Разделы тела и самочувствия">{bodyCardTopics.map(id=><LegacyLessonLink key={id} current={topic===id} href={bodyFlowHref(id)}>{bodyCardTitles[id]}</LegacyLessonLink>)}</nav>
      <nav className={styles.nav} aria-label="Шаги флоу тела">{bodyFlowPhases.map((id,i)=><LegacyLessonLink key={id} current={phase===id} href={bodyFlowHref(topic,id)}>{i+1} · {titles[id]}</LegacyLessonLink>)}</nav>
      <h2 ref={heading} tabIndex={-1}>{bodyCardTitles[topic]} · {titles[phase]}</h2>
      <div className={styles.nav}>{index>0&&<LegacyLessonLink href={bodyFlowHref(topic,bodyFlowPhases[index-1])}>← Назад</LegacyLessonLink>}{index<3?<LegacyLessonLink href={bodyFlowHref(topic,bodyFlowPhases[index+1])}>Дальше: {titles[bodyFlowPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:topicIndex<2?<LegacyLessonLink href={bodyFlowHref(bodyCardTopics[topicIndex+1])}>Следующий раздел: {bodyCardTitles[bodyCardTopics[topicIndex+1]]} →</LegacyLessonLink>:<LegacyLessonLink href={bodyFlowHref()}>Вернуться к началу →</LegacyLessonLink>}</div>
      <RelatedLearningNavigation value={renderRelated?openRelated:navigate}>
        <div hidden={topic!=="movement"||phase!=="explanation"}><BodyExplanation topic="movement"/></div>
        <div hidden={topic!=="face"||phase!=="practice"}><nav className={styles.nav} aria-label="Виды заданий тела"><button type="button" aria-pressed={practice==="writing"} onClick={()=>setPractice("writing")}>Письмо · 8 слов</button><button type="button" aria-pressed={practice==="check"} onClick={()=>setPractice("check")}>Части тела и действия · 6 заданий</button><button type="button" aria-pressed={practice==="phrases"} onClick={()=>setPractice("phrases")}>Фразы COM · 2 задания</button></nav></div>
        <div hidden={topic!=="face"||!(phase==="explanation"||(phase==="practice"&&practice==="check"))}><EverydayLesson lessonId="body" readingIntroduction={<BodyReadingContent topic="face"/>} flowMode={phase==="practice"?"check":"learn"} onPractice={()=>{setPractice("check");open("face","practice");}} onLearn={()=>open("face","explanation")} onComplete={()=>open("face","review")}/></div>
        <div hidden={topic!=="face"||phase!=="practice"||practice!=="phrases"}><UsagePractice module={usage} compact active={topic==="face"&&phase==="practice"&&practice==="phrases"&&!related} onComplete={()=>open("face","review")} completionLabel="К повторению →"/></div>
        {writingTopics.map(id=><div key={`words:${id}`} hidden={topic!==id||phase!=="words"}><BodyCards topic={id} embedded/></div>)}
        <div hidden={topic!=="feelings"}><FeelingsLesson flowPhase={phase==="explanation"?"examples":phase} active={topic==="feelings"&&!related} onFlowPhase={next=>open("feelings",next==="examples"?"explanation":next)} renderWords={(onViewed,viewed)=><BodyCards topic="feelings" embedded onViewed={onViewed} viewed={viewed}/>} explanation={<BodyExplanation topic="feelings"/>} onCardReview={()=>open("feelings","review")}/></div>
      </RelatedLearningNavigation>
      {writingTopics.map(id=><div key={`write:${id}`} hidden={topic!==id||phase!=="practice"||(id==="face"&&practice!=="writing")}><VocabularyWriting words={wordSets[id]} title={bodyCardTitles[id]} active={topic===id&&phase==="practice"&&!related&&(id!=="face"||practice==="writing")}/><LegacyLessonLink href={bodyFlowHref(id,"review")}>К повторению карточек →</LegacyLessonLink></div>)}
      {phase==="review"&&<><p>Здесь повторяются сохранённые карточки всех трёх пачек по сроку SRS. Повтор фраз без примеров — отдельное упражнение, его отметка не меняет расписание карточек.</p><StudyReview studyItemIds={bodyStudyItemIds} embedded/><details><summary>Результаты заданий тела</summary><ul>{results.map(([id,title])=>{const result=learner?.learning.activities?.[id],completion=plan?.progress.completed[id];return <li key={id}>{title}: {result?`${result.correct} / ${result.total}`:completion?.revision===1?`пройдено${completion.needsReview?" · стоит повторить":""} (без сохранённого счёта)`:"результата пока нет"}</li>;})}</ul></details></>}
      <p><LegacyLessonLink href="/learning/topics">Все темы: схемы тела и школьные материалы →</LegacyLessonLink></p>
    </div>
  </section>;
}
