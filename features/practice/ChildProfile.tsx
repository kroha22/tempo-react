"use client";
import { useEffect, useRef, useState } from "react";
import { useProfileLearning } from "./profile-learning";
import { rewardAlbum } from "./learning-rewards";
import { usePracticePlan } from "./plan/PracticePlanContext";
import { emptyPracticePlanProgress } from "./plan/model";
import styles from "./ChildProfile.module.css";
import {TempoCharacter} from "./TempoCharacter";

import {childAvatars,type ChildAvatarId} from "./child-avatars";
export function ChildAvatar({ id }: { id?: ChildAvatarId }) {
  const avatar = childAvatars.find(item => item.id === id) ?? childAvatars[0];
  return <span className={styles.avatar} role="img" aria-label={avatar.name}>{avatar.symbol}</span>;
}
export function ChildAlbum({ avatar }: { avatar?: ChildAvatarId }) {
  const learner = useProfileLearning();
  const plan = usePracticePlan();
  const [filter, setFilter] = useState<"all" | "earned">("all");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  if (!learner) return null;
  const entries = rewardAlbum(learner.learning, plan?.progress ?? emptyPracticePlanProgress());
  const count = entries.filter(entry => entry.earned).length;
  const categories = [...new Set(entries.map(entry => entry.group))];
  return <section className={styles.album} aria-label="Альбом наград">
    <header><ChildAvatar id={avatar}/><div><span className={styles.kicker}>Моя коллекция открытий</span><h2 id="child-album-title" ref={heading} tabIndex={-1}>Мой альбом наград</h2></div><span className={styles.sparkle} aria-hidden="true">✧</span></header>
    <p>Каждое занятие оставляет свой след. Собирай значки за диалоги, слова, грамматику и игры.</p>
    <div className={styles.albumStats}><strong>{count}<span>значков собрано</span></strong><p>Твоя история португальского.<br/>Без гонки и потери наград за перерывы.</p><TempoCharacter pose="book"/></div>
    <nav className={styles.filters} aria-label="Показать награды"><button type="button" aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>Весь альбом</button><button type="button" aria-pressed={filter==="earned"} onClick={()=>setFilter("earned")}>Полученные · {count}</button></nav>
    {filter==="earned"&&count===0&&<p>Здесь появится твой первый значок. Закончи любое занятие и загляни снова!</p>}
    {categories.map((category,index)=>{
      const items=entries.filter(entry=>entry.group===category&&(filter==="all"||entry.earned));
      if(!items.length)return null;
      return <section className={styles.shelf} key={category} data-tone={index%4} aria-label={category}>
        <h3><span aria-hidden="true">{["✿","✧","◈","✦"][index%4]}</span>{category}<small>{entries.filter(entry=>entry.group===category&&entry.earned).length} получено</small></h3>
        <ul className={styles.badges}>{items.map(entry=><li key={entry.id} data-earned={entry.earned}>
          <BadgeSticker tone={index%4} icon={entry.id==="feelings:words"?1:entry.id==="feelings:practice"?2:entry.id==="feelings:review"?3:undefined} earned={entry.earned}/><strong>{entry.title}</strong>
          <small>{entry.earned?"✓ Получено":"○ Впереди"}</small>
          {entry.result&&<span className={styles.badgeScore}>Лучший результат: {entry.result.correct} / {entry.result.total}</span>}
          <details><summary>{entry.earned?"Мой результат":"Как получить"}</summary><p>{entry.earned?entry.result?entry.result.correct===entry.result.total?"Этот круг пройден с полным результатом.":"Занятие пройдено. Можно повторить, чтобы улучшить результат.":"Сохранённый этап пройден. Награда остаётся в альбоме.":entry.hint}</p></details>
        </li>)}</ul>
      </section>;
    })}
    <p className={styles.note}>Все темы — в одном альбоме выбранного профиля. Сохраняется только в этом браузере.</p>
  </section>;
}
function BadgeSticker({tone,earned,icon=tone}:{tone:number;earned:boolean;icon?:number}) {
  return <svg className={styles.sticker} data-tone={tone} data-earned={earned} viewBox="0 0 100 100" aria-hidden="true">
    <path className={styles.stickerEdge} d="M50 5 62 12 76 11 82 24 95 32 91 47 96 61 84 71 79 85 64 86 51 95 38 88 23 89 17 75 5 67 9 52 4 38 17 28 22 14 37 13Z"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 4"/>
    <path d={icon===0?"M50 29c-14-16-26 7-11 16-19 0-16 26 2 20-9 17 17 24 18 5 14 13 29-10 12-18 19-7 3-29-10-15 2-13-12-17-11-8Z":icon===1?"M31 31h38v38H31zM31 39l19 11 19-11M50 50v19":icon===2?"m50 27 7 15 17 3-12 12 3 17-15-8-15 8 3-17-12-12 17-3Z":"M31 55a20 20 0 1 1 8 13M31 43v14h14M50 37v16l10 6"} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {icon===0&&<circle cx="50" cy="52" r="6" fill="currentColor"/>}
  </svg>;
}
export function ChildLessonResult({ correct, total, saved, onContinue, onRetry }: { correct: number; total: number; saved: boolean; onContinue: () => void; onRetry: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const complete = correct === total;
  return <section className={styles.result} aria-label="Результат занятия">
    <div className={styles.characterResult}><TempoCharacter pose={complete?"celebrate":"encourage"}/></div>
    <span className={styles.kicker}>Ещё один шаг вперёд</span>
    <h2 ref={heading} tabIndex={-1}>{complete ? "Фразы получились!" : "Ты потренировался!"}</h2>
    <p>Верных ответов: <strong>{correct} из {total}</strong></p>
    <p>{complete ? "Ты выбрал верные формы ESTAR во всех фразах о состоянии." : "Некоторые формы ESTAR ещё стоит повторить. Подсказки помогут разобраться."}</p>
    <p className={styles.note}>{!saved ? "Сохранение не подтверждено. Используй кнопку повторного сохранения выше — полученные ранее награды остаются." : complete ? "Открой коллекцию по кнопке: там видны полученные значки и следующий шаг." : "Твои прежние значки остаются. Можно попробовать ещё раз."}</p>
    <div className={styles.actions}><button type="button" onClick={onContinue}>Посмотреть коллекцию</button><button type="button" onClick={onRetry}>Повторить фразы</button></div>
  </section>;
}
