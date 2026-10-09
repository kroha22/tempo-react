"use client";

import { useMemo, useState } from "react";
import { schoolInstructionCards } from "@/features/content/school-content";
import { DeckCardFrame } from "./DeckCardFrame";

type Confidence = "again" | "hard" | "good" | "easy";

const confidenceOptions: Array<{ value: Confidence; label: string }> = [
  { value: "again", label: "Не знаю" },
  { value: "hard", label: "Сложно" },
  { value: "good", label: "Помню" },
  { value: "easy", label: "Легко" },
];

export function SchoolInstructionsDeck({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [confidenceByCard, setConfidenceByCard] = useState<Record<string, Confidence>>({});
  const card = schoolInstructionCards[index];
  const showTranslation = reverse !== flipped;
  const counts = useMemo(() => {
    const next: Record<Confidence, number> = { again: 0, hard: 0, good: 0, easy: 0 };
    Object.values(confidenceByCard).forEach((value) => { next[value] += 1; });
    return next;
  }, [confidenceByCard]);

  function move(direction: -1 | 1) {
    setIndex((current) => (current + direction + schoolInstructionCards.length) % schoolInstructionCards.length);
    setFlipped(false);
  }

  function rate(value: Confidence) {
    setConfidenceByCard((current) => ({ ...current, [card.id]: value }));
    move(1);
  }

  return <section className="cards-workspace" id="cards" aria-label="Колода «Инструкции на уроке»">
    <button type="button" className="deck-back" onClick={onBack}>← К выбору колоды</button>
    <div className="deck-heading">
      <div>
        <span className="deck-kicker">Школа · 8 фраз</span>
        <h2>Инструкции на уроке</h2>
        <p>Повторяй короткие инструкции, которые звучат на уроке.</p>
      </div>
      <div className="deck-stats" aria-label="Прогресс карточек в этой сессии">
        <div><strong>{counts.again + counts.hard}</strong><span>повторить</span></div>
        <div><strong>{Object.keys(confidenceByCard).length}</strong><span>встречалось</span></div>
        <div><strong>{counts.good + counts.easy}</strong><span>запомнено</span></div>
      </div>
    </div>
    <div className="deck-progress" role="progressbar" aria-label="Позиция в колоде школьных инструкций" aria-valuemin={1} aria-valuemax={schoolInstructionCards.length} aria-valuenow={index + 1}>
      <span style={{ width: `${((index + 1) / schoolInstructionCards.length) * 100}%` }} />
    </div>
    <div className="study-area">
      <div className="study-meta"><span>инфинитив: <span lang="pt-PT">{card.infinitive}</span></span><span>{index + 1} / {schoolInstructionCards.length}</span></div>
      <label className="deck-direction"><input type="checkbox" checked={reverse} onChange={(event) => { setReverse(event.target.checked); setFlipped(false); }} />Сначала по-русски</label>
      <DeckCardFrame text={card.examplePt} onPrevious={() => move(-1)} onNext={() => move(1)}><button type="button" className={`flashcard general-vocabulary-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-pressed={flipped} aria-label={showTranslation ? "Показать португальскую фразу" : "Показать перевод фразы"}>
        <span className="card-corner">{showTranslation ? "русский" : "português"}</span>
        <span className={`card-face ${showTranslation ? "card-back" : "card-front"}`}>
          <small>{showTranslation ? "перевод" : "инструкция"}</small>
          <strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? card.exampleRu : card.examplePt}</strong>
          <em lang={showTranslation ? "pt-PT" : "ru"}>{showTranslation ? card.infinitive : "Нажми, чтобы перевернуть"}</em>
        </span>
      </button></DeckCardFrame>
      <div className={`rating-panel ${flipped ? "visible" : ""}`} aria-hidden={!flipped}>
        <p>Насколько хорошо вспомнилось?</p>
        <div className="rating-buttons">{confidenceOptions.map((option) => <button type="button" key={option.value} className={option.value} disabled={!flipped} onClick={() => rate(option.value)}><strong>{option.label}</strong></button>)}</div>
      </div>
    </div>
    <p className="deck-note">Глаголы этих инструкций также доступны в базовой колоде слов.</p>
  </section>;
}
