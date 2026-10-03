import type { Tense } from "@/features/conjugation/data";
import type { PracticeSection } from "./practice-types";
import styles from "./PracticeTopbar.module.css";

type PracticeTopbarProps = {
  section: PracticeSection;
  childMode: boolean;
  tense: Tense;
  onSectionChange: (section: PracticeSection) => void;
  onToggleChildMode: () => void;
};

export function PracticeTopbar({ section, childMode, tense, onSectionChange, onToggleChildMode }: PracticeTopbarProps) {
  const lessonNumber = section === "cards" ? "02" : section === "vocabulary" ? "35" : section === "lessons" ? "13" : tense === "present" ? "01" : "02";
  const lessonLabel = section === "cards" ? "duas coleções" : section === "vocabulary" ? "temas e jogos" : section === "lessons" ? "gramática prática" : tense === "present" ? "Presente do indicativo" : "Pretérito perfeito";

  return (
    <header className={styles.topbar}>
      <button className={styles.brand} onClick={() => onSectionChange("trainer")} aria-label="Tempo — тренажёр португальского">
        <span className={styles.brandMark} aria-hidden="true">t</span>
        <span>TEMPO</span>
      </button>
      <nav className={styles.sectionNav} aria-label="Разделы занятий">
        <button className={section === "trainer" ? styles.active : ""} onClick={() => onSectionChange("trainer")}>Спряжение</button>
        <button className={section === "lessons" ? styles.active : ""} onClick={() => onSectionChange("lessons")}>Уроки</button>
        <button className={section === "vocabulary" ? styles.active : ""} onClick={() => onSectionChange("vocabulary")}>Слова</button>
        <button className={section === "cards" ? styles.active : ""} onClick={() => onSectionChange("cards")}>Карточки</button>
      </nav>
      <div className={styles.topActions}>
        {section === "trainer" && <button className={`${styles.kidsToggle} ${childMode ? styles.active : ""}`} aria-pressed={childMode} onClick={onToggleChildMode}>
          <span aria-hidden="true">✦</span> {childMode ? "Взрослый" : "Для детей"}
        </button>}
        <div className={styles.lessonLabel}><span>{lessonNumber}</span> {lessonLabel}</div>
      </div>
    </header>
  );
}
