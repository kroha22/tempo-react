"use client";
import {homeFlowHref} from "../../content/home-flow";
import {useEffect,useRef} from "react";
import {homeWordsForTopic,homeBatchSources,homeRouteSources,homeCardTopics,homeCardTitles,homeStudyItemIds,homeCardsHref,type HomeCardTopic} from "../../content/home-cards";
import {EnsureQueryScope} from "../../../shared/query/SessionQueryBoundary";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {StudyItemCardSave} from "./ReadingCardSave";
import {StudyReview} from "../study-review/StudyReview";
import {CardSpeechButton} from "../components/CardSpeechButton";
import styles from "./FamilyCards.module.css";
export function HomeCards({topic:requestedTopic,mode,source:requestedSource,onBack,embedded=false}:{topic?:string;mode?:string;source?:string;onBack?:()=>void;embedded?:boolean}){
  const topic:HomeCardTopic=homeCardTopics.find(id=>id===requestedTopic)??"rooms",review=mode==="review",heading=useRef<HTMLHeadingElement>(null);
  const source=requestedSource==="route"?homeRouteSources.find(source=>source.topic===topic)!:homeBatchSources.find(source=>source.id===`lesson:home:${topic}`)!;
  const words=homeWordsForTopic(topic,requestedSource==="route");
  useEffect(()=>{if(embedded)return;heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start",behavior:"instant"});},[topic,review,requestedSource,embedded]);
  return <EnsureQueryScope><section className={styles.panel} aria-label="Дом и расположение: личные карточки и повторение">
    {!embedded&&<>{onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/topics">← Все темы</LegacyLessonLink>}
    <h1 ref={heading} tabIndex={-1}>{review?"Дом и расположение · Повторение":`Дом и расположение · ${homeCardTitles[topic]}`}</h1>
    <nav className={styles.navigation} aria-label="Карточки дома и расположения">{homeCardTopics.map(id=><LegacyLessonLink key={id} href={homeCardsHref(id)} current={!review&&topic===id}>{homeCardTitles[id]} · {id==="rooms"?6:id==="objects"?7:5} слов</LegacyLessonLink>)}<LegacyLessonLink href={homeCardsHref(topic,true)} current={review}>Повторение темы</LegacyLessonLink></nav></>}
    {review?<><p>Только сохранённые карточки этих трёх пачек по сроку SRS. Просмотр слов и добавление источника не засчитывают задания.</p><StudyReview studyItemIds={homeStudyItemIds} embedded/></>:<>
      <p>Выберите нужные слова. Сохранение прежней карточки из этой пачки добавляет источник и подключает повторение, если его ещё не было. Имеющаяся оценка сохраняется.</p>
      {requestedSource==="route"&&<p>Источник сохранения: {source.title}. Здесь только слова этого урока: {words.length}. Полные пачки доступны во вкладках выше.</p>}
      {topic==="rooms"&&<p>Sala здесь — комната / гостиная, quarto — спальня, escritório — рабочий кабинет дома.</p>}
      {topic==="objects"&&<p>Кот — знакомый участник сцены. Одинаковые предметы из схем и уроков сохраняются в общие карточки.</p>}
      {topic==="location"&&<p>Em cima de — на поверхности. В примере de + a даёт da: dentro da caixa.</p>}
      <div className={styles.words}>{words.map(word=><article key={`${source.id}:${word.studyItemId}`}><strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p><p lang="pt-PT">{word.example.pt}</p><p>{word.example.ru}</p><CardSpeechButton text={word.pt}/><StudyItemCardSave choice={word} source={source} existingItemHint="Добавим источник и подключим повторение, если его ещё не было. Прежняя оценка сохраняется."/></article>)}</div>
      <LegacyLessonLink href={embedded?homeFlowHref(topic,"review"):homeCardsHref(topic,true)}>К повторению сохранённых карточек →</LegacyLessonLink>
      <p><LegacyLessonLink href={homeRouteSources.find(source=>source.topic===topic)!.href}>Объяснение и готовое задание →</LegacyLessonLink></p>
    </>}
  </section></EnsureQueryScope>;
}
