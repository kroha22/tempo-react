"use client";

import {LessonText,useLessonText} from "./LessonText";
import {ActivityCompletion} from "./ActivityCompletion";
import { useContext, useState } from "react";
import type { UsageModule } from "../content/learning-model";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";
import { RelatedLearningNavigation } from "./RelatedLearningNavigation";

export function UsagePractice({ module, active = true,compact=false,portuguese=false,keepStudyPortuguese=false,onComplete,onRunComplete,completionLabel="Следующий урок →" }: { module: UsageModule; active?: boolean;compact?:boolean;portuguese?:boolean;keepStudyPortuguese?:boolean;onComplete?:()=>void;onRunComplete?:(result:{correct:number;total:number})=>void;completionLabel?:string }) {
  const textHelp=useLessonText();
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount,setCorrectCount]=useState(0);
  const exercise = module.exercises[step];
  const finished = step >= module.exercises.length;

  function restart() {
    textHelp?.reset();
    setStep(0);
    setSelectedId(null);
    setChecked(false);
    setCorrectCount(0);
  }

  if (finished) return <ActivityCompletion id={module.id} title={module.title} group="Слова в жизни" correct={correctCount} total={module.exercises.length} record={module.id!=="usage:feelings"} child={module.id==="usage:feelings"?false:undefined}><section className="usage-practice usage-practice--finished" aria-live="polite">
    <span className="tempo-kicker">{portuguese?"Concluído":"Фразы готовы"}</span>
    <h2>{portuguese?"Prática concluída":"Все примеры пройдены"}</h2>
    <p>{portuguese?"Já praticaste estas situações. Podes continuar ou tentar outra vez.":"Слова остались теми же, но теперь они встретились внутри целых предложений."}</p>
    <button type="button" onClick={restart}>{portuguese?"↺ Tentar outra vez":"↺ Повторить фразы"}</button>
    {onComplete&&<button type="button" onClick={onComplete}>{completionLabel}</button>}
    <RelatedLinks module={module} />
  </section></ActivityCompletion>;

  const correct = selectedId === exercise.correctOptionId;
  const correctSentence = `${exercise.before}${exercise.options.find(option => option.id === exercise.correctOptionId)?.text ?? ""}${exercise.after}`;
  return <section className="usage-practice">
    {!compact&&<header className="speech-help-zone">
      <div className="speech-help-group"><SpeechHelpButton /></div>
      <span className="tempo-kicker">Слова в контексте</span>
      <h2><LessonText text={module.title}/></h2>
      <p>{module.situation}</p>
    </header>}

    {!compact&&<div className="usage-examples" aria-label="Примеры фраз">
      {module.examples.map(example => <article key={example.id}>
        <div className="usage-example-copy">
        <strong lang="pt-PT">{example.portuguese}</strong>
        <span>{example.translation}</span>
        </div>
        <CardSpeechButton text={example.portuguese} disabled={!active} />
      </article>)}
    </div>}

    <div className="usage-task">
      <div className="usage-task__progress"><span>{portuguese?"Agora tu":"Попробуй сам"}</span><b>{step + 1} {portuguese?"de":"из"} {module.exercises.length}</b></div>
      <div key={exercise.id} className="usage-prompt"><p><LessonText text={exercise.prompt} translation={exercise.promptTranslation} audio/></p>{!textHelp&&exercise.promptTranslation&&<details className="usage-prompt-translation"><summary aria-label="Показать перевод вопроса на русский" title="Перевод на русский">i</summary><p lang="ru">{exercise.promptTranslation}</p></details>}</div>
      <div className="usage-sentence" lang="pt-PT">{!keepStudyPortuguese&&textHelp?.translated&&selectedId&&textHelp.translations[`${exercise.before}${exercise.options.find(option=>option.id===selectedId)?.text??""}${exercise.after}`]?<LessonText text={`${exercise.before}${exercise.options.find(option=>option.id===selectedId)?.text??""}${exercise.after}`}/>:<><LessonText text={exercise.before} keepPortuguese={keepStudyPortuguese}/><span>{selectedId ? <LessonText text={exercise.options.find(option => option.id === selectedId)?.text??""} keepPortuguese={keepStudyPortuguese}/> : "…"}</span><LessonText text={exercise.after} keepPortuguese={keepStudyPortuguese}/></>}</div>
      <div className="usage-options" aria-label="Варианты ответа">
        {exercise.options.map(option => textHelp&&(textHelp.words||textHelp.listen)?<div key={option.id} className="usage-option-help"><p><LessonText text={option.text} keepPortuguese={keepStudyPortuguese} audio/></p><button type="button" aria-pressed={selectedId===option.id} disabled={checked} aria-label={`Выбрать: ${option.text}`} onClick={()=>setSelectedId(option.id)}>✓</button></div>:<button type="button" key={option.id} aria-pressed={selectedId===option.id} disabled={checked} onClick={()=>setSelectedId(option.id)}><span aria-hidden="true">{option.icon}</span><b><LessonText text={option.text}/></b></button>)}
      </div>
      {!checked ? <button className="usage-check" type="button" disabled={!selectedId} onClick={() => setChecked(true)}>{portuguese?"Verificar":"Проверить"}</button> : <div className={`usage-feedback ${correct ? "is-correct" : "is-wrong"}`} role="status">
        <strong>{correct ? (portuguese?"Correto!":"Верно") : (portuguese?"Vê a resposta e tenta compreender.":"Посмотри на правильный вариант")}</strong>
        <div className="usage-answer-audio"><p><LessonText text={exercise.feedback} audio/></p>{!textHelp&&<CardSpeechButton key={exercise.id} text={correctSentence} label="Послушать фразу" disabled={!active} />}</div>
        <button type="button" onClick={() => {textHelp?.reset();const score=correctCount+Number(correct);setCorrectCount(score);if(step+1===module.exercises.length)onRunComplete?.({correct:score,total:module.exercises.length});setStep(current => current + 1); setSelectedId(null); setChecked(false); }}>{step + 1 === module.exercises.length ? (portuguese?"Concluir":"Завершить") : (portuguese?"Seguinte →":"Следующая фраза →")}</button>
      </div>}
    </div>

    <RelatedLinks module={module} />
  </section>;
}

function RelatedLinks({ module }: { module: UsageModule }) {
  const navigate = useContext(RelatedLearningNavigation);
  if(!module.relatedLinks.length)return null;
  return <aside className="usage-related" aria-label="Связанные уроки и практика">
    <span>Связано с этой темой</span>
    <div>{module.relatedLinks.map(link => <a key={link.id} href={navigate ? `#${link.href}` : link.href} onClick={navigate ? (event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(link.href); } : undefined}>{link.label} →</a>)}</div>
  </aside>;
}
