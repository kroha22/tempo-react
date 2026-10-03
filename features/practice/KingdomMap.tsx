import type { VerbGroup } from "@/features/conjugation/data";
import styles from "./KingdomMap.module.css";

type KingdomMapProps = {
  group: VerbGroup;
  worldName: string;
  worldPrompt: string;
  irregularPlaceName: string;
  onChooseKingdom: (group: VerbGroup) => void;
  onOpenBeingGuide: (verb: "ser" | "estar") => void;
  onOpenActionGuide: (use: "habit" | "now") => void;
  onOpenTerGuide: () => void;
};

export function KingdomMap({ group, worldName, worldPrompt, irregularPlaceName, onChooseKingdom, onOpenBeingGuide, onOpenActionGuide, onOpenTerGuide }: KingdomMapProps) {
  return (
    <div className={styles.kingdomMap} role="group" aria-label="Группы глаголов">
      <div className={styles.title}>
        <span aria-hidden="true">✦</span>
        <strong>{worldName}</strong>
        <small>{worldPrompt}</small>
      </div>
      <button className={`${styles.kingdomButton} ${styles.ar} ${group === "ar" ? styles.active : ""}`} onClick={() => onChooseKingdom("ar")}>
        <strong>-AR</strong><span>Красная группа</span>
      </button>
      <button className={`${styles.kingdomButton} ${styles.er} ${group === "er" ? styles.active : ""}`} onClick={() => onChooseKingdom("er")}>
        <strong>-ER</strong><span>Зелёная группа</span>
      </button>
      <button className={`${styles.kingdomButton} ${styles.ir} ${group === "ir" ? styles.active : ""}`} onClick={() => onChooseKingdom("ir")}>
        <strong>-IR</strong><span>Синяя группа</span>
      </button>
      <button
        className={`${styles.magicKingdom} ${group === "irregular" ? styles.active : ""}`}
        aria-label={`${irregularPlaceName} — неправильные глаголы`}
        onClick={() => onChooseKingdom("irregular")}
      >
        <span className={styles.magicKingdomIcon} aria-hidden="true">✦</span>
        <span className={styles.magicKingdomCopy}>
          <strong>{irregularPlaceName}</strong>
          <small>Неправильные глаголы</small>
        </span>
      </button>
      <div className={styles.beingGateway} role="group" aria-label="Отдельные неправильные правила">
        <button className={styles.ser} onClick={() => onOpenBeingGuide("ser")}><strong>SER</strong><span>кто? что?</span></button>
        <button className={styles.estar} onClick={() => onOpenBeingGuide("estar")}><strong>ESTAR</strong><span>как? где?</span></button>
        <button className={styles.ter} onClick={onOpenTerGuide}><strong>TER</strong><span>иметь</span></button>
      </div>
      <div className={styles.actionGateway} role="group" aria-label="Урок обычно или прямо сейчас">
        <button className={styles.habit} onClick={() => onOpenActionGuide("habit")}><strong>Обычно</strong><span>falo</span></button>
        <button className={styles.now} onClick={() => onOpenActionGuide("now")}><strong>Сейчас</strong><span>estou a falar</span></button>
      </div>
    </div>
  );
}
