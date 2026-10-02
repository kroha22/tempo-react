"use client";

import { useMemo, useState } from "react";
import { generalVocabulary } from "@/features/content/general-vocabulary";
import type { GeneralVocabularyPartOfSpeech } from "@/features/content/general-vocabulary-types";
import { vocabularyLessons } from "@/features/content/vocabulary-lessons";

const partOfSpeechLabels: Record<GeneralVocabularyPartOfSpeech, string> = {
  verb: "глагол",
  noun: "существительное",
  adjective: "прилагательное",
  "adverb-or-other": "другое",
};

export function GeneralVocabularyDeck({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const reviewedDisplays = useMemo(
    () => new Map(vocabularyLessons.flatMap((lesson) => lesson.items.map((item) => [item.sourceEntryId, item.display] as const))),
    [],
  );
  const card = generalVocabulary[index];
  const portuguese = reviewedDisplays.get(card.id) ?? card.portuguese;
  const showTranslation = reverse !== flipped;

  function move(direction: -1 | 1) {
    setIndex((current) => (current + direction + generalVocabulary.length) % generalVocabulary.length);
    setFlipped(false);
  }

  return (
    <section className="cards-workspace" id="cards" aria-label="Колода из 351 слова">
      <button type="button" className="deck-back" onClick={onBack}>← К выбору колоды</button>
      <div className="deck-heading">
        <div>
          <span className="deck-kicker">351 слово · общая подборка</span>
          <h2>Португальские слова</h2>
          <p>Существительные, глаголы, прилагательные и другие полезные слова из общей базы.</p>
        </div>
        <div className="deck-position" aria-label="Позиция в колоде"><strong>{index + 1}</strong><span>из {generalVocabulary.length}</span></div>
      </div>

      <div className="deck-progress" role="progressbar" aria-label="Позиция в колоде слов" aria-valuemin={1} aria-valuemax={generalVocabulary.length} aria-valuenow={index + 1}>
        <span style={{ width: `${((index + 1) / generalVocabulary.length) * 100}%` }} />
      </div>

      <div className="study-area">
        <div className="study-meta">
          <span>{partOfSpeechLabels[card.partOfSpeech]}</span>
          <span>{index + 1} / {generalVocabulary.length}</span>
        </div>
        <label className="deck-direction"><input type="checkbox" checked={reverse} onChange={(event) => { setReverse(event.target.checked); setFlipped(false); }} />Сначала по-русски</label>
        <button
          type="button"
          className={`flashcard general-vocabulary-card ${flipped ? "flipped" : ""}`}
          onClick={() => setFlipped((value) => !value)}
          aria-pressed={flipped}
          aria-label={showTranslation ? "Показать португальское слово" : "Показать перевод слова"}
        >
          <span className="card-corner">{showTranslation ? "русский" : "português"}</span>
          <span className={`card-face ${showTranslation ? "card-back" : "card-front"}`}>
            <small>{showTranslation ? "перевод" : partOfSpeechLabels[card.partOfSpeech]}</small>
            <strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? card.translation : portuguese}</strong>
            <em>{showTranslation ? portuguese : "Нажми, чтобы перевернуть"}</em>
          </span>
        </button>
        <div className="deck-step-actions">
          <button type="button" onClick={() => move(-1)}>← Предыдущее</button>
          <button type="button" className="primary-button" onClick={() => move(1)}>Следующее →</button>
        </div>
      </div>
      <p className="deck-note">Эта демонстрационная колода сохраняет исходный порядок подборки. Проверенные формы с артиклем и множественным числом показываются там, где они уже подготовлены.</p>
    </section>
  );
}
