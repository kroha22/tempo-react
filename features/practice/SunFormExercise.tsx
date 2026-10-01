import type { ConjugationVerb, Forms, PersonKey, Tense } from "@/features/conjugation/data";
import { people } from "@/features/conjugation/data";
import type { PracticeMode } from "./practice-types";
import styles from "./SunFormExercise.module.css";

type SunFormExerciseProps = {
  mode: Extract<PracticeMode, "learn" | "practice">;
  tense: Tense;
  verb: ConjugationVerb;
  forms: Forms;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  placedChipKeys: PersonKey[];
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  completed: boolean;
  onPlace: (target: PersonKey, chip: PersonKey | null) => void;
  onSelectChip: (chip: PersonKey | null) => void;
  onRestartPractice: () => void;
};

export function SunFormExercise({
  mode,
  tense,
  verb,
  forms,
  chips,
  placed,
  placedChipKeys,
  selectedChip,
  mistake,
  completed,
  onPlace,
  onSelectChip,
  onRestartPractice,
}: SunFormExerciseProps) {
  return (
    <div className={`sun-form-exercise ${styles.layout} ${mode === "practice" ? styles.withBank : ""}`}>
      <div className={`sun-card ${styles.card}`}>
        <div className={`sun-stage ${styles.stage}`}>
          {people.map((person) => {
            const isVisible = mode === "learn" || Boolean(placed[person.key]);
            return (
              <div className={styles.rayGroup} key={person.key} style={{ "--angle": `${person.angle}deg` } as React.CSSProperties}>
                <span className={styles.ray} />
                <div className={`${styles.personNode} ${mistake === person.key ? styles.shake : ""}`}>
                  <span className={styles.pronoun}>{person.label}</span>
                  {mode === "learn" ? (
                    <span className={`${styles.answer} ${styles.shown}`}>{forms[person.key]}</span>
                  ) : (
                    <button
                      className={`${styles.dropZone} ${isVisible ? styles.filled : ""}`}
                      aria-label={`Форма для ${person.label}`}
                      onClick={() => onPlace(person.key, selectedChip)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onPlace(person.key, event.dataTransfer.getData("text/plain") as PersonKey)}
                    >
                      {isVisible ? forms[person.key] : "…"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className={`sun-core ${styles.sunCore}`}>
            <span className={styles.sunMini}>{tense === "present" ? "presente" : "pretérito"}</span>
            <strong className={verb.infinitive.length >= 9 ? styles.longWord : undefined}>{verb.infinitive}</strong>
            <span>{verb.translation}</span>
          </div>
        </div>
      </div>

      {mode === "practice" && (
        <aside className={styles.wordBank} aria-label="Формы глагола для расстановки">
          <div>
            <span className={styles.bankNumber}>FORMAS</span>
            <h2>Формы</h2>
            <p>Выбери и поставь на лучик.</p>
          </div>
          <div className={styles.chips}>
            {chips.map((key, index) => {
              const used = placedChipKeys.includes(key);
              return (
                <button
                  key={key}
                  draggable={!used}
                  disabled={used}
                  className={`${styles.wordChip} ${selectedChip === key ? styles.selected : ""}`}
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", key)}
                  onClick={() => onSelectChip(selectedChip === key ? null : key)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {forms[key]}
                </button>
              );
            })}
          </div>
          {completed && <div className={styles.successStamp}>✓ Отлично!</div>}
        </aside>
      )}

      <div className={styles.footer}>
        {mode === "learn" ? (
          <p>Все формы уже открыты. Сравни окончания или переходи в режим практики.</p>
        ) : (
          <>
            <p>{completed ? "Perfeito! Все формы на своих местах." : selectedChip ? `Выбрано: ${forms[selectedChip]}. Теперь выбери место.` : "Перетащи форму к местоимению или выбирай кликом."}</p>
            <button className={styles.secondaryButton} onClick={onRestartPractice}>Сначала</button>
          </>
        )}
      </div>
    </div>
  );
}
