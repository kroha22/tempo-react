import { AppShell } from "@/features/app-shell/AppShell";
import { LearningHome } from "@/features/app-shell/LearningHome";
import { parsePresentationMode } from "@/features/learning/presentation-mode";

export default async function LearningPage({ searchParams }: { searchParams?: Promise<{ mode?: string | string[] }> }) {
  const mode = parsePresentationMode((await searchParams)?.mode);
  return <AppShell current="learning"><LearningHome mode={mode} /></AppShell>;
}
