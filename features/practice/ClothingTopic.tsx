"use client";
import {VocabularyStudy} from "./VocabularyStudy";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {navigationTopic,topicWordsHref} from "../content/topic-navigation";
/** Existing activity owner: ten clothing words, unchanged exercises and progress keys. */
export function ClothingTopic({onBack}:{onBack:()=>void}){
  const topic=navigationTopic("topic:vocabulary-clothing")!;
  return <section aria-label={topic.title}><p className="tempo-kicker">{topic.title}</p><nav aria-label={`Материалы: ${topic.title}`}><LegacyLessonLink href={topicWordsHref(topic.id)}>Учить слова: {topic.title} →</LegacyLessonLink></nav><VocabularyStudy initialTopicId={topic.id} onBackToOrigin={onBack}/></section>;
}
