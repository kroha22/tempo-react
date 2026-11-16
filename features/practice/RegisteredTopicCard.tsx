"use client";
import type {NavigationTopic} from "../content/topic-navigation";
import {topicWordsHref} from "../content/topic-navigation";
import {preparationUnits} from "../content/test-preparation";
import {schoolLessonHref} from "../learning/plan/school-plan";
import {LegacyLessonLink} from "./LegacyLessonLink";
export function RegisteredTopicCard({topic,className,onOpenLegacy}:{topic:NavigationTopic;className?:string;onOpenLegacy:(id:string)=>void}){
  return <section aria-label={`Тема: ${topic.title}`}>
    <LegacyLessonLink className={className} href={topic.href}><strong>{topic.title}</strong><span>{topic.description}</span><small>Объяснение → слова → задания → повторение</small></LegacyLessonLink>
    <details><summary>Материалы темы</summary><p><LegacyLessonLink href={topicWordsHref(topic.id)}>Учить слова: {topic.title} →</LegacyLessonLink></p>
      {topic.schoolUnitIds.map(id=><p key={id}><LegacyLessonLink href={schoolLessonHref(id)}>{preparationUnits.find(unit=>unit.id===id)!.title[1]} →</LegacyLessonLink></p>)}
      {topic.legacyEntries.map(entry=><p key={entry.id}><button type="button" data-topic-id={entry.id} onClick={()=>onOpenLegacy(entry.id)}>{entry.title}</button></p>)}
    </details>
  </section>;
}
