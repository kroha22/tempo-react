import { AppShell } from "@/features/app-shell/AppShell";
import { GrammarCourse } from "@/features/learning/gramatica/GrammarCourse";

export default async function GrammarPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return <AppShell current="learning"><GrammarCourse slug={slug?.join("/")} /></AppShell>;
}
