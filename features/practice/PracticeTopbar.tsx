import type { Tense } from "@/features/conjugation/data";
import type { PracticeSection } from "./practice-types";
import styles from "./PracticeTopbar.module.css";

type PracticeTopbarProps = {
  planCount?:number;
  onHome?:()=>void;
  home?:boolean;
  profileMode?:boolean;
  section: PracticeSection;
  childMode: boolean;
  tense: Tense;
  onSectionChange: (section: PracticeSection) => void;
  onToggleChildMode: () => void;
};

export function PracticeTopbar({ section, childMode, tense, onSectionChange, onToggleChildMode, planCount,onHome,home,profileMode }: PracticeTopbarProps) {
  const navigationSection = section === "cards" ? "cards" : "lessons";
  const lessonNumber = section === "cards" ? "02" : section === "vocabulary" ? "01" : section === "lessons" ? String(planCount??14) : tense === "present" ? "01" : "02";
  const lessonLabel = section === "cards" ? "coleções e frases" : section === "vocabulary" ? "temas e jogos" : section === "lessons" ? planCount?"занятия по шагам":"gramática prática" : tense === "present" ? "Presente do indicativo" : "Pretérito perfeito";

  return (
    <header className={`${styles.topbar} practice-topbar`}>
      <div className={`${styles.brandCluster} practice-brand-cluster`}>
        <button className={styles.brand} onClick={() => onHome?onHome():onSectionChange("lessons")} aria-label={onHome?"На главную":"Tempo — уроки португальского"}>
          <span className={styles.brandMark} aria-hidden="true">t</span>
          <span>TEMPO</span>
        </button>
        {!profileMode&&<button
          className={`${styles.kidsToggle} ${childMode ? styles.active : ""}`}
          aria-label={childMode ? "Переключить на взрослый режим" : "Переключить на детский режим"}
          aria-pressed={childMode}
          title={childMode ? "Взрослый режим" : "Детский режим"}
          onClick={onToggleChildMode}
        >
          <span aria-hidden="true">{childMode ? "A" : "✦"}</span>
        </button>}
      </div>
      {!home&&<nav className={styles.sectionNav} aria-label="Разделы занятий">
        <button className={navigationSection === "lessons" ? styles.active : ""} onClick={() => onSectionChange("vocabulary")}>Уроки</button>
        <button className={navigationSection === "cards" ? styles.active : ""} onClick={() => onSectionChange("cards")}>Карточки</button>
      </nav>}
      <div className={styles.topActions}>
        <div className={styles.lessonLabel}><span>{lessonNumber}</span> {lessonLabel}</div>
      </div>
    </header>
  );
}
