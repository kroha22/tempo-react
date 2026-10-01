"use client";

import { useMemo, useState } from "react";
import { firstVerticalSliceContentPack } from "@/features/content/manifest";
import { EnsureCardsQueryScope, useCardsScope } from "../query/CardsQueryBoundary";
import { useSavedItemsQuery } from "../query/queries";

const emptyItems: NonNullable<ReturnType<typeof useSavedItemsQuery>["data"]>["items"] = [];

type Filter = "all" | "noun" | "verb" | "chunk";

export function SavedStudyItemLibrary() {
  return <EnsureCardsQueryScope><SavedItemList /></EnsureCardsQueryScope>;
}

function SavedItemList() {
  const [filter, setFilter] = useState<Filter>("all");
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
    <div className="card-filters" aria-label="Фильтр карточек">{(["all", "noun", "verb", "chunk"] as Filter[]).map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Все" : value === "noun" ? "Существительные" : value === "verb" ? "Глаголы" : "Выражения"}</button>)}</div>
    {loading && <p className="library-note" role="status">Загружаем сохранённые карточки…</p>}
    {(!available || query.isError) && <div className="library-note"><p role="alert">{!available ? "Для загрузки сохранённых карточек нужно войти." : query.data ? "Не удалось обновить библиотеку. Показаны последние загруженные данные." : "Не удалось загрузить сохранённые карточки."}</p><button type="button" onClick={retry} disabled={query.isFetching}>Повторить загрузку библиотеки</button></div>}
    {available && !loading && !query.isError && items.length === 0 && <p className="library-note">Пока здесь пусто. Сохраняйте полезные слова и фразы в итогах уроков.</p>}
    <div className="saved-card-grid">{items.map((item) => { const display = item.display; const front = display.type === "noun" ? `${display.definiteArticle} ${display.lemma} — ${display.pluralDefiniteArticle} ${display.plural}` : display.type === "verb" ? display.infinitive : display.text; const itemSources = sources.filter((source) => source.studyItemId === item.id); return <article key={item.id}><span>{display.type === "noun" ? "существительное" : display.type === "verb" ? "глагол" : "выражение"}</span><strong lang="pt-PT">{front}</strong><small>{itemSources.length ? `Источников: ${itemSources.length}` : "Из маршрута"}</small></article>; })}</div>
  </section>;
}
