import { AppShell } from "@/features/app-shell/AppShell";
import { LessonEngine } from "@/features/learning/lesson-engine/LessonEngine";
import { parsePresentationMode } from "@/features/learning/presentation-mode";

export default async function LessonPage({ params, searchParams }: {
  params: Promise<{ lessonId: string }>;
  searchParams?: Promise<{ mode?: string | string[] }>;
}) {
  const { lessonId } = await params;
  const mode = parsePresentationMode((await searchParams)?.mode);
  return <AppShell current="learning"><LessonEngine lessonId={decodeURIComponent(lessonId)} initialPresentation={mode} /></AppShell>;
}
