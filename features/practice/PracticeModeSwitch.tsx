import type { PracticeMode } from "./practice-types";
import styles from "./PracticeModeSwitch.module.css";

const modes: Array<{ value: PracticeMode; number: string; label: string }> = [
  { value: "learn", number: "01", label: "Изучать" },
  { value: "practice", number: "02", label: "Практика" },
  { value: "choose", number: "03", label: "Выбери" },
  { value: "reverse", number: "04", label: "Наоборот" },
];

type PracticeModeSwitchProps = {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
};

export function PracticeModeSwitch({ mode, onChange }: PracticeModeSwitchProps) {
  return (
    <div className={styles.modeSwitch} role="group" aria-label="Режим занятия">
      {modes.map((item) => (
        <button key={item.value} className={mode === item.value ? styles.active : ""} onClick={() => onChange(item.value)}>
          <span>{item.number}</span> {item.label}
        </button>
      ))}
    </div>
  );
}
