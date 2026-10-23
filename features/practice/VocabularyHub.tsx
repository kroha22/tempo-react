import { VocabularyStudy } from "./VocabularyStudy";
import styles from "./VocabularyHub.module.css";

export function VocabularyHub({ onOpenCards }: { onOpenCards: () => void }) {
  return (
    <main className={styles.shell} aria-label="Слова">
      <header className={styles.header}>
        <div>
          <span>Palavras · Слова</span>
          <h1 lang="pt-PT">Palavras e expressões</h1>
          <p>Слова и выражения</p>
          <p>Выбирайте тему и способ практики. Полная колода базовых слов находится в разделе карточек.</p>
        </div>
        <button type="button" onClick={onOpenCards}>Перейти к карточкам</button>
      </header>
      <VocabularyStudy onOpenCards={onOpenCards} />
    </main>
  );
}
