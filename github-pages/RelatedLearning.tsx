import { useState } from "react";
import { routeLessonExperiences } from "@/features/content/first-vertical-slice/route-extension";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";
import PracticeScreen from "@/features/practice/PracticeScreen";

export function relatedDestination(href: string) {
  if (href === "/learning/conjugation") return { kind: "conjugation" as const };
  const prefix = "/learning/lessons/";
  if (!href.startsWith(prefix)) return null;
  try {
    const lesson = routeLessonExperiences.find(item => item.id === decodeURIComponent(href.slice(prefix.length)));
    return lesson ? { kind: "lesson" as const, lesson } : null;
  } catch { return null; }
}

export function RelatedLearning({ href, onBack }: { href: string; onBack: () => void }) {
  const destination = relatedDestination(href);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  if (!destination) return <section><button type="button" onClick={onBack}>← Вернуться к фразам</button><h1>Урок не найден</h1></section>;
  if (destination.kind === "conjugation") return <section aria-label="Формы настоящего времени">
    <button type="button" className="tempo-back" onClick={onBack}>← Вернуться к фразам</button>
    <h1 tabIndex={-1}>Формы настоящего времени</h1>
    <PracticeScreen initialSection="trainer" initialVerbKey="estar" initialTense="present" />
  </section>;
  const lesson = destination.lesson;
  const activity = lesson.activity;
  const answer = activity.options.find(option => option.id === activity.correctOptionId)!;
  return <section className="house-activity related-lesson" aria-label={lesson.title}>
    <button type="button" className="tempo-back" onClick={onBack}>← Вернуться к фразам</button>
    <span className="tempo-kicker">Короткий урок · {lesson.minutes} мин</span>
    <h1 tabIndex={-1}>{lesson.title}</h1><p>{lesson.canDo}</p>
    <div className="usage-task"><h2>Как это работает</h2><p>{lesson.cue}</p></div>
    <h2>Примеры</h2>
    <div className="usage-examples">{lesson.examples.map(example => <article key={example.pt}><div className="usage-example-copy"><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></div><CardSpeechButton text={example.pt} /></article>)}</div>
    {!!lesson.vocabulary?.length && <><h2>Слова и выражения</h2><dl className="related-lesson-vocabulary">{lesson.vocabulary.map(item => <div key={item.pt}><dt lang="pt-PT">{item.pt}</dt><dd>{item.ru}{item.note && <small>{item.note}</small>}</dd></div>)}</dl></>}
    <div className="usage-task"><h2>Попробуй сам</h2><p>{activity.prompt}</p>{activity.support && <p>{activity.support}</p>}
      <div className="usage-options" aria-label="Варианты ответа">{activity.options.map(option => <button type="button" key={option.id} aria-pressed={selected === option.id} disabled={checked} onClick={() => setSelected(option.id)}>{option.label}</button>)}</div>
      {!checked ? <button type="button" className="usage-check" disabled={!selected} onClick={() => setChecked(true)}>Проверить</button> : <div className={`usage-feedback ${selected === activity.correctOptionId ? "is-correct" : "is-wrong"}`} role="status"><strong>{selected === activity.correctOptionId ? "Верно" : "Посмотри на правильный вариант"}</strong><p>{answer.label}</p><button type="button" onClick={() => { setChecked(false); setSelected(null); }}>Попробовать ещё раз</button></div>}
    </div>
    <button type="button" onClick={onBack}>← Вернуться к фразам</button>
  </section>;
}
