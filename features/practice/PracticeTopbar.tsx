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
  const navigationSection = section === "trainer" ? "lessons" : section;
  const lessonNumber = section === "cards" ? "02" : section === "vocabulary" ? "35" : section === "lessons" ? "13" : tense === "present" ? "01" : "02";
  const lessonLabel = section === "cards" ? "duas coleções" : section === "vocabulary" ? "temas e jogos" : section === "lessons" ? "gramática prática" : tense === "present" ? "Presente do indicativo" : "Pretérito perfeito";

  return (
    <header className={styles.topbar}>
      <div className={styles.brandCluster}>
        <button className={styles.brand} onClick={() => onSectionChange("lessons")} aria-label="Tempo — уроки португальского">
          <span className={styles.brandMark} aria-hidden="true">t</span>
          <span>TEMPO</span>
        </button>
        <button
          className={`${styles.kidsToggle} ${childMode ? styles.active : ""}`}
          aria-label={childMode ? "Переключить на взрослый режим" : "Переключить на детский режим"}
          aria-pressed={childMode}
          title={childMode ? "Взрослый режим" : "Детский режим"}
          onClick={onToggleChildMode}
        >
          <span aria-hidden="true">{childMode ? "A" : "✦"}</span>
        </button>
      </div>
      <nav className={styles.sectionNav} aria-label="Разделы занятий">
        <button className={navigationSection === "lessons" ? styles.active : ""} onClick={() => onSectionChange("lessons")}>Уроки</button>
        <button className={navigationSection === "vocabulary" ? styles.active : ""} onClick={() => onSectionChange("vocabulary")}>Слова</button>
        <button className={navigationSection === "cards" ? styles.active : ""} onClick={() => onSectionChange("cards")}>Карточки</button>
      </nav>
      <div className={styles.topActions}>
        <div className={styles.lessonLabel}><span>{lessonNumber}</span> {lessonLabel}</div>
      </div>
    </header>
  );
}
