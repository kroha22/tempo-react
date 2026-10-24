"use client";
import {ActivityCompletion} from "./ActivityCompletion";
import {useState} from "react";
import {identitySets,type IdentityTask} from "../content/identity";
import {VocabularyCards} from "./VocabularyCards";
import {VocabularyWriting} from "./VocabularyWriting";
import {WordPairs} from "./WordPairs";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./FirstSteps.module.css";

type WordMode="cards"|"pairs"|"writing";
export function IdentityVocabulary({setId="identity:roles",mode="cards",active=true}:{setId?:string;mode?:WordMode;active?:boolean}) {
  const set=identitySets.find(item=>item.id===setId)!;
  return <>
    <div hidden={mode!=="cards"}><VocabularyCards words={set.words} active={active&&mode==="cards"}/></div>
    {active&&mode==="pairs"&&<WordPairs words={set.words} blocks={[{id:set.id,title:set.ru,words:set.words.map(word=>word.id)}]}/>}
    <div hidden={mode!=="writing"}><VocabularyWriting title={set.ru} words={set.words} active={active&&mode==="writing"}/></div>
  </>;
}

type SentenceAnswer={verb:string;ending:string;checked:boolean};
const emptyAnswer:SentenceAnswer={verb:"",ending:"",checked:false};
function SentencePractice({task,answer,onChange}:{task:IdentityTask;answer:SentenceAnswer;onChange:(answer:SentenceAnswer)=>void}) {
  const {verb,ending,checked}=answer;
  const correct=verb===task.verb&&ending===task.ending;
  return <section className={styles.check} aria-label={task.prompt}><h3>{task.prompt}</h3>
    <p className={styles.sentence} lang="pt-PT">{task.subject} <b>{verb||"___"}</b> <b>{ending||"___"}</b>.</p>
    <fieldset className={styles.sentenceChoices}><legend>1. Форма SER</legend><div className={styles.options}>{["sou","é","somos","são"].map(value=><button type="button" key={value} lang="pt-PT" aria-pressed={verb===value} onClick={()=>{onChange({...answer,verb:value,checked:false});}}>{value}</button>)}</div></fieldset>
    <fieldset className={styles.sentenceChoices}><legend>2. Закончи фразу</legend><div className={styles.options}>{task.options.map(value=><button type="button" key={value} lang="pt-PT" aria-pressed={ending===value} onClick={()=>{onChange({...answer,ending:value,checked:false});}}>{value}</button>)}</div></fieldset>
    <button type="button" disabled={!verb||!ending} onClick={()=>onChange({...answer,checked:true})}>Проверить фразу</button>
    {checked&&<div role="status"><p>{correct?"✓ Верно!":verb!==task.verb?`Проверь форму глагола. ${task.verbHint}`:`Проверь окончание фразы. ${task.wordHint}`}</p>{correct&&<><strong lang="pt-PT">{task.subject} {task.verb} {task.ending}.</strong><p>{task.translation}</p></>}</div>}
  </section>;
}

export function IdentityLesson({child}:{child:boolean}) {
  const [setId,setSetId]=useState(identitySets[0].id);
  const [mode,setMode]=useState<WordMode|"phrases"|"practice">("cards");
  const [question,setQuestion]=useState(0);
  const [answers,setAnswers]=useState<Record<string,SentenceAnswer>>({});
  const set=identitySets.find(item=>item.id===setId)!;
  return <section aria-label="Кто я: слова и фразы с SER">
    <p>{child?"Представь героя: кто он, откуда и какой у него характер. Можно всё придумать — рассказывать о себе необязательно.":"Представь себя или персонажа: роль, происхождение и характеристика. Начни со слов, затем собери фразы с SER."}</p>
    <nav className={styles.identitySets} aria-label="Наборы Кто я">{identitySets.map(item=><button type="button" key={item.id} aria-label={`${item.title} — ${item.ru}`} aria-pressed={setId===item.id} onClick={()=>{setSetId(item.id);setMode("cards");setQuestion(0);}}><span lang="pt-PT">{item.title}</span><br/>{item.ru}</button>)}</nav>
    <nav className={styles.identityModes} aria-label="Занятия Кто я">{([["cards","Карточки"],["pairs","Пары"],["writing","Напиши слово"],["phrases","Примеры фраз"],["practice","Собери фразу"]] as const).map(([id,label])=><button type="button" key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}>{label}</button>)}</nav>
    <p>{child?set.childCue:set.adultCue}</p>
    <div hidden={!["cards","pairs","writing"].includes(mode)}><IdentityVocabulary key={set.id} active={["cards","pairs","writing"].includes(mode)} setId={set.id} mode={mode==="pairs"||mode==="writing"?mode:"cards"}/></div>
    {mode==="phrases"&&<><div className={styles.examples}>{set.examples.map(example=><article key={example.pt}><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></article>)}</div>
      {set.id==="identity:roles"?<p>Слово учим с артиклем: <b lang="pt-PT">o professor / a professora</b>. Но профессию после SER обычно называем без него: <b lang="pt-PT">Sou professora.</b> Несколько людей: <b lang="pt-PT">Eles são médicos.</b></p>:set.id==="identity:origin"?<p><b lang="pt-PT">Sou de Portugal. Sou do Brasil.</b> Do = de + o. Сочетание со страной запоминаем целиком. <b lang="pt-PT">De onde és?</b> — «Откуда ты?»; és — форма SER для tu. Происхождение здесь не означает гражданство.</p>:<p><b lang="pt-PT">O Rui é calmo.</b> — характеристика Руя. <b lang="pt-PT">O Rui está calmo.</b> — его состояние сейчас. Для Аны: calma, curiosa, simpática; для нескольких мужчин или смешанной группы: calmos, curiosos, simpáticos.</p>}
      <button type="button" onClick={()=>setMode("practice")}>Теперь собери фразу →</button>
    </>}
    <div hidden={mode!=="practice"}><nav className={styles.switch} aria-label="Задания Кто я">{set.tasks.map((task,index)=><button type="button" key={task.id} aria-pressed={question===index} aria-label={`Задание ${index+1} из ${set.tasks.length}`} onClick={()=>setQuestion(index)}>{index+1}</button>)}</nav><SentencePractice task={set.tasks[question]} answer={answers[set.tasks[question].id]??emptyAnswer} onChange={answer=>setAnswers(previous=>({...previous,[set.tasks[question].id]:answer}))}/></div>
    {mode==="practice"&&set.tasks.every(task=>answers[task.id]?.checked)&&<ActivityCompletion id={set.id} title={set.ru+" · фразы с SER"} group="Первые фразы" correct={set.tasks.filter(task=>answers[task.id]?.verb===task.verb&&answers[task.id]?.ending===task.ending).length} total={set.tasks.length} child={child} scoreLabel="Верно"><button type="button" onClick={()=>{setAnswers(previous=>Object.fromEntries(Object.entries(previous).filter(([id])=>!set.tasks.some(task=>task.id===id))));setQuestion(0);}}>Повторить фразы</button></ActivityCompletion>}
    <aside className={styles.links}><LegacyLessonLink href="/learning/practice?lesson=ser-estar">SER / ESTAR: общее объяснение и формы →</LegacyLessonLink></aside>
  </section>;
}
