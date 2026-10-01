import { AppShell } from "@/features/app-shell/AppShell";
import { ErrorReview } from "@/features/learning/components/ErrorReview";

export default function ErrorsPage() {
  return <AppShell current="learning"><ErrorReview /></AppShell>;
}
