import { VocabularyStudy } from "./VocabularyStudy";
import styles from "./VocabularyHub.module.css";

export function VocabularyHub({ onOpenCards }: { onOpenCards: () => void }) {
  return (
    <main className={styles.shell} aria-label="Слова">
      <header className={styles.header}>
        <div>
          <span>Palavras</span>
          <h1>Слова и выражения</h1>
          <p>Выбирайте тему и способ практики. Полная колода базовых слов находится в разделе карточек.</p>
        </div>
        <button type="button" onClick={onOpenCards}>Перейти к карточкам</button>
      </header>
      <VocabularyStudy onOpenCards={onOpenCards} />
    </main>
  );
}
