"use client";
import { useEffect, useRef, useState } from "react";
import { allGramaticaLessons as gramaticaLessons, diagnosticPassed, grammarAnswerCorrect, grammarExitResult, grammarTasks, type GrammarLesson } from "../../content/gramatica-ativa";
import { LegacyLessonLink } from "../../practice/LegacyLessonLink";
import { Button } from "@/shared/ui/Button";
import { currentGrammarTask } from "./session";
import { useGrammarSession } from "./use-grammar-session";
import styles from "./grammar.module.css";
import { GrammarVocabulary } from "./GrammarVocabulary";
import { vocabularyHref } from "../../content/gramatica-vocabulary";
import { StudyReview } from "../../cards/study-review/StudyReview";
import { reviewHref } from "../../cards/study-review/catalog";
import { GrammarWordBatch } from "./GrammarWordBatch";
import { firstGrammarUnits, wordBatchHref } from "./first-units";
import { mixedReviewSkills } from "../../content/gramatica-mixed-review";

export function GrammarCourse({ slug, practiceOnly = false }: { slug?: string; practiceOnly?: boolean }) {
  const wordUnit = slug?.match(/^words\/u(\d{2})$/);
  if (wordUnit && Number(wordUnit[1]) >= 1 && Number(wordUnit[1]) <= 54) return <GrammarWordBatch key={slug} unit={Number(wordUnit[1])} practiceOnly={practiceOnly} />;
  if (slug === "review") return <StudyReview practiceOnly={practiceOnly} />;
  const reviewUnit = slug?.match(/^review\/u(\d{2})$/);
  if (reviewUnit && Number(reviewUnit[1]) >= 1 && Number(reviewUnit[1]) <= 54) return <StudyReview key={slug} unit={Number(reviewUnit[1])} practiceOnly={practiceOnly} />;
  if (slug === "vocabulary") return <GrammarVocabulary practiceOnly={practiceOnly} />;
  const vocabularyUnit = slug?.match(/^vocabulary\/u(\d{2})$/);
  if (vocabularyUnit && Number(vocabularyUnit[1]) >= 1 && Number(vocabularyUnit[1]) <= 54) return <GrammarVocabulary key={slug} unit={Number(vocabularyUnit[1])} practiceOnly={practiceOnly} />;
  const lesson = gramaticaLessons.find((l) => l.slug === slug);
  if (slug && !lesson) return <section><h1>Урок не найден</h1><LegacyLessonLink href="/learning/gramatica-ativa">К курсу</LegacyLessonLink></section>;
  if (lesson) return <GrammarLessonView key={lesson.id} lesson={lesson} practiceOnly={practiceOnly} />;
  return <section className={styles.course}>
    <LegacyLessonLink href="/learning">← К обучению</LegacyLessonLink>
    <span className="tempo-kicker">Взрослый курс · Европейский португальский</span>
    <h1>Gramática Ativa 1</h1><p>Начните с повторения знакомых тем. Слова можно быстро разобрать и сразу добавить в карточки.</p>
    <LegacyLessonLink className={styles.next} href={vocabularyHref()}>Словарь и карточки всех 54 уроков →</LegacyLessonLink>
    <LegacyLessonLink className={styles.next} href={reviewHref()}>Повторить сохранённые карточки →</LegacyLessonLink>
    {practiceOnly && <p className={styles.notice}>В демо доступны все задания. Серверный прогресс и сохранение карточек здесь недоступны.</p>}
    <h2>Уроки 1–11 · Повторение</h2>
    <p>Готовые объяснения, быстрые пачки слов и отдельные проверки с вводом ответа и разбором ошибок.</p>
    <ol className={styles.list}>{firstGrammarUnits.map((l) => <li key={l.unit} className={styles.unitCard}><span>Урок {l.unit}</span><h3>{l.title}</h3><p>{l.summary}</p><LegacyLessonLink href={wordBatchHref(l.unit)}>Разобрать слова →</LegacyLessonLink><LegacyLessonLink href={`/learning/practice?lesson=${l.lessonId}`}>Объяснение и практика →</LegacyLessonLink>{l.practiceSlug && <LegacyLessonLink href={`/learning/gramatica-ativa/${l.practiceSlug}`}>Проверить себя →</LegacyLessonLink>}{l.unit === 7 && <LegacyLessonLink href="/learning/trazer">Ещё практика TRAZER →</LegacyLessonLink>}</li>)}</ol>
    <LegacyLessonLink className={styles.next} href="/learning/gramatica-ativa/review-foundations">Смешанное повторение U01–U11 · 22 задания →</LegacyLessonLink>
    <p>Уроки 12–17 и 24–54 ещё готовятся к включению в книжный маршрут. Их словари уже доступны.</p>
    <h2>Уроки 18–23 · Диагностика и обучение</h2>
    <ol className={styles.list}>{gramaticaLessons.filter((l) => l.unit >= 18).map((l) => <li key={l.id}><LegacyLessonLink href={`/learning/gramatica-ativa/${l.slug}`}><span>Урок {l.unit}</span><strong>{l.title}</strong><small>{l.canDo}</small><b>Начать →</b></LegacyLessonLink></li>)}</ol>
  </section>;
}
function GrammarLessonView({ lesson, practiceOnly }: { lesson: GrammarLesson; practiceOnly: boolean }) {
  const session = useGrammarSession(lesson, practiceOnly);
  const { view, busy, error } = session;
  const [answer, setAnswer] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const prompt = useRef<HTMLParagraphElement>(null);
  const task = view.status === "ready" ? currentGrammarTask(lesson, view.snapshot) : undefined;
  const stepKey = view.status === "ready" ? `${view.snapshot.phase}:${view.snapshot.index}` : view.status;
  useEffect(() => { (prompt.current ?? heading.current)?.focus({ preventScroll: true }); }, [stepKey]);
  const checked = view.status === "ready" && task && Object.hasOwn(view.snapshot.answers, task.id);
  const recorded = view.status === "ready" && task ? view.snapshot.answers[task.id] : undefined;
  const correct = task && recorded !== undefined && grammarAnswerCorrect(task, recorded);
  const nextLesson = gramaticaLessons.find((l) => l.unit === lesson.unit + 1);
  const exitMistakes = view.status === "summary" && view.snapshot ? grammarTasks(lesson, "exit").filter((t) => !grammarAnswerCorrect(t, view.snapshot!.answers[t.id] ?? "")) : [];
  return <section className={styles.course}>
    <LegacyLessonLink href="/learning/gramatica-ativa">← К урокам Gramática Ativa 1</LegacyLessonLink>
    <span className="tempo-kicker">{lesson.checkpoint?"Повторение U01–U11":`Урок ${lesson.unit}`} · Взрослый вариант</span>
    <h1 ref={heading} tabIndex={-1}>{lesson.title}</h1>
    {!lesson.checkpoint&&<><LegacyLessonLink href={vocabularyHref(lesson.unit)}>Слова и карточки урока {lesson.unit} →</LegacyLessonLink>
    <LegacyLessonLink href={wordBatchHref(lesson.unit)}>Быстро разобрать слова →</LegacyLessonLink>
    {firstGrammarUnits.find((l) => l.unit === lesson.unit) && <LegacyLessonLink href={`/learning/practice?lesson=${firstGrammarUnits.find((l) => l.unit === lesson.unit)!.lessonId}`}>Открыть прежнее объяснение и практику →</LegacyLessonLink>}</>}
    {lesson.checkpoint&&view.status!=="summary"&&<><details><summary>Как оценивается повторение</summary><p>{lesson.rule}</p></details><p className={styles.batchHint}>22 задания · можно прерваться и продолжить позже.</p></>}
    {practiceOnly && <p className={styles.notice}>Тренировка в демо: результат не сохраняется на сервере.</p>}
    {error && <div role="alert" className={styles.error}><p>{error}</p><Button variant="secondary" onClick={session.retry} disabled={busy}>Повторить сохранение</Button></div>}
    {view.status === "loading" && <p role="status">Загружаем прогресс…</p>}
    {view.status === "ready" && view.snapshot.phase === "rule" && <article className={styles.card}>
      <h2>{diagnosticPassed(lesson, view.snapshot.answers) ? "Коротко освежим правило" : "Разберёмся по шагам"}</h2>
      <p>{lesson.canDo}</p><p>{lesson.rule}</p>
      <div className={styles.examples}>{lesson.examples.map((e) => <p key={e.pt}><strong lang="pt-PT">{e.pt}</strong><span>{e.ru}</span></p>)}</div>
      {lesson.vocabulary.length > 0 && <><h3>Выражения для урока</h3><dl>{lesson.vocabulary.map((v) => <div key={v.slug}><dt lang="pt-PT">{v.pt}</dt><dd>{v.ru}</dd></div>)}</dl></>}
      <details><summary>Что повторяем</summary><p>{lesson.review.join(" · ")}</p></details>
      <Button onClick={() => { setAnswer(""); session.next(); }} disabled={busy || !!error}>{diagnosticPassed(lesson, view.snapshot.answers) ? "К самостоятельной проверке" : "Перейти к практике"}</Button>
    </article>}
    {view.status === "ready" && task && <article className={styles.card}>
      <div className={styles.progress}><span>{view.snapshot.phase === "diagnostic" ? "Диагностика" : view.snapshot.phase === "guided" ? "Практика с объяснениями" : "Самостоятельная проверка"}</span><b>{view.snapshot.index + 1} / {grammarTasks(lesson, view.snapshot.phase === "rule" ? "guided" : view.snapshot.phase).length}</b></div>
      <p ref={prompt} tabIndex={-1} className={styles.prompt} id="grammar-prompt">{task.prompt}</p>
      {view.snapshot.phase === "exit" && <small>Оценивается первый ответ. После проверки появится объяснение.</small>}
      <form onSubmit={(e) => { e.preventDefault(); session.check(answer); }}>
        {task.options ? <fieldset disabled={busy || !!checked || !!error} className={styles.options}><legend className={styles.srOnly}>Варианты ответа</legend>{task.options.map((value) => <label key={value}><input type="radio" name="grammar-answer" value={value} checked={(recorded ?? answer) === value} onChange={() => setAnswer(value)} /><span lang={/[а-яё]/iu.test(value) ? "ru" : "pt-PT"}>{value}</span></label>)}</fieldset> : <label className={styles.inputLabel}>Ответ на португальском<input key={task.id} lang="pt-PT" aria-describedby="grammar-prompt" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={500} value={recorded ?? answer} disabled={busy || !!checked || !!error} onChange={(e) => setAnswer(e.target.value)} /></label>}
        {!checked && <Button type="submit" disabled={!answer.trim() || busy || !!error}>Проверить</Button>}
      </form>
      {checked && <div className={correct ? styles.feedback : styles.error} role="status"><strong>{correct ? "Верно" : "Нужно повторить"}</strong>{!correct && <p>Ответ: <span lang="pt-PT">{task.answers[0]}</span></p>}<p>{task.explanation}</p></div>}
      {checked && <Button onClick={() => { setAnswer(""); session.next(); }} disabled={busy || !!error}>{view.snapshot.phase === "exit" && view.snapshot.index === grammarTasks(lesson,"exit").length-1 ? "Посмотреть итог" : "Дальше"}</Button>}
      {view.snapshot.phase !== "diagnostic" && lesson.vocabulary.length > 0 && <details><summary>Словарь урока</summary><dl>{lesson.vocabulary.map((v) => <div key={v.slug}><dt lang="pt-PT">{v.pt}</dt><dd>{v.ru}</dd></div>)}</dl></details>}
    </article>}
    {view.status === "summary" && <article className={styles.card}>
      <h2>{view.demonstrated ? "Получилось!" : "Проверка завершена — есть что повторить"}</h2>
      {!lesson.checkpoint&&view.snapshot && <p>Самостоятельная проверка: {grammarExitResult(lesson, view.snapshot.answers).correct} из 5.</p>}
      <p>{lesson.checkpoint?"Результат по каждому навыку: два верных ответа, включая ввод, подтверждают его в этой проверке. Это не означает устойчивого освоения.":view.demonstrated ? lesson.canDo : "Нужно не менее 4 из 5 и верное ключевое задание. Повторите правило и попробуйте новую попытку."}</p>
      {lesson.checkpoint&&view.snapshot&&<ul className={styles.list}>{mixedReviewSkills.map(skill=>{
        const tasks=lesson.tasks.filter(task=>task.target===`grammar:ga1:${skill.slug}`);
        const correct=tasks.filter(task=>grammarAnswerCorrect(task,view.snapshot!.answers[task.id]??"")).length;
        return <li key={skill.slug}><h3>U{String(skill.unit).padStart(2,"0")} · {skill.title}</h3><p>{correct}/2 · {correct===2?"Получилось в этой проверке":"Стоит повторить"}</p><LegacyLessonLink href={`/learning/practice?lesson=${skill.foundation}`}>Открыть объяснение →</LegacyLessonLink><LegacyLessonLink href={`/learning/gramatica-ativa/${skill.slug}`}>Потренировать навык →</LegacyLessonLink></li>;
      })}</ul>}
      <p>{practiceOnly ? "Это результат текущей тренировки." : "Результат сохранён. Завершение урока не означает устойчивого освоения — вернитесь к теме после перерыва."}</p>
      {exitMistakes.length > 0 && <ul>{exitMistakes.map((t) => <li key={t.id}><b>{t.prompt}</b><p>{t.explanation}</p><span lang="pt-PT">{t.answers[0]}</span></li>)}</ul>}
      {!practiceOnly && lesson.vocabulary.length > 0 && <><h3>Сохранить выражения в карточки</h3><div className={styles.cards}>{lesson.vocabulary.map((v) => { const id = `study:chunk:ga1:${v.slug}`; const saved = session.savedIds.includes(id); return <Button key={id} variant="secondary" disabled={busy || saved || !!error} onClick={() => session.saveCard(id)}><span lang="pt-PT">{v.pt}</span> · {saved ? "Сохранено ✓" : "+ В карточки"}</Button>; })}</div></>}
      <Button variant="secondary" onClick={() => { setAnswer(""); session.restart(); }} disabled={busy || !!error}>Повторить урок</Button>
      {nextLesson && <LegacyLessonLink className={styles.next} href={`/learning/gramatica-ativa/${nextLesson.slug}`}>Урок {nextLesson.unit}: {nextLesson.title} →</LegacyLessonLink>}
    </article>}
    {busy && <p role="status">{practiceOnly ? "Проверяем…" : "Сохраняем…"}</p>}
  </section>;
}
