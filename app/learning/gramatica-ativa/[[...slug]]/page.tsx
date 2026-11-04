import { AppShell } from "@/features/app-shell/AppShell";
import { GrammarCourse } from "@/features/learning/gramatica/GrammarCourse";
import {GeneralPlan} from "@/features/learning/plan/GeneralPlan";

export default async function GrammarPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return <AppShell current="learning">{slug?.length?<GrammarCourse slug={slug.join("/")}/>:<GeneralPlan/>}</AppShell>;
}
