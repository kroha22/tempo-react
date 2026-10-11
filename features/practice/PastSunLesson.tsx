"use client";

import { useState } from "react";
import { TenseExamples } from "./TenseExamples";
import { LegacyLessonLink as Link } from "./LegacyLessonLink";
import { people } from "../conjugation/data";
import { pastSunAnswer, type SunLesson } from "../content/past-sun-lessons";

const positions = [[50, 10], [84, 30], [84, 70], [50, 90], [16, 70], [16, 30]];

export function PastSunLesson({ lesson }: { lesson: SunLesson }) {
  const form = (person: typeof people[number]["key"]) => pastSunAnswer(lesson.verb, person);
  const [stage, setStage] = useState<"learn" | "exercise" | "done">("learn");
  const [hideForms, setHideForms] = useState(false);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const [translation, setTranslation] = useState(false);
  const [helped, setHelped] = useState<string[]>([]);
  const [repeat, setRepeat] = useState<readonly SunLesson["exercises"][number][]>(lesson.exercises);
  const task = repeat[index];
  const correct = answer.trim().toLowerCase() === form(task.person);
  function help() { setHint(true); setHelped(previous => previous.includes(task.id) ? previous : [...previous, task.id]); }
  function next() { setAnswer(""); setChecked(false); setHint(false); setTranslation(false); if (index + 1 === repeat.length) setStage("done"); else setIndex(index + 1); }
  function restart(onlyHelped: boolean) { setRepeat(onlyHelped ? repeat.filter(item => helped.includes(item.id)) : lesson.exercises); setHelped([]); setIndex(0); setAnswer(""); setChecked(false); setHint(false); setTranslation(false); setStage("exercise"); }
  return <section className="house-activity trazer-lesson">
    <Link href="/learning">← Уроки и правила</Link>
    <div className="house-heading"><div><span className="tempo-kicker">Прошедшее время · неправильный глагол</span><h1>{lesson.verb.toUpperCase()} <span aria-hidden="true">☀</span></h1></div><span lang="pt-PT">Pretérito Perfeito</span></div>
    {stage === "learn" ? <>
      <p lang="pt-PT">Aprende as formas do verbo {lesson.verb} no Pretérito Perfeito e faz o exercício.</p>
      <p><b lang="pt-PT">{lesson.verb}</b> — {lesson.translation}. В Pretérito Perfeito рассказываем о завершённом событии в прошлом: <span lang="pt-PT">{lesson.example}</span> — {lesson.exampleTranslation}</p>
      <div className="trazer-sun" aria-label={`Формы ${lesson.verb} в прошедшем времени`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">{positions.map(([x,y], i) => <line key={i} x1="50" y1="50" x2={x} y2={y} />)}</svg>
        <div className="trazer-sun-center"><strong lang="pt-PT">{lesson.verb}</strong><span>☀</span><small>прошедшее</small></div>
        {people.map((person, i) => <button type="button" key={person.key} className="trazer-ray" style={{ left: `${positions[i][0]}%`, top: `${positions[i][1]}%` }} aria-label={`${person.label}: ${!hideForms || revealed.includes(person.key) ? form(person.key) : "показать форму"}`} onClick={() => setRevealed(previous => previous.includes(person.key) ? previous.filter(key => key !== person.key) : [...previous, person.key])}><small lang="pt-PT">{person.label}</small><strong lang="pt-PT">{!hideForms || revealed.includes(person.key) ? form(person.key) : "?"}</strong></button>)}
      </div>
      <div className="house-tools"><button type="button" onClick={() => { setHideForms(!hideForms); setRevealed([]); }}>{hideForms ? "Показать все формы" : "Скрыть формы и вспомнить"}</button><button type="button" className="house-primary" onClick={() => setStage("exercise")}>К упражнению →</button></div>
      <p className="house-feedback"><b>Запомни:</b> {lesson.note}</p>
      <TenseExamples tense="past" />
      <details><summary>А форма с vós?</summary><p><span lang="pt-PT">Vós {lesson.vos}.</span> Эта форма встречается реже. В основном упражнении используем <span lang="pt-PT">vocês {form("voces")}</span>.</p></details>
    </> : stage === "done" ? <div className="house-feedback"><h2>Muito bem!</h2><p>Упражнение пройдено. Можно ещё раз вспомнить формы, для которых понадобилась помощь.</p><div className="house-tools">{!!helped.length && <button type="button" className="house-primary" onClick={() => restart(true)}>Повторить с подсказками: {helped.length}</button>}<button type="button" onClick={() => restart(false)}>Пройти всё ещё раз</button><button type="button" onClick={() => { setRepeat(lesson.exercises); setIndex(0); setHelped([]); setStage("learn"); }}>Вернуться к солнышку</button></div><Link href={`/learning/practice?verb=${lesson.verb}&tense=past`}>Свободная тренировка {lesson.verb} →</Link></div> : <>
      <div className="house-heading"><h2>Вставь форму {lesson.verb}</h2><span>{index + 1} / {repeat.length}</span></div>
      <p>Событие уже произошло. Используй Pretérito Perfeito.</p>
      <form onSubmit={event => { event.preventDefault(); setChecked(true); if (!correct) setHelped(previous => previous.includes(task.id) ? previous : [...previous, task.id]); }}>
        <label htmlFor={`${lesson.verb}-answer`} className="trazer-sentence" lang="pt-PT">{task.before} <b>_____</b> {task.after}</label>
        <input id={`${lesson.verb}-answer`} className="house-room-input" aria-label={`Форма ${lesson.verb}`} value={answer} maxLength={30} autoComplete="off" autoCapitalize="none" spellCheck={false} onChange={event => { setAnswer(event.target.value); setChecked(false); }} />
        <div className="house-tools"><button type="submit" className="house-primary">Проверить</button><button type="button" onClick={help}>Подсказка</button><button type="button" aria-expanded={translation} onClick={() => setTranslation(!translation)}>Перевод</button></div>
      </form>
      {translation && <p className="house-feedback">{task.translation}</p>}
      {hint && <div className="house-feedback"><span lang="pt-PT">{people.find(person => person.key === task.person)?.label} → <b>{form(task.person)}</b></span><p>Прочитай, скрой подсказку и попробуй написать форму.</p><button type="button" onClick={() => setHint(false)}>Скрыть подсказку</button></div>}
      {checked && <p className="house-feedback" role="status">{correct ? `✓ Верно! ${task.before} ${form(task.person)} ${task.after}` : answer.trim() ? "× Пока не подходит. Посмотри, кто выполнял действие, и попробуй ещё раз." : "Впиши форму глагола или открой подсказку."}</p>}
      {checked && correct && <button type="button" className="house-primary" onClick={next}>{index + 1 === repeat.length ? "Завершить" : "Дальше →"}</button>}
      <p><button type="button" className="pair-back" onClick={() => { help(); setStage("learn"); }}>Подсмотреть солнышко</button></p>
    </>}
  </section>;
}
