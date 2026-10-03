"use client";

import { useMemo, useState } from "react";
import { generalVocabulary } from "@/features/content/general-vocabulary";
import type { GeneralVocabularyPartOfSpeech } from "@/features/content/general-vocabulary-types";
import { vocabularyLessons, type VocabularyLesson } from "@/features/content/vocabulary-lessons";
import styles from "./VocabularyLessons.module.css";

type View = "topics" | "catalog" | "lesson";
type LessonStage = "overview" | "cards" | "quiz" | "summary";
type PartOfSpeechFilter = "all" | GeneralVocabularyPartOfSpeech;

const partOfSpeechLabels: Record<GeneralVocabularyPartOfSpeech, string> = {
  verb: "глагол",
  noun: "существительное",
  adjective: "прилагательное",
  "adverb-or-other": "другое",
};

const filters: readonly { id: PartOfSpeechFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "verb", label: "Глаголы" },
  { id: "noun", label: "Существительные" },
  { id: "adjective", label: "Прилагательные" },
  { id: "adverb-or-other", label: "Другие" },
];

function quizOptions(lesson: VocabularyLesson, index: number): string[] {
  const correct = lesson.items[index].translation;
  const distractors = [
    lesson.items[(index + 2) % lesson.items.length].translation,
    lesson.items[(index + 4) % lesson.items.length].translation,
  ];
  const options = [correct, ...distractors];
  const offset = index % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

export default function VocabularyLessons({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<View>("topics");
  const [lessonId, setLessonId] = useState(vocabularyLessons[0].id);
  const [stage, setStage] = useState<LessonStage>("overview");
  const [itemIndex, setItemIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quizSelection, setQuizSelection] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PartOfSpeechFilter>("all");
  const [visibleCount, setVisibleCount] = useState(48);

  const selectedLesson = vocabularyLessons.find((lesson) => lesson.id === lessonId) ?? vocabularyLessons[0];
  const currentItem = selectedLesson.items[itemIndex];
  const catalog = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-PT");
    return generalVocabulary.filter((entry) => {
      const matchesFilter = filter === "all" || entry.partOfSpeech === filter;
      const matchesQuery = !normalized
        || entry.portuguese.toLocaleLowerCase("pt-PT").includes(normalized)
        || entry.translation.toLocaleLowerCase("ru").includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  function openLesson(lesson: VocabularyLesson) {
    setLessonId(lesson.id);
    setStage("overview");
    setItemIndex(0);
    setRevealed(false);
    setQuizSelection(null);
    setScore(0);
    setView("lesson");
  }

  function startCards() {
    setStage("cards");
    setItemIndex(0);
    setRevealed(false);
  }

  function advanceCard() {
    if (itemIndex < selectedLesson.items.length - 1) {
      setItemIndex((value) => value + 1);
      setRevealed(false);
      return;
    }
    setStage("quiz");
    setItemIndex(0);
    setQuizSelection(null);
    setScore(0);
  }

  function answerQuiz(option: string) {
    if (quizSelection) return;
    setQuizSelection(option);
    if (option === currentItem.translation) setScore((value) => value + 1);
  }

  function advanceQuiz() {
    if (itemIndex < selectedLesson.items.length - 1) {
      setItemIndex((value) => value + 1);
      setQuizSelection(null);
      return;
    }
    setStage("summary");
  }

  function showView(nextView: Exclude<View, "lesson">) {
    setView(nextView);
    setVisibleCount(48);
  }

  const Root = embedded ? "section" : "main";
  return (
    <Root className={`${styles.shell} ${embedded ? styles.embedded : ""}`} aria-label="Изучение слов">
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Palavras · 351</p>
          <h1>Слова по темам</h1>
          <p>Небольшие уроки с примерами, карточками и быстрой проверкой.</p>
        </div>
        <div className={styles.summary} aria-label="Состав подборки">
          <strong>{vocabularyLessons.length}</strong>
          <span>тем · по 6 слов</span>
        </div>
      </header>

      <nav className={styles.viewTabs} aria-label="Режим изучения слов">
        <button className={view !== "catalog" ? styles.activeTab : ""} onClick={() => showView("topics")}>Уроки по темам</button>
        <button className={view === "catalog" ? styles.activeTab : ""} onClick={() => showView("catalog")}>Вся подборка · 351</button>
      </nav>

      {view === "topics" && (
        <section className={styles.topicGrid} aria-label="Темы слов">
          {vocabularyLessons.map((lesson, index) => (
            <button className={styles.topicCard} key={lesson.id} onClick={() => openLesson(lesson)}>
              <span className={styles.topicIcon} aria-hidden="true">{lesson.icon}</span>
              <span className={styles.topicNumber}>Урок {String(index + 1).padStart(2, "0")}</span>
              <strong>{lesson.title}</strong>
              <span className={styles.topicDescription}>{lesson.description}</span>
              <span className={styles.wordPreview}>{lesson.items.map((item) => item.lemma).join(" · ")}</span>
              <span className={styles.topicAction}>Открыть урок <span aria-hidden="true">→</span></span>
            </button>
          ))}
        </section>
      )}

      {view === "catalog" && (
        <section className={styles.catalog} aria-label="Полная подборка слов">
          <div className={styles.catalogIntro}>
            <div>
              <h2>Каталог слов</h2>
              <p>Исходная форма и перевод. Артикли, формы и примеры добавлены в тематических уроках после проверки.</p>
            </div>
            <label className={styles.search}>
              <span>Найти слово</span>
              <input
                type="search"
                value={query}
                placeholder="Например, viajar или город"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(48);
                }}
              />
            </label>
          </div>
          <div className={styles.filters} aria-label="Часть речи">
            {filters.map((item) => (
              <button
                key={item.id}
                className={filter === item.id ? styles.activeFilter : ""}
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id);
                  setVisibleCount(48);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className={styles.resultCount} aria-live="polite">Найдено: {catalog.length}</p>
          <div className={styles.wordList}>
            {catalog.slice(0, visibleCount).map((entry) => (
              <article className={styles.wordRow} key={entry.id}>
                <div><strong lang="pt-PT">{entry.portuguese}</strong><span>{partOfSpeechLabels[entry.partOfSpeech]}</span></div>
                <p>{entry.translation}</p>
                {entry.existingCardId && <span className={styles.inDeck}>есть в колоде</span>}
              </article>
            ))}
          </div>
          {catalog.length === 0 && <p className={styles.empty}>Ничего не найдено. Попробуйте другой запрос.</p>}
          {visibleCount < catalog.length && (
            <button className={styles.loadMore} onClick={() => setVisibleCount((value) => value + 48)}>Показать ещё</button>
          )}
        </section>
      )}

      {view === "lesson" && (
        <section className={styles.lesson} aria-label={`Урок: ${selectedLesson.title}`}>
          <button className={styles.backButton} onClick={() => showView("topics")}><span aria-hidden="true">←</span> Ко всем темам</button>
          <div className={styles.lessonHeading}>
            <span className={styles.lessonIcon} aria-hidden="true">{selectedLesson.icon}</span>
            <div>
              <p className={styles.kicker}>{stage === "overview" ? "Знакомство" : stage === "cards" ? "Карточки" : stage === "quiz" ? "Проверка" : "Готово"}</p>
              <h2>{selectedLesson.title}</h2>
            </div>
            {stage !== "summary" && <span className={styles.progressLabel}>{stage === "overview" ? "6 слов" : `${itemIndex + 1} / ${selectedLesson.items.length}`}</span>}
          </div>

          {stage === "overview" && (
            <>
              <div className={styles.canDo}>
                <span>После урока</span>
                <strong>{selectedLesson.canDo}</strong>
                <p><span lang="pt-PT">{selectedLesson.examplePt}</span><br />{selectedLesson.exampleRu}</p>
              </div>
              <div className={styles.lessonWords}>
                {selectedLesson.items.map((item) => (
                  <article key={item.id}>
                    <div><strong lang="pt-PT">{item.display}</strong><span>{item.translation}</span></div>
                    <p><span lang="pt-PT">{item.examplePt}</span><br />{item.exampleRu}</p>
                  </article>
                ))}
              </div>
              <button className={styles.primaryAction} onClick={startCards}>Начать карточки</button>
            </>
          )}

          {stage === "cards" && (
            <div className={styles.practiceStage}>
              <div className={styles.progressTrack}><span style={{ width: `${((itemIndex + 1) / selectedLesson.items.length) * 100}%` }} /></div>
              <button className={styles.flashcard} aria-expanded={revealed} onClick={() => setRevealed(true)}>
                <span className={styles.cardHint}>{revealed ? "Перевод и пример" : "Нажмите, чтобы открыть"}</span>
                <strong lang="pt-PT">{currentItem.display}</strong>
                {revealed ? (
                  <span className={styles.reveal}>
                    <b>{currentItem.translation}</b>
                    <span lang="pt-PT">{currentItem.examplePt}</span>
                    <span>{currentItem.exampleRu}</span>
                  </span>
                ) : <span className={styles.tapMark} aria-hidden="true">+</span>}
              </button>
              {revealed && (
                <div className={styles.ratingActions}>
                  <button onClick={advanceCard}>↺ Не помню</button>
                  <button className={styles.rememberButton} onClick={advanceCard}>✓ Помню</button>
                </div>
              )}
            </div>
          )}

          {stage === "quiz" && (
            <div className={styles.quizStage}>
              <div className={styles.progressTrack}><span style={{ width: `${((itemIndex + 1) / selectedLesson.items.length) * 100}%` }} /></div>
              <p className={styles.questionLabel}>Выберите перевод</p>
              <h3 lang="pt-PT">{currentItem.display}</h3>
              <div className={styles.quizOptions}>
                {quizOptions(selectedLesson, itemIndex).map((option) => {
                  const isCorrect = option === currentItem.translation;
                  const isSelected = option === quizSelection;
                  const stateClass = quizSelection
                    ? isCorrect ? styles.correctOption : isSelected ? styles.wrongOption : ""
                    : "";
                  return <button key={option} className={stateClass} disabled={quizSelection !== null} onClick={() => answerQuiz(option)}>{option}</button>;
                })}
              </div>
              {quizSelection && (
                <div className={styles.quizFeedback} aria-live="polite">
                  <strong>{quizSelection === currentItem.translation ? "✓ Верно" : "✕ Пока нет"}</strong>
                  <span>Правильный ответ: {currentItem.translation}</span>
                  <button className={styles.primaryAction} onClick={advanceQuiz}>{itemIndex === selectedLesson.items.length - 1 ? "Посмотреть результат" : "Следующее слово"}</button>
                </div>
              )}
            </div>
          )}

          {stage === "summary" && (
            <div className={styles.lessonSummary}>
              <span aria-hidden="true">✓</span>
              <p className={styles.kicker}>Тема пройдена</p>
              <h3>{score} из {selectedLesson.items.length}</h3>
              <p>{score === selectedLesson.items.length ? "Все слова узнаны." : "Можно ещё раз пройти карточки и повторить сложные слова."}</p>
              <div className={styles.summaryActions}>
                <button onClick={() => showView("topics")}>К другим темам</button>
                <button className={styles.primaryAction} onClick={startCards}>Повторить урок</button>
              </div>
            </div>
          )}
        </section>
      )}
    </Root>
  );
}
