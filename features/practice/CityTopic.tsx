"use client";
import {VocabularyStudy} from "./VocabularyStudy";
import {LegacyLessonLink} from "./LegacyLessonLink";
import {navigationTopic,topicWordsHref} from "../content/topic-navigation";
import {homeFlowHref} from "../content/home-flow";
/** Existing city sets and scene owners; no new content or progress keys. */
export function CityTopic({onBack}:{onBack:()=>void}){
  const topic=navigationTopic("topic:city")!;
  return <section aria-label={topic.title}><p className="tempo-kicker">{topic.title}</p><nav aria-label={`Материалы: ${topic.title}`}><LegacyLessonLink href={topicWordsHref(topic.id)}>Учить слова: {topic.title} →</LegacyLessonLink><p><LegacyLessonLink href={homeFlowHref("location")}>Дом и расположение · отдельная тема →</LegacyLessonLink></p></nav><VocabularyStudy initialTopicId={topic.id} onBackToOrigin={onBack}/></section>;
}
