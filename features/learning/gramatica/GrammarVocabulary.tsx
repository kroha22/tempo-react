"use client";
import { useMemo, useState } from "react";
import { allGramaticaLessons as gramaticaLessons } from "../../content/gramatica-ativa";
import { gramaticaVocabulary, vocabularyForUnit, vocabularyFront, vocabularyHref, allVocabularySources as vocabularySources } from "../../content/gramatica-vocabulary";
import type { WordClass } from "../../content/gramatica-vocabulary-editorial";
import { LegacyLessonLink } from "../../practice/LegacyLessonLink";
import { Button } from "@/shared/ui/Button";
import { useVocabularyCards } from "./use-vocabulary-cards";
import styles from "./grammar.module.css";
import { reviewHref } from "../../cards/study-review/catalog";
import { wordBatchHref } from "./first-units";

const labels: Record<WordClass, string> = { noun: "существительное", verb: "глагол", adjective: "прилагательное", adverb: "наречие", pronoun: "местоимение", preposition: "предлог", conjunction: "союз", determiner: "определитель", particle: "частица", chunk: "выражение / конструкция" };
export function GrammarVocabulary({ unit, practiceOnly = false }: { unit?: number; practiceOnly?: boolean }) {
  const [stage, setStage] = useState<"all" | "preview" | "core">("all");
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const cards = useVocabularyCards(practiceOnly);
  const words = useMemo(() => vocabularyForUnit(unit, stage === "all" ? undefined : stage).filter((e) => `${e.lemma} ${e.forms.join(" ")} ${e.translation}`.toLocaleLowerCase("pt-PT").includes(search.toLocaleLowerCase("pt-PT").trim())), [unit, stage, search]);
  const entry = words[index];
  const lesson = gramaticaLessons.find((l) => l.unit === unit);
  function reset() { setIndex(0); setFlipped(false); }
  function move(next: number) { setIndex(next); setFlipped(false); }
  return <section className={styles.course}>
    <LegacyLessonLink href="/learning/gramatica-ativa">← К курсу Gramática Ativa 1</LegacyLessonLink>
    <span className="tempo-kicker">Взрослый словарь · Все 54 урока</span>
    <h1 tabIndex={-1}>Слова и выражения{unit ? ` · урок ${unit}` : ""}</h1>
    <p>Всего значений: {gramaticaVocabulary.length}. Карточки связаны с уроками.</p>
    {unit && <LegacyLessonLink className={styles.next} href={wordBatchHref(unit)}>Быстро разобрать: знаю / в карточки →</LegacyLessonLink>}
    <LegacyLessonLink href={reviewHref(unit)}>Повторить сохранённые карточки по сроку →</LegacyLessonLink>
    {practiceOnly && <p className={styles.notice}>В демо можно переворачивать карточки. Серверное сохранение здесь недоступно.</p>}
    <details><summary>Выбрать урок: {unit ?? "все 54"}</summary><nav className={styles.unitLinks} aria-label="Словарь по урокам"><LegacyLessonLink href={vocabularyHref()}>Все</LegacyLessonLink>{Array.from({ length: 54 }, (_, i) => <LegacyLessonLink key={i} href={vocabularyHref(i + 1)}>{i + 1}</LegacyLessonLink>)}</nav></details>
    <div className={styles.filters}>
      <label>Найти слово или перевод<input type="search" value={search} onChange={(e) => { setSearch(e.target.value); reset(); }} /></label>
      <label>Этап<select value={stage} onChange={(e) => { const value = e.target.value; if (value === "all" || value === "preview" || value === "core") { setStage(value); reset(); } }}><option value="all">Все слова</option><option value="preview">Перед уроком</option><option value="core">В уроке</option></select></label>
      <Button variant="secondary" aria-pressed={reverse} onClick={() => { setReverse(!reverse); setFlipped(false); }}>{reverse ? "RU → PT" : "PT → RU"}</Button>
    </div>
    {cards.error && <div role="alert" className={styles.error}><p>{cards.error}</p><Button onClick={cards.retry} disabled={cards.pending}>Повторить действие</Button></div>}
    {!entry ? <p role="status">Ничего не найдено. Попробуйте другой запрос.</p> : <article className={styles.card}>
      <div className={styles.progress}><span>{labels[entry.partOfSpeech]}</span><b>{index + 1} / {words.length}</b></div>
      <button className={styles.flashcard} aria-label={flipped ? "Скрыть ответ" : "Показать ответ"} aria-expanded={flipped} onClick={() => setFlipped(!flipped)}>
        <strong lang={reverse ? "ru" : "pt-PT"}>{reverse ? entry.translation : vocabularyFront(entry)}</strong>
        {!reverse && <span lang="pt-PT">{entry.examples[0].pt}</span>}
        <small>{flipped ? "Скрыть ответ" : "Нажмите, чтобы увидеть ответ"}</small>
      </button>
      {flipped && <div className={styles.examples} role="status"><strong lang={reverse ? "pt-PT" : "ru"}>{reverse ? vocabularyFront(entry) : entry.translation}</strong>
        {vocabularySources.filter((r) => entry.sourceRowIds.includes(r.id) && r.pdfPages && (!unit || Number(r.unit.slice(-2)) === unit)).map((r) => <p key={r.id}>Проверено по книге: урок {Number(r.unit.slice(-2))}, {r.printedPages?.length?`стр. ${r.printedPages.join("–")} (PDF ${r.pdfPages?.join("–")})`:`PDF ${r.pdfPages?.join("–")}`}.</p>)}
        {entry.noun?.pluralOnly && <p>Используется во множественном числе.</p>}
        {entry.government && <p lang="pt-PT">{entry.government}</p>}
        {entry.partOfSpeech === "verb" && entry.forms.some((f) => f !== entry.lemma) && <p>Формы в источнике: <span lang="pt-PT">{entry.forms.filter((f) => f !== entry.lemma).join(", ")}</span></p>}
        {entry.examples.map((e) => <p key={e.pt}><strong lang="pt-PT">{e.pt}</strong><span>{e.ru}</span></p>)}
      </div>}
      {!practiceOnly && <Button variant="secondary" disabled={cards.loading || cards.pending || !!cards.error || cards.sourceSaved(entry.studyItemId, unit)} onClick={() => cards.save(entry.studyItemId, unit)}>{cards.loading ? "Загружаем карточки…" : cards.sourceSaved(entry.studyItemId, unit) ? "Сохранено ✓" : cards.savedIds.includes(entry.studyItemId) ? "Сохранено ✓ · добавить источник этого урока" : "+ В мои карточки"}</Button>}
      <div className={styles.progress}><Button variant="secondary" disabled={index === 0} onClick={() => move(index - 1)}>← Назад</Button><Button disabled={index + 1 >= words.length} onClick={() => move(index + 1)}>Следующая →</Button></div>
      <details><summary>Связи с уроками ({entry.units.length})</summary><p>Сохранение из другого урока добавляет источник, а не новую карточку.</p><ul>{entry.units.map((u) => { const rows = vocabularySources.filter((r) => entry.sourceRowIds.includes(r.id) && Number(r.unit.slice(-2)) === u); return <li key={u}><LegacyLessonLink href={vocabularyHref(u)}>Урок {u}</LegacyLessonLink>: {[...new Set(rows.map((r) => r.stage === "preview" ? "перед уроком" : "в уроке"))].join(", ")}</li>; })}</ul></details>
      {lesson && <LegacyLessonLink href={`/learning/gramatica-ativa/${lesson.slug}`}>Вернуться к уроку {lesson.unit} →</LegacyLessonLink>}
    </article>}
    <p>Перелистывание не отмечает слово выученным и не меняет расписание прежней колоды.</p>
  </section>;
}
