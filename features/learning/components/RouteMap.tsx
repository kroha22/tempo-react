"use client";

import Link from "next/link";
import { EnsureQueryScope, useQueryScope } from "@/shared/query/SessionQueryBoundary";
import { routeLessonExperiences } from "@/features/content/first-vertical-slice/route-extension";
import { routeModeHref, type PresentationMode } from "@/features/learning/presentation-mode";

import { useLearningProgressQuery } from "../query/queries";

export function RouteMap({ mode = "adult" }: { mode?: PresentationMode }) {
  return <EnsureQueryScope><RouteProgress mode={mode} /></EnsureQueryScope>;
}

function RouteProgress({ mode }: { mode: PresentationMode }) {
  const scope = useQueryScope();
  const query = useLearningProgressQuery();
  const progress = query.data ?? [];
  const retry = () => { if (scope.blocked) scope.retryAccess(); else void query.refetch(); };
  return <>
    {!scope.blocked && query.isPending && <p role="status">Загружаем прогресс маршрута…</p>}
    {(scope.blocked || query.isError) && <div className="library-note"><p role="alert">{scope.blocked ? "Не удалось открыть локальный прогресс. Уроки доступны для просмотра." : "Не удалось обновить прогресс маршрута. Уроки доступны для просмотра."}</p><button type="button" className="tempo-secondary" disabled={query.isFetching} onClick={retry}>Обновить маршрут</button></div>}
    <ol className="route-list">
    {routeLessonExperiences.map((lesson, index) => {
      const current = progress.find((item) => item.lessonId === lesson.id);
      const finished = current?.status === "finished";
      const checkpoint = lesson.id.startsWith("checkpoint:");
      return <li key={lesson.id} className={checkpoint ? "route-list__checkpoint" : undefined}>
        <Link href={routeModeHref(`/learning/lessons/${encodeURIComponent(lesson.id)}`, mode)} aria-label={`${finished ? "Завершено. " : ""}${lesson.title}`}>
          <span className="route-node">{finished ? "✓" : checkpoint ? "★" : index + 1}</span><span><b>{lesson.title}</b><small>{finished ? (current?.canDoResult === "demonstrated" ? "Освоено" : "Завершено · стоит повторить") : lesson.canDo}</small></span><i aria-hidden="true">→</i>
        </Link>
      </li>;
    })}
    </ol>
  </>;
}
