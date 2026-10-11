"use client";

import { useState } from "react";
import { TenseExamples } from "./TenseExamples";
import { LegacyLessonLink as Link } from "./LegacyLessonLink";
import { people } from "../conjugation/data";
import { futureTasks, futureForm, futureSentence, checkFutureTask, type FutureTask } from "../content/future-lesson";

function FutureRound({ task, number, total, onNext }: { task: FutureTask; number: number; total: number; onNext: (helped: boolean) => void }) {
  const [verb, setVerb] = useState<string | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const [translation, setTranslation] = useState(false);
  const [helped, setHelped] = useState(false);
  const result = checkFutureTask(task, verb, time);
  const done = checked && result.verb && result.time;
  const person = people.find(person => person.key === task.person)!;
  return <>
    <div className="house-heading"><h2>Собери предложение</h2><span>{number} / {total}</span></div>
    <p className="future-sentence" lang="pt-PT">{task.subject} <b>{verb ?? "___"}</b> {task.action} <b>{time === null ? "___" : task.times[time].text}</b>{task.punctuation}</p>
    <fieldset className="future-options"><legend>1. Выбери форму ir</legend>{task.verbs.map(value => <button type="button" key={value} lang="pt-PT" aria-pressed={verb === value} onClick={() => { setVerb(value); setChecked(false); }}>{value}</button>)}</fieldset>
    <fieldset className="future-options future-time"><legend>2. Выбери выражение времени</legend>{task.times.map((option, i) => <button type="button" key={option.text} aria-pressed={time === i} onClick={() => { setTime(i); setChecked(false); }}><span lang="pt-PT">{option.text}</span>{translation && <small>{option.translation}</small>}</button>)}</fieldset>
    <div className="house-tools"><button type="button" className="house-primary" onClick={() => { setChecked(true); if (!result.verb || !result.time) setHelped(true); }}>Проверить</button><button type="button" aria-expanded={hint} onClick={() => { setHint(!hint); setHelped(true); }}>Подсказка</button><button type="button" aria-expanded={translation} onClick={() => { setTranslation(!translation); setHelped(true); }}>Перевод</button></div>
    {hint && <div className="house-feedback"><p><span lang="pt-PT">{task.subject}</span> → <span lang="pt-PT">{person.label}</span> → <b lang="pt-PT">{futureForm(task.person)}</b>.</p><p>Теперь выбери время будущего события. Формы <span lang="pt-PT">ontem, passado, anterior</span> отсылают к прошлому.</p></div>}
    {checked && <div className="house-feedback" role="status"><p>{result.verb ? "✓ Форма глагола верна." : verb ? `× Проверь, о ком говорится: ${task.subject}.` : "Выбери форму глагола."}</p><p>{result.time ? "✓ Время подходит для этого будущего события." : time !== null ? "× Это выражение указывает на прошлое. Выбери другое время." : "Выбери выражение времени."}</p>{done && <><strong lang="pt-PT">{futureSentence(task)}</strong><p>{task.translation}</p>{task.id === "future-skating" && <small>«После уроков» здесь относится к предстоящему событию. Само выражение можно употреблять и в рассказе о прошлом.</small>}</>}</div>}
    {done && <button type="button" className="house-primary" onClick={() => onNext(helped)}>{number === total ? "Завершить" : "Дальше →"}</button>}
  </>;
}

export function FutureLesson() {
  const [stage, setStage] = useState<"learn" | "exercise" | "done">("learn");
  const [tasks, setTasks] = useState(futureTasks);
  const [index, setIndex] = useState(0);
  const [helped, setHelped] = useState<string[]>([]);
  function restart(onlyHelped: boolean) { setTasks(onlyHelped ? tasks.filter(task => helped.includes(task.id)) : futureTasks); setIndex(0); setHelped([]); setStage("exercise"); }
  return <section className="house-activity future-lesson">
    <Link href="/learning">← Уроки и правила</Link>
    <div className="house-heading"><div><span className="tempo-kicker">Говорим о будущем</span><h1>Что будем делать?</h1></div></div>
    {stage === "learn" ? <>
      <p>О планах и будущих событиях можно говорить с помощью <b lang="pt-PT">ir + infinitivo</b>.</p>
      <div className="future-formula"><span lang="pt-PT">Eu <b>vou</b> <strong>jogar</strong> amanhã.</span><small>Я буду играть завтра.</small></div>
      <p>Глагол <b lang="pt-PT">ir</b> ставим в настоящем времени по лицу. Следующий глагол оставляем в начальной форме: <span lang="pt-PT">jogar, passear, ver</span>.</p>
      <div className="future-forms">{people.map(person => <div key={person.key}><span lang="pt-PT">{person.label}</span><b lang="pt-PT">{futureForm(person.key)}</b></div>)}</div>
      <p><span lang="pt-PT"><b>amanhã</b></span> — завтра; <span lang="pt-PT"><b>na próxima quinta-feira</b></span> — в следующий четверг.</p>
      <p>В упражнении выбери две части: правильную форму <span lang="pt-PT">ir</span> и подходящее время.</p>
      <button type="button" className="house-primary" onClick={() => setStage("exercise")}>К упражнению · 4 предложения →</button>
      <TenseExamples tense="future" />
    </> : stage === "done" ? <div className="house-feedback"><h2>Muito bem!</h2><p>Теперь ты можешь составлять предложения о будущем.</p><div className="house-tools">{!!helped.length && <button type="button" className="house-primary" onClick={() => restart(true)}>Повторить сложное: {helped.length}</button>}<button type="button" onClick={() => restart(false)}>Все предложения ещё раз</button><button type="button" onClick={() => { setTasks(futureTasks); setIndex(0); setHelped([]); setStage("learn"); }}>Вернуться к правилу</button></div><details><summary>Готовые предложения для тетради</summary><ol>{futureTasks.map(task => <li key={task.id}><p lang="pt-PT">{futureSentence(task)}</p><small>{task.translation}</small></li>)}</ol></details></div>
    : <FutureRound key={tasks[index].id} task={tasks[index]} number={index + 1} total={tasks.length} onNext={usedHelp => { if (usedHelp) setHelped(previous => [...previous, tasks[index].id]); if (index + 1 === tasks.length) setStage("done"); else setIndex(index + 1); }} />}
  </section>;
}
