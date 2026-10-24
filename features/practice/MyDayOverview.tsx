"use client";
import {useState} from "react";
import {myDayEvents} from "../content/my-day";
import {LearningClock} from "./LearningClock";
import styles from "./MyDayOverview.module.css";

export function MyDayOverview({onClock,onPhrases,onWords}:{onClock:()=>void;onPhrases:()=>void;onWords:()=>void}) {
  const [selected,setSelected]=useState(0);
  const event=myDayEvents[selected];
  return <section className={styles.block} aria-label="Мой день: время и действия">
    <header><span className="tempo-kicker">O meu dia · Мой день</span><h2>Во сколько ты что делаешь?</h2><p>Научимся называть время и связывать его с действиями. Это пример распорядка — твой день может выглядеть иначе.</p></header>
    <div className={styles.layout}><div className={styles.timeline} role="group" aria-label="Пример распорядка дня">{myDayEvents.map((item,index)=><button type="button" key={item.id} aria-pressed={selected===index} onClick={()=>setSelected(index)}><time>{String(item.hour).padStart(2,"0")}:{String(item.minute).padStart(2,"0")}</time><span lang="pt-PT">{item.phrase}</span></button>)}</div>
    <div className={styles.focus} aria-live="polite"><LearningClock time={event} describe/><strong lang="pt-PT">{event.phrase}</strong><p>{event.ru}</p></div></div>
    <div className={styles.steps}><button type="button" onClick={onWords}>1 · Ações — Действия</button><button type="button" onClick={onClock}>2 · Horas — Часы</button><button type="button" onClick={onPhrases}>3 · Frases — Собери фразы</button></div>
    <details className={styles.rule}><summary>Правило: который час и во сколько?</summary><p><b lang="pt-PT">Que horas são? — São sete horas.</b><br/>Который час? — Семь часов.</p><p><b lang="pt-PT">A que horas acordas? — Acordo às sete.</b><br/>Во сколько ты просыпаешься? — В семь.</p><p><b lang="pt-PT">à uma</b> — в час; <b lang="pt-PT">às sete</b> — в семь. Время действия вводим через <b>à / às</b>. В <b>às</b> соединяются a + as.</p><p><b lang="pt-PT">Acordo, estudo, descanso</b> — формы EU настоящего времени: acordar → acordo. <b lang="pt-PT">Vou</b> — особая форма IR. В <b lang="pt-PT">tomo o pequeno-almoço</b> TOMAR означает «завтракать» вместе с o pequeno-almoço. Инфинитивы и формы можно потренировать в режиме «Фразы».</p><p><b lang="pt-PT">às cinco da tarde</b> — в 17:00; <b lang="pt-PT">às nove da noite</b> — в 21:00. Уточнение части суток снимает неоднозначность циферблата.</p></details>
  </section>;
}
