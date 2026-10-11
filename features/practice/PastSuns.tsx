"use client";
import { useState } from "react";
import { pastSunLessons, type SunVerb } from "../content/past-sun-lessons";
import { PastSunLesson } from "./PastSunLesson";

export function PastSuns() {
  const [verb, setVerb] = useState<SunVerb>("fazer");
  return <div className="house-activity"><nav className="vocabulary-modes" aria-label="Глагол для солнышка">{pastSunLessons.map(lesson => <button type="button" key={lesson.verb} aria-pressed={verb === lesson.verb} onClick={() => setVerb(lesson.verb)}>{lesson.verb.toUpperCase()}</button>)}</nav>{pastSunLessons.map(lesson => <div key={lesson.verb} hidden={verb !== lesson.verb}><PastSunLesson lesson={lesson} /></div>)}</div>;
}
