"use client";
import {useEffect,useId,useMemo,useRef,useState} from "react";
import type {WordLearningSet} from "../content/word-learning-library";
import {wordRoundRanges} from "./word-learning-session";
import {newPaperSession,paperPortuguese,paperRows,paperAnswer,paperCue,paperInitialHint,paperWritesPortuguese,revealPaperHint,checkPaper,markPaper,paperDifficult,paperChecked,repeatPaper,nextPaperColumn,type PaperSession,type PaperPhase} from "./paper-accordion";
import styles from "./PaperAccordion.module.css";

const phases:[PaperPhase,string][]=[["fold","Сложить лист"],["copy","Записать образец"],["recall","Вспомнить"],["check","Проверить"]];
/** Paper self-check is temporary practice, not a card grade or lesson completion. */
export function PaperAccordion({sets,initialSetId,initialPart=0}:{sets:readonly WordLearningSet[];initialSetId?:string;initialPart?:number}){
  const choices=useMemo(()=>sets.filter(set=>set.words.length>0),[sets]);
  const [selected,setSelected]=useState(initialSetId??""),[part,setPart]=useState(()=>{const first=choices.find(set=>set.id===initialSetId);return Number.isInteger(initialPart)&&initialPart>=0&&initialPart<wordRoundRanges(first?.words.length??0).length?initialPart:0;});
  const [sessions,setSessions]=useState<Record<string,PaperSession>>({});
  const heading=useRef<HTMLHeadingElement>(null),id=useId();
  const pack=choices.find(set=>set.id===selected);
  const ranges=wordRoundRanges(pack?.words.length??0),range=ranges[part]??ranges[0];
  const words=pack?.words.slice(range.start,range.end)??[];
  const sessionKey=JSON.stringify([pack?.id,range.start,range.end]);
  const session=sessions[sessionKey]??newPaperSession();
  const rows=paperRows(words,session),pt=paperWritesPortuguese(session),checked=paperChecked(words,session),difficult=paperDifficult(words,session);
  const helped=rows.filter(word=>session.hints[word.id]).length;
  function change(update:(current:PaperSession)=>PaperSession){setSessions(current=>({...current,[sessionKey]:update(current[sessionKey]??newPaperSession())}));}
  useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[selected,part,session.phase,session.column,session.retry]);
  function advance(){change(current=>current.phase==="fold"?{...current,phase:"copy"}:current.phase==="copy"?{...current,phase:"recall"}:current.phase==="recall"?checkPaper(current):nextPaperColumn(current));}
  return <section className={styles.paper} aria-label="Бумажная гармошка">
    <p className={styles.intro}>Пишите на настоящем листке. Здесь — образец, подсказки и самопроверка. Карточки, расписание повторения и результаты уроков не меняются.</p>
    <div className={styles.selectors}><label htmlFor={`${id}-set`}>Пачка слов<select id={`${id}-set`} value={pack?.id??""} onChange={event=>{setSelected(event.target.value);setPart(0);}}><option value="">Выберите готовую пачку</option>{choices.map(set=><option key={set.id} value={set.id}>{set.title} · {set.words.length}</option>)}</select></label>{pack&&ranges.length>1&&<label htmlFor={`${id}-part`}>На этот лист<select id={`${id}-part`} value={part} onChange={event=>setPart(Number(event.target.value))}>{ranges.map((item,index)=><option key={item.start} value={index}>{item.start+1}–{item.end} из {pack.words.length}</option>)}</select></label>}</div>
    {!pack?<p role="status">Выберите пачку — на одном листе будет не больше шести строк.</p>:<>
      <h2 ref={heading} tabIndex={-1}>{pack.title} · {range.start+1}–{range.end}</h2>
      <nav className={styles.steps} aria-label="Шаги бумажной гармошки">{phases.map(([phase,label],index)=><button type="button" key={phase} aria-current={session.phase===phase?"step":undefined} onClick={()=>change(current=>phase==="check"?checkPaper(current):{...current,phase})}>{index+1} · {label}</button>)}</nav>
      <div className={styles.sheet} role="img" aria-label={`Лист из шести колонок: PT, RU, PT, RU, PT, RU. ${session.phase==="fold"||session.phase==="copy"?"Сначала заполняем колонки 1 и 2.":`Сейчас пишем в колонку ${session.column}.`}`}>
        {[1,2,3,4,5,6].map(column=><div key={column} data-active={session.phase==="fold"||session.phase==="copy"?column<3:column===session.column} data-covered={session.phase==="recall"&&column<session.column-1}><span>{column}</span><strong>{column%2?"PT":"RU"}</strong><small>{column<3?"образец":"по памяти"}</small></div>)}
      </div>
      {session.phase==="fold"&&<div className={styles.instructions}><p>Возьмите A4 горизонтально. Разделите на шесть вертикальных полос — примерно по 5 см.</p><p>Согните по пяти линиям попеременно от себя и к себе, затем расправьте. Вверху подпишите: PT · RU · PT · RU · PT · RU.</p><p>Две первые колонки — образец, остальные четыре пока пустые.</p></div>}
      {session.phase==="copy"&&<><p>Перепишите португальский образец в колонку 1, перевод — в колонку 2. Одна строка на слово или выражение. Колонки 3–6 оставьте пустыми.</p><div className={styles.rowHead}><span>1 · Португальский</span><span>2 · Русский</span></div>{words.map(word=><div className={styles.row} key={word.id} data-word-id={word.id}><span lang="pt-PT">{paperPortuguese(word)}</span><span lang="ru">{word.translation}</span></div>)}</>}
      {session.phase==="recall"&&<>
        <p>{session.retry?`Повтор трудных: на свободном месте или новом листке запишите слева ${pt?"русские":"португальские"} подсказки. Справа напишите ответы по памяти, закрыв образец.`:`Подогните использованные полосы назад: перед вами колонка ${session.column-1} и пустая ${session.column}. Пишите ${pt?"по-португальски":"по-русски"} в колонку ${session.column}, не разворачивая образец.`}</p>
        <div className={styles.rowHead}><span>Подсказка · {pt?"RU":"PT"}</span><span>Ответ на бумаге · {pt?"PT":"RU"}</span></div>
        {rows.map(word=><div className={styles.row} key={word.id} data-word-id={word.id}><span lang={pt?"ru":"pt-PT"}>{paperCue(word,session)}</span><div className={styles.answer}><span lang={pt?"pt-PT":"ru"}>{session.hints[word.id]===2?paperAnswer(word,session):session.hints[word.id]===1?paperInitialHint(paperAnswer(word,session)):"Ответ скрыт"}</span>{session.hints[word.id]!==2&&<button type="button" aria-label={`${session.hints[word.id]?"Открыть ответ":"Подсказка"}: ${paperCue(word,session)}`} onClick={()=>change(current=>revealPaperHint(current,word.id))}>{session.hints[word.id]?"Открыть ответ":"Подсказка"}</button>}</div></div>)}
        <p role="status">{helped?`С подсказкой: ${helped} из ${rows.length}. Эти строки вернутся в повтор трудных.`:"Образец скрыт. Сначала запишите ответы на бумаге, затем проверьте."}</p>
      </>}
      {session.phase==="check"&&<><p>{session.retry?"Сверьте повтор с образцом":"Разверните образец и сверьте ответы"}. Исправьте ошибки другим цветом. «Самостоятельно» отмечайте только без подсказки.</p>
        {rows.map(word=><div className={styles.row} key={word.id} data-word-id={word.id}><div className={styles.answer}><span lang={pt?"ru":"pt-PT"}>{paperCue(word,session)}</span><strong lang={pt?"pt-PT":"ru"}>{paperAnswer(word,session)}</strong>{!!session.hints[word.id]&&<small>Была подсказка</small>}</div><div className={styles.marks} role="group" aria-label={`Самопроверка: ${paperCue(word,session)}`}><button type="button" disabled={!!session.hints[word.id]} aria-pressed={session.marks[word.id]==="independent"} onClick={()=>change(current=>markPaper(current,word.id,"independent"))}>Самостоятельно ✓</button><button type="button" aria-pressed={session.marks[word.id]==="repeat"} onClick={()=>change(current=>markPaper(current,word.id,"repeat"))}>Повторить</button></div></div>)}
        <p role="status">Отмечено: {rows.filter(word=>session.marks[word.id]).length} из {rows.length}. Трудных строк: {difficult.length}.</p>
      </>}
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={session.phase==="check"&&!checked} onClick={advance}>{session.phase==="fold"?"Лист готов →":session.phase==="copy"?"Записано · скрыть образец →":session.phase==="recall"?"Написал(а) · проверить →":session.column===6?"Новый лист · весь список →":`К колонке ${session.column+1} · ${pt?"PT → RU":"RU → PT"} →`}</button>{session.phase==="check"&&difficult.length>0&&<button type="button" onClick={()=>change(current=>repeatPaper(words,current))}>Повторить трудные · {difficult.length}</button>}</div>
      <p className={styles.note}>Отметки хранятся только пока открыта гармошка. После выхода или перезагрузки можно начать новый лист; прежние сохранения Tempo остаются на месте.</p>
    </>}
  </section>;
}
