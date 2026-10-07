"use client";

import { useMemo, useState } from "react";
import { schoolInstructionCards } from "@/features/content/school-content";
import { CardSpeechButton } from "./CardSpeechButton";

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
        <span className="deck-kicker">Школа · 8 глаголов</span>
        <h2>Инструкции на уроке</h2>
        <p>Сначала вспомни глагол, затем посмотри, как он звучит в короткой учебной фразе.</p>
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
      <button type="button" className={`flashcard general-vocabulary-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-pressed={flipped} aria-label={showTranslation ? "Показать португальский глагол" : "Показать перевод глагола"}>
        <span className="card-corner">{showTranslation ? "русский" : "português"}</span>
        <span className={`card-face ${showTranslation ? "card-back" : "card-front"}`}>
          <small>{showTranslation ? "перевод" : "глагол"}</small>
          <strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? card.translation : card.label}</strong>
          <em lang={showTranslation ? "pt-PT" : "ru"}>{showTranslation ? card.examplePt : card.exampleRu}</em>
        </span>
      </button>
      <CardSpeechButton key={card.id} text={card.infinitive} />
      {flipped && <CardSpeechButton key={`${card.id}-example`} text={card.examplePt} label="Послушать пример" />}
      <div className={`rating-panel ${flipped ? "visible" : ""}`} aria-hidden={!flipped}>
        <p>Насколько хорошо вспомнилось?</p>
        <div className="rating-buttons">{confidenceOptions.map((option) => <button type="button" key={option.value} className={option.value} disabled={!flipped} onClick={() => rate(option.value)}><strong>{option.label}</strong></button>)}</div>
      </div>
      <div className="deck-step-actions"><button type="button" onClick={() => move(-1)}>← Предыдущее</button><button type="button" className="primary-button" onClick={() => move(1)}>Следующее →</button></div>
    </div>
    <p className="deck-note">Форма в примере помогает распознать школьную инструкцию; карточка остаётся связана с тем же инфинитивом из колоды 1 000 глаголов.</p>
  </section>;
}
