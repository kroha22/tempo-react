"use client";

import { useState } from "react";
import VocabularyLessons from "@/features/vocabulary/VocabularyLessons";
import { VocabularyStudy } from "./VocabularyStudy";
import styles from "./VocabularyHub.module.css";

type VocabularyView = "themes" | "collection";

export function VocabularyHub({ onOpenCards }: { onOpenCards: () => void }) {
  const [view, setView] = useState<VocabularyView>("themes");
  return (
    <main className={styles.shell} aria-label="Слова">
      <header className={styles.header}>
        <div>
          <span>Palavras</span>
          <h1>Слова и выражения</h1>
          <p>Выбирайте тему и способ практики или проходите короткие уроки из подборки 351 слова.</p>
        </div>
        <button type="button" onClick={onOpenCards}>Перейти к карточкам</button>
      </header>
      <nav className={styles.tabs} aria-label="Разделы изучения слов">
        <button type="button" aria-pressed={view === "themes"} onClick={() => setView("themes")}>Темы и игры</button>
        <button type="button" aria-pressed={view === "collection"} onClick={() => setView("collection")}>Подборка 351</button>
      </nav>
      {view === "themes" ? <VocabularyStudy onOpenCards={onOpenCards} /> : <VocabularyLessons embedded />}
    </main>
  );
}
