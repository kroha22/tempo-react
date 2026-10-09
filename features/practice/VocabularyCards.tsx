"use client";

import { useState } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";

export function VocabularyCards({ words, active = true }: { words: readonly VocabularyWord[]; active?: boolean }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];
  const showTranslation = flipped;
  function move(nextIndex: number) { setIndex(nextIndex); setFlipped(false); }
  return <section className="house-activity vocabulary-cards">
    <div className="vocabulary-card-counter" aria-live="polite">{index + 1} / {words.length}</div>
    <div className="vocabulary-card-carousel">
      <button type="button" className="vocabulary-page-arrow" aria-label="Предыдущая карточка" disabled={index === 0} onClick={() => move(index - 1)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg></button>
      <div className="vocabulary-card-glass" data-tone={index % 3}>
        <div className="speech-help-corner"><SpeechHelpButton /></div>
        <button type="button" className="vocabulary-flashcard" aria-label="Перевернуть карточку" aria-pressed={flipped} onClick={() => setFlipped(!flipped)}><small>{showTranslation ? "Русский" : "Português"}</small><strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? word.translation : word.label}</strong><span className="vocabulary-tap-hint"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M13 21V11a2 2 0 0 1 4 0v7l2-2 5 3v5c0 4-3 6-6 6h-2l-7-8a2 2 0 0 1 3-3l1 2Z"/><path d="M15 3V1m-6 5L7 4m14 2 2-2M6 11H3m21 0h3"/></svg>Нажми, чтобы перевернуть</span></button>
        <div className="vocabulary-card-speaker"><CardSpeechButton key={word.id} text={word.label} disabled={!active} /></div>
      </div>
      <button type="button" className="vocabulary-page-arrow" aria-label={index === words.length - 1 ? "Повторить набор" : "Следующая карточка"} onClick={() => move((index + 1) % words.length)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>
    </div>
  </section>;
}
