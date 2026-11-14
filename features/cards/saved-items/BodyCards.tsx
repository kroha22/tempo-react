"use client";
import {useEffect,useRef} from "react";
import {bodyCardWords,bodyCardSources,bodyCardTopics,bodyCardTitles,bodyStudyItemIds,bodyCardsHref,bodyActionWordIds,type BodyCardTopic} from "../../content/body-cards";
import {readingSource} from "../../content/reading-sources";
import {EnsureQueryScope} from "../../../shared/query/SessionQueryBoundary";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {StudyItemCardSave} from "./ReadingCardSave";
import {StudyReview} from "../study-review/StudyReview";
import {CardSpeechButton} from "../components/CardSpeechButton";
import styles from "./FamilyCards.module.css";
export function BodyCards({topic:requestedTopic,mode,source:requestedSource,onBack}:{topic?:string;mode?:string;source?:string;onBack?:()=>void}){
  const topic:BodyCardTopic=bodyCardTopics.find(id=>id===requestedTopic)??"face",review=mode==="review",heading=useRef<HTMLHeadingElement>(null);
  const actions=requestedSource==="body",source=actions?readingSource("lesson:everyday:body")!:bodyCardSources.find(source=>source.id===`lesson:body:${topic}`)!,words=bodyCardWords.filter(word=>actions?bodyActionWordIds.includes(word.wordId):word.topic===topic);
  useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[topic,review]);
  return <EnsureQueryScope><section className={styles.panel} aria-label="Тело и самочувствие: личные карточки и повторение">
    {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/topics">← Все темы</LegacyLessonLink>}
    <h1 ref={heading} tabIndex={-1}>{review?"Тело и самочувствие · Повторение":actions?"Тело и действия · 6 знакомых слов":`Тело и самочувствие · ${bodyCardTitles[topic]}`}</h1>
    <nav className={styles.navigation} aria-label="Карточки тела и самочувствия">{bodyCardTopics.map(id=><LegacyLessonLink key={id} href={bodyCardsHref(id)} current={!actions&&!review&&topic===id}>{bodyCardTitles[id]} · {id==="face"?8:6} слов</LegacyLessonLink>)}<LegacyLessonLink href={bodyCardsHref(topic,true)} current={review}>Повторение темы</LegacyLessonLink></nav>
    {review?<><p>Только сохранённые слова этих трёх пачек, когда наступает срок. Задания и отметки знакомства сохраняют самостоятельные результаты.</p><StudyReview studyItemIds={bodyStudyItemIds} embedded/></>:<>
      <p>Добавьте нужные слова. Повторное добавление дополняет источники той же карточки без сброса расписания.</p>
      {topic==="face"&&<p>O ouvido — орган слуха, a orelha — наружная часть уха. A língua здесь означает часть тела.</p>}
      {topic==="movement"&&<p>A mão — кисть, o braço — рука от плеча до кисти. Это разные карточки.</p>}
      {topic==="feelings"&&<p>Triste, cansado и pronto — прежние карточки GA1 с книжными привязками. Родовые формы в примерах не создают отдельные карточки.</p>}
      <div className={styles.words}>{words.map(word=><article key={word.studyItemId}>
        <strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p>{word.forms!==word.pt&&<p>Формы: <span lang="pt-PT">{word.forms}</span></p>}<p lang="pt-PT">{word.example.pt}</p><p>{word.example.ru}</p>
        <CardSpeechButton text={word.pt}/><StudyItemCardSave choice={word} source={source}/>
      </article>)}</div>
      <LegacyLessonLink href={bodyCardsHref(topic,true)}>К повторению сохранённых карточек →</LegacyLessonLink>
      <p><LegacyLessonLink href="/learning/everyday/body">Тело и действия: объяснение и задания →</LegacyLessonLink></p>
    </>}
  </section></EnsureQueryScope>;
}
