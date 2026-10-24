import { usePracticePlan } from "./PracticePlanContext";
import { isPracticeStepComplete, nextPracticeStep, practicePlanChapters, practicePlanSteps } from "./model";
import styles from "./ChildPracticePlan.module.css";

export function PracticeWelcome({name,onContinue,onPlan,onWords,onCards}:{name:string;onContinue:(id:string)=>void;onPlan:()=>void;onWords:()=>void;onCards:()=>void}) {
  const plan=usePracticePlan()!;
  const done=practicePlanSteps.filter(step=>isPracticeStepComplete(plan.progress,step));
  const review=done.filter(step=>plan.progress.completed[step.id].needsReview);
  const next=nextPracticeStep(plan.progress),chapter=practicePlanChapters.find(item=>item.steps.some(step=>step.id===next.id))!;
  const chapterDone=chapter.steps.filter(step=>isPracticeStepComplete(plan.progress,step)).length;
  const started=done.length>0||!!plan.progress.lastStepId;
  return <section className={`${styles.plan} ${styles.welcome}`} aria-label="Мой старт">
    <header className={styles.intro}><span className="tempo-kicker">Португальский понемногу каждый день</span><h1>Привет, {name}!</h1><p>{started?"Продолжим с твоего следующего шага.":"Начнём с небольшого занятия. Всё нужное будет по пути."}</p><div className={styles.counter}><strong>{done.length} из {practicePlanSteps.length}</strong><span>занятий пройдено</span></div><progress aria-label="Пройденные занятия" value={done.length} max={practicePlanSteps.length}/><small>Твой прогресс · в этом браузере</small></header>
    <div className={styles.continue}><span>{done.length===practicePlanSteps.length?"План пройден — можно повторить любимое":`${chapter.title} · ${chapterDone} из ${chapter.steps.length}`}</span><strong>{next.title}</strong><p>{chapter.description}. Занятие займёт около {next.minutes} минут.</p><button type="button" onClick={()=>onContinue(next.id)}>{done.length===practicePlanSteps.length?"Повторить занятие":started?"Продолжить →":"Начать →"}</button></div>
    {review.length>0&&<p className={styles.reviewNote}>Стоит повторить: {review.length} {review.length===1?"занятие":"занятия"}. Они отмечены в плане.</p>}
    <nav className={styles.destinations} aria-label="Выбрать занятие"><button type="button" onClick={onWords}><strong>Уроки</strong><span>Все темы, времена и формы</span></button><button type="button" onClick={onPlan}><strong>Мой план</strong><span>Рекомендуемый порядок и пройденные занятия</span></button><button type="button" onClick={onCards}><strong>Карточки</strong><span>Колоды и повторение слов</span></button></nav>
  </section>;
}
