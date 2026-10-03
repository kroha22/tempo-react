"use client";

import { useState } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";

export function VocabularyCards({ words }: { words: readonly VocabularyWord[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const word = words[index];
  const showTranslation = reverse !== flipped;
  return <section className="house-activity vocabulary-cards">
    <div className="house-heading"><h1>Карточки</h1><span>{index + 1} / {words.length}</span></div>
    <label className="house-toggle"><input type="checkbox" checked={reverse} onChange={event => { setReverse(event.target.checked); setFlipped(false); }} />Сначала по-русски</label>
    <button type="button" className="vocabulary-flashcard" aria-label="Перевернуть карточку" aria-pressed={flipped} onClick={() => setFlipped(!flipped)}><small>{showTranslation ? "Русский" : "Português"}</small><strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? word.translation : word.label}</strong><span>Нажми, чтобы перевернуть</span></button>
    <div className="house-tools"><button type="button" disabled={index === 0} onClick={() => { setIndex(index - 1); setFlipped(false); }}>← Назад</button><button type="button" className="house-primary" onClick={() => { setIndex((index + 1) % words.length); setFlipped(false); }}>{index === words.length - 1 ? "Повторить набор" : "Следующая →"}</button></div>
  </section>;
}
