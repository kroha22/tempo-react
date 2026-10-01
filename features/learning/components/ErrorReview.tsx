"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { EnsureQueryScope, useQueryScope } from "@/shared/query/SessionQueryBoundary";
import type { ErrorPattern } from "../progress/errors-api";
import { useErrorPatternsQuery } from "../query/queries";
import { useImproveErrorMutation } from "../query/mutations";

const labels: Record<string, string> = { SER_ESTAR_CHOICE: "Когда нужен SER, а когда ESTAR", NOUN_ARTICLE_NUMBER: "Артикль и множественное число", SPACE_RELATION: "Где находится предмет", REQUIRED_PATTERN_HA: "Как сказать «здесь есть» с HÁ", FICAR_SENSE: "Как спросить, где находится место" };

function attemptsLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} попыток`;
  if (last === 1) return `${count} попытка`;
  if (last >= 2 && last <= 4) return `${count} попытки`;
  return `${count} попыток`;
}

export function ErrorReview() {
  return <EnsureQueryScope><ErrorList /></EnsureQueryScope>;
}

function ErrorList() {
  const scope = useQueryScope();
  const query = useErrorPatternsQuery();
  // Acknowledged themes are hidden for this visit, not removed from server history.
  const [dismissed, setDismissed] = useState<string[]>([]);
  const patterns = (query.data ?? []).filter((pattern) => !dismissed.includes(pattern.patternKey));
  const retry = () => { if (scope.blocked) scope.retryAccess(); else void query.refetch(); };
  const notice = <div className="library-note"><p role="alert">{scope.blocked ? "Для загрузки повторения нужно войти." : "Не удалось обновить повторение. Попробуйте ещё раз."}</p><button type="button" className="tempo-secondary" disabled={query.isFetching} onClick={retry}>Повторить загрузку повторения</button></div>;
  if (scope.blocked || (query.isError && !query.data)) return <section className="empty-learning-state"><h1>Повторение ошибок</h1>{notice}<Link href="/learning/route">Вернуться к урокам</Link></section>;
  if (query.isPending) return <section className="empty-learning-state"><h1>Повторение ошибок</h1><p role="status">Подбираем, что повторить…</p></section>;
  if (query.isError && !patterns.length) return <section className="empty-learning-state"><h1>Повторение ошибок</h1>{notice}<Link href="/learning/route">Вернуться к урокам</Link></section>;
  if (!patterns.length) return <section className="empty-learning-state"><span aria-hidden="true">✓</span><h1>Пока нечего повторять</h1><p>Сложные темы появятся здесь, только если один и тот же ответ несколько раз вызовет трудности.</p><Link href="/learning/route">Вернуться к урокам</Link></section>;
  return <section className="error-review"><span className="tempo-kicker">Короткое повторение</span><h1>Вернёмся к сложным местам</h1><p>Здесь появятся темы, в которых несколько раз подряд было трудно выбрать ответ.</p>{query.isError && notice}<div>{patterns.map((pattern) => <ErrorItem key={pattern.patternKey} pattern={pattern} onConfirmed={() => setDismissed((ids) => [...ids, pattern.patternKey])} />)}</div></section>;
}

function ErrorItem({ pattern, onConfirmed }: { pattern: ErrorPattern; onConfirmed: () => void }) {
  const scope = useQueryScope();
  const mutation = useImproveErrorMutation();
  const submitting = useRef(false);
  async function improve() {
    if (submitting.current || scope.blocked) return;
    submitting.current = true;
    try {
      await mutation.mutateAsync(pattern.patternKey);
      if (scope.isActive()) onConfirmed();
    } catch { /* Mutation state keeps the failed action beside its theme. */ }
    finally { submitting.current = false; }
  }
  return <article><span>{attemptsLabel(pattern.occurrenceCount)}</span><h2>{labels[pattern.errorCode] ?? "Стоит повторить"}</h2><p>Ещё раз посмотрите на главное правило и попробуйте ответить заново. Предыдущие попытки сохранятся.</p>
    {mutation.isError && <p role="alert">Не удалось сохранить отметку. Попробуйте ещё раз.</p>}
    <button type="button" disabled={mutation.isPending} onClick={improve}>{mutation.isPending ? "Сохраняем отметку…" : mutation.isError ? "Повторить сохранение отметки" : "Теперь понятнее"}</button>
  </article>;
}
