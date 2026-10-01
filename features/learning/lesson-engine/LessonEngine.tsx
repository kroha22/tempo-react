"use client";

import Link from "next/link";
import { EnsureQueryScope } from "@/shared/query/SessionQueryBoundary";
import { firstVerticalSliceContentPack } from "@/features/content/manifest";
import { routeLessonExperiences } from "@/features/content/first-vertical-slice/route-extension";
import type { PresentationMode } from "@/features/learning/presentation-mode";
import { useLessonSession } from "./use-lesson-session";
import { LessonView } from "./LessonView";

export function LessonEngine({ lessonId, initialPresentation = "adult" }: { lessonId: string; initialPresentation?: PresentationMode }) {
  const experience = routeLessonExperiences.find((item) => item.id === lessonId);
  const lesson = firstVerticalSliceContentPack.lessons.find((item) => item.id === lessonId);
  const flow = firstVerticalSliceContentPack.flows.find((item) => item.id === lesson?.flowId);
  if (!experience || !lesson || !flow) return <section className="lesson-missing"><h1>Урок не найден</h1><Link href="/learning/route">Вернуться к маршруту</Link></section>;
  const requiredItemIds = lesson.completionRule.requiredExerciseUseIds.flatMap((id) => {
    const use = firstVerticalSliceContentPack.exerciseUses.find((item) => item.id === id);
    return use ? [use.exerciseItemId] : [];
  });
  const cardLabels = experience.saveItemIds.flatMap((id) => {
    const display = firstVerticalSliceContentPack.studyItems.find((item) => item.id === id)?.display;
    if (!display) return [];
    return [{ id, label: display.type === "noun" ? `${display.definiteArticle} ${display.lemma} — ${display.pluralDefiniteArticle} ${display.plural}` : display.type === "verb" ? display.infinitive : display.text }];
  });
  return <EnsureQueryScope key={lessonId}><LessonSession key={lessonId} experience={experience} requiredItemIds={requiredItemIds} flowRevision={flow.contentRevision} cardLabels={cardLabels} initialPresentation={initialPresentation} /></EnsureQueryScope>;
}

function LessonSession({ experience, requiredItemIds, flowRevision, cardLabels, initialPresentation }: {
  experience: (typeof routeLessonExperiences)[number]; requiredItemIds: string[]; flowRevision: number; cardLabels: { id: string; label: string }[]; initialPresentation?: PresentationMode;
}) {
  const session = useLessonSession(experience, requiredItemIds, flowRevision);
  return <LessonView experience={experience} cardLabels={cardLabels} session={session} initialPresentation={initialPresentation} />;
}
