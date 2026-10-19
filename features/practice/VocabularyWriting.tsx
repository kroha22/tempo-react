"use client";

import { useRef, useState } from "react";
import { checkVocabularyWritingAnswer, type VocabularyWord } from "../content/vocabulary-model";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";
import styles from "./VocabularyWriting.module.css";

export function VocabularyWriting({ words, active = true }: { words: readonly VocabularyWord[]; active?: boolean }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | "accent" | null>(null);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const word = words[index];
  const resolved = result === "correct";
  if (!word) return <p>В этом наборе пока нет слов.</p>;
  function next() {
    if (index === words.length - 1) { setFinished(true); return; }
    setIndex(index + 1); setAnswer(""); setResult(null); setHint(false); input.current?.focus();
  }
  function insertLetter(letter: string) {
    const field = input.current;
    if (!field || resolved) return;
    const start = field.selectionStart ?? answer.length;
    const end = field.selectionEnd ?? start;
    setAnswer(answer.slice(0, start) + letter + answer.slice(end));
    setResult(null);
    field.focus();
    requestAnimationFrame(() => field.setSelectionRange(start + letter.length, start + letter.length));
  }
  if (finished) return <section className={styles.panel}><h2>Набор пройден!</h2><p>Вспомнилось: {score} из {words.length}</p><button type="button" onClick={() => { setIndex(0); setAnswer(""); setResult(null); setHint(false); setScore(0); setFinished(false); }}>Повторить набор</button></section>;
  return <section className={styles.panel} aria-label="Напиши слово">
    <header><span>{index + 1} / {words.length}</span><SpeechHelpButton /></header>
    <p className={styles.prompt}>Как это по-португальски?</p>
    <h2>{word.translation}</h2>
    <form onSubmit={event => {
      event.preventDefault();
      if (resolved) { next(); return; }
      if (!answer.trim()) return;
      const outcome = checkVocabularyWritingAnswer(word, answer, words);
      const correct = outcome === "correct";
      setResult(outcome);
      if (correct && !hint) setScore(score + 1);
    }}>
      <label htmlFor="vocabulary-writing-answer">Твой ответ</label>
      <input id="vocabulary-writing-answer" ref={input} lang="pt-PT" value={answer} onChange={event => { setAnswer(event.target.value); if (!resolved) setResult(null); }} readOnly={resolved} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Напиши слово…" aria-describedby="vocabulary-writing-feedback" />
      <div className={styles.letters} role="group" aria-label="Португальские буквы">{["á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"].map(letter => <button type="button" key={letter} lang="pt-PT" aria-label={`Вставить ${letter}`} disabled={resolved} onPointerDown={event => event.preventDefault()} onClick={() => insertLetter(letter)}>{letter}</button>)}</div>
      <small>Можно без артикля. Знаки ударения важны, если меняют значение слова.</small>
      <div id="vocabulary-writing-feedback" className={styles.feedback} role="status" aria-label="Результат проверки">
        {result === "wrong" && "Пока не так. Попробуй ещё раз или открой подсказку."}
        {result === "accent" && "Здесь знак ударения отличает одно слово от другого. Выбери нужную букву под полем или открой подсказку."}
        {(resolved || hint) && <><span>{resolved ? "Верно!" : "Подсказка:"} <strong lang="pt-PT">{word.label}</strong></span><CardSpeechButton text={word.label} disabled={!active} /></>}
      </div>
      <div className={styles.actions}><button type="submit" disabled={!resolved && !answer.trim()}>{resolved ? index === words.length - 1 ? "Завершить" : "Дальше" : "Проверить"}</button>{!resolved && <button type="button" aria-pressed={hint} onClick={() => { setHint(true); input.current?.focus(); }}>Подсказка</button>}</div>
    </form>
  </section>;
}
