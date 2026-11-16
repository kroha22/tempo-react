"use client";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import {schoolPlanGroups,schoolLessonHref} from "./school-plan";
import styles from "./GeneralPlan.module.css";
import {navigationTopics,topicWordsHref} from "../../content/topic-navigation";
import {useProfileLearning} from "../../practice/profile-learning";
export function PlanWords(){const child=useProfileLearning()?.profile.child??false;return <section className={styles.plan} aria-label="Слова и повторение"><LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink><h1 tabIndex={-1}>Слова и повторение</h1>
  <nav className={styles.links} aria-label="Работа со словами"><LegacyLessonLink href="/learning/quick-words">Учить слова →</LegacyLessonLink><LegacyLessonLink href="/learning/gramatica-ativa/review">Повторить сохранённые →</LegacyLessonLink><LegacyLessonLink href="/learning/gramatica-ativa/saved">Мои карточки из уроков →</LegacyLessonLink></nav>
  {!child&&<nav className={styles.links} aria-label="Слова по темам">{navigationTopics.map(topic=><LegacyLessonLink key={topic.id} href={topicWordsHref(topic.id)}>{topic.title} →</LegacyLessonLink>)}</nav>}
  <details className={styles.section}><summary><strong>Слова из школьных уроков</strong><span>20 подборок</span></summary><div className={styles.content}>{schoolPlanGroups.map(group=><details className={styles.block} key={group.title}><summary><strong>{group.title}</strong></summary><nav className={styles.links} aria-label={`Слова: ${group.title}`}>{group.units.map(unit=><LegacyLessonLink key={unit.id} href={schoolLessonHref(unit.id,true)}>{unit.title[1]} →</LegacyLessonLink>)}</nav></details>)}</div></details>
  <details className={styles.section}><summary><strong>Другие словари и колоды</strong></summary><nav className={`${styles.content} ${styles.links}`}><LegacyLessonLink href="/learning/legacy-cards?group=intro">Слова прежних уроков · подключить повторение →</LegacyLessonLink><LegacyLessonLink href="/learning/gramatica-ativa/vocabulary">Словарь книги · 54 темы →</LegacyLessonLink><LegacyLessonLink href="/cards">Колоды карточек →</LegacyLessonLink></nav></details>
</section>;}
