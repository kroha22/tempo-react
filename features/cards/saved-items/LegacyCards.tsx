"use client";
import {useEffect,useRef} from "react";
import {EnsureCardsQueryScope} from "../query/CardsQueryBoundary";
import {legacyCardGroups,legacyCardsHref} from "../../content/legacy-cards";
import {legacySrsIds} from "../../content/legacy-srs";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {LegacyCardSave} from "./LegacyCardSave";
import {StudyReview} from "../study-review/StudyReview";
import {CardSpeechButton} from "../components/CardSpeechButton";
import styles from "./FamilyCards.module.css";
export function LegacyCards({group:requested,mode,onBack}:{group?:string;mode?:string;onBack?:()=>void}){
  const group=legacyCardGroups.find(group=>group.id===requested)??legacyCardGroups[0],review=mode==="review",heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start",behavior:"instant"});},[group.id,review]);
  return <EnsureCardsQueryScope><section className={styles.panel} aria-label="Слова прежних уроков: карточки и повторение">
    {onBack?<button type="button" onClick={onBack}>← Назад</button>:<LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink>}
    <h1 ref={heading} tabIndex={-1}>{review?"Повторение слов прежних уроков":"Слова прежних уроков"}</h1>
    <nav className={styles.navigation} aria-label="Группы прежних уроков">{legacyCardGroups.map(g=><LegacyLessonLink key={g.id} href={legacyCardsHref(g.id)} current={!review&&g.id===group.id}>{g.title} · {g.words.length}</LegacyLessonLink>)}<LegacyLessonLink href={legacyCardsHref(group.id,true)} current={review}>Повторение 17 целей</LegacyLessonLink></nav>
    <p>Выберите нужные слова. Уже сохранённую карточку можно подключить к повторению без сброса даты и прежних оценок. Просмотр не сохраняет слова и не завершает урок.</p>
    {review?<StudyReview studyItemIds={legacySrsIds} embedded/>:<>{legacyCardGroups.map(g=><div key={g.id} hidden={g.id!==group.id}><h2>{g.title}</h2>{g.id==="intro"&&<p>Пять фраз из объяснения знакомства, включая дополнительные приветствия.</p>}<p><LegacyLessonLink href={g.source.href}>Объяснение: {g.source.title} →</LegacyLessonLink></p><div className={styles.words}>{g.words.map(word=><article key={word.studyItemId}><strong lang="pt-PT">{word.pt}</strong><p>{word.ru}</p><p lang="pt-PT">{word.example.pt}</p><p>{word.example.ru}</p><CardSpeechButton text={word.pt}/><LegacyCardSave studyItemId={word.studyItemId} source={g.source}/></article>)}</div></div>)}<LegacyLessonLink href={legacyCardsHref(group.id,true)}>К повторению сохранённых →</LegacyLessonLink></>}
  </section></EnsureCardsQueryScope>;
}
