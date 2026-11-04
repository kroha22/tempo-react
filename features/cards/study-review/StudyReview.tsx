"use client";
import { useEffect, useRef } from "react";
import { EnsureQueryScope } from "@/shared/query/SessionQueryBoundary";
import { LegacyLessonLink } from "@/features/practice/LegacyLessonLink";
import { Button } from "@/shared/ui/Button";
import { intervalLabel, nextInterval, type ReviewGrade } from "../scheduler";
import { studyReviewCardById, vocabularyHref } from "./catalog";
import { useStudyReview } from "./use-study-review";
import styles from "../../learning/gramatica/grammar.module.css";

const grades: { grade: ReviewGrade; label: string }[] = [{ grade: 0, label: "Не знаю" }, { grade: 1, label: "Сложно" }, { grade: 2, label: "Помню" }, { grade: 3, label: "Легко" }];
export function StudyReview({ unit, practiceOnly = false }: { unit?: number; practiceOnly?: boolean }) {
  if (practiceOnly) return <section className={styles.course}><h1>Интервальное повторение</h1><p>Для оценок и расписания нужен Tempo с серверным сохранением. В статическом демо можно изучать словарь.</p><LegacyLessonLink href={vocabularyHref(unit)}>Открыть карточки словаря →</LegacyLessonLink></section>;
  return <EnsureQueryScope><ReviewSession key={unit ?? "all"} unit={unit} /></EnsureQueryScope>;
}
function ReviewSession({ unit }: { unit?: number }) {
  const session = useStudyReview(unit);
  const { active, status } = session;
  const card = active ? studyReviewCardById.get(active.studyItemId) : undefined;
  const face = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (session.count > 0) face.current?.focus(); }, [session.count]);
  const ready = status === "ready" && !session.accessBlocked;
  const receipt = session.receipt;
  return <section className={styles.course}>
    <LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>
    <span className="tempo-kicker">Взрослый вариант · интервальное повторение</span>
    <h1>Повторение{unit ? ` · урок ${unit}` : ""}</h1>
    <p>Только сохранённые карточки. Сначала просроченные, затем новые. Оценено за эту сессию: {session.count}.</p>
    {session.accessBlocked && <div className={styles.error} role="alert"><p>Для повторения и сохранения оценок нужно войти.</p><Button onClick={session.retry}>Повторить проверку доступа</Button></div>}
    {!session.accessBlocked && status === "loading" && <p role="status">Загружаем расписание…</p>}
    {!session.accessBlocked && status === "load-error" && <div className={styles.error} role="alert"><p>Не удалось загрузить расписание.</p><Button onClick={session.retry}>Повторить загрузку</Button></div>}
    {!session.accessBlocked && status === "save-error" && <div className={styles.error} role="alert"><p>Не удалось сохранить оценку. Карточка остаётся на месте.</p><Button onClick={session.retry}>Повторить сохранение оценки</Button></div>}
    {!session.accessBlocked && status === "conflict" && <div className={styles.error} role="alert"><p>Расписание изменилось в другой сессии. Загрузите его заново перед новой оценкой.</p><Button onClick={session.reload}>Обновить расписание</Button></div>}
    {session.refreshError && <div className={styles.error} role="alert"><p>Не удалось обновить расписание. Показана последняя подтверждённая карточка.</p><Button onClick={session.reload}>Повторить обновление</Button></div>}
    {receipt?.progress && ready && <p role="status">Оценка сохранена. Следующее повторение: {new Date(receipt.progress.due).toLocaleString("ru-RU")}. Интервал: {intervalLabel(receipt.progress.interval)}.</p>}
    {card && active && !session.accessBlocked && <article className={styles.card}>
      <span>{active.progress ? "Пора повторить" : "Новая карточка"}</span>
      <button ref={face} className={`${styles.flashcard} ${styles.reviewFace}`} disabled={!ready} aria-expanded={session.flipped} aria-label={session.flipped ? "Скрыть ответ" : "Показать ответ"} onClick={session.flip}>
        <strong lang="pt-PT">{card.front}</strong><span lang="pt-PT">{card.examples[0]?.pt}</span>
        <small>{session.flipped ? "Скрыть ответ" : "Вспомните значение и откройте ответ"}</small>
      </button>
      {session.flipped && <div className={styles.examples}><strong>{card.back}</strong>{card.examples.map((e) => <p key={e.pt}><strong lang="pt-PT">{e.pt}</strong><span>{e.ru}</span></p>)}</div>}
      {session.flipped && <div className={styles.reviewGrades} aria-label="Как вспомнилось?">{grades.map(({ grade, label }) => <Button key={grade} variant="secondary" disabled={!ready} onClick={() => session.rate(grade)}>{label} · {intervalLabel(nextInterval(active.progress ?? undefined, grade, card.lowerPriority))}</Button>)}</div>}
      {status === "saving" && <p role="status">Сохраняем оценку…</p>}
      <details><summary>Уроки: {card.units.join(", ")}</summary>{card.units.map((u) => <p key={u}><LegacyLessonLink href={vocabularyHref(u)}>Словарь урока {u} →</LegacyLessonLink></p>)}</details>
    </article>}
    {ready && !card && <article className={styles.card}><h2>{session.eligibleCount ? "На сейчас всё" : "Пока нет сохранённых карточек"}</h2><p>{session.eligibleCount ? "Карточки появятся, когда наступит срок. Можно добавить новые из словаря." : "Сохраните нужные слова и выражения в словаре или в итогах урока."}</p><Button variant="secondary" onClick={session.reload} disabled={session.refreshing}>Проверить сроки повторения</Button></article>}
    <LegacyLessonLink href={vocabularyHref(unit)}>К словарю и сохранению карточек →</LegacyLessonLink>
  </section>;
}
