"use client";

import { useMemo, useState } from "react";
import { firstVerticalSliceContentPack } from "@/features/content/manifest";
import { EnsureCardsQueryScope, useCardsScope } from "../query/CardsQueryBoundary";
import { useSavedItemsQuery } from "../query/queries";
import { gramaticaVocabulary, vocabularyHref } from "@/features/content/gramatica-vocabulary";
import { LegacyLessonLink } from "@/features/practice/LegacyLessonLink";
import {readingSourceById} from "@/features/content/reading-sources";

const emptyItems: NonNullable<ReturnType<typeof useSavedItemsQuery>["data"]>["items"] = [];

type Filter = "all" | "noun" | "verb" | "chunk" | "word";

export function SavedStudyItemLibrary() {
  return <EnsureCardsQueryScope><SavedItemList /></EnsureCardsQueryScope>;
}

function SavedItemList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [flipped, setFlipped] = useState<string[]>([]);
  const scope = useCardsScope();
  const query = useSavedItemsQuery();
  const rows = query.data?.items ?? emptyItems;
  const sources = query.data?.sources ?? [];
  const available = !scope.blocked;
  const loading = available && query.isPending;
  function retry() { if (scope.blocked) scope.retryAccess(); else void query.refetch(); }
  const items = useMemo(() => rows.map((row) => firstVerticalSliceContentPack.studyItems.find((item) => item.id === row.studyItemId)).filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((item) => filter === "all" || item.display.type === filter), [filter, rows]);
  return <section className="saved-library" aria-labelledby="saved-library-title">
    <div className="saved-library__heading"><div><span className="tempo-kicker">Личная библиотека</span><h2 id="saved-library-title">Сохранённые из уроков</h2></div><span>{rows.length} карточек</span></div>
    <div className="card-filters" aria-label="Фильтр карточек">{(["all", "noun", "verb", "chunk", "word"] as Filter[]).map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Все" : value === "noun" ? "Существительные" : value === "verb" ? "Глаголы" : value === "word" ? "Другие слова" : "Выражения"}</button>)}</div>
    {loading && <p className="library-note" role="status">Загружаем сохранённые карточки…</p>}
    {(!available || query.isError) && <div className="library-note"><p role="alert">{!available ? "Для загрузки сохранённых карточек нужно войти." : query.data ? "Не удалось обновить библиотеку. Показаны последние загруженные данные." : "Не удалось загрузить сохранённые карточки."}</p><button type="button" onClick={retry} disabled={query.isFetching}>Повторить загрузку библиотеки</button></div>}
    {available && !loading && !query.isError && items.length === 0 && <p className="library-note">Пока здесь пусто. Сохраняйте полезные слова и фразы в итогах уроков.</p>}
    <div className="saved-card-grid">{items.map((item) => {
      const display = item.display;
      const front = display.type === "noun" ? display.pluralOnly ? `${display.pluralDefiniteArticle} ${display.plural}` : `${display.definiteArticle} ${display.lemma} — ${display.pluralDefiniteArticle} ${display.plural}` : display.type === "verb" ? display.infinitive : display.text;
      const itemSources = sources.filter((source) => source.studyItemId === item.id);
      const dictionaryEntry = gramaticaVocabulary.find((e) => e.studyItemId === item.id);
      const example = firstVerticalSliceContentPack.examples.find((e) => e.id === item.defaultExampleId);
      const open = flipped.includes(item.id);
      return <article key={item.id}>
        <span>{display.type === "noun" ? "существительное" : display.type === "verb" ? "глагол" : display.type === "word" ? "слово" : "выражение"}</span>
        <strong lang="pt-PT">{front}</strong>
        <button type="button" aria-label={`${open ? "Скрыть перевод" : "Показать перевод"}: ${front}`} aria-expanded={open} onClick={() => setFlipped((ids) => open ? ids.filter((id) => id !== item.id) : [...ids, item.id])}>{open ? "Скрыть перевод" : "Показать перевод"}</button>
        {open && <div><p>{firstVerticalSliceContentPack.locales.ru[display.translationKey]}</p>{dictionaryEntry ? <p><strong lang="pt-PT">{dictionaryEntry.examples[0].pt}</strong><br />{dictionaryEntry.examples[0].ru}</p> : example && <p><strong lang="pt-PT">{example.text}</strong><br />{firstVerticalSliceContentPack.locales.ru[example.translationKey]}</p>}</div>}
        <small>{itemSources.length ? `Источников: ${itemSources.length}` : "Из маршрута"}</small>
        {itemSources.flatMap(source=>{const lesson=readingSourceById.get(source.sourceId);return lesson?[<LegacyLessonLink key={`reading:${source.sourceId}`} href={lesson.href}>К объяснению: {lesson.title} →</LegacyLessonLink>]:[];})}
        {dictionaryEntry && <LegacyLessonLink href={vocabularyHref()}>Gramática Ativa 1 · уроки {dictionaryEntry.units.join(", ")} →</LegacyLessonLink>}
        {itemSources.flatMap((source) => { const match = source.sourceContextId?.match(/^unit:ga1:u(\d{2})$/); return match ? [<LegacyLessonLink key={`${source.sourceId}:${source.sourceContextId}`} href={vocabularyHref(Number(match[1]))}>К словарю урока {Number(match[1])} →</LegacyLessonLink>] : []; })}
      </article>;
    })}</div>
  </section>;
}
