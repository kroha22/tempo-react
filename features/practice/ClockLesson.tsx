"use client";
import { useState } from "react";
import { LegacyLessonLink as Link } from "./LegacyLessonLink";
import { clockExamples, clockReadTasks, clockSetTasks, checkClockAnswer, sameClockTime, clockDigital, type ClockTask, type ClockTime } from "../content/clock-lesson";
import { LearningClock } from "./LearningClock";

function ClockRound({ task, mode, onNext }: { task: ClockTask; mode: "read" | "set"; onNext: (helped: boolean) => void }) {
  const [answer,setAnswer]=useState(""); const [time,setTime]=useState<ClockTime>({hour:12,minute:0});
  const [hand,setHand]=useState<"hour"|"minute">("hour"); const [checked,setChecked]=useState(false); const [hint,setHint]=useState(false);const [helped,setHelped]=useState(false);const [accessible,setAccessible]=useState(false);
  const result=checkClockAnswer(task,answer);const correct=mode==="read"?result==="correct":sameClockTime(task,time);
  function update(next:ClockTime){setTime(next);setChecked(false);}
  return <>
    <h2>{mode==="read"?"Que horas são?":task.phrase}</h2>
    {task.context&&<p>{task.context}</p>}
    <LearningClock time={mode==="read"?task:time} onChange={mode==="set"?update:undefined} describe={mode==="set"||accessible} onDial={mode==="set"?value=>update(hand==="hour"?{...time,hour:value}:{...time,minute:value%12*5}):undefined}/>
    {mode==="read"?<><label className="house-answer-label" htmlFor="clock-answer">Напиши время по-португальски</label><input id="clock-answer" className="house-room-input" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false);}} maxLength={120} autoComplete="off" spellCheck={false}/><button type="button" className="pair-back" aria-pressed={accessible} onClick={()=>{setAccessible(!accessible);setHelped(true);}}>Показать время цифрами</button>{accessible&&<p role="status">{clockDigital(task)}</p>}</>:<>
      <div className="house-tools"><button type="button" aria-pressed={hand==="hour"} onClick={()=>setHand("hour")}>Часовая</button><button type="button" aria-pressed={hand==="minute"} onClick={()=>setHand("minute")}>Минутная</button></div><p className="clock-instruction">Выбрана {hand==="hour"?"часовая":"минутная"} стрелка. Можно нажать на число. Или потяни за круглый кончик любой стрелки и крути её. Шаг — 5 минут; с клавиатуры используй стрелки.</p>
      <div className="clock-selects"><label>Часы<select value={time.hour} onChange={e=>update({...time,hour:Number(e.target.value)})}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label><label>Минуты<select value={time.minute} onChange={e=>update({...time,minute:Number(e.target.value)})}>{Array.from({length:12},(_,i)=><option key={i} value={i*5}>{String(i*5).padStart(2,"0")}</option>)}</select></label></div>
    </>}
    <div className="house-tools"><button type="button" className="house-primary" onClick={()=>{setChecked(true);if(!correct)setHelped(true);}}>Проверить</button><button type="button" aria-expanded={hint} onClick={()=>{setHint(!hint);setHelped(true);}}>Подсказка и перевод</button></div>
    {hint&&<div className="house-feedback"><b lang="pt-PT">{task.phrase}</b><p>{task.translation}</p><p>{clockDigital(task)}</p></div>}
    {checked&&<div className="house-feedback" role="status">{correct?<><b>✓ Верно!</b><p lang="pt-PT">{task.phrase}</p><p>{task.translation}</p></>:mode==="read"&&result==="numeric"?<><p>✓ Время прочитано верно. Теперь напиши словами:</p><b lang="pt-PT">{task.phrase}</b></>:<p>{mode==="read"?"Попробуй ещё раз или открой подсказку. Можно написать, например, sete e meia.":"Проверь обе стрелки. Короткая показывает часы, длинная — минуты."}</p>}</div>}
    {checked&&correct&&<button type="button" className="house-primary" onClick={()=>onNext(helped)}>Дальше →</button>}
  </>;
}

export function ClockLesson(){
  const [session,setSession]=useState(0);
  const [mode,setMode]=useState<"learn"|"read"|"set">("learn");const [example,setExample]=useState(0);const [index,setIndex]=useState(0);const [tasks,setTasks]=useState<readonly ClockTask[]>(clockReadTasks);const [helped,setHelped]=useState<string[]>([]);
  function start(next:"read"|"set"){setSession(value=>value+1);setMode(next);setTasks(next==="read"?clockReadTasks:clockSetTasks);setIndex(0);setHelped([]);}
  return <section className="house-activity clock-lesson"><Link href="/learning">← Уроки и правила</Link><div className="house-heading"><div><span className="tempo-kicker">Время на часах</span><h1>Que horas são?</h1></div></div>
    <nav className="vocabulary-modes" aria-label="Упражнения с часами"><button type="button" aria-pressed={mode==="learn"} onClick={()=>setMode("learn")}>Разобраться</button><button type="button" aria-pressed={mode==="read"} onClick={()=>start("read")}>Назови время</button><button type="button" aria-pressed={mode==="set"} onClick={()=>start("set")}>Выставь стрелки</button></nav>
    {mode==="learn"?<><p>Короткая толстая стрелка — часы, длинная тонкая — минуты. Каждое число на циферблате — ещё пять минут.</p><LearningClock time={clockExamples[example]} describe/><div className="clock-example"><strong lang="pt-PT">{clockExamples[example].phrase}</strong><span>{clockDigital(clockExamples[example])} · {clockExamples[example].translation}</span></div><div className="clock-example-buttons">{clockExamples.map((task,i)=><button type="button" key={task.id} aria-pressed={example===i} onClick={()=>setExample(i)}>{clockDigital(task)}</button>)}</div><div className="house-feedback"><p><b lang="pt-PT">É uma hora</b> — один час; <b lang="pt-PT">são sete horas</b> — семь часов.</p><p><b lang="pt-PT">e um quarto</b> — ещё 15 минут; <b lang="pt-PT">e meia</b> — ещё 30 минут.</p><p><b lang="pt-PT">um quarto para as oito</b> — до восьми осталось 15 минут: 7:45.</p><p><b lang="pt-PT">meio-dia</b> — полдень; <b lang="pt-PT">meia-noite</b> — полночь. На обычном циферблате они выглядят одинаково.</p></div><button type="button" className="house-primary" onClick={()=>start("read")}>Попробовать →</button></>:index===tasks.length?<div className="house-feedback"><h2>Muito bem!</h2><p>Задания пройдены.</p><div className="house-tools">{!!helped.length&&<button type="button" onClick={()=>{setTasks(tasks.filter(task=>helped.includes(task.id)));setIndex(0);setHelped([]);}}>Повторить сложное</button>}<button type="button" onClick={()=>start(mode)}>Ещё раз</button><button type="button" className="house-primary" onClick={()=>start(mode==="read"?"set":"read")}>{mode==="read"?"Выставить стрелки →":"Назвать время →"}</button></div></div>:<><p className="clock-progress">{index+1} / {tasks.length}</p><ClockRound key={`${session}-${mode}-${tasks[index].id}`} task={tasks[index]} mode={mode} onNext={usedHelp=>{if(usedHelp)setHelped(previous=>[...previous,tasks[index].id]);setIndex(index+1);}}/></>}
  </section>;
}
