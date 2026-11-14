"use client";
import {useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {EnsureQueryScope} from "../../shared/query/SessionQueryBoundary";
import {homeFlowPhases,homeFlowHref,type HomeFlowPhase,type HomeFlowTopic} from "../content/home-flow";
import {homeCardTopics,homeCardTitles,homeStudyItemIds,homeRouteSources} from "../content/home-cards";
import {routeLessonExperiences} from "../content/first-vertical-slice/route-extension";
import {houseImageActivity} from "../content/house";
import {housePracticeBlocks,housePracticeWords,practiceWord} from "../content/house-practice";
import {HomeCards} from "../cards/saved-items/HomeCards";
import {StudyReview} from "../cards/study-review/StudyReview";
import {HomeExplanation} from "./HomeExplanation";
import {ActivityCompletion} from "./ActivityCompletion";
import {ImageMatchingExercise} from "./ImageMatchingExercise";
import {VocabularyCards} from "./VocabularyCards";
import {VocabularyWriting} from "./VocabularyWriting";
import {wordActivityId} from "./learning-rewards";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import styles from "./TimeDayFlow.module.css";
const phaseTitles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
const writing=housePracticeBlocks.slice(0,2).map(block=>({...block,words:block.words.map(practiceWord)}));
const results=[...homeRouteSources.map(source=>({id:source.id,title:source.title})),{id:"image:image-house",title:"Полная схема дома · 24 подписи"},...writing.map(block=>({id:wordActivityId("writing",block.words.map(word=>word.id)),title:`${block.title} · письмо ${block.words.length}`}))];
type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
export function HomeFlow({topic:requestedTopic,phase:requestedPhase,related:requestedRelated,renderRelated,onBack,legacyWords=false}:{topic?:string;phase?:string;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void;legacyWords?:boolean}){
  const topic=homeCardTopics.find(id=>id===requestedTopic)??"rooms",phase=homeFlowPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/home")?requestedRelated:undefined;
  return <EnsureQueryScope><Flow topic={topic} phase={phase} related={related} renderRelated={renderRelated} onBack={onBack} legacyWords={legacyWords}/></EnsureQueryScope>;
}
function Flow({topic,phase,related,renderRelated,onBack,legacyWords}:{topic:HomeFlowTopic;phase:HomeFlowPhase;related?:string;renderRelated?:RelatedRenderer;onBack?:()=>void;legacyWords?:boolean}){
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),heading=useRef<HTMLHeadingElement>(null),relatedRoot=useRef<HTMLDivElement>(null);
  const [expanded,setExpanded]=useState(false);
  const open=(nextTopic:HomeFlowTopic,nextPhase:HomeFlowPhase)=>{const href=homeFlowHref(nextTopic,nextPhase);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href==="/learning/house")open("rooms","explanation");else if(href==="/cards/house")open("rooms","words");else if(href.startsWith("/learning/")&&!href.startsWith("/learning/home"))navigate?.(homeFlowHref(topic,phase,href));else navigate?.(href);};
  useEffect(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start",behavior:"instant"});}},[topic,phase,related]);
  const index=homeFlowPhases.indexOf(phase),topicIndex=homeCardTopics.indexOf(topic);
  return <section className={styles.flow} aria-label="Дом и расположение: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(topic,phase)}>← К уроку «Дом и расположение»</button>{renderRelated(related,()=>open(topic,phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
      {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
      <h1>Дом и расположение</h1><p>Назовите комнаты и предметы, объясните, где они находятся. Результаты заданий и повторение карточек сохраняются отдельно.</p>
      <nav className={styles.nav} aria-label="Разделы дома">{homeCardTopics.map(id=><LegacyLessonLink key={id} current={topic===id} href={homeFlowHref(id)}>{homeCardTitles[id]}</LegacyLessonLink>)}</nav>
      <nav className={styles.nav} aria-label="Шаги флоу дома">{homeFlowPhases.map((id,i)=><LegacyLessonLink key={id} current={phase===id} href={homeFlowHref(topic,id)}>{i+1} · {phaseTitles[id]}</LegacyLessonLink>)}</nav>
      <h2 ref={heading} tabIndex={-1}>{homeCardTitles[topic]} · {phaseTitles[phase]}</h2>
      <div className={styles.nav}>{index>0&&<LegacyLessonLink href={homeFlowHref(topic,homeFlowPhases[index-1])}>← Назад</LegacyLessonLink>}{index<3?<LegacyLessonLink href={homeFlowHref(topic,homeFlowPhases[index+1])}>Дальше: {phaseTitles[homeFlowPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:topicIndex<2?<LegacyLessonLink href={homeFlowHref(homeCardTopics[topicIndex+1])}>Следующий раздел: {homeCardTitles[homeCardTopics[topicIndex+1]]} →</LegacyLessonLink>:<LegacyLessonLink href={homeFlowHref()}>Вернуться к началу →</LegacyLessonLink>}</div>
      <RelatedLearningNavigation value={renderRelated?openRelated:navigate}>
        {homeCardTopics.map(id=><div key={`explain:${id}`} hidden={topic!==id||phase!=="explanation"}><HomeExplanation topic={id}/></div>)}
        {phase==="explanation"&&<LegacyLessonLink href={topic==="location"?"/learning/practice?lesson=estar":"/learning/practice?lesson=ter"}>Связанная грамматика: {topic==="location"?"ESTAR":"TER"} →</LegacyLessonLink>}
        {homeCardTopics.map(id=><div key={`words:${id}`} hidden={topic!==id||phase!=="words"}><HomeCards topic={id} embedded/></div>)}
      </RelatedLearningNavigation>
      <div hidden={phase!=="words"||topic!=="rooms"}><details open={legacyWords||undefined}><summary>Слова полной схемы · 24 подписи</summary><p>Прежние подписи схемы. Личные карточки 6/7/5 выше сохраняются отдельно.</p><VocabularyCards words={houseImageActivity.wordIds.map(practiceWord)} active={phase==="words"&&topic==="rooms"&&!related}/></details></div>
      {homeCardTopics.map(id=><div key={`practice:${id}`} hidden={topic!==id||phase!=="practice"}><HomeRoutePractice topic={id} active={topic===id&&phase==="practice"&&!related}/></div>)}
      <div hidden={phase!=="practice"||topic==="location"}><button type="button" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>Дополнительные задания прежнего набора</button><div hidden={!expanded}>
        <p>Это расширенные прежние наборы, а не только карточки 6/7/5. Их результаты сохраняются под прежними ключами.</p>
        {writing.map((block,i)=><div key={block.id} hidden={topic!==(i===0?"rooms":"objects")}><h3>{block.title} · {block.words.length} слов</h3><VocabularyWriting words={block.words} title={block.title} active={expanded&&phase==="practice"&&topic===(i===0?"rooms":"objects")&&!related}/></div>)}
        <div hidden={topic!=="rooms"}><h3>Полная схема дома · 24 подписи</h3><p>Подписи не проверяют отношения «под» или «внутри» и не засчитываются просмотром шести комнат.</p><LegacyLessonLink href="/cards/house">Слова схемы →</LegacyLessonLink><ImageMatchingExercise definition={houseImageActivity} words={housePracticeWords} embedded/></div>
      </div></div>
      {phase==="review"&&<><p>Только сохранённые карточки 6/7/5 по сроку общего SRS. Нет общей оценки освоения дома по одному вопросу.</p><StudyReview studyItemIds={homeStudyItemIds} embedded/><details><summary>Результаты заданий дома</summary><ul>{results.map(({id,title})=>{const result=learner?.learning.activities?.[id];return <li key={id}>{title}: {result?`${result.correct} / ${result.total}`:"результата пока нет"}</li>;})}</ul></details></>}
    </div>
  </section>;
}
function HomeRoutePractice({topic,active}:{topic:HomeFlowTopic;active:boolean}){
  const source=homeRouteSources.find(source=>source.topic===topic)!,lesson=routeLessonExperiences.find(lesson=>lesson.id===source.id)!,activity=lesson.activity;
  const [selected,setSelected]=useState<string|null>(null),[checked,setChecked]=useState(false),answer=activity.options.find(option=>option.id===activity.correctOptionId)!;
  return <section aria-label={`Практика дома: ${topic}`}><p>{activity.prompt}</p>{activity.support&&<p>{activity.support}</p>}<div className="usage-options" aria-label="Варианты ответа">{activity.options.map(option=><button type="button" key={option.id} aria-pressed={selected===option.id} disabled={checked} onClick={()=>setSelected(option.id)}>{option.label}</button>)}</div>
    {!checked?<button type="button" disabled={!selected} onClick={()=>setChecked(true)}>Проверить</button>:<><p role="status">{selected===activity.correctOptionId?"Верно":"Посмотри на правильный вариант"} {answer.label}</p><ActivityCompletion id={lesson.id} title={lesson.title} group="Первые фразы" correct={selected===activity.correctOptionId?1:0} total={1} scoreLabel="Верно" record={active}/><button type="button" onClick={()=>{setSelected(null);setChecked(false);}}>Повторить вопрос</button></>}
  </section>;
}
