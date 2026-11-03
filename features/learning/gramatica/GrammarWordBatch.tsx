"use client";
import { useEffect, useRef, useState } from "react";
import { vocabularyForUnit, vocabularyFront, vocabularyHref } from "../../content/gramatica-vocabulary";
import { LegacyLessonLink } from "../../practice/LegacyLessonLink";
import { Button } from "@/shared/ui/Button";
import { useVocabularyCards } from "./use-vocabulary-cards";
import { firstGrammarUnits } from "./first-units";
import {pastGrammarUnits,grammarExplanationHref} from "./past-units";
import { reviewHref } from "../../cards/study-review/catalog";
import styles from "./grammar.module.css";

export function GrammarWordBatch({ unit, practiceOnly = false }: { unit: number; practiceOnly?: boolean }) {
  const words = vocabularyForUnit(unit);
  const lesson = firstGrammarUnits.find((item) => item.unit === unit);
  const pastLesson=pastGrammarUnits.find(item=>item.unit===unit);
  const cards = useVocabularyCards(practiceOnly);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [choices, setChoices] = useState<Record<string, "known" | "saved" | "existing" | "skip">>({});
  const [receipt, setReceipt] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const entry = words[index];
  const locked = cards.loading || cards.pending || Boolean(cards.error);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [index]);
  function advance(choice: "known" | "saved" | "existing" | "skip") {
    if (!entry) return;
    setChoices((previous) => ({ ...previous, [entry.studyItemId]: choice }));
    setReceipt(choice === "saved" ? `${entry.lemma}: сохранено в карточки` : choice === "existing" ? `${entry.lemma}: уже в карточках` : "");
    setIndex(index + 1); setRevealed(false);
  }
  const count = (choice: string) => Object.values(choices).filter((value) => value === choice).length;
  return <section className={styles.course}>
    <LegacyLessonLink href="/learning/gramatica-ativa">← К курсу</LegacyLessonLink>
    <span className="tempo-kicker">Урок {unit} · Слова перед уроком</span>
    <h1>Разберём слова</h1>
    <p>Знакомое пропускайте. Что хочется учить — сразу отправляйте в карточки.</p>
    <p className={styles.batchHint}>Тематическая подборка. «Знаю» действует в этом разборе и не меняет сроки повторения.</p>
    {practiceOnly && <p className={styles.notice}>Демо: слова можно просмотреть. Для сохранения карточек нужен серверный режим.</p>}
    <p role="status" className={styles.batchReceipt}>{cards.pending ? "Сохраняем…" : receipt}</p>
    {cards.error && <div role="alert" className={styles.error}><p>{cards.error}</p><Button disabled={cards.pending} onClick={cards.retry}>Повторить сохранение</Button></div>}
    {entry ? <article className={styles.card}>
      <div className={styles.progress}><span>Пачка {Math.floor(index / 8) + 1} из {Math.ceil(words.length / 8)}</span><b>Слово {index + 1} из {words.length}</b></div>
      <h2 ref={heading} tabIndex={-1} lang="pt-PT" className={styles.batchWord}>{vocabularyFront(entry)}</h2>
      <Button variant="secondary" onClick={() => setRevealed(!revealed)}>{revealed ? "Скрыть перевод" : "Показать перевод"}</Button>
      {revealed && <div className={styles.examples}><strong>{entry.translation}</strong><p><span lang="pt-PT">{entry.examples[0].pt}</span><span>{entry.examples[0].ru}</span></p></div>}
      {cards.savedIds.includes(entry.studyItemId) && <p>Уже есть в ваших карточках. Повторное добавление сохранит источник этого урока.</p>}
      <div className={styles.reviewGrades}>
        <Button variant="secondary" disabled={locked} onClick={() => advance("known")}>Знаю →</Button>
        {!practiceOnly && <Button disabled={locked} onClick={() => cards.sourceSaved(entry.studyItemId, unit) ? advance("existing") : cards.save(entry.studyItemId, unit, () => advance("saved"))}>{cards.sourceSaved(entry.studyItemId, unit) ? "Уже в карточках →" : "В карточки →"}</Button>}
      </div>
      <Button variant="secondary" disabled={locked} onClick={() => advance("skip")}>Пока пропустить</Button>
      {index > 0 && index % 8 === 0 && <p>Предыдущая пачка разобрана. Продолжайте, когда удобно.</p>}
    </article> : <article className={styles.card}>
      <h2 ref={heading} tabIndex={-1}>Все слова просмотрены</h2>
      <p>Знаю: {count("known")} · Сохранено: {count("saved")} · Уже в карточках: {count("existing")} · Пропущено: {count("skip")}</p>
      <p>Сохранённые слова остались в общей колоде. Ответы «Знаю» и пропуски не записываются как освоение темы.</p>
      {!practiceOnly && <LegacyLessonLink className={styles.next} href={reviewHref(unit)}>Повторить карточки урока →</LegacyLessonLink>}
      <Button variant="secondary" onClick={() => { setChoices({}); setIndex(0); setReceipt(""); setRevealed(false); }}>Посмотреть слова ещё раз</Button>
    </article>}
    {lesson && <LegacyLessonLink className={styles.next} href={`/learning/practice?lesson=${lesson.lessonId}`}>К объяснению и практике: {lesson.title} →</LegacyLessonLink>}
    {lesson?.practiceSlug && <LegacyLessonLink className={styles.next} href={`/learning/gramatica-ativa/${lesson.practiceSlug}`}>Проверить себя по уроку {unit} →</LegacyLessonLink>}
    {pastLesson&&<><LegacyLessonLink className={styles.next} href={grammarExplanationHref(pastLesson.practiceSlug)}>К объяснению и практике: {pastLesson.title} →</LegacyLessonLink><LegacyLessonLink href={`/learning/gramatica-ativa/${pastLesson.practiceSlug}`}>Проверить себя по уроку {unit} →</LegacyLessonLink></>}
    <LegacyLessonLink href={vocabularyHref(unit)}>Открыть словарь урока →</LegacyLessonLink>
  </section>;
}
