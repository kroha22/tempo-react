"use client";

import { useState } from "react";
import type { LessonPracticeTarget } from "./practice-types";

import { shortGrammarLessons as lessons } from "../content/short-grammar-lessons";
import { usePracticePlan } from "./plan/PracticePlanContext";

const pastPanels = {
  pps: {
    title: "Завершённое событие",
    note: "Pretérito Perfeito Simples · событие с границей",
    forms: [
      { label: "-AR", value: "-ei · -aste · -ou · -ámos · -aram" },
      { label: "-ER", value: "-i · -este · -eu · -emos · -eram" },
      { label: "-IR", value: "-i · -iste · -iu · -imos · -iram" },
      { label: "ser / ir", value: "fui · foste · foi · fomos · foram" },
      { label: "estar", value: "estive · estiveste · esteve · estivemos · estiveram" },
      { label: "ter", value: "tive · tiveste · teve · tivemos · tiveram" },
    ],
    special: "Частые основы: fiz/fez, disse, trouxe, quis, vi/viu, vim/veio, dei/deu, soube, pus/pôs, pude/pôde.",
    examples: [
      { pt: "Ontem fui ao mercado.", ru: "Вчера я ходил на рынок." },
      { pt: "Fiz o jantar em vinte minutos.", ru: "Я приготовил ужин за двадцать минут." },
    ],
  },
  imperfeito: {
    title: "Фон и привычка",
    note: "Pretérito Imperfeito · без обозначенной границы",
    forms: [
      { label: "-AR", value: "-ava · -avas · -ava · -ávamos · -avam" },
      { label: "-ER / -IR", value: "-ia · -ias · -ia · -íamos · -iam" },
      { label: "частые", value: "era · tinha · vinha · punha" },
      { label: "привычка", value: "costumava + infinitivo" },
      { label: "возраст", value: "tinha seis anos" },
      { label: "время", value: "era uma hora · eram duas horas" },
    ],
    special: "Costumava + infinitivo подчёркивает старую привычку: Costumava ir a pé para a escola.",
    examples: [
      { pt: "Quando era criança, vivia no campo.", ru: "Когда я был ребёнком, я жил за городом." },
      { pt: "Tinha seis anos e eram três da tarde.", ru: "Мне было шесть лет, и было три часа дня." },
    ],
  },
};

type AdultLessonsProps = {
  singleLesson?: boolean;
  activeLessonId: string;
  onLessonChange: (lessonId: string) => void;
  onOpenPractice: (target: LessonPracticeTarget) => void;
  onOpenConjugationOverview: () => void;
};

