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
import styles from "./GeneralPlan.module.css";

export function GeneralPlan({practiceOnly=false}:{practiceOnly?:boolean}){return <EnsureQueryScope><Plan practiceOnly={practiceOnly}/></EnsureQueryScope>;}
function Plan({practiceOnly}:{practiceOnly:boolean}){
  const scope=useQueryScope(),practice=usePracticePlan();
  const query=useQuery({...learningProgressOptions(scope.scopeKey),enabled:!practiceOnly&&!scope.blocked,staleTime:0,refetchOnMount:"always"});
  const [filter,setFilter]=useState<"all"|"active"|"done"|"review">("all");
  const state=generalPlanSummary(query.data??[],practice?.progress);
  const known=!practiceOnly&&!!query.data&&!query.isError&&!scope.blocked;
  const matches=(unit:typeof generalPlanUnits[number])=>filter==="all"||(known&&unit.lesson&&(filter==="done"?bookPassed(state.rowById.get(unit.lesson.id)):bookState(unit.lesson,state.rowById.get(unit.lesson.id))===filter));
  return <section className={styles.plan} aria-label="Общий план обучения">
    <header className={styles.intro}><span className="tempo-kicker">Португальский · единый маршрут</span><h1 tabIndex={-1}>Общий план</h1><p>Книга, объяснения, тренировка и слова — в одном месте. Возвращайтесь сюда из любого занятия.</p>
      {known&&<><strong>{state.done.length} из {state.ready.length} проверок книги пройдено</strong><progress aria-label="Пройденные проверки книги" value={state.done.length} max={state.ready.length}/></>}
      <small>В книге 54 темы. Готовы объяснения и задания U01–U30; слова доступны для всех 54 тем.</small>
    </header>
    {!practiceOnly&&query.isFetching&&<p role="status">Обновляем прогресс…</p>}
    {!practiceOnly&&(query.isError||scope.blocked)&&<div role="alert"><p>Не удалось загрузить прогресс книги. Сохранения не изменены; уроки можно открыть по ссылкам.</p><button type="button" onClick={()=>scope.blocked?scope.retryAccess():void query.refetch()}>Повторить загрузку прогресса</button></div>}
    {known&&<article className={styles.continue}><span>{bookState(state.next.lesson,state.rowById.get(state.next.lesson.id))==="active"?"Продолжить начатое":"Следующая тема"}</span><h2>U{String(state.next.unit).padStart(2,"0")} · {state.next.title}</h2><LegacyLessonLink href={`/learning/gramatica-ativa/${state.next.lesson.slug}`}>{bookState(state.next.lesson,state.rowById.get(state.next.lesson.id))==="active"?"Продолжить урок →":"Начать проверку →"}</LegacyLessonLink><LegacyLessonLink href={`/learning/gramatica-ativa/${state.next.lesson.slug}/explanation`}>Сначала прочитать объяснение →</LegacyLessonLink></article>}
    <nav className={styles.tools} aria-label="Материалы общего плана"><LegacyLessonLink href="/learning/gramatica-ativa/saved">Мои карточки из уроков</LegacyLessonLink><LegacyLessonLink href="/learning/gramatica-ativa/review">Интервальное повторение</LegacyLessonLink><LegacyLessonLink href="/learning/gramatica-ativa/review-foundations">Смешанное повторение U01–U11</LegacyLessonLink></nav>
    <h2>Темы по порядку · Gramática Ativa 1</h2><p>Короткая практика и проверка по книге отмечаются отдельно: знакомое объяснение помогает повторить тему, а результат проверки показывает её освоение.</p>
    <div className={styles.filters} role="group" aria-label="Показать темы">{([['all','Все'],['active','В процессе'],['done','Пройдено'],['review','Повторить']] as const).map(([value,label])=><button key={value} type="button" disabled={value!=="all"&&!known} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
    {generalPlanBlocks.map(block=>{
      const units=generalPlanUnits.filter(unit=>unit.unit>=block.from&&unit.unit<=block.to).filter(matches);
      if(!units.length)return null;
      return <details className={styles.block} key={block.from} open={filter!=="all"||(state.next.unit>=block.from&&state.next.unit<=block.to)}><summary><strong>U{String(block.from).padStart(2,"0")}–U{block.to} · {block.title}</strong><span>{units.length} тем</span></summary><ol>{units.map(unit=>{
        const status=unit.lesson&&known?bookState(unit.lesson,state.rowById.get(unit.lesson.id)):undefined;
        return <li key={unit.unit}><div className={styles.unitHeading}><span className={styles.number}>U{String(unit.unit).padStart(2,"0")}</span><h3>{unit.title}</h3></div><p>{!unit.lesson?"Объяснение и задания готовятся · слова доступны":!known?"Прогресс не загружен":status==="done"?"✓ Проверка по книге пройдена":status==="active"?bookPassed(state.rowById.get(unit.lesson.id))?"Повторение в процессе · проверка ранее пройдена":"В процессе · можно продолжить":status==="review"?"Проверка завершена · стоит повторить":"Проверка по книге ещё не пройдена"}</p>
          <div className={styles.links}><LegacyLessonLink href={wordBatchHref(unit.unit)}>Разобрать слова U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink>{unit.lesson&&<><LegacyLessonLink href={`/learning/gramatica-ativa/${unit.lesson.slug}/explanation`}>Объяснение U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink><LegacyLessonLink href={`/learning/gramatica-ativa/${unit.lesson.slug}`}>{status==="active"?"Продолжить проверку":status==="done"||status==="review"?"Повторить проверку":"Проверить себя"} U{String(unit.unit).padStart(2,"0")} →</LegacyLessonLink></>}</div>
          {unit.shortLessonIds.map(id=>{const short=shortGrammarLessons.find(lesson=>lesson.id===id)!;const completed=practice?.progress.completed[`practice:grammar:${id}`];return <div className={styles.related} key={id}><LegacyLessonLink href={`/learning/practice?lesson=${id}`}>Короткий урок: {short.title} →</LegacyLessonLink><small>{completed?.revision===1?completed.needsReview?"Короткая практика пройдена · стоит повторить":"✓ Короткая практика пройдена":"Дополнительное объяснение и тренировка"}</small></div>;})}
          {extraUnitLinks(unit).map(link=><div className={styles.related} key={link.href}><LegacyLessonLink href={link.href}>{link.title} →</LegacyLessonLink></div>)}
        </li>;
      })}</ol></details>;
    })}
    {filter!=="all"&&!generalPlanUnits.some(matches)&&<p>Таких тем пока нет.</p>}
    <h2>Слова и повседневные ситуации</h2><p>Дополнительные занятия: {state.supplementalDone.length} из {supplementalSteps.length} пройдено. Прежние результаты сохранены.</p>
    <ul className={styles.supplements}>{supplementalSteps.map(step=>{const done=practice&&isPracticeStepComplete(practice.progress,step);return <li key={step.id}><LegacyLessonLink href={planStepHref(step.id)}>{step.title} →</LegacyLessonLink><small>{done?practice.progress.completed[step.id].needsReview?"Пройдено · повторить":"✓ Пройдено":`${step.minutes} минут`}</small></li>;})}</ul>
    <div className={styles.tools}><LegacyLessonLink href="/learning/topics">Все темы и свободная практика →</LegacyLessonLink><LegacyLessonLink href="/cards">Колоды карточек →</LegacyLessonLink></div>
  </section>;
}
