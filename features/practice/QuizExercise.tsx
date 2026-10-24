import {useState} from "react";
import {ActivityCompletion,useChildPresentation} from "./ActivityCompletion";
import {wordActivityId} from "./learning-rewards";
import { people, type Forms, type Person, type Tense, type ConjugationVerb } from "@/features/conjugation/data";
import type { PracticeMode, QuizResult } from "./practice-types";
import styles from "./QuizExercise.module.css";

type QuizExerciseProps = {
  mode: Extract<PracticeMode, "choose" | "reverse">;
  round: number;
  tense: Tense;
  verb: ConjugationVerb;
  forms: Forms;
  questionPerson: Person;
  correctForm: string;
  chooseOptions: string[];
  quizSelection: string | null;
  quizResult: QuizResult;
  onAnswer: (selection: string, correct: boolean) => void;
  onNext: () => void;
};

export function QuizExercise({
  mode,
  round,
  tense,
  verb,
  forms,
  questionPerson,
  correctForm,
  chooseOptions,
  quizSelection,
  quizResult,
  onAnswer,
  onNext,
}: QuizExerciseProps) {
  const [score,setScore]=useState(0);
  const child=useChildPresentation();
  const finished=!!quizResult&&round%people.length===people.length-1;
  function answer(selection:string,correct:boolean){setScore((round%people.length===0?0:score)+Number(correct));onAnswer(selection,correct);}
  return (
    <div className={`${styles.card} ${quizResult ? styles[quizResult] : ""}`}>
      <div className={styles.heading}>
        <span>{mode === "choose" ? "Выбери правильную форму" : "Узнай местоимение"}</span>
        <span>{(round % people.length) + 1} / {people.length}</span>
      </div>

      <div className={styles.prompt}>
        {mode === "choose" ? (
          <>
            <span className={styles.context}>{verb.infinitive} · {tense === "present" ? "presente" : "pretérito"}</span>
            <strong>{questionPerson.label}</strong>
            <span>Какая форма подходит?</span>
          </>
        ) : (
          <>
            <span className={styles.context}>{verb.infinitive} · {tense === "present" ? "presente" : "pretérito"}</span>
            <strong>{correctForm}</strong>
            <span>Кто выполнял действие?</span>
          </>
        )}
      </div>

      <div className={`${styles.options} ${styles[mode]}`}>
        {mode === "choose" ? chooseOptions.map((form) => {
          const correct = form === correctForm;
          const selected = quizSelection === form;
          return (
            <button
              key={form}
              disabled={Boolean(quizResult)}
              className={`${quizResult && correct ? styles.correct : ""} ${selected && quizResult === "wrong" ? styles.wrong : ""}`}
              onClick={() => answer(form, correct)}
            >{form}</button>
          );
        }) : people.map((person) => {
          const correct = forms[person.key] === correctForm;
          const selected = quizSelection === person.key;
          return (
            <button
              key={person.key}
              disabled={Boolean(quizResult)}
              className={`${quizResult && correct ? styles.correct : ""} ${selected && quizResult === "wrong" ? styles.wrong : ""}`}
              onClick={() => answer(person.key, correct)}
            >{person.label}</button>
          );
        })}
      </div>

      <div className={styles.footer} aria-live="polite">
        <p>{quizResult === "correct" ? "Верно! Muito bem!" : quizResult === "wrong" ? `Почти. Правильный ответ: ${mode === "choose" ? correctForm : people.filter((person) => forms[person.key] === correctForm).map((person) => person.label).join(" или ")}.` : "Выбери один из вариантов."}</p>
        {quizResult && !(child&&finished) && <button onClick={onNext}>Следующий <span aria-hidden="true">›</span></button>}
      </div>
      {finished&&<ActivityCompletion key={Math.floor(round/people.length)} id={wordActivityId(`quiz-${mode}`,[verb.infinitive,tense])} title={`${verb.infinitive.toUpperCase()} · ${mode==="choose"?"выбери форму":"узнай местоимение"}`} group="Грамматика" correct={score} total={people.length} scoreLabel="Верно"><button type="button" onClick={onNext}>Следующий круг →</button></ActivityCompletion>}
    </div>
  );
}
