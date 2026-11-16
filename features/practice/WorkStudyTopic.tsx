"use client";
import {VocabularyStudy} from "./VocabularyStudy";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {navigationTopic,topicWordsHref} from "../content/topic-navigation";
/** Existing work activity owner; study packs remain separate source sets. */
export function WorkStudyTopic({onBack}:{onBack:()=>void}){
  const topic=navigationTopic("topic:work")!;
  return <section aria-label={topic.title}><p className="tempo-kicker">{topic.title}</p><nav aria-label={`Материалы: ${topic.title}`}><LegacyLessonLink href={topicWordsHref(topic.id)}>Учить слова: {topic.title} →</LegacyLessonLink></nav><VocabularyStudy initialTopicId={topic.id} onBackToOrigin={onBack}/></section>;
}
