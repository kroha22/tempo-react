import Flashcards from "@/features/cards/components/Flashcards";
import { AppShell } from "@/features/app-shell/AppShell";
import { CardsQueryBoundary } from "@/features/cards/query/CardsQueryBoundary";

export default function CardsPage() {
  return (
    <AppShell current="cards">
      <CardsQueryBoundary>
        <Flashcards />
      </CardsQueryBoundary>
    </AppShell>
  );
}
