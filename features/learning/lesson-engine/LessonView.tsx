"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RouteLessonExperience } from "../../content/first-vertical-slice/route-extension";
import { routeModeHref, type PresentationMode } from "@/features/learning/presentation-mode";
import { sessionBusy, type Failure } from "./model/session";
import type { useLessonSession } from "./use-lesson-session";
import { Button } from "@/shared/ui/Button";
import { Feedback } from "@/shared/ui/Feedback";
import { ChoiceGroup } from "@/shared/ui/ChoiceGroup";
import styles from "./lesson-view.module.css";

function FailureNotice({ error, context, retry, label, disabled }: { error: Failure; context: string; retry?: () => void; label?: string; disabled?: boolean }) {
  const reason = error === "auth" ? "Для сохранения прогресса нужно войти." : error === "conflict" ? "Данные урока изменились. Обновите страницу." : error === "invalid" ? "Ответ сервера не удалось проверить." : error === "server" ? "Сервер временно недоступен." : "Проверьте подключение к сети.";
  return <Feedback tone="error" action={retry ? { label: label ?? "Повторить", onClick: retry, disabled } : undefined}>{context}: {reason}</Feedback>;
}

export function LessonView({ experience, cardLabels, session, initialPresentation }: {
  experience: RouteLessonExperience;
  cardLabels: { id: string; label: string }[];
  session: ReturnType<typeof useLessonSession>;
  initialPresentation?: PresentationMode;
}) {
  const [presentation, setPresentation] = useState<PresentationMode>(initialPresentation ?? "adult");
  const { state, continueLesson, retryBoundary, finish, select, saveCard, restart, loadProgress, loadCards } = session;
  const lessonId = experience.id;
  const { phase, stepRevision, message: stepActionMessage } = state;
  const { stage } = phase;
  const selection = phase.stage === "activity" ? phase.selection : null;
  const completion = phase.stage === "summary" ? phase.result : null;
  const busy = sessionBusy(state);
  const status = state.completion.status === "pending" ? "Завершаем урок…" : state.boundary.status === "pending" ? "Сохраняем шаг…" : stage === "summary" ? "Урок завершён" : state.boundary.status === "saved" ? "Шаг сохранён" : state.progressLoad.status === "loading" ? "Загружаем прогресс…" : "";
  const isKingdoms = presentation === "kingdoms";
  const presentationLabel = isKingdoms ? "Для детей" : "Взрослый";
  const heroImage = isKingdoms ? "/ser-estar-kingdoms.webp" : "/ser-estar-adult.webp";
  const heroTitle = isKingdoms ? "Детское задание" : "Практическая ситуация";
  const heroCopy = isKingdoms ? "Та же фраза и тот же ответ, но оформление мягче и сказочнее." : "Короткий учебный сценарий без лишнего сюжета.";
  const practiceModeParam = isKingdoms ? "&mode=kingdoms" : "";
  const sunPracticeVerb = experience.practiceVerbKeys?.[0] ?? "fazer";
  const sunPracticeHref = `/learning/practice?verb=${sunPracticeVerb}&tense=present${practiceModeParam}`;
  function scrollToLessonStart() {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches ? "smooth" : "instant" }));
  }
  function repeatCurrentStep() { restart(stage === "learn" ? "learn" : "activity"); scrollToLessonStart(); }
  function restartLesson() { restart("learn"); scrollToLessonStart(); }

  return (
    <section className={isKingdoms ? "lesson-engine lesson-engine--kingdoms" : "lesson-engine"}>
      <header className="lesson-engine__top">
        <Link href={routeModeHref("/learning/route", presentation)} aria-label="Закрыть урок и вернуться к маршруту">×</Link>
        <div className="lesson-progress" aria-label={`Этап ${stage === "learn" ? 1 : stage === "activity" ? 2 : 3} из 3`}><i style={{ width: `${stage === "learn" ? 34 : stage === "activity" ? 67 : 100}%` }} /></div>
        <span className="save-indicator" role="status">{status}</span>
      </header>

      {session.accessBlocked && <FailureNotice error="auth" context={stage === "learn" ? "Загрузка прогресса" : "Сохранение прогресса"} retry={session.retryAccess} label="Повторить проверку доступа" />}
      {!session.accessBlocked && state.progressLoad.status === "failed" && state.boundary.status === "idle" && state.completion.status === "idle" && stage !== "summary" && <FailureNotice error={state.progressLoad.error} context="Загрузка прогресса" retry={loadProgress} label="Повторить загрузку прогресса" />}
      {!session.accessBlocked && state.boundary.status === "failed" && state.completion.status === "idle" && stage !== "summary" && <FailureNotice error={state.boundary.error} context="Сохранение шага" retry={retryBoundary} label="Повторить сохранение шага" disabled={busy} />}
      {!session.accessBlocked && state.completion.status === "failed" && <FailureNotice error={state.completion.error} context="Завершение урока" />}

      <div className={styles.stepActions} aria-label="Управление уроком">
        <Button variant="secondary" onClick={repeatCurrentStep} disabled={busy}>{stage === "learn" ? "↺ Повторить объяснение" : "↺ Повторить задание"}</Button>
        <Button variant="secondary" onClick={restartLesson} disabled={busy}>Начать урок сначала</Button>
        <span aria-live="polite">{stepActionMessage}</span>
      </div>

      <div className={styles.presentationSwitch} aria-label="Оформление урока">
        <Button variant={presentation === "adult" ? "primary" : "secondary"} onClick={() => setPresentation("adult")} aria-pressed={presentation === "adult"}>Взрослый</Button>
        <Button variant={presentation === "kingdoms" ? "primary" : "secondary"} onClick={() => setPresentation("kingdoms")} aria-pressed={presentation === "kingdoms"}>Для детей</Button>
      </div>

      {stage === "learn" && <div className="lesson-card" key={`learn-${stepRevision}`}>
        <figure className="lesson-visual">
          <Image src={heroImage} alt="" aria-hidden="true" fill sizes="(max-width: 620px) 100vw, 760px" priority={stage === "learn"} />
          <figcaption><span>{presentationLabel}</span><b>{heroTitle}</b><small>{heroCopy}</small></figcaption>
        </figure>
        <span className="tempo-kicker">Урок · {experience.minutes} минут</span><h1>{experience.title}</h1><p className="lesson-cando">{experience.canDo}</p>
        <div className="meaning-cue"><b>Главная идея</b><p>{experience.cue}</p></div>
        <div className="lesson-examples">{experience.examples.map((example) => <article key={example.pt}><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></article>)}</div>
        {experience.vocabulary?.length ? <section className="lesson-vocabulary" aria-labelledby="lesson-vocabulary-title"><div><span>Новые слова</span><h2 id="lesson-vocabulary-title">Слова и выражения урока</h2></div><ul>{experience.vocabulary.map((item) => <li key={item.pt}><strong lang="pt-PT">{item.pt}</strong><span>{item.ru}</span>{item.note && <small>{item.note}</small>}</li>)}</ul></section> : null}
        {experience.topicId && <Link className="topic-deep-link" href={`/learning/topics/${experience.topicId}?returnLesson=${encodeURIComponent(lessonId)}&phase=learn`}>Разобраться подробнее →</Link>}
        {experience.practiceVerbKeys?.length ? <div className="lesson-practice-links"><span>Потренировать формы</span>{experience.practiceVerbKeys.map((verb) => <Link key={verb} href={`/learning/practice?verb=${verb}&tense=present${practiceModeParam}`}>{verb.toUpperCase()} →</Link>)}</div> : null}
        <Button className={styles.primaryAction} onClick={continueLesson} disabled={!state.sessionId || busy}>Перейти к заданию <span aria-hidden="true">→</span></Button>
      </div>}

      {stage === "activity" && <div className="lesson-card exercise-card" key={`activity-${stepRevision}`}>
        <span className="tempo-kicker">Самостоятельное задание</span><h1>{experience.activity.kind === "scene" ? "Посмотрите на сцену" : "Выберите ответ"}</h1><p className="exercise-prompt">{experience.activity.prompt}</p>
        {experience.activity.kind === "scene" && <div className="room-scene" aria-hidden="true"><div className={`scene-cat scene-cat--${selection ?? "waiting"}`}>кот</div><div className="scene-table">стол</div><div className="scene-box">коробка</div></div>}
        {experience.activity.kind !== "scene" && <figure className="lesson-visual lesson-visual--compact">
          <Image src={heroImage} alt="" aria-hidden="true" fill sizes="(max-width: 620px) 100vw, 760px" />
          <figcaption><span>{presentationLabel}</span><b>{heroTitle}</b><small>{heroCopy}</small></figcaption>
        </figure>}
        {experience.activity.support && <p className="scene-support">{experience.activity.support}</p>}
        <ChoiceGroup label="Варианты ответа" name="answer" value={selection} onChange={select} disabled={state.completion.status === "pending" || state.completion.status === "failed"} options={experience.activity.options.map((option) => ({ value: option.id, label: option.label }))} />
        <Button className={styles.primaryAction} disabled={!selection || busy} onClick={(event) => { if (event.detail < 2) finish(); }}>{state.completion.status === "failed" ? "Проверить ещё раз" : "Проверить и завершить"}</Button>
      </div>}

      {stage === "summary" && <div className="lesson-card lesson-summary" key={`summary-${stepRevision}`}>
        <span className={`summary-mark summary-mark--${completion ?? "partial"}`} aria-hidden="true">{completion === "demonstrated" ? "✓" : "↺"}</span>
        <span className="tempo-kicker">Итог урока</span><h1>{completion === "demonstrated" ? "Получилось!" : "Урок завершён"}</h1><p>{completion === "demonstrated" ? experience.canDo : "Можно идти дальше — сложное место вернётся в коротком повторении."}</p>
        {experience.checkpointCriteria && <ul className="criteria-results">{experience.checkpointCriteria.map((criterion, index) => <li key={criterion}><span>{index === 4 && completion === "demonstrated" ? "Получилось" : index === 4 ? "Повторить" : "Проверено"}</span>{criterion}</li>)}</ul>}
        {cardLabels.length > 0 && <div className="card-save-list"><h2>Добавить в карточки</h2>
          {state.cardsLoad.status === "loading" && <p role="status">Загружаем карточки…</p>}
          {state.cardsLoad.status === "failed" && <FailureNotice error={state.cardsLoad.error} context="Загрузка карточек" retry={loadCards} label="Повторить загрузку карточек" />}
          {cardLabels.map(({ id, label }) => {
            const card = state.cards[id];
            const saved = state.savedIds.includes(id);
            return <div key={id}>
              <button disabled={saved || card?.status === "pending"} onClick={() => saveCard(id)}>
                <span lang="pt-PT">{label}</span><b>{saved ? "Сохранено ✓" : card?.status === "pending" ? "Сохраняем…" : card?.status === "failed" ? "Повторить сохранение" : "+ В карточки"}</b>
              </button>
              {card?.status === "failed" && <FailureNotice error={card.error} context={`Карточка «${label}»`} />}
            </div>;
          })}
        </div>}
        <div className="summary-actions"><Link className="tempo-secondary" href={routeModeHref("/learning/route", presentation)}>К списку уроков</Link><Link className="tempo-secondary" href={sunPracticeHref}>К солнышкам</Link><Link className="tempo-primary" href={routeModeHref("/learning/route", presentation)}>Дальше →</Link></div>
      </div>}
    </section>
  );
}
