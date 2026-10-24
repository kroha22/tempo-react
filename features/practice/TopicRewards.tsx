import styles from "./TopicRewards.module.css";

const stages=[{title:"Знакомство",child:"Исследователь",path:"M8 12h10v17H8zM18 12h10v17H18M18 14v15",hint:"Открой переводы всех шести слов."},{title:"Практика",child:"Мастер фраз",path:"m18 8 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z",hint:"После знакомства пройди три фразы без ошибок. Можно пробовать снова."},{title:"Повторение",child:"Закрепил!",path:"M10 15a9 9 0 1 1-1 9M10 9v7H4m10 5 3 3 6-7",hint:"Повтори три задания без примеров и ответь верно на все."}];
export function TopicRewards({child,earned,wordCount,persistent=false}:{child:boolean;earned:readonly boolean[];wordCount:number;persistent?:boolean}){
  return <section className={styles.rewards} data-child={child} aria-label="Награды темы">
    <header><strong>{child?"Твоя коллекция":"Этапы темы"}</strong><span>{earned.filter(Boolean).length} / 3</span></header>
    <ol>{stages.map((stage,index)=><li key={stage.title} data-earned={earned[index]} data-tone={index} aria-label={`${stage.title}: ${earned[index]?"получено":"впереди"}`}>
      <span className={styles.medal} aria-hidden="true"><svg viewBox="0 0 36 36"><path d={stage.path}/></svg></span>
      <strong>{child?stage.child:stage.title}</strong><small>{earned[index]?"✓ Получено":index===0?`${wordCount} / 6 слов`:index===1?"Фразы с ESTAR":"Ещё одна практика"}</small>
    </li>)}</ol>
    <details><summary>Как получить отметки</summary>{stages.map(stage=><p key={stage.title}><b>{stage.title}.</b> {stage.hint}</p>)}<p>{persistent?"Отметки сохраняются в выбранном профиле на этом устройстве.":"Пробный режим: отметки действуют, пока тема открыта."} Повторение доступно сразу, без ожидания следующего дня.</p></details>
  </section>;
}
