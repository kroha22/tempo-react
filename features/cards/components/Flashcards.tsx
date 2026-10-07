"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  hasLowerPresentationPriority,
  intervalLabel,
  nextInterval,
  type ReviewGrade,
} from "@/features/cards/scheduler";
import { verbCards } from "../data/verb-cards";
import { useReviewSession } from "../hooks/use-review-session";
import { EnsureCardsQueryScope } from "../query/CardsQueryBoundary";
import { Feedback } from "@/shared/ui/Feedback";
import { GeneralVocabularyDeck } from "./GeneralVocabularyDeck";
import { SchoolInstructionsDeck } from "./SchoolInstructionsDeck";
import { CardSpeechButton } from "./CardSpeechButton";

const gradeLabels: Array<{ grade: ReviewGrade; label: string; className: string }> = [
  { grade: 0, label: "Не знаю", className: "again" },
  { grade: 1, label: "Сложно", className: "hard" },
  { grade: 2, label: "Помню", className: "good" },
  { grade: 3, label: "Легко", className: "easy" },
];

export default function Flashcards() {
  const [deck, setDeck] = useState<"verbs" | "words" | "school" | null>(null);
  if (deck === "words") return <GeneralVocabularyDeck onBack={() => setDeck(null)} />;
  if (deck === "school") return <SchoolInstructionsDeck onBack={() => setDeck(null)} />;
  if (deck === "verbs") return <EnsureCardsQueryScope><ReviewCards onBack={() => setDeck(null)} /></EnsureCardsQueryScope>;
  return <DeckPicker onChoose={setDeck} />;
}

function DeckPicker({ onChoose }: { onChoose: (deck: "verbs" | "words" | "school") => void }) {
  return (
    <section className="deck-library" id="cards" aria-label="Колоды карточек">
      <div className="deck-library__heading">
        <span className="deck-kicker">Карточки</span>
        <h2>Выберите колоду</h2>
        <p>Частотные глаголы, базовая лексика и короткие тематические наборы.</p>
      </div>
      <div className="deck-library__grid">
        <button type="button" onClick={() => onChoose("verbs")} aria-label="Открыть колоду «1 000 глаголов»">
          <span className="deck-library__icon" aria-hidden="true">1000</span>
          <strong>1 000 глаголов</strong>
          <span>Частотная колода с интервальным повторением</span>
          <small>Открыть колоду →</small>
        </button>
        <button type="button" onClick={() => onChoose("words")} aria-label="Открыть колоду «351 базовое слово»">
          <span className="deck-library__icon deck-library__icon--words" aria-hidden="true">351</span>
          <strong>351 базовое слово</strong>
          <span>Глаголы, существительные, прилагательные и другие слова</span>
          <small>Открыть колоду →</small>
        </button>
        <button type="button" onClick={() => onChoose("school")} aria-label="Открыть колоду «Инструкции на уроке»">
          <span className="deck-library__icon deck-library__icon--school" aria-hidden="true">A+?</span>
          <strong>Инструкции на уроке</strong>
          <span>8 знакомых глаголов в школьных фразах</span>
          <small>Открыть колоду →</small>
        </button>
      </div>
    </section>
  );
}

