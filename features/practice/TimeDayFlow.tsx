"use client";
import {useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {EnsureQueryScope} from "../../shared/query/SessionQueryBoundary";
import {timeDayTopics,timeDayPhases,timeDayTitles,timeDayHref,timeDayWords,timeDaySources,timeDayStudyItemIds,timeDayActivityIds,type TimeDayTopic,type TimeDayPhase} from "../content/time-day";
import {learningCatalog} from "../content/learning-catalog";
import {StudyItemCardSave} from "../cards/saved-items/ReadingCardSave";
import {StudyReview} from "../cards/study-review/StudyReview";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {TestPreparation} from "./TestPreparation";
import {CalendarLesson} from "./CalendarLesson";
import {MyDayOverview} from "./MyDayOverview";
import {UsagePractice} from "./UsagePractice";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import styles from "./TimeDayFlow.module.css";

const monthLessons=["months-first","months-last"];
const phaseTitles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
const routine=learningCatalog.usageModules.find(module=>module.id==="usage:my-day")!;
type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
export function TimeDayFlow({topic:requestedTopic,phase:requestedPhase,onBack,related:requestedRelated,renderRelated}:{topic?:string;phase?:string;onBack?:()=>void;related?:string;renderRelated?:RelatedRenderer}){
  const topic=timeDayTopics.find(id=>id===requestedTopic)??"hours",phase=timeDayPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/time-day")?requestedRelated:undefined;
  return <EnsureQueryScope><Flow topic={topic} phase={phase} onBack={onBack} related={related} renderRelated={renderRelated}/></EnsureQueryScope>;
}
function Flow({topic,phase,onBack,related,renderRelated}:{topic:TimeDayTopic;phase:TimeDayPhase;onBack?:()=>void;related?:string;renderRelated?:RelatedRenderer}){
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),heading=useRef<HTMLHeadingElement>(null);
  const [monthPractice,setMonthPractice]=useState<"phrases"|"calendar">("phrases");
  const relatedRoot=useRef<HTMLDivElement>(null);
  const open=(nextTopic:TimeDayTopic,nextPhase:TimeDayPhase)=>{const href=timeDayHref(nextTopic,nextPhase);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href.startsWith("/learning/")&&!href.startsWith("/learning/time-day")){navigate?.(timeDayHref(topic,phase,href));}else navigate?.(href);};
  useEffect(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start"});}},[topic,phase,related]);
  const index=timeDayPhases.indexOf(phase),topicIndex=timeDayTopics.indexOf(topic);
  return <section className={styles.flow} aria-label="Время и мой день: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(topic,phase)}>← К уроку «Время и мой день»</button>{renderRelated(related,()=>open(topic,phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
    {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
    <h1>Время и мой день</h1><p>Назовите время, месяц и действия своего дня. Готовые объяснения и задания собраны по порядку; к любому шагу можно вернуться.</p>
    <nav className={styles.nav} aria-label="Разделы темы">{timeDayTopics.map(id=><LegacyLessonLink key={id} current={topic===id} href={timeDayHref(id)}>{timeDayTitles[id]}</LegacyLessonLink>)}</nav>
    <nav className={styles.nav} aria-label="Шаги урока">{timeDayPhases.map((id,i)=><LegacyLessonLink key={id} current={phase===id} href={timeDayHref(topic,id)}>{i+1} · {phaseTitles[id]}</LegacyLessonLink>)}</nav>
    <h2 ref={heading} tabIndex={-1}>{timeDayTitles[topic]} · {phaseTitles[phase]}</h2>
    <div className={styles.nav}>{index>0&&<LegacyLessonLink href={timeDayHref(topic,timeDayPhases[index-1])}>← Назад</LegacyLessonLink>}{index<3?<LegacyLessonLink href={timeDayHref(topic,timeDayPhases[index+1])}>Дальше: {phaseTitles[timeDayPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:topicIndex<2?<LegacyLessonLink href={timeDayHref(timeDayTopics[topicIndex+1])}>Следующий раздел: {timeDayTitles[timeDayTopics[topicIndex+1]]} →</LegacyLessonLink>:<LegacyLessonLink href={timeDayHref()}>Вернуться к началу →</LegacyLessonLink>}</div>
    <div hidden={topic!=="hours"||!(phase==="explanation"||phase==="practice")}><TestPreparation initialUnitId="hours" permanentTitle="Часы" flowPage={phase==="practice"?"practice":"theory"} onFlowPractice={()=>open("hours","practice")} active={topic==="hours"} onUnitChange={()=>{}} onBack={()=>{}} onOpen={()=>{}}/></div>
    <div hidden={topic!=="months"||phase!=="practice"}><nav className={styles.nav} aria-label="Виды заданий о месяцах"><button type="button" aria-pressed={monthPractice==="phrases"} onClick={()=>setMonthPractice("phrases")}>Месяцы во фразах</button><button type="button" aria-pressed={monthPractice==="calendar"} onClick={()=>setMonthPractice("calendar")}>Порядок и дни</button></nav></div>
    <div hidden={topic!=="months"||!(phase==="explanation"||phase==="practice")||(phase==="practice"&&monthPractice!=="phrases")}><CalendarLesson initialLessonId="months-first" lessonIds={monthLessons} flowView={phase==="practice"?"practice":"learn"} active={topic==="months"&&(phase==="explanation"||(phase==="practice"&&monthPractice==="phrases"))} onRoutine={()=>open("routine","explanation")}/></div>
    <div hidden={topic!=="months"||phase!=="practice"||monthPractice!=="calendar"}><TestPreparation initialUnitId="months" permanentTitle="Месяцы" flowPage="practice" active={topic==="months"&&phase==="practice"&&monthPractice==="calendar"} onUnitChange={()=>{}} onBack={()=>{}} onOpen={()=>{}}/></div>
    <div hidden={topic!=="routine"||phase!=="explanation"}><MyDayOverview onClock={()=>open("hours","practice")} onWords={()=>open("routine","words")} onPhrases={()=>open("routine","practice")}/></div>
    <div hidden={topic!=="routine"||phase!=="practice"}>{renderRelated?<RelatedLearningNavigation value={openRelated}><UsagePractice module={routine} active={topic==="routine"&&phase==="practice"&&!related} onComplete={()=>open("routine","review")} completionLabel="К повторению →"/></RelatedLearningNavigation>:<UsagePractice module={routine} active={topic==="routine"&&phase==="practice"} onComplete={()=>open("routine","review")} completionLabel="К повторению →"/>}</div>
    {timeDayTopics.map(id=><div key={id} hidden={topic!==id||phase!=="words"}><p>Выберите нужные карточки. Добавление сохраняет источник этого урока; знакомая карточка сохраняет прежнее расписание.</p><div className={styles.words}>{timeDayWords.filter(word=>word.topic===id).map(word=><article key={word.wordId}><strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p><CardSpeechButton text={word.pt} disabled={topic!==id||phase!=="words"}/><StudyItemCardSave choice={word} source={timeDaySources.find(source=>source.id===`lesson:time-day:${id}`)!}/></article>)}</div></div>)}
    {phase==="review"&&<><p>Повторяются только сохранённые карточки темы «Время и мой день», когда наступает срок. Просмотр объяснения и переход по шагам не засчитывают задание.</p><StudyReview studyItemIds={timeDayStudyItemIds} embedded/><details><summary>Результаты готовых заданий</summary><p>Результаты разных заданий сохраняются отдельно.</p><ul>{timeDayActivityIds.map(id=>{const result=learner?.learning.activities?.[id];return <li key={id}>{result?`${result.title}: ${result.correct} / ${result.total}`:`${activityTitle(id)}: результата пока нет`}</li>;})}</ul></details></>}
    </div>
  </section>;
}
function activityTitle(id:string){return ({"prep:hours":"Часы и сутки","clock:read":"Назови время","clock:set":"Выставь стрелки","prep:months":"Месяцы и дни","prep:months:order":"Месяцы по порядку","prep:months:days":"Месяцы с 31 днём","usage:calendar:months-first":"Первая половина года","usage:calendar:months-last":"Вторая половина года","usage:my-day":"Фразы о распорядке"} as Record<string,string>)[id];}
