"use client";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {EnsureQueryScope,useQueryScope} from "@/shared/query/SessionQueryBoundary";
import {learningProgressOptions} from "../query/queries";
import {usePracticePlan} from "../../practice/plan/PracticePlanContext";
import {isPracticeStepComplete} from "../../practice/plan/model";
import {shortGrammarLessons} from "../../content/short-grammar-lessons";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {generalPlanBlocks,generalPlanUnits,generalPlanSummary,bookState,bookPassed,planStepHref,supplementalSteps,extraUnitLinks} from "./model";
import {wordBatchHref} from "../gramatica/first-units";
import {schoolPlanGroups,schoolLessonHref} from "./school-plan";
import styles from "./GeneralPlan.module.css";
import {navigationTopic,topicWordsHref} from "../../content/topic-navigation";
import {useProfileLearning} from "../../practice/profile-learning";
import {AdultGeneralPlan} from "./AdultGeneralPlan";

const everyday=[
  {...navigationTopic("topic:work")!,steps:[]},
  {...navigationTopic("topic:city")!,steps:[]},
  {...navigationTopic("foundation:hello")!,steps:[]},
  {...navigationTopic("topic:vocabulary-clothing")!,steps:[]},
  {...navigationTopic("topic:vocabulary-house")!,steps:[]},
  {...navigationTopic("topic:vocabulary-family")!,steps:supplementalSteps.filter(s=>(navigationTopic("topic:vocabulary-family")!.supplementalStepIds as readonly string[]).includes(s.id))},
  {...navigationTopic("topic:food")!,steps:supplementalSteps.filter(s=>(navigationTopic("topic:food")!.supplementalStepIds as readonly string[]).includes(s.id))},
  {...navigationTopic("topic:vocabulary-body")!,steps:supplementalSteps.filter(s=>(navigationTopic("topic:vocabulary-body")!.supplementalStepIds as readonly string[]).includes(s.id))},
  {...navigationTopic("topic:vocabulary-calendar")!,steps:[]},
];
export function GeneralPlan({practiceOnly=false,initialBlock}:{practiceOnly?:boolean;initialBlock?:string}){const profile=useProfileLearning()?.profile;return <EnsureQueryScope>{profile&&!profile.child?<AdultGeneralPlan key={profile.id} practiceOnly={practiceOnly} initialBlock={initialBlock}/>:<Plan practiceOnly={practiceOnly}/>}</EnsureQueryScope>;}
function Plan({practiceOnly}:{practiceOnly:boolean}){
  const child=useProfileLearning()?.profile.child??false;
  const everydayTopics=everyday.filter(topic=>!child||!["topic:vocabulary-clothing","foundation:hello","topic:city","topic:work"].includes(topic.id));
  const scope=useQueryScope(),practice=usePracticePlan();
  const query=useQuery({...learningProgressOptions(scope.scopeKey),enabled:!practiceOnly&&!scope.blocked,staleTime:0,refetchOnMount:"always"});
  const [filter,setFilter]=useState<"all"|"active"|"done"|"review">("all");
  const state=generalPlanSummary(query.data??[],practice?.progress);
  const known=!practiceOnly&&!!query.data&&!query.isError&&!scope.blocked;
  const matches=(unit:typeof generalPlanUnits[number])=>filter==="all"||(known&&unit.lesson&&(filter==="done"?bookPassed(state.rowById.get(unit.lesson.id)):bookState(unit.lesson,state.rowById.get(unit.lesson.id))===filter));
  return <section className={styles.plan} aria-label="Общий план обучения">
    <header className={styles.intro} data-ui-surface><h1 tabIndex={-1}>Общий план</h1>{known&&<div><small>По книге · {state.done.length}/{state.ready.length}</small><progress aria-label="Пройденные проверки книги" value={state.done.length} max={state.ready.length}/></div>}</header>
    {known&&<article className={styles.continue}><span>{bookState(state.next.lesson,state.rowById.get(state.next.lesson.id))==="active"?"Продолжить начатое":"Следующая тема по книге"}</span><h2>U{String(state.next.unit).padStart(2,"0")} · {state.next.title}</h2><LegacyLessonLink className={styles.primary} href={`/learning/gramatica-ativa/${state.next.lesson.slug}`}>{bookState(state.next.lesson,state.rowById.get(state.next.lesson.id))==="active"?"Продолжить урок →":"Начать проверку →"}</LegacyLessonLink><LegacyLessonLink className={styles.secondary} href={`/learning/gramatica-ativa/${state.next.lesson.slug}/explanation`}>Сначала прочитать объяснение →</LegacyLessonLink></article>}
    {!practiceOnly&&query.isFetching&&<p role="status">Обновляем прогресс…</p>}
    {!practiceOnly&&(query.isError||scope.blocked)&&<div role="alert"><p>Не удалось загрузить прогресс книги. Сохранения не изменены; уроки можно открыть ниже.</p><button type="button" onClick={()=>scope.blocked?scope.retryAccess():void query.refetch()}>Повторить загрузку прогресса</button></div>}
    <details className={styles.section}><summary><strong>Курс по книге</strong><span>54 темы</span></summary><div className={styles.content}>
      <p>Gramática Ativa 1 · {known?`${state.done.length} из ${state.ready.length} проверок книги пройдено`:"Прогресс не загружен"}</p>
      <div className={styles.filters} role="group" aria-label="Показать темы">{([['all','Все'],['active','В процессе'],['done','Пройдено'],['review','Повторить']] as const).map(([value,label])=><button key={value} type="button" disabled={value!=="all"&&!known} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
      {generalPlanBlocks.map(block=>{
        const units=generalPlanUnits.filter(unit=>unit.unit>=block.from&&unit.unit<=block.to).filter(matches);
        if(!units.length)return null;
        return <details className={styles.block} key={`${block.from}:${filter}`} open={filter!=="all"}><summary><strong>U{String(block.from).padStart(2,"0")}–U{block.to} · {block.title}</strong><span>{units.length} тем</span></summary><ol>{units.map(unit=>{
          const status=unit.lesson&&known?bookState(unit.lesson,state.rowById.get(unit.lesson.id)):undefined;
          const label=!unit.lesson?"Только слова":!known?"Прогресс не загружен":status==="done"?"✓ Пройдено":status==="active"?"В процессе":status==="review"?"Повторить":"Не начато";
          return <li key={unit.unit}><details className={styles.unit}><summary><span className={styles.unitHeading}><span className={styles.number}>U{String(unit.unit).padStart(2,"0")}</span><span><strong>{unit.title}</strong><small>{label}</small></span></span></summary><div className={styles.content}>
            <p>{!unit.lesson?"Объяснение и задания готовятся · слова доступны":status==="active"&&bookPassed(state.rowById.get(unit.lesson.id))?"Повторение в процессе · проверка ранее пройдена":"Объяснение, слова и проверка по книге"}</p>
            <nav className={styles.links} aria-label={`Материалы U${String(unit.unit).padStart(2,"0")}`}><LegacyLessonLink href={wordBatchHref(unit.unit)}>Разобрать слова U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink>{unit.lesson&&<><LegacyLessonLink href={`/learning/gramatica-ativa/${unit.lesson.slug}/explanation`}>Объяснение U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink><LegacyLessonLink href={`/learning/gramatica-ativa/${unit.lesson.slug}`}>{status==="active"?"Продолжить проверку":status==="done"||status==="review"?"Повторить проверку":"Проверить себя"} U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink></>}</nav>
            {unit.shortLessonIds.map(id=>{const short=shortGrammarLessons.find(lesson=>lesson.id===id)!;const completed=practice?.progress.completed[`practice:grammar:${id}`];return <div className={styles.related} key={id}><LegacyLessonLink href={`/learning/practice?lesson=${id}`}>Короткий урок: {short.title} →</LegacyLessonLink><small>{completed?.revision===1?completed.needsReview?"Короткая практика пройдена · стоит повторить":"✓ Короткая практика пройдена":"Дополнительное объяснение и тренировка"}</small></div>;})}
            {extraUnitLinks(unit).map(link=><div className={styles.related} key={link.href}><LegacyLessonLink href={link.href}>{link.title} →</LegacyLessonLink></div>)}
          </div></details></li>;
        })}</ol></details>;
      })}
      {filter!=="all"&&!generalPlanUnits.some(matches)&&<p>Таких тем пока нет.</p>}
      <LegacyLessonLink href="/learning/gramatica-ativa/review-foundations">Смешанное повторение U01–U11 →</LegacyLessonLink>
      <details className={styles.info}><summary>О курсе и отметках</summary><p>Готовы объяснения и задания U01–U30; слова доступны для всех 54 тем. Короткая практика и проверка по книге отмечаются отдельно.</p></details>
    </div></details>
    <details className={styles.section}><summary><strong>Повседневные темы</strong><span>{everydayTopics.length} тем</span></summary><div className={styles.content}>
      {everydayTopics.map(topic=><details className={styles.block} key={topic.href}><summary><strong>{topic.title}</strong></summary><div className={styles.content}><LegacyLessonLink href={topic.href}>Открыть урок: {topic.title} →</LegacyLessonLink>{topic.steps.map(step=>{const done=practice&&isPracticeStepComplete(practice.progress,step);return <div className={styles.related} key={step.id}><LegacyLessonLink href={planStepHref(step.id)}>{step.title} →</LegacyLessonLink><small>{done?practice.progress.completed[step.id].needsReview?"Пройдено · повторить":"✓ Пройдено":`${step.minutes} минут`}</small></div>;})}</div></details>)}
      <small>Дополнительные занятия: {state.supplementalDone.length} из {supplementalSteps.length} пройдено.</small>
    </div></details>
    <details className={styles.section}><summary><strong>Буквы и школьные темы</strong><span>20 уроков</span></summary><div className={styles.content}>{schoolPlanGroups.map(group=><details className={styles.block} key={group.title}><summary><strong>{group.title}</strong><span>{group.units.length}</span></summary>{(group.topic?.id==="topic:reading"||group.topic?.id==="topic:vocabulary-cooperation")&&<nav className={styles.links} aria-label={`Материалы: ${group.topic.title}`} >{group.units.length>1&&<LegacyLessonLink href={group.topic.href}>Открыть раздел: {group.topic.title} →</LegacyLessonLink>}<LegacyLessonLink href={topicWordsHref(group.topic.id)}>Учить слова: {group.topic.title} →</LegacyLessonLink></nav>}<nav className={styles.links} aria-label={group.title}>{group.units.map(unit=><LegacyLessonLink key={unit.id} href={schoolLessonHref(unit.id)}>{unit.title[1]} →</LegacyLessonLink>)}</nav></details>)}</div></details>
    <LegacyLessonLink className={styles.wordsEntry} href="/learning/plan/words"><strong>Слова и повторение</strong><span aria-hidden="true">→</span></LegacyLessonLink>
    <footer className={styles.footer}><LegacyLessonLink href="/learning/topics">Все темы и свободная практика →</LegacyLessonLink></footer>
  </section>;
}
