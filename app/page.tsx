import { AppShell } from "@/features/app-shell/AppShell";
import { LearningHome } from "@/features/app-shell/LearningHome";

export default function Home() {
  return <AppShell current="learning"><LearningHome /></AppShell>;
}
