"use client";
import {useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {EnsureQueryScope} from "../../shared/query/SessionQueryBoundary";
import {foodFlowTopics,foodFlowPhases,foodFlowTitles,foodFlowHref,type FoodFlowPhase} from "../content/food-flow";
import {foodProductWords,foodStudyItemIds,type FoodCardTopic} from "../content/food-cards";
import {topicExpansion} from "../content/vocabulary-catalog";
import {learningCatalog} from "../content/learning-catalog";
import {FoodCards} from "../cards/saved-items/FoodCards";
import {StudyReview} from "../cards/study-review/StudyReview";
import {FoodExplanation} from "./FoodExplanation";
import {EverydayLesson} from "./EverydayLesson";
import {UsagePractice} from "./UsagePractice";
import {VocabularyWriting} from "./VocabularyWriting";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import {usePracticePlan} from "./plan/PracticePlanContext";
import styles from "./TimeDayFlow.module.css";

const titles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
const writingTopics=["fruit","meals"] as const;
const wordSets=Object.fromEntries(writingTopics.map(topic=>[topic,foodProductWords.filter(word=>word.topic===topic).map(word=>topicExpansion.byKey.get(word.key)!)]));
const usage=learningCatalog.usageModules.find(module=>module.id==="usage:food-likes")!;
const results=[["practice:words:expansion-food-fruit","Письмо: фрукты"],["practice:words:expansion-food-meals","Письмо: продукты"],["practice:everyday:likes","GOSTAR DE"],["usage:food-likes","Продукты во фразах"]];
type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
export function FoodFlow({topic:requestedTopic,phase:requestedPhase,related:requestedRelated,renderRelated,onBack}:{topic?:string;phase?:string;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const topic=foodFlowTopics.find(id=>id===requestedTopic)??"fruit",phase=foodFlowPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/food")?requestedRelated:undefined;
  return <EnsureQueryScope><Flow topic={topic} phase={phase} related={related} renderRelated={renderRelated} onBack={onBack}/></EnsureQueryScope>;
}
function Flow({topic,phase,related,renderRelated,onBack}:{topic:FoodCardTopic;phase:FoodFlowPhase;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void}){
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),plan=usePracticePlan(),heading=useRef<HTMLHeadingElement>(null),relatedRoot=useRef<HTMLDivElement>(null);
  const [practice,setPractice]=useState<"check"|"phrases">("check");
  const open=(nextTopic:FoodCardTopic,nextPhase:FoodFlowPhase)=>{const href=foodFlowHref(nextTopic,nextPhase);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href==="/learning/everyday/likes")open("preferences","explanation");else if(href.startsWith("/learning/")&&!href.startsWith("/learning/food"))navigate?.(foodFlowHref(topic,phase,href));else navigate?.(href);};
  useEffect(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start"});}},[topic,phase,related]);
  const index=foodFlowPhases.indexOf(phase),topicIndex=foodFlowTopics.indexOf(topic);
  return <section className={styles.flow} aria-label="Еда и предпочтения: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(topic,phase)}>← К уроку «Еда и предпочтения»</button>{renderRelated(related,()=>open(topic,phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
      {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
      <h1>Еда и предпочтения</h1><p>Узнайте продукты, расскажите о предпочтениях и повторите выбранные карточки. Результаты разных заданий сохраняются отдельно.</p>
      <nav className={styles.nav} aria-label="Разделы еды">{foodFlowTopics.map(id=><LegacyLessonLink key={id} current={topic===id} href={foodFlowHref(id)}>{foodFlowTitles[id]}</LegacyLessonLink>)}</nav>
      <nav className={styles.nav} aria-label="Шаги флоу еды">{foodFlowPhases.map((id,i)=><LegacyLessonLink key={id} current={phase===id} href={foodFlowHref(topic,id)}>{i+1} · {titles[id]}</LegacyLessonLink>)}</nav>
      <h2 ref={heading} tabIndex={-1}>{foodFlowTitles[topic]} · {titles[phase]}</h2>
      <div className={styles.nav}>{index>0&&<LegacyLessonLink href={foodFlowHref(topic,foodFlowPhases[index-1])}>← Назад</LegacyLessonLink>}{index<3?<LegacyLessonLink href={foodFlowHref(topic,foodFlowPhases[index+1])}>Дальше: {titles[foodFlowPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:topicIndex<2?<LegacyLessonLink href={foodFlowHref(foodFlowTopics[topicIndex+1])}>Следующий раздел: {foodFlowTitles[foodFlowTopics[topicIndex+1]]} →</LegacyLessonLink>:<LegacyLessonLink href={foodFlowHref()}>Вернуться к началу →</LegacyLessonLink>}</div>
      <RelatedLearningNavigation value={renderRelated?openRelated:navigate}>
        {writingTopics.map(id=><div key={`explain:${id}`} hidden={topic!==id||phase!=="explanation"}><FoodExplanation topic={id}/></div>)}
        <div hidden={topic!=="preferences"||phase!=="practice"}><nav className={styles.nav} aria-label="Виды заданий предпочтений"><button type="button" aria-pressed={practice==="check"} onClick={()=>setPractice("check")}>GOSTAR DE · 5 заданий</button><button type="button" aria-pressed={practice==="phrases"} onClick={()=>setPractice("phrases")}>Продукты во фразах · 2 задания</button></nav></div>
        <div hidden={topic!=="preferences"||!(phase==="explanation"||(phase==="practice"&&practice==="check"))}><EverydayLesson lessonId="likes" flowMode={phase==="practice"?"check":"learn"} onPractice={()=>{setPractice("check");open("preferences","practice");}} onLearn={()=>open("preferences","explanation")} onComplete={()=>open("preferences","review")}/></div>
        <div hidden={topic!=="preferences"||phase!=="explanation"}><LegacyLessonLink href="/learning/practice?lesson=present-ar">Настоящее время -AR: объяснение и практика →</LegacyLessonLink></div>
        <div hidden={topic!=="preferences"||phase!=="practice"||practice!=="phrases"}><UsagePractice module={usage} compact active={topic==="preferences"&&phase==="practice"&&practice==="phrases"&&!related} onComplete={()=>open("preferences","review")} completionLabel="К повторению →"/></div>
        {foodFlowTopics.map(id=><div key={`words:${id}`} hidden={topic!==id||phase!=="words"}><FoodCards topic={id} embedded/></div>)}
      </RelatedLearningNavigation>
      {writingTopics.map(id=><div key={`write:${id}`} hidden={topic!==id||phase!=="practice"}><VocabularyWriting words={wordSets[id]} title={foodFlowTitles[id]} active={topic===id&&phase==="practice"&&!related}/><LegacyLessonLink href={foodFlowHref(id,"review")}>К повторению карточек →</LegacyLessonLink></div>)}
      {phase==="review"&&<><p>Повторяются только сохранённые карточки еды и gostar de, когда наступает срок. Просмотр и сохранение слов не засчитывают задания.</p><StudyReview studyItemIds={foodStudyItemIds} embedded/><details><summary>Результаты заданий еды</summary><ul>{results.map(([id,title])=>{const result=learner?.learning.activities?.[id],completion=plan?.progress.completed[id];return <li key={id}>{title}: {result?`${result.correct} / ${result.total}`:completion?.revision===1?`пройдено${completion.needsReview?" · стоит повторить":""} (без сохранённого счёта)`:"результата пока нет"}</li>;})}</ul></details></>}
    </div>
  </section>;
}
