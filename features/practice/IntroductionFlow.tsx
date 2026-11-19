"use client";
import {useContext,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {introductionPhases,introductionHref,introductionCards,introductionStudyItemIds,introductionExplanation,introductionGlossary,type IntroductionPhase} from "../content/introduction-flow";
import {wordBrowseSets} from "../content/word-browse-sets";
import {topicForWordSet,topicWordsHref} from "../content/topic-navigation";
import {greetingSets} from "../content/greetings";
import {identitySets} from "../content/identity";
import {DescriptionReading,DescriptionParagraph} from "./DescriptionReading";
import {GreetingsLesson} from "./GreetingsLesson";
import {IdentityLesson} from "./IdentityLesson";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
import {useProfileLearning} from "./profile-learning";
import {LegacyCardSave} from "../cards/saved-items/LegacyCardSave";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {StudyReview} from "../cards/study-review/StudyReview";
import styles from "./TimeDayFlow.module.css";
import practiceStyles from "./FirstSteps.module.css";
import flowStyles from "./IntroductionFlow.module.css";

type RelatedRenderer=(href:string,onBack:()=>void)=>ReactNode;
const titles={explanation:"Объяснение",words:"Слова",practice:"Задания",review:"Повторение"};
export function IntroductionFlow({phase:requestedPhase,related:requestedRelated,renderRelated,onBack}:{phase?:string;related?:string;renderRelated?:RelatedRenderer;onBack:()=>void}){
  const phase=introductionPhases.find(id=>id===requestedPhase)??"explanation";
  const related=renderRelated&&requestedRelated?.startsWith("/learning/")&&!requestedRelated.startsWith("/learning/introduction")?requestedRelated:undefined;
  const navigate=useContext(RelatedLearningNavigation),learner=useProfileLearning(),heading=useRef<HTMLHeadingElement>(null),relatedRoot=useRef<HTMLDivElement>(null);
  const [practice,setPractice]=useState<"greetings"|"identity">("greetings");
  const sets=useMemo(()=>wordBrowseSets(false).filter(set=>topicForWordSet(set)?.id==="foundation:hello"),[]);
  const open=(next:IntroductionPhase)=>{const href=introductionHref(next);if(navigate)navigate(href);else window.location.assign(href);};
  const openRelated=(href:string)=>{if(href==="/learning/plan"||href==="/learning/topics")navigate?.(href);else if(href.startsWith("/learning/")&&!href.startsWith("/learning/introduction"))navigate?.(introductionHref(phase,href));else navigate?.(href);};
  useEffect(()=>{const target=related?Array.from(relatedRoot.current?.querySelectorAll<HTMLElement>("h1,h2")??[]).find(element=>!element.closest("[hidden]")):heading.current;if(target){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView?.({block:"start"});}},[phase,related]);
  const index=introductionPhases.indexOf(phase);
  return <section className={styles.flow} aria-label="Первые разговоры и чтение: единый урок">
    {related&&renderRelated&&<RelatedLearningNavigation value={openRelated}><div ref={relatedRoot}><button type="button" onClick={()=>open(phase)}>← К первым разговорам</button>{renderRelated(related,()=>open(phase))}</div></RelatedLearningNavigation>}
    <div hidden={!!related}>
      <button type="button" onClick={onBack}>← Назад</button>
      <h1>Первые разговоры и чтение</h1>
      <nav className={flowStyles.steps} aria-label="Шаги знакомства">{introductionPhases.map((id,i)=><LegacyLessonLink className={flowStyles.link} key={id} href={introductionHref(id)} current={phase===id}>{i+1} · {titles[id]}</LegacyLessonLink>)}</nav>
      <h2 ref={heading} tabIndex={-1}>{titles[phase]}</h2>
      <RelatedLearningNavigation value={renderRelated?openRelated:navigate}>
        <div hidden={phase!=="explanation"}><DescriptionReading source={introductionCards.source} glossary={introductionGlossary}>{introductionExplanation.map(row=><DescriptionParagraph key={row.pt} {...row}/>)}</DescriptionReading><p><LegacyLessonLink className={flowStyles.link} href="/learning/gramatica-ativa/identity-and-origin/explanation">SER: кто и откуда →</LegacyLessonLink></p><details><summary>Буквы и чтение — по необходимости</summary><p>Десять готовых тем. Можно открыть нужный звук, не проходя весь алфавит перед разговором.</p><LegacyLessonLink className={flowStyles.link} href="/learning/reading">Открыть буквы и чтение →</LegacyLessonLink></details></div>
        <div hidden={phase!=="words"}><p>Просмотрите нужную пачку и выберите слова в свою колоду. Знакомые слова можно пропустить.</p><div className={styles.nav}><LegacyLessonLink className={flowStyles.link} href={topicWordsHref("foundation:hello")}>Просмотреть все слова знакомства →</LegacyLessonLink></div><div className={styles.nav}>{sets.map(set=><LegacyLessonLink className={flowStyles.link} key={set.id} href={`/learning/quick-words?set=${encodeURIComponent(set.id)}`}>{set.title} · {set.words.length}</LegacyLessonLink>)}</div><details><summary>Пять готовых фраз — в карточки</summary><div className={styles.words}>{introductionCards.words.map(word=><article key={word.studyItemId}><strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p><CardSpeechButton text={word.pt} disabled={phase!=="words"||!!related}/><LegacyCardSave studyItemId={word.studyItemId} source={introductionCards.source}/></article>)}</div></details><p><LegacyLessonLink className={flowStyles.link} href="/learning/gramatica-ativa/words/u01">Слова «Кто и откуда» →</LegacyLessonLink></p></div>
        <div hidden={phase!=="practice"}><nav className={styles.nav} aria-label="Виды заданий знакомства"><button type="button" aria-pressed={practice==="greetings"} onClick={()=>setPractice("greetings")}>Короткий разговор</button><button type="button" aria-pressed={practice==="identity"} onClick={()=>setPractice("identity")}>Рассказать о себе</button></nav><div className={practiceStyles.pilot} hidden={practice!=="greetings"}><GreetingsLesson child={false} practiceOnly/></div><div className={practiceStyles.pilot} hidden={practice!=="identity"}><IdentityLesson child={false} practiceOnly/></div><p><LegacyLessonLink className={flowStyles.link} href="/learning/gramatica-ativa/identity-and-origin">SER: проверка и практика →</LegacyLessonLink></p></div>
        {phase==="review"&&!related&&<><p>Повторяются только сохранённые фразы знакомства, слова U01 и слова из объяснения. Остальные слова из пачек доступны в вашей общей колоде.</p><StudyReview studyItemIds={introductionStudyItemIds} embedded/><p><LegacyLessonLink className={flowStyles.link} href={topicWordsHref("foundation:hello")}>Открыть мою колоду слов →</LegacyLessonLink></p><details><summary>Результаты готовых заданий</summary><ul>{[...greetingSets.map(set=>({id:set.id,title:set.ru})),...identitySets.map(set=>({id:set.id,title:set.ru}))].map(row=>{const result=learner?.learning.activities?.[row.id];return <li key={row.id}>{row.title}: {result?`${result.correct} / ${result.total}`:"результата пока нет"}</li>;})}</ul></details><p>Просмотр объяснения и сохранение слов не засчитывают задания.</p></>}
      </RelatedLearningNavigation>
      <nav className={styles.nav} aria-label="Продолжение знакомства">{index>0&&<LegacyLessonLink className={flowStyles.link} href={introductionHref(introductionPhases[index-1])}>← {titles[introductionPhases[index-1]]}</LegacyLessonLink>}{index<3?<LegacyLessonLink className={flowStyles.link} href={introductionHref(introductionPhases[index+1])}>Дальше: {titles[introductionPhases[index+1]].toLocaleLowerCase("ru")} →</LegacyLessonLink>:<LegacyLessonLink className={flowStyles.link} href="/learning/plan">Продолжить общий план →</LegacyLessonLink>}</nav>
    </div>
  </section>;
}