export default function AdultLessons({ activeLessonId, onLessonChange, onOpenPractice, onOpenConjugationOverview, singleLesson = false }: AdultLessonsProps) {
  const plan = usePracticePlan();
  const activeIndex = Math.max(0, lessons.findIndex((item) => item.id === activeLessonId));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hadMistake,setHadMistake]=useState(false);
  const [pastMode, setPastMode] = useState<keyof typeof pastPanels>("pps");
  const lesson = lessons[activeIndex];
  const chapters = Array.from(new Set(lessons.map((item) => item.chapter)));

  const openLesson = (index: number) => {
    onLessonChange(lessons[index].id);
    setSelectedAnswer(null);
    setHadMistake(false);
  };

  return (
    <section className="adult-lessons" aria-label={singleLesson?lesson.title:undefined} aria-labelledby={singleLesson?undefined:"adult-lessons-title"}>
      {!singleLesson && <header className="adult-lessons-intro">
        <div>
          <span className="adult-kicker">Грамматика без лишнего</span>
          <h1 id="adult-lessons-title">{lessons.length} коротких уроков</h1>
          <p>Правило, опорные формы, живые примеры и один вопрос для самопроверки.</p>
        </div>
        <div className="adult-intro-actions">
          <button onClick={onOpenConjugationOverview}>Все спряжения <span aria-hidden="true">→</span></button>
          <div className="adult-progress" aria-label={`Урок ${activeIndex + 1} из ${lessons.length}`}>
            <strong>{String(activeIndex + 1).padStart(2, "0")}</strong><span>/ {lessons.length}</span>
          </div>
        </div>
      </header>}

      <div className="adult-lessons-layout">
        {!singleLesson && <nav className="adult-lesson-nav" aria-label="Темы уроков">
          {chapters.map((chapter) => (
            <div className="adult-lesson-group" key={chapter}>
              <span>{chapter}</span>
              {lessons.map((item, index) => item.chapter === chapter ? (
                <button
                  key={item.id}
                  className={index === activeIndex ? "active" : ""}
                  aria-current={index === activeIndex ? "page" : undefined}
                  onClick={() => openLesson(index)}
                >
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{item.title}</span>
                </button>
              ) : null)}
            </div>
          ))}
        </nav>}

        <article className="adult-lesson-card" key={lesson.id}>
          <header className="adult-lesson-heading">
            <div><span>{lesson.chapter} · урок {activeIndex + 1}</span><h2>{lesson.title}</h2><p>{lesson.subtitle}</p></div>
          </header>

          <div className="adult-rule">
            <span>Суть</span>
            <p>{lesson.rule}</p>
            {lesson.formula && <code>{lesson.formula}</code>}
          </div>

          {lesson.id === "past" && <section className="adult-past" aria-labelledby="past-mode-title">
            <div className="adult-past-switch" role="group" aria-label="Два плана прошедшего времени">
              <button className={pastMode === "pps" ? "active" : ""} aria-pressed={pastMode === "pps"} onClick={() => setPastMode("pps")}>Событие</button>
              <button className={pastMode === "imperfeito" ? "active" : ""} aria-pressed={pastMode === "imperfeito"} onClick={() => setPastMode("imperfeito")}>Фон и привычка</button>
            </div>
            <div className="adult-past-panel">
              <span>{pastPanels[pastMode].note}</span>
              <h3 id="past-mode-title">{pastPanels[pastMode].title}</h3>
              <div className="adult-past-forms">
                {pastPanels[pastMode].forms.map((form) => <p key={form.label}><span>{form.label}</span><strong>{form.value}</strong></p>)}
              </div>
              <p className="adult-past-note">{pastPanels[pastMode].special}</p>
              <div className="adult-past-examples">
                {pastPanels[pastMode].examples.map((example) => <p key={example.pt}><strong lang="pt">{example.pt}</strong><span>{example.ru}</span></p>)}
              </div>
            </div>
          </section>}

          {lesson.markers && <div className="adult-markers" aria-label="Подсказки">
            {lesson.markers.map((marker) => <span key={marker}>{marker}</span>)}
          </div>}

          {lesson.forms && <section className="adult-forms" aria-labelledby={`${lesson.id}-forms`}>
            <h3 id={`${lesson.id}-forms`}>Опорные формы</h3>
            <div>{lesson.forms.map((form) => <p key={`${form.label}-${form.value}`}><span>{form.label}</span><strong>{form.value}</strong></p>)}</div>
          </section>}

          <section className="adult-examples" aria-labelledby={`${lesson.id}-examples`}>
            <h3 id={`${lesson.id}-examples`}>Примеры</h3>
            <div>{lesson.examples.map((example) => <p key={example.pt}><strong lang="pt">{example.pt}</strong><span>{example.ru}</span></p>)}</div>
          </section>

          <section className="adult-check" aria-labelledby={`${lesson.id}-check`}>
            <span>Проверь себя</span>
            <h3 id={`${lesson.id}-check`} lang="pt">{lesson.quiz.prompt}</h3>
            <div className="adult-check-options">
              {lesson.quiz.options.map((option, index) => {
                const revealed = selectedAnswer !== null;
                const correct = index === lesson.quiz.answer;
                const wrong = revealed && index === selectedAnswer && !correct;
                return <button
                  key={option}
                  disabled={revealed}
                  className={revealed && correct ? "correct" : wrong ? "wrong" : ""}
                  onClick={() => {setSelectedAnswer(index);if(correct)plan?.complete(`practice:grammar:${lesson.id}`,hadMistake);else setHadMistake(true);}}
                >{option}</button>;
              })}
            </div>
            <p className="adult-check-feedback" aria-live="polite">
              {selectedAnswer === null ? "Выбери подходящий вариант." : selectedAnswer === lesson.quiz.answer ? `Верно. ${lesson.quiz.explanation}` : `Не совсем. ${lesson.quiz.explanation}`}
            </p>
            {selectedAnswer!==null&&selectedAnswer!==lesson.quiz.answer&&<button type="button" onClick={()=>setSelectedAnswer(null)}>Попробовать ещё раз</button>}
          </section>

          {!singleLesson && lesson.practice && <aside className="adult-practice-bridge" aria-label="Практика этого урока">
            <div><span>Связано с уроком</span><strong>Закрепи это правило на тех же формах</strong></div>
            <button onClick={() => onOpenPractice(lesson.practice!)}>Потренировать формы <span aria-hidden="true">→</span></button>
          </aside>}

          {!singleLesson && <footer className="adult-lesson-controls">
            <button disabled={activeIndex === 0} onClick={() => openLesson(activeIndex - 1)}>← Предыдущий</button>
            <button disabled={activeIndex === lessons.length - 1} onClick={() => openLesson(activeIndex + 1)}>Следующий →</button>
          </footer>}
        </article>
      </div>
    </section>
  );
}
