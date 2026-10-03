"use client";

import { useEffect, useId, useRef, useState } from "react";
import { checkVocabularyAnswer, type VocabularyWord, type VocabularySet } from "../content/vocabulary-model";
import { generateOddTasks, type GeneratedOddTask as OddTask } from "./odd-one-out";

function OddWord({ word, selected, showInfo, hint, onSelect, onHint }: { word: VocabularyWord; id: string; selected: boolean; showInfo: boolean; hint: boolean; onSelect: () => void; onHint: () => void }) {
  const hintId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  function cancel() { if (timer.current) clearTimeout(timer.current); timer.current = null; }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <div className={`house-word-entry house-odd-word ${showInfo ? "has-info" : ""} ${selected ? "is-crossed" : ""}`}>
    <button type="button" className="house-word" aria-pressed={selected} aria-describedby={hint ? hintId : undefined}
      onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; cancel(); held.current = false; origin.current = { x: event.clientX, y: event.clientY }; timer.current = setTimeout(() => { held.current = true; onHint(); }, 550); }}
      onPointerMove={event => { if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 10) { cancel(); held.current = true; } }}
      onPointerUp={cancel} onPointerCancel={() => { cancel(); held.current = true; }} onPointerLeave={cancel} onBlur={cancel}
      onContextMenu={event => event.preventDefault()} onClick={event => { if (held.current && event.detail !== 0) { held.current = false; return; } onSelect(); }}>
      <span lang="pt-PT">{word.label}</span>{selected && <span aria-label="Выбрано лишним">×</span>}
    </button>
    {showInfo && <button type="button" className="house-info" aria-label={`Перевод: ${word.label}`} aria-expanded={hint} onClick={onHint}>ⓘ</button>}
    {hint && <div className="house-hint" id={hintId} role="status">{word.translation}</div>}
  </div>;
}

