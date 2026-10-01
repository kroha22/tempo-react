import type { ConjugationVerb, Forms, PersonKey } from "@/features/conjugation/data";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import type { PracticeMode } from "./practice-types";
import styles from "./TerGuide.module.css";

type TerGuideProps = {
  childMode: boolean;
  kicker: string;
  verb: ConjugationVerb;
  forms: Forms;
  sunMode: Extract<PracticeMode, "learn" | "practice">;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  placedChipKeys: PersonKey[];
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  completed: boolean;
  onBack: () => void;
  onSunModeChange: (mode: Extract<PracticeMode, "learn" | "practice">) => void;
  onPlace: (target: PersonKey, chip: PersonKey | null) => void;
  onSelectChip: (chip: PersonKey | null) => void;
  onRestartPractice: () => void;
};

const terPatterns = [
  ["🎒", "Что есть", "Tenho uma chave."],
  ["🎂", "Возраст", "A Rita tem nove anos."],
  ["☕", "Состояния", "Temos fome. / Tenho sono."],
] as const;

const contrastPairs = [
  ["eu", "tenho", "у меня есть / мне"],
  ["ele / ela", "tem", "у него / у неё есть"],
  ["eles / elas", "têm", "у них есть"],
] as const;

export function TerGuide({
  childMode,
  kicker,
  verb,
  forms,
  sunMode,
  chips,
  placed,
  placedChipKeys,
  selectedChip,
  mistake,
  completed,
  onBack,
  onSunModeChange,
  onPlace,
  onSelectChip,
  onRestartPractice,
}: TerGuideProps) {
  return (
    <section className={`${styles.guide} ${childMode ? styles.kingdoms : styles.adult}`} aria-labelledby="ter-guide-title">
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><span aria-hidden="true">‹</span> {childMode ? "К карте" : "К тренажёру"}</button>
        <div>
          <span className={styles.kicker}>{kicker}</span>
          <h2 id="ter-guide-title">TER</h2>
        </div>
        <div className={styles.badge} aria-label="Тип неправильного урока">
          <span>★</span>
          <strong>иметь</strong>
        </div>
      </header>

      <div className={styles.heroGrid}>
        <div className={styles.illustration} role="img" aria-label="Комната с предметами, возрастом и подсказками состояния">
          <span>У кого что есть?</span>
        </div>
        <div className={styles.explanation}>
          <span className={styles.question}>Что у кого есть?</span>
          <h2>TER связывает владельца и то, что у него есть</h2>
          <p>С TER говорим о вещах, возрасте и частых состояниях. Возраст по-португальски тоже строится через TER, а не через SER.</p>
          <div className={styles.patternList}>
            {terPatterns.map(([icon, label, example]) => (
              <div key={label}><span aria-hidden="true">{icon}</span><p><strong>{label}</strong><b>{example}</b></p></div>
            ))}
          </div>
          <aside className={styles.memoryTip}>
            <strong>Главная подсказка</strong>
            <p>Запомни форму целиком: <b>tenho</b>, <b>tens</b>, <b>tem</b>, <b>temos</b>, <b>têm</b>. У множественного числа есть знак: <b>têm</b>.</p>
          </aside>
        </div>
      </div>

      <section className={styles.contrast} aria-labelledby="ter-pattern-title">
        <div>
          <span>Паттерны TER</span>
          <h2 id="ter-pattern-title">Одна форма — разные полезные смыслы</h2>
        </div>
        <div className={styles.contrastCards}>
          {contrastPairs.map(([subject, form, meaning]) => (
            <article key={subject}>
              <span>{subject}</span>
              <strong>{form}</strong>
              <p>{meaning}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sunLesson} aria-labelledby="ter-sun-title">
        <div className={styles.sunIntro}>
          <div>
            <span>Солнечный урок</span>
            <h2 id="ter-sun-title">TER в настоящем времени</h2>
            <p>Сначала видим все формы, затем закрываем лучи и собираем их по местоимениям.</p>
          </div>
          <div className={styles.sunModeSwitch} role="group" aria-label="Режим солнечного урока">
            <button className={sunMode === "learn" ? styles.active : ""} onClick={() => onSunModeChange("learn")}>Смотреть формы</button>
            <button className={sunMode === "practice" ? styles.active : ""} onClick={() => onSunModeChange("practice")}>Потренировать</button>
          </div>
        </div>
        <SunFormExercise
          mode={sunMode}
          tense="present"
          verb={verb}
          forms={forms}
          chips={chips}
          placed={placed}
          placedChipKeys={placedChipKeys}
          selectedChip={selectedChip}
          mistake={mistake}
          completed={completed}
          onPlace={onPlace}
          onSelectChip={onSelectChip}
          onRestartPractice={onRestartPractice}
        />
      </section>

      <section className={styles.miniPractice} aria-labelledby="ter-mini-title">
        <div>
          <span>Мини-практика</span>
          <h2 id="ter-mini-title">Eles ___ uma chave.</h2>
        </div>
        <p><strong>Подсказка:</strong> <code>eles / elas</code> требует форму с диакритикой: <b>têm</b>.</p>
      </section>

      <footer className={styles.footer}>
        <button className={styles.practiceButton} onClick={() => onSunModeChange(sunMode === "learn" ? "practice" : "learn")}>
          {sunMode === "learn" ? "Потренировать здесь" : "Смотреть формы"} <span aria-hidden="true">›</span>
        </button>
      </footer>
    </section>
  );
}
