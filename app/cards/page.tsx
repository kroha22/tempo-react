import Flashcards from "@/features/cards/components/Flashcards";
import { AppShell } from "@/features/app-shell/AppShell";
import { SavedStudyItemLibrary } from "@/features/cards/saved-items/SavedStudyItemLibrary";
import styles from "./cards-page.module.css";
import { CardsQueryBoundary } from "@/features/cards/query/CardsQueryBoundary";

export default function CardsPage() {
  return (
    <AppShell current="cards">
      <h1 className={styles.title}>Карточки</h1>
      <CardsQueryBoundary>
        <Flashcards />
        <SavedStudyItemLibrary />
      </CardsQueryBoundary>
    </AppShell>
  );
}