function ReviewCards({ onBack }: { onBack: () => void }) {
  const faceId = useId();
  const cardButton = useRef<HTMLButtonElement>(null);
  const { card: currentCard, progress, flipped, status, sessionCount, stats, rate, retry, flip, refreshError, refreshing, refresh } = useReviewSession();
  const loading = status === "loading";
  const ready = status === "ready";
  const canFlip = ready || status === "load-error";
  const { due: dueCount, seen: seenCount, learned: learnedCount } = stats;

  useEffect(() => {
    // A confirmed review reveals a new word; keep keyboard review in the card.
    if (sessionCount > 0) cardButton.current?.focus();
  }, [sessionCount]);

  if (!currentCard) return <p role="status">В колоде пока нет карточек.</p>;

  return (
    <section className="cards-workspace" id="cards" aria-label="Карточки для запоминания глаголов">
      <button type="button" className="deck-back" onClick={onBack}>← К выбору колоды</button>
      <div className="deck-heading">
        <div>
          <span className="deck-kicker">1000 глаголов · по частоте</span>
          <h2>Повторение глаголов</h2>
          <p>Сначала попробуй вспомнить перевод, потом переверни карточку и оцени себя.</p>
        </div>
        <div className="deck-stats" aria-label="Прогресс карточек">
          <div><strong>{dueCount}</strong><span>повторить</span></div>
          <div><strong>{seenCount}</strong><span>встречалось</span></div>
          <div><strong>{learnedCount}</strong><span>запомнено</span></div>
        </div>
      </div>

      <div className="deck-progress" role="progressbar" aria-label="Изучено глаголов" aria-valuemin={0} aria-valuemax={verbCards.length} aria-valuenow={seenCount}>
        <span style={{ width: `${seenCount / verbCards.length * 100}%` }} />
      </div>

      <div className="study-area">
        <div className="review-status">
          {refreshError && <Feedback tone="error" action={{ label: "Повторить обновление", onClick: refresh, pending: refreshing }}>Не удалось обновить прогресс. Текущая карточка сохранена на экране.</Feedback>}
          {status === "saving" && <Feedback tone="status">Сохраняем оценку…</Feedback>}
          {status === "load-error" && <Feedback tone="error" action={{ label: "Загрузить ещё раз", onClick: retry }}>Не удалось загрузить прогресс. Проверьте подключение и вход в аккаунт.</Feedback>}
          {status === "save-error" && <Feedback tone="error" action={{ label: "Повторить сохранение", onClick: retry }}>Оценка не подтверждена сервером. Повторите сохранение, прежде чем продолжить.</Feedback>}
        </div>
        <div className="study-meta">
          <span>Сегодня: {sessionCount}</span>
          <span>№ {currentCard.rank} по частоте</span>
        </div>

        <button
          type="button"
          className={`flashcard ${flipped ? "flipped" : ""}`}
          ref={cardButton}
          onClick={flip}
          disabled={!canFlip}
          aria-busy={loading || status === "saving"}
          aria-label={flipped ? "Показать португальское слово" : "Показать перевод"}
          aria-describedby={loading ? undefined : faceId}
        >
          <span className="card-corner">{hasLowerPresentationPriority(currentCard) ? "базовое · реже" : "português"}</span>
          {loading ? (
            <span className="card-loading">Загружаю прогресс…</span>
          ) : flipped ? (
            <span className="card-face card-back">
              <small>по-русски</small>
              <strong id={faceId}>{currentCard.ru}</strong>
              <em lang="pt-PT">{currentCard.pt}</em>
            </span>
          ) : (
            <span className="card-face card-front">
              <small>португальский</small>
              <strong id={faceId} lang="pt-PT">{currentCard.pt}</strong>
              <em>Нажми, чтобы перевернуть</em>
            </span>
          )}
        </button>

        <CardSpeechButton key={currentCard.id} text={currentCard.pt} disabled={loading} />

        {!flipped && canFlip && (
          <button type="button" className="unknown-card-button" onClick={flip}>
            Не знаю этот глагол — показать перевод
          </button>
        )}

        <div className={`rating-panel ${flipped ? "visible" : ""}`} aria-hidden={!flipped}>
          <p>Насколько хорошо вспомнилось?</p>
          <div className="rating-buttons">
            {gradeLabels.map((item) => (
              <button type="button" key={item.grade} className={item.className} disabled={!flipped || !ready} onClick={() => rate(item.grade)}>
                <strong>{item.label}</strong>
                <span>{intervalLabel(nextInterval(progress[currentCard.id], item.grade, hasLowerPresentationPriority(currentCard)))}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="deck-note">Слова, которые даются тяжело, вернутся через минуты. Хорошо знакомые — через дни и недели. Самые базовые глаголы сразу получают более длинные интервалы.</p>
      <p className="deck-source">Частотный порядок: <a href="https://kizombrazil.wordpress.com/2013/02/10/os-1000-verbos-portugueses-mais-comuns/" target="_blank" rel="noreferrer">Corpus do Português</a> · словарь: <a href="https://freedict.org/" target="_blank" rel="noreferrer">FreeDict / WikDict</a></p>
    </section>
  );
}
