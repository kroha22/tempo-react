"use client";
import {ActivityCompletion} from "./ActivityCompletion";
import {useRef,useState} from "react";
import {greetingSets,greetingExtras} from "../content/greetings";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./FirstSteps.module.css";

export function GreetingsLesson({child}:{child:boolean}) {
  const noteRef=useRef<HTMLDetailsElement>(null);
  const [setId,setSetId]=useState(greetingSets[0].id);
  const [mode,setMode]=useState<"phrases"|"practice">("phrases");
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [checked,setChecked]=useState<Record<string,boolean>>({});
  const set=greetingSets.find(item=>item.id===setId)!;
  return <section aria-label="Приветствия и общение">
    <p>{child?"Поздоровайся, познакомься, спроси, как дела, и попрощайся. Попробуем по маленьким шагам!":"Научимся начать и закончить короткий разговор: приветствие, имя, самочувствие и прощание."}</p>
    <nav className={styles.steps} aria-label="Ситуации общения">{greetingSets.map(item=><button type="button" key={item.id} aria-label={`${item.pt} ${item.ru}`} aria-pressed={setId===item.id} onClick={()=>{setSetId(item.id);setMode("phrases");}}><span lang="pt-PT">{item.pt}</span><br/>{item.ru}</button>)}</nav>
    <div className={styles.switch} role="group" aria-label="Режим общения"><button type="button" aria-pressed={mode==="phrases"} onClick={()=>setMode("phrases")}>Фразы и пояснения</button><button type="button" aria-pressed={mode==="practice"} onClick={()=>setMode("practice")}>Практика диалога</button></div>
    <h2>{set.ru}</h2><p>{child?set.childCue:set.adultCue}</p>
    {mode==="phrases"?<>
      <div className={styles.examples}>{set.phrases.map(phrase=><article key={phrase.pt}><strong lang="pt-PT">{phrase.pt}</strong><span>{phrase.ru}</span>{phrase.note&&<small>{phrase.note}</small>}{phrase.pt==="Chamo-me…"&&<button type="button" aria-label="Почему в chamo-me есть me?" onClick={()=>{if(noteRef.current){noteRef.current.open=true;noteRef.current.querySelector("summary")?.focus();}}}>* Почему здесь me?</button>}</article>)}</div>
      {set.id==="greetings:introduce"&&<details ref={noteRef}><summary>Chamo-me*: что значит me?</summary><p>{child?"Chamo-me Rita — «Меня зовут Рита». Представь, что ты Рита. Про себя говоришь me, а когда спрашиваешь имя друга — te: Como te chamas?":"Chamo-me — форма глагола chamar-se («называться»): chamo — форма для «я», me — местоимение «себя», относящееся к говорящему. По-русски всю конструкцию естественно переводим «меня зовут»."}</p><p><b lang="pt-PT">Eu chamo-me Rita. — Tu chamas-te Rui.</b><br/>Меня зовут Рита. — Тебя зовут Руй.</p><p>В вопросе <b lang="pt-PT">Como te chamas?</b> местоимение te стоит перед глаголом. Пока запоминаем вопрос и ответ целиком. Me и te — не притяжательные слова meu/minha («мой/моя»).</p><LegacyLessonLink href="/learning/practice?lesson=reflexive">Возвратные глаголы: как работают me, te, se →</LegacyLessonLink></details>}
      {set.id==="greetings:conversation"&&<p><b lang="pt-PT">— Como estás? — Estou bem, obrigada. E tu? — Estou bem, obrigado.</b><br/>— Как ты? — У меня всё хорошо, спасибо. А ты? — У меня всё хорошо, спасибо.<br/>Здесь сначала отвечает Рита, затем Руй. Если хочется рассказать о другом состоянии, открой тему «Как я себя чувствую».</p>}
      {set.id==="greetings:goodbye"&&<details><summary>Ещё пожелания — по желанию</summary><div className={styles.examples}>{greetingExtras.map(phrase=><article key={phrase.pt}><strong lang="pt-PT">{phrase.pt}</strong><span>{phrase.ru}</span>{phrase.note&&<small>{phrase.note}</small>}</article>)}</div></details>}
      <button type="button" onClick={()=>setMode("practice")}>Попробовать диалог →</button>
    </>:<>{set.checks.map(check=>{
      const revealed=checked[check.id],correct=answers[check.id]===check.answer;
      return <section key={check.id} className={styles.check} aria-labelledby={`${check.id}-prompt`}><h3 id={`${check.id}-prompt`}>{check.prompt}</h3><div className={styles.options}>{check.options.map((option,index)=><button type="button" key={option} lang="pt-PT" aria-pressed={answers[check.id]===index} onClick={()=>{setAnswers(previous=>({...previous,[check.id]:index}));setChecked(previous=>({...previous,[check.id]:false}));}}>{option}</button>)}</div><button type="button" disabled={answers[check.id]===undefined} onClick={()=>setChecked(previous=>({...previous,[check.id]:true}))}>Проверить ответ</button>{revealed&&<p role="status">{correct?"✓ Верно. ":"Попробуй ещё раз. "}{check.feedback}</p>}</section>;
    })}<p>Это практика выбора фраз. Можно вернуться к пояснениям и попробовать ещё раз.</p></>}
    {mode==="practice"&&set.checks.length>0&&set.checks.every(check=>checked[check.id])&&<ActivityCompletion id={set.id} title={set.ru} group="Первые фразы" correct={set.checks.filter(check=>answers[check.id]===check.answer).length} total={set.checks.length} child={child} scoreLabel="Верно"><button type="button" onClick={()=>{setChecked(previous=>Object.fromEntries(Object.entries(previous).filter(([id])=>!set.checks.some(check=>check.id===id))));}}>Повторить диалог</button></ActivityCompletion>}
  </section>;
}
