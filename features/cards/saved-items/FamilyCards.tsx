"use client";
import {WordLearningEntry} from "../../practice/WordLearningEntry";

import {useEffect,useRef} from "react";
import {familyCardSources,familyCardWords,familyCardsHref,familyStudyItemIds,type FamilyCardTopic} from "../../content/family-cards";
import {EnsureQueryScope} from "../../../shared/query/SessionQueryBoundary";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {StudyItemCardSave} from "./ReadingCardSave";
import {StudyReview} from "../study-review/StudyReview";
import {CardSpeechButton} from "../components/CardSpeechButton";
import styles from "./FamilyCards.module.css";

export function FamilyCards({topic:requestedTopic,mode,onBack,embedded=false}:{topic?:string;mode?:string;onBack?:()=>void;embedded?:boolean}){
  const topic:FamilyCardTopic=requestedTopic==="relatives"?"relatives":"close",review=mode==="review";
  const heading=useRef<HTMLHeadingElement>(null);
  const title=topic==="close"?"Близкие":"Родственники";
  const source=familyCardSources.find(source=>source.id===`lesson:family:${topic}`)!;
  useEffect(()=>{if(!embedded){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});}},[topic,review,embedded]);
  const words=(support:boolean)=>familyCardWords.filter(word=>word.topic===topic&&word.support===support).map(word=><article key={word.studyItemId}>
    <strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p>
    {word.forms&&<p><span lang="pt-PT">{word.forms}</span><br/><small>В карточки сохраняется указанная выше мужская форма из общего словаря.</small></p>}
    <p lang="pt-PT">{word.example.pt}</p><p>{word.example.ru}</p>
    <CardSpeechButton text={word.pt}/><StudyItemCardSave choice={word} source={source}/>
  </article>);
  return <EnsureQueryScope><section className={styles.panel} aria-label="Семейные слова и личное повторение">
    {!embedded&&<>{onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/topics">← Все темы</LegacyLessonLink>}
    <h1 ref={heading} tabIndex={-1}>{review?"Моя семья · Повторение":`Моя семья · ${title}`}</h1>
    <nav className={styles.navigation} aria-label="Семейные карточки"><LegacyLessonLink href={familyCardsHref("close")} current={!review&&topic==="close"}>Близкие · 6 слов</LegacyLessonLink><LegacyLessonLink href={familyCardsHref("relatives")} current={!review&&topic==="relatives"}>Родственники · 6 слов</LegacyLessonLink><LegacyLessonLink href={familyCardsHref(topic,true)} current={review}>Повторение карточек семьи</LegacyLessonLink></nav></>}
    {!review&&<WordLearningEntry sources={[topic==="close"?"collection:expansion-family-close":"collection:expansion-family-relatives"]}/>}
    {review?<><p>Только сохранённые семейные карточки, когда наступает срок. Результаты письма и фраз сохраняются отдельно.</p><StudyReview studyItemIds={familyStudyItemIds} embedded/></>:<>
      <p>Выберите нужные слова. Если карточка уже есть, добавится только семейный источник; её расписание повторения сохранится.</p>
      <div className={styles.words}>{words(false)}</div>
      {topic==="close"&&<details><summary>Профессии для семейных фраз · 5 карточек по желанию</summary><p>Знакомые роли из темы «Кто я». Парные формы помогают рассказывать о близких.</p><div className={styles.words}>{words(true)}</div></details>}
      {!embedded&&<LegacyLessonLink href={familyCardsHref(topic,true)}>К повторению сохранённых карточек →</LegacyLessonLink>}
    </>}
  </section></EnsureQueryScope>;
}
