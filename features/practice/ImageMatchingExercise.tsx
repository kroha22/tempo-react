"use client";

import {ActivityCompletion} from "./ActivityCompletion";
import { useRef, useState } from "react";
import { checkImageAnswers, placeImageWord, type ImageAnswers, type ImageMatchingDefinition } from "./image-matching";
import type { VocabularyWord } from "../content/vocabulary-model";
import { WordCelebration } from "./WordCelebration";
import motion from "./PracticeMotion.module.css";

export function ImageMatchingExercise({ definition, words, embedded=false }: { definition: ImageMatchingDefinition; words: readonly VocabularyWord[]; embedded?:boolean }) {
  const houseWords = definition.wordIds.map((id, index) => { const word = words.find(word => word.id === id); if (!word) throw new Error(`Unknown image word: ${id}`); return { ...word, number: index + 1 }; });
  const houseIllustration = definition.image;
  const total = definition.spots.length;
  const [answers, setAnswers] = useState<ImageAnswers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [instant, setInstant] = useState(false);
  const [alwaysHints, setAlwaysHints] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [resetPrompt, setResetPrompt] = useState(false);
  const [message, setMessage] = useState("Выбери слово, затем квадрат на картинке.");
  const [pulses,setPulses]=useState<Record<string,{sequence:number;confirmed:boolean}>>({});
  const [celebrate,setCelebrate]=useState(false);
  const pulseSequence=useRef(0);
  const resetButton = useRef<HTMLButtonElement>(null);
  const selectedWord = houseWords.find(word => word.id === selected);
  const results = checkImageAnswers(definition, answers);
  const correct = results.filter(result => result.status === "correct").length;

  function place(spotId: string) {
    setHint(null);
    setCelebrate(false);
    setChecked(false);
    if (selected) {
      const next=placeImageWord(answers, spotId, selected);
      const nextResults=checkImageAnswers(definition,next);
      const confirmed=instant&&nextResults.find(result=>result.id===spotId)?.status==="correct";
      setAnswers(next);
      setPulses(previous=>({...previous,[spotId]:{sequence:++pulseSequence.current,confirmed}}));
      if(instant&&nextResults.every(result=>result.status==="correct"))setCelebrate(true);
      setMessage(`${selectedWord?.number} · ${selectedWord?.label} — поставлено. Выбери следующее слово.`);
      setSelected(null);
    } else if (answers[spotId]) {
      setSelected(answers[spotId]);
      setAnswers(Object.fromEntries(Object.entries(answers).filter(([key]) => key !== spotId)));
      setPulses(previous=>Object.fromEntries(Object.entries(previous).filter(([key])=>key!==spotId)));
      setMessage("Выбери новый квадрат для этого слова.");
    } else setMessage("Сначала выбери слово из списка.");
  }

  function check() {
    if(checked)return;
    setChecked(true);setSelected(null);
    setPulses(Object.fromEntries(results.filter(result=>result.status==="correct").map(result=>[result.id,{sequence:++pulseSequence.current,confirmed:true}])));
    if(correct===total)setCelebrate(true);
  }
  return <section className="house-activity" style={{position:"relative"}} onClick={event => { if (!(event.target as HTMLElement).closest(".house-info,.house-hint")) setHint(null); }} onKeyDown={event => { if (event.key === "Escape") { setHint(null); setResetPrompt(false); } }}>
    {celebrate&&<WordCelebration word={{id:"image-complete",label:"Muito bem!",translation:"Всё верно"}} onFinish={()=>setCelebrate(false)}/>}
    {!embedded&&<div className="house-heading"><div><span className="tempo-kicker">Задание по картинке · {houseWords.length} слов</span><h1 lang={definition.titleLang ?? "pt-PT"}>{definition.title}</h1></div>{definition.cardsHref && <a href={definition.cardsHref}>Изучить слова в карточках →</a>}</div>}
    <p className="house-status" aria-live="polite">{selectedWord ? `${selectedWord.number} · ${selectedWord.label} — нажми на квадрат.` : message}</p>
    <div className="house-tools"><button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? "Показать целиком" : "Увеличить картинку"}</button><span>{Object.keys(answers).length} из {total}</span>{zoom && <small>Прокручивай картинку вбок</small>}</div>
    <div className="house-image-scroll"><div className={`house-image${zoom ? " is-zoomed" : ""}`} style={{ aspectRatio: `${houseIllustration.crop.width}/${houseIllustration.crop.height}` }}>
      {/* Crop metadata and hit targets use the same revised illustration coordinates. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={houseIllustration.src} alt={houseIllustration.alt} width={houseIllustration.width} height={houseIllustration.height} style={{ width: `${houseIllustration.width / houseIllustration.crop.width * 100}%`, left: `${-houseIllustration.crop.x / houseIllustration.crop.width * 100}%`, top: `${-houseIllustration.crop.y / houseIllustration.crop.height * 100}%` }} />
      {definition.spots.map((spot, index) => {
        const word = houseWords.find(item => item.id === answers[spot.id]);
        const result = (checked || instant) && word ? results[index].status : "";
        const point = [spot.x, spot.y];
        const pulse=pulses[spot.id];
        return <button key={spot.id} type="button" className={`house-spot ${word ? "is-filled" : ""} ${result}`} style={{ left: `${(point[0] - houseIllustration.crop.x) / houseIllustration.crop.width * 100}%`, top: `${(point[1] - houseIllustration.crop.y) / houseIllustration.crop.height * 100}%` }} onClick={() => place(spot.id)} aria-label={`Квадрат ${index + 1}${word ? `, номер ${word.number}, ${word.label}` : ", пустой"}${result === "correct" ? ", верно" : result === "wrong" ? ", ошибка" : ""}`}>{word?.number}{word&&pulse&&<span key={pulse.sequence} aria-hidden="true" data-feedback={pulse.confirmed&&(instant||checked)?"confirmed":"placed"} className={`${motion.placement} ${pulse.confirmed&&(instant||checked)?motion.confirmed:""}`}/>}</button>;
      })}
    </div></div>
    <label className="house-toggle"><input type="checkbox" role="switch" checked={instant} onChange={event => { setInstant(event.target.checked); setChecked(false); setHint(null); }} />Показывать ошибки сразу</label>
    <label className="house-toggle"><input type="checkbox" role="switch" checked={alwaysHints} onChange={event => { setAlwaysHints(event.target.checked); setHint(null); }} />Всегда показывать кнопки перевода ⓘ</label>
    <div className="house-words" role="group" aria-label="Слова для расстановки">
      {houseWords.map(word => {
        const spot = Object.keys(answers).find(key => answers[key] === word.id);
        const result = (checked || instant) && spot ? (results.find(result => result.id === spot)?.status ?? "") : "";
        const showInfo = alwaysHints || result === "wrong";
        return <div key={word.id} className={`house-word-entry ${spot ? "is-placed" : ""} ${result} ${selected === word.id ? "is-selected" : ""} ${showInfo ? "has-info" : ""}`}>
          <button type="button" className="house-word" aria-pressed={selected === word.id} onClick={() => { setSelected(selected === word.id ? null : word.id); setResetPrompt(false); }}><b>{word.number}</b><span lang="pt-PT">{word.label}</span>{spot && <span className="house-mark" aria-label={result === "correct" ? "Верно" : result === "wrong" ? "Ошибка" : "Расставлено"}>{result === "correct" ? "✓" : result === "wrong" ? "×" : "•"}</span>}</button>
          {showInfo && <button type="button" className="house-info" aria-label={`Перевод: ${word.label}`} aria-expanded={hint === word.id} aria-controls={`hint-${word.id}`} onClick={() => setHint(hint === word.id ? null : word.id)}>ⓘ</button>}
          {showInfo && hint === word.id && <div className="house-hint" id={`hint-${word.id}`} role="status">{word.translation}</div>}
        </div>;
      })}
    </div>
    <div className="house-tools"><button type="button" className="house-primary" onClick={check}>Проверить</button><button type="button" ref={resetButton} onClick={() => setResetPrompt(true)}>Сбросить</button></div>
    {resetPrompt && <div className="house-reset" role="group" aria-label="Подтверждение сброса"><span>Очистить все расставленные номера?</span><button type="button" onClick={() => { setAnswers({}); setSelected(null); setChecked(false); setHint(null); setResetPrompt(false);setPulses({});setCelebrate(false); setMessage("Выбери слово, затем квадрат на картинке."); resetButton.current?.focus(); }}>Да, очистить</button><button type="button" onClick={() => { setResetPrompt(false); resetButton.current?.focus(); }}>Отмена</button></div>}
    {(checked||instant)&&correct===total&&<ActivityCompletion id={`image:${definition.id}`} title={definition.title} group="Слова и игры" correct={correct} total={total} scoreLabel="На своих местах"/>}
    <p className="house-result" aria-live="polite">{(checked || instant) ? correct === total ? "Всё верно! Muito bem!" : `Верно: ${correct} из ${total}. Пустых: ${total - Object.keys(answers).length}. ✓ — верно, × — попробуй другой квадрат.` : ""}</p>
  </section>;
}
