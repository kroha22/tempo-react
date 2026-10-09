"use client";

import { useState } from "react";
import type { TempoPracticeDeck as PracticeDeck } from "../data/tempo-decks";
import { DeckCardFrame } from "./DeckCardFrame";

export function TempoPracticeDeck({ deck, onBack }: { deck: PracticeDeck; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const card = deck.cards[index];
  function move(delta: number) { setIndex(value => (value + delta + deck.cards.length) % deck.cards.length); setFlipped(false); }
  const reviewed = Object.values(ratings);
  return <section className="cards-workspace" aria-label={`Колода «${deck.title}»`}>
    <button type="button" className="deck-back" onClick={onBack}>← К выбору колоды</button>
    <div className="deck-heading"><div><span className="deck-kicker">Колода Tempo · {deck.category === "phrases" ? "фразы" : "формы глаголов"}</span><h2>{deck.title}</h2><p>{deck.description}</p></div><div className="deck-stats" aria-label="Прогресс в этой сессии"><div><strong>{reviewed.filter(value => value < 2).length}</strong><span>повторить</span></div><div><strong>{reviewed.length}</strong><span>встречалось</span></div><div><strong>{reviewed.filter(value => value >= 2).length}</strong><span>вспомнилось</span></div></div></div>
    <div className="deck-progress" role="progressbar" aria-label="Позиция в колоде Tempo" aria-valuemin={1} aria-valuemax={deck.cards.length} aria-valuenow={index + 1}><span style={{ width: `${(index + 1) / deck.cards.length * 100}%` }} /></div>
    <div className="study-area"><div className="study-meta"><span>{card.kind === "form" ? "Вспомни форму" : "Португальский → русский"}</span><span>{index + 1} / {deck.cards.length}</span></div>
      <DeckCardFrame text={card.spokenPortuguese} onPrevious={() => move(-1)} onNext={() => move(1)}><button type="button" className={`flashcard tempo-practice-card ${flipped ? "flipped" : ""}`} aria-label="Перевернуть карточку Tempo" aria-pressed={flipped} onClick={() => setFlipped(value => !value)}><span className="card-face"><small>{card.hint}</small><strong lang={flipped ? (card.kind === "form" ? "pt-PT" : "ru") : (card.kind === "form" ? "ru" : "pt-PT")}>{flipped ? (card.kind === "form" ? card.portuguese : card.russian) : card.prompt}</strong><em lang={flipped ? "pt-PT" : "ru"}>{flipped && card.kind === "expression" ? card.portuguese : flipped ? "Сравни форму с местоимением" : "Нажми, чтобы перевернуть"}</em></span></button></DeckCardFrame>
      {flipped && <div className="rating-panel visible"><p>Насколько хорошо вспомнилось?</p><div className="rating-buttons">{["Не знаю", "Сложно", "Помню", "Легко"].map((label, grade) => <button type="button" className={["again", "hard", "good", "easy"][grade]} key={label} onClick={() => { setRatings(previous => ({ ...previous, [card.id]: grade })); move(1); }}><strong>{label}</strong></button>)}</div></div>}
    </div><p className="deck-note">Оценки показаны для текущей сессии. Можно листать карточки стрелками и повторять колоду.</p>
  </section>;
}
