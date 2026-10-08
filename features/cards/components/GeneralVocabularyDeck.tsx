"use client";

import { useMemo, useState } from "react";
import { generalVocabulary } from "@/features/content/general-vocabulary";
import type { GeneralVocabularyPartOfSpeech } from "@/features/content/general-vocabulary-types";
import { vocabularyLessons } from "@/features/content/vocabulary-lessons";
import { DeckCardFrame } from "./DeckCardFrame";

type Confidence = "again" | "hard" | "good" | "easy";

const confidenceOptions: Array<{ value: Confidence; label: string }> = [
  { value: "again", label: "Не знаю" },
  { value: "hard", label: "Сложно" },
  { value: "good", label: "Помню" },
  { value: "easy", label: "Легко" },
];

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
  const [confidenceByCard, setConfidenceByCard] = useState<Record<string, Confidence>>({});
  const reviewedDisplays = useMemo(
    () => new Map(vocabularyLessons.flatMap((lesson) => lesson.items.map((item) => [item.sourceEntryId, item.display] as const))),
    [],
  );
  const card = generalVocabulary[index];
  const portuguese = reviewedDisplays.get(card.id) ?? card.portuguese;
  const showTranslation = reverse !== flipped;
  const confidenceCounts = useMemo(() => {
    const counts: Record<Confidence, number> = { again: 0, hard: 0, good: 0, easy: 0 };
    Object.values(confidenceByCard).forEach((value) => { counts[value] += 1; });
    return counts;
  }, [confidenceByCard]);

  function move(direction: -1 | 1) {
    setIndex((current) => (current + direction + generalVocabulary.length) % generalVocabulary.length);
    setFlipped(false);
  }

  function rate(value: Confidence) {
    setConfidenceByCard((current) => ({ ...current, [card.id]: value }));
    move(1);
  }

  return (
    <section className="cards-workspace" id="cards" aria-label="Колода «351 базовое слово»">
      <button type="button" className="deck-back" onClick={onBack}>← К выбору колоды</button>
      <div className="deck-heading">
        <div>
          <span className="deck-kicker">351 слово · базовая лексика</span>
          <h2>Базовые португальские слова</h2>
          <p>Существительные, глаголы, прилагательные и другие полезные слова для повторения.</p>
        </div>
        <div className="deck-stats" aria-label="Прогресс карточек в этой сессии">
          <div><strong>{confidenceCounts.again + confidenceCounts.hard}</strong><span>повторить</span></div>
          <div><strong>{Object.keys(confidenceByCard).length}</strong><span>встречалось</span></div>
          <div><strong>{confidenceCounts.good + confidenceCounts.easy}</strong><span>запомнено</span></div>
        </div>
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
        <DeckCardFrame text={portuguese} onPrevious={() => move(-1)} onNext={() => move(1)}><button
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
        </button></DeckCardFrame>
        <div className={`rating-panel ${flipped ? "visible" : ""}`} aria-hidden={!flipped}>
          <p>Насколько хорошо вспомнилось?</p>
          <div className="rating-buttons">
            {confidenceOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={option.value}
                disabled={!flipped}
                onClick={() => rate(option.value)}
              ><strong>{option.label}</strong></button>
            ))}
          </div>
        </div>
      </div>
      <p className="deck-note">Эта демонстрационная колода сохраняет исходный порядок подборки. Проверенные формы с артиклем и множественным числом показываются там, где они уже подготовлены.</p>
    </section>
  );
}
