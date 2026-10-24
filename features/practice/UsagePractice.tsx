"use client";

import {ActivityCompletion} from "./ActivityCompletion";
import { useContext, useState } from "react";
import type { UsageModule } from "../content/learning-model";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";
import { RelatedLearningNavigation } from "./RelatedLearningNavigation";

export function UsagePractice({ module, active = true,onComplete,onRunComplete,completionLabel="Следующий урок →" }: { module: UsageModule; active?: boolean;onComplete?:()=>void;onRunComplete?:(result:{correct:number;total:number})=>void;completionLabel?:string }) {
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount,setCorrectCount]=useState(0);
  const exercise = module.exercises[step];
  const finished = step >= module.exercises.length;

  function restart() {
    setStep(0);
    setSelectedId(null);
    setChecked(false);
    setCorrectCount(0);
  }

  if (finished) return <ActivityCompletion id={module.id} title={module.title} group="Слова в жизни" correct={correctCount} total={module.exercises.length} record={module.id!=="usage:feelings"} child={module.id==="usage:feelings"?false:undefined}><section className="usage-practice usage-practice--finished" aria-live="polite">
    <span className="tempo-kicker">Фразы готовы</span>
    <h2>Все примеры пройдены</h2>
    <p>Слова остались теми же, но теперь они встретились внутри целых предложений.</p>
    <button type="button" onClick={restart}>↺ Повторить фразы</button>
    {onComplete&&<button type="button" onClick={onComplete}>{completionLabel}</button>}
    <RelatedLinks module={module} />
  </section></ActivityCompletion>;

  const correct = selectedId === exercise.correctOptionId;
  const correctSentence = `${exercise.before}${exercise.options.find(option => option.id === exercise.correctOptionId)?.text ?? ""}${exercise.after}`;
  return <section className="usage-practice">
    <header className="speech-help-zone">
      <div className="speech-help-group"><SpeechHelpButton /></div>
      <span className="tempo-kicker">Слова в контексте</span>
      <h2>{module.title}</h2>
      <p>{module.situation}</p>
    </header>

    <div className="usage-examples" aria-label="Примеры фраз">
      {module.examples.map(example => <article key={example.id}>
        <div className="usage-example-copy">
        <strong lang="pt-PT">{example.portuguese}</strong>
        <span>{example.translation}</span>
        </div>
        <CardSpeechButton text={example.portuguese} disabled={!active} />
      </article>)}
    </div>

    <div className="usage-task">
      <div className="usage-task__progress"><span>Попробуй сам</span><b>{step + 1} из {module.exercises.length}</b></div>
      <p>{exercise.prompt}</p>
      <div className="usage-sentence" lang="pt-PT">{exercise.before}<span>{selectedId ? exercise.options.find(option => option.id === selectedId)?.text : "…"}</span>{exercise.after}</div>
      <div className="usage-options" aria-label="Варианты ответа">
        {exercise.options.map(option => <button
          type="button"
          key={option.id}
          aria-pressed={selectedId === option.id}
          disabled={checked}
          onClick={() => setSelectedId(option.id)}
        ><span aria-hidden="true">{option.icon}</span><b lang="pt-PT">{option.text}</b></button>)}
      </div>
      {!checked ? <button className="usage-check" type="button" disabled={!selectedId} onClick={() => setChecked(true)}>Проверить</button> : <div className={`usage-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
        <strong>{correct ? "Верно" : "Посмотри на правильный вариант"}</strong>
        <div className="usage-answer-audio"><p>{exercise.feedback}</p><CardSpeechButton key={exercise.id} text={correctSentence} label="Послушать фразу" disabled={!active} /></div>
        <button type="button" onClick={() => {const score=correctCount+Number(correct);setCorrectCount(score);if(step+1===module.exercises.length)onRunComplete?.({correct:score,total:module.exercises.length});setStep(current => current + 1); setSelectedId(null); setChecked(false); }}>{step + 1 === module.exercises.length ? "Завершить" : "Следующая фраза →"}</button>
      </div>}
    </div>

    <RelatedLinks module={module} />
  </section>;
}

function RelatedLinks({ module }: { module: UsageModule }) {
  const navigate = useContext(RelatedLearningNavigation);
  return <aside className="usage-related" aria-label="Связанные уроки и практика">
    <span>Связано с этой темой</span>
    <div>{module.relatedLinks.map(link => <a key={link.id} href={navigate ? `#${link.href}` : link.href} onClick={navigate ? (event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(link.href); } : undefined}>{link.label} →</a>)}</div>
  </aside>;
}
