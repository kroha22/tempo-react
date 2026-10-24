"use client";
import {ActivityCompletion} from "./ActivityCompletion";
import {useState} from "react";
import type {ShortGrammarLesson} from "../content/short-grammar-lessons";
import {usePracticePlan} from "./plan/PracticePlanContext";

export function ShortGrammarQuiz({lesson}:{lesson:ShortGrammarLesson}) {
  const plan=usePracticePlan();
  const [selectedAnswer,setSelectedAnswer]=useState<number|null>(null);
  const [hadMistake,setHadMistake]=useState(false);
  return (<section className="adult-check" aria-labelledby={`${lesson.id}-check`}>
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
            {selectedAnswer===lesson.quiz.answer&&<ActivityCompletion id={`practice:grammar:${lesson.id}`} title={lesson.title+" · "+lesson.subtitle} group="Грамматика" correct={hadMistake?0:1} total={1}><button type="button" onClick={()=>{setSelectedAnswer(null);setHadMistake(false);}}>Повторить проверку</button></ActivityCompletion>}
          </section>
  );
}