function OddRound({ task, number, total, alwaysHints, setAlwaysHints, onNext, words, places, mode }: { words: readonly VocabularyWord[]; places: readonly string[]; mode: "odd" | "common"; task: OddTask; number: number; total: number; alwaysHints: boolean; setAlwaysHints: (value: boolean) => void; onNext: (helped: boolean) => void }) {
  const inputId = useId();
  const practiceWord = (id: string) => { const word = words.find(word => word.id === id); if (!word) throw new Error(`Unknown vocabulary word: ${id}`); return word; };
  const [odd, setOdd] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [helped, setHelped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [russianFeedback, setRussianFeedback] = useState("");
  const [russianCorrect, setRussianCorrect] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const place = practiceWord(task.place);
  const result = checkVocabularyAnswer(place, answer);
  const oddCorrect = mode === "common" || odd === task.odd;
  const done = checked && oddCorrect && result === "pt";
  const knownPlace = revealed || russianCorrect || (checked && result === "ru");
  function translate(id: string) { setHint(hint === id ? null : id); setHelped(true); }
  return <div onClick={event => { if (!(event.target as HTMLElement).closest(".house-odd-word")) setHint(null); }} onKeyDown={event => { if (event.key === "Escape") { setHint(null); setHelp(false); } }}>
    <div className="house-heading"><h1>{mode === "odd" ? "Найди лишнее" : "Что общего?"}</h1><span>{number} из {total}</span></div>
    <p className="house-odd-instruction">{mode === "odd" ? "Нажми на лишнее слово. Удерживай слово, чтобы увидеть перевод." : "Что объединяет эти слова? Нажми на слово, чтобы увидеть перевод."}</p>
    <div className="house-odd-words">{task.words.filter(id => mode === "odd" || id !== task.odd).map(id => <OddWord key={id} id={id} word={practiceWord(id)} selected={odd === id} showInfo={alwaysHints || (checked && !oddCorrect && odd === id)} hint={hint === id} onSelect={() => { if (mode === "common") { translate(id); return; } const next = odd === id ? null : id; setOdd(next); setChecked(false); setHint(null); }} onHint={() => translate(id)} />)}</div>
    <label className="house-toggle"><input type="checkbox" role="switch" checked={alwaysHints} onChange={event => { setAlwaysHints(event.target.checked); setHint(null); }} />Всегда показывать кнопки перевода ⓘ</label>
    <form onSubmit={event => { event.preventDefault(); setChecked(true); setHint(null); if (result !== "pt" || !oddCorrect) setHelped(true); }}>
      <label className="house-answer-label" htmlFor={inputId}>Что объединяет {mode === "odd" ? "остальные " : ""}слова?</label>
      <input ref={input} id={inputId} className="house-room-input" value={answer} maxLength={120} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="Ответ по-португальски или по-русски" autoComplete="off" autoCapitalize="none" spellCheck={false} />
      <div className="house-tools"><button type="submit" className="house-primary">Проверить</button><button type="button" aria-expanded={help} onClick={() => { setHelp(!help); setHelped(true); }}>Нужна подсказка?</button></div>
    </form>
    {help && <div className="house-feedback"><p>Какая группа подходит? Можно выбрать по-русски.</p><div className="house-place-options">{places.map(option => <button type="button" key={option} onClick={() => { const correct = option === task.place; setRussianCorrect(correct); setRussianFeedback(correct ? `✓ Да! ${place.translation} — ${place.label}. Теперь попробуй написать по-португальски.` : "Пока не подходит. Подумай, что объединяет оставшиеся предметы."); }}>{practiceWord(option).translation}</button>)}</div><p role="status">{russianFeedback}</p><button type="button" onClick={() => setRevealed(true)}>Показать ответ с объяснением</button></div>}
    {knownPlace && <div className="house-feedback"><strong>{place.translation} — <span lang="pt-PT">{place.label}</span></strong><p>Запомни название и введи его по-португальски.</p><button type="button" onClick={() => { setRussianCorrect(false); setRevealed(false); setRussianFeedback(""); setHelp(false); setChecked(false); setAnswer(""); input.current?.focus(); }}>Скрыть образец и попробовать</button></div>}
    {checked && <div className="house-feedback" role="status">{mode === "odd" && <p>{oddCorrect ? `✓ Лишнее слово найдено: ${practiceWord(task.odd).label} — ${practiceWord(task.odd).translation.toLowerCase()}.` : odd ? "× Попробуй выбрать другое лишнее слово." : "Выбери одно лишнее слово."}</p>}<p>{result === "pt" ? `✓ Группа названа верно: ${place.label} — ${place.translation.toLowerCase()}.` : result === "ru" ? `✓ По смыслу верно! По-португальски: ${place.label}. Попробуй написать это название.` : result === "empty" ? "Напиши название группы или открой подсказку." : "× Название группы пока не подходит. Можно ответить по-русски или открыть подсказку."}</p>{done && <p>{task.explanation}</p>}</div>}
    {revealed && <div className="house-feedback">{mode === "odd" && <p>Лишнее: <span lang="pt-PT">{practiceWord(task.odd).label}</span> — {practiceWord(task.odd).translation.toLowerCase()}.</p>}<p>{task.explanation}</p></div>}
    {(done || revealed) && <button type="button" className="house-primary" onClick={() => onNext(helped || revealed)}>{number === total ? "Завершить" : "Следующее задание →"}</button>}
  </div>;
}

export function OddWordExercise({ words, sets, mode = "odd" }: { words: readonly VocabularyWord[]; sets: readonly VocabularySet[]; mode?: "odd" | "common" }) {
  const [rounds, setRounds] = useState<readonly OddTask[]>([]);
  const [index, setIndex] = useState(0);
  const [helpedIds, setHelpedIds] = useState<string[]>([]);
  const [alwaysHints, setAlwaysHints] = useState(false);
  const top = useRef<HTMLElement>(null);
  const eligible = sets.filter(set => set.oddOneOut);
  const places = [...new Set(eligible.map(set => set.oddOneOut!.answerWordId))];
  const finished = rounds.length > 0 && index === rounds.length;
  return <section className="house-activity house-odd" ref={top}>
    {!rounds.length ? <><div className="house-heading"><h1>{mode === "odd" ? "Найди лишнее" : "Что общего?"}</h1></div><p>{mode === "odd" ? "Четыре слова относятся к одной группе, а одно — лишнее. Найди его и назови общую группу." : "Посмотри на четыре слова и назови, что их объединяет."} Можно отвечать по-русски, смотреть переводы и подсказки.</p><button type="button" className="house-primary" onClick={() => setRounds(generateOddTasks(eligible, Math.random))}>Начать · {eligible.length}</button></>
    : finished ? <div className="house-feedback"><h1>Готово! Muito bem!</h1><p>Можно повторить с подсказками или попробовать новые сочетания.</p>{helpedIds.length > 0 && <button type="button" className="house-primary" onClick={() => { setRounds(rounds.filter(task => helpedIds.includes(task.id))); setIndex(0); setHelpedIds([]); }}>Повторить то, где нужна была помощь</button>}<button type="button" onClick={() => { setRounds(generateOddTasks(eligible, Math.random)); setIndex(0); setHelpedIds([]); }}>Новые задания</button></div>
    : <OddRound key={rounds[index].id} task={rounds[index]} words={words} places={places} mode={mode} number={index + 1} total={rounds.length} alwaysHints={alwaysHints} setAlwaysHints={setAlwaysHints} onNext={helped => { if (helped) setHelpedIds(previous => [...previous, rounds[index].id]); setIndex(index + 1); top.current?.scrollIntoView({ block: "start" }); }} />}
  </section>;
}
