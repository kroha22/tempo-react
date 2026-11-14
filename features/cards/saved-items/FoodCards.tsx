"use client";
import {useEffect,useRef} from "react";
import {foodCardSources,foodProductWords,foodPreferenceWordIds,foodPreferenceCard,foodPreferenceSource,foodStudyItemIds,foodCardsHref,type FoodCardTopic} from "../../content/food-cards";
import {EnsureQueryScope} from "../../../shared/query/SessionQueryBoundary";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {StudyItemCardSave} from "./ReadingCardSave";
import {StudyReview} from "../study-review/StudyReview";
import {CardSpeechButton} from "../components/CardSpeechButton";
import styles from "./FamilyCards.module.css";

const titles={fruit:"Фрукты",meals:"Продукты и напитки",preferences:"Предпочтения"};
export function FoodCards({topic:requestedTopic,mode,onBack,embedded=false}:{topic?:string;mode?:string;onBack?:()=>void;embedded?:boolean}){
  const topic:FoodCardTopic=requestedTopic==="meals"||requestedTopic==="preferences"?requestedTopic:"fruit",review=mode==="review";
  const heading=useRef<HTMLHeadingElement>(null);
  const source=topic==="preferences"?foodPreferenceSource:foodCardSources.find(source=>source.id===`lesson:food:${topic}`)!;
  const words=topic==="preferences"?foodPreferenceWordIds.map(id=>foodProductWords.find(word=>word.wordId===id)!):foodProductWords.filter(word=>word.topic===topic);
  useEffect(()=>{if(!embedded){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});}},[topic,review,embedded]);
  return <EnsureQueryScope><section className={styles.panel} aria-label="Еда: личные карточки и повторение">
    {!embedded&&<>{onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/topics">← Все темы</LegacyLessonLink>}
    <h1 ref={heading} tabIndex={-1}>{review?"Еда · Повторение":`Еда · ${titles[topic]}`}</h1>
    <nav className={styles.navigation} aria-label="Карточки еды">{(["fruit","meals","preferences"] as const).map(id=><LegacyLessonLink key={id} href={foodCardsHref(id)} current={!review&&topic===id}>{titles[id]}{id==="fruit"?" · 6 слов":id==="meals"?" · 8 слов":""}</LegacyLessonLink>)}<LegacyLessonLink href={foodCardsHref(topic,true)} current={review}>Повторение еды</LegacyLessonLink></nav></>}
    {review?<><p>Только сохранённые продукты и gostar de, когда наступает срок. Письмо и задания сохраняют самостоятельные результаты.</p><StudyReview studyItemIds={foodStudyItemIds} embedded/></>:<>
      <p>Добавьте нужные слова. Повторное добавление сохраняет ту же карточку и дополняет её источники без сброса расписания.</p>
      {topic==="preferences"&&<><p>Шесть знакомых продуктов во фразах. В словаре есть артикль: o queijo; в общем предпочтении: gosto de queijo.</p><LegacyLessonLink href="/learning/everyday/likes">GOSTAR DE: объяснение и задания →</LegacyLessonLink></>}
      <div className={styles.words}>{words.map(word=><article key={word.studyItemId}>
        <strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p><p lang="pt-PT">{word.example.pt}</p><p>{word.example.ru}</p>{word.usageNote&&<p>{word.usageNote}</p>}
        <CardSpeechButton text={word.pt}/><StudyItemCardSave choice={word} source={source}/>
      </article>)}{topic==="preferences"&&<article><strong lang="pt-PT">{foodPreferenceCard.pt}</strong><p>{foodPreferenceCard.ru}</p><p>Та же карточка общего словаря с привязкой к уроку U49.</p><CardSpeechButton text={foodPreferenceCard.pt}/><StudyItemCardSave choice={foodPreferenceCard} source={foodPreferenceSource}/></article>}</div>
      {!embedded&&<LegacyLessonLink href={foodCardsHref(topic,true)}>К повторению сохранённых карточек →</LegacyLessonLink>}
    </>}
  </section></EnsureQueryScope>;
}
