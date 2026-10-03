import type { ConjugationVerb, Tense, VerbGroup } from "@/features/conjugation/data";
import { PracticeModeSwitch } from "@/features/practice/PracticeModeSwitch";
import type { PracticeMode } from "./practice-types";
import styles from "./PracticeControls.module.css";

type PracticeControlsProps = {
  childMode: boolean;
  group: VerbGroup;
  irregularPlaceName: string;
  mode: PracticeMode;
  tense: Tense;
  verb: ConjugationVerb;
  onReturnToChildRules: () => void;
  onChangeTense: (tense: Tense) => void;
  onChangeGroup: (group: VerbGroup) => void;
  onOpenBeingGuide: (verb: "ser" | "estar") => void;
  onOpenActionGuide: (use: "habit" | "now") => void;
  onOpenTerGuide: () => void;
  onStepVerb: (direction: -1 | 1) => void;
  onModeChange: (mode: PracticeMode) => void;
};

export function PracticeControls({
  childMode,
  group,
  irregularPlaceName,
  mode,
  tense,
  verb,
  onReturnToChildRules,
  onChangeTense,
  onChangeGroup,
  onOpenBeingGuide,
  onOpenActionGuide,
  onOpenTerGuide,
  onStepVerb,
  onModeChange,
}: PracticeControlsProps) {
  return (
    <>
      {childMode && (
        <div className={styles.childLessonBar}>
          <button onClick={onReturnToChildRules}><span aria-hidden="true">‹</span> Правила</button>
          <span className={styles.chosenKingdom}>
            {group === "ar" ? "Красная группа · -AR" : group === "er" ? "Зелёная группа · -ER" : group === "ir" ? "Синяя группа · -IR" : `${irregularPlaceName} · неправильные глаголы`}
          </span>
        </div>
      )}
      <div className={`${styles.controls} ${childMode ? styles.kids : ""}`}>
        <div className={styles.selectionPanel}>
          <div className={styles.filterRow}>
            <div className={styles.tenseSwitch} role="group" aria-label="Время глагола">
              <button className={tense === "present" ? styles.active : ""} onClick={() => onChangeTense("present")}>Настоящее</button>
              <button className={tense === "past" ? styles.active : ""} onClick={() => onChangeTense("past")}>Прошедшее</button>
            </div>
            <div className={`${styles.groupSwitch} ${childMode ? styles.kidsHidden : ""}`} role="group" aria-label="Группа глаголов">
              <button className={group === "ar" ? styles.active : ""} onClick={() => onChangeGroup("ar")}>-AR</button>
              <button className={group === "er" ? styles.active : ""} onClick={() => onChangeGroup("er")}>-ER</button>
              <button className={group === "ir" ? styles.active : ""} onClick={() => onChangeGroup("ir")}>-IR</button>
              <button className={group === "irregular" ? styles.active : ""} onClick={() => onChangeGroup("irregular")}>Неправильные</button>
            </div>
            {!childMode && (
              <>
                <div className={styles.adultBeingEntry} role="group" aria-label="Правила для ser, estar и ter">
                  <span>Быть / иметь</span>
                  <button onClick={() => onOpenBeingGuide("ser")}>SER</button>
                  <button onClick={() => onOpenBeingGuide("estar")}>ESTAR</button>
                  <button onClick={onOpenTerGuide}>TER</button>
                </div>
                <div className={styles.adultActionEntry} role="group" aria-label="Урок обычно или прямо сейчас">
                  <span>Действие</span>
                  <button onClick={() => onOpenActionGuide("habit")}>Обычно</button>
                  <button onClick={() => onOpenActionGuide("now")}>Сейчас</button>
                </div>
              </>
            )}
          </div>
          <div className={styles.verbControl}>
            <span className={styles.controlLabel}>Глагол</span>
            <div className={styles.verbPicker} aria-label="Выбор глагола" style={{ "--verb-accent": verb.accent } as React.CSSProperties}>
              <button className={`${styles.verbArrow} ${styles.previous}`} onClick={() => onStepVerb(-1)} aria-label="Предыдущий глагол" />
              <div className={styles.verbTag} aria-live="polite">
                <strong>{verb.infinitive}</strong>
                <span>{verb.translation}</span>
              </div>
              <button className={`${styles.verbArrow} ${styles.next}`} onClick={() => onStepVerb(1)} aria-label="Следующий глагол" />
            </div>
          </div>
        </div>

        <PracticeModeSwitch mode={mode} onChange={onModeChange} />
      </div>
    </>
  );
}
