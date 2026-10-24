import type { ConjugationVerb, Forms, PersonKey, Tense } from "@/features/conjugation/data";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import styles from "./BeingGuide.module.css";
import type { BeingVerb, PracticeMode } from "./practice-types";
import {SerEstarExplanation} from "./SerEstarExplanation";

type BeingGuideProps = {
  beingVerb: BeingVerb;
  childMode: boolean;
  kicker: string;
  illustrationTitle: string;
  onBack: () => void;
  tense: Tense;
  verb: ConjugationVerb;
  forms: Forms;
  sunMode: Extract<PracticeMode, "learn" | "practice">;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  placedChipKeys: PersonKey[];
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  completed: boolean;
  onChangeBeingVerb: (verb: BeingVerb) => void;
  onSunModeChange: (mode: Extract<PracticeMode, "learn" | "practice">) => void;
  onPlace: (target: PersonKey, chip: PersonKey | null) => void;
  onSelectChip: (chip: PersonKey | null) => void;
  onRestartPractice: () => void;
};


export function BeingGuide({
  beingVerb,
  childMode,
  kicker,
  illustrationTitle,
  onBack,
  tense,
  verb,
  forms,
  sunMode,
  chips,
  placed,
  placedChipKeys,
  selectedChip,
  mistake,
  completed,
  onChangeBeingVerb,
  onSunModeChange,
  onPlace,
  onSelectChip,
  onRestartPractice,
}: BeingGuideProps) {
  const otherVerb = beingVerb === "ser" ? "estar" : "ser";
  const tenseName = tense === "present" ? "настоящем времени" : "прошедшем времени";

  return (
    <section className={`${styles.guide} ${styles[beingVerb]} ${childMode ? styles.kingdoms : styles.adult}`} aria-labelledby="being-guide-title">
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><span aria-hidden="true">‹</span> {childMode ? "К карте" : "К тренажёру"}</button>
        <div>
          <span className={styles.kicker}>{kicker}</span>
          <h2 id="being-guide-title">{beingVerb.toUpperCase()}</h2>
        </div>
        <div className={styles.switch} role="group" aria-label="Выбрать правило ser или estar">
          <button className={beingVerb === "ser" ? styles.active : ""} onClick={() => onChangeBeingVerb("ser")}>SER</button>
          <button className={beingVerb === "estar" ? styles.active : ""} onClick={() => onChangeBeingVerb("estar")}>ESTAR</button>
        </div>
      </header>
      <div className={styles.grid}>
        <div className={`${styles.illustration} ${styles[beingVerb]}`} role="img" aria-label={`${illustrationTitle}: ${beingVerb === "ser" ? "кто или что, происхождение, роль и характеристика" : "текущее состояние, настроение и местоположение"}`}>
          <span>{illustrationTitle}</span>
        </div>
        <SerEstarExplanation childMode={childMode} focus={beingVerb} showForms={false} illustrations={false}/>
      </div>
      <section className={styles.sunLesson} aria-labelledby="being-sun-title">
        <div className={styles.sunIntro}>
          <div>
            <span className={styles.sunKicker}>Солнечный урок</span>
            <h2 id="being-sun-title">{beingVerb.toUpperCase()} в {tenseName}</h2>
            <p>{beingVerb === "ser"
              ? "Сначала видим все формы, затем закрываем лучи и собираем их по местоимениям."
              : "Сначала связываем ESTAR с состоянием и местом, затем сразу тренируем те же формы."}</p>
          </div>
          <div className={styles.sunModeSwitch} role="group" aria-label="Режим солнечного урока">
            <button className={sunMode === "learn" ? styles.active : ""} onClick={() => onSunModeChange("learn")}>Смотреть формы</button>
            <button className={sunMode === "practice" ? styles.active : ""} onClick={() => onSunModeChange("practice")}>Потренировать</button>
          </div>
        </div>
        <SunFormExercise
          mode={sunMode}
          tense={tense}
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
      <footer className={styles.footer}>
        <button className={styles.other} onClick={() => onChangeBeingVerb(otherVerb)}>Сравнить с {otherVerb.toUpperCase()}</button>
        <button className={styles.practice} onClick={() => onSunModeChange(sunMode === "learn" ? "practice" : "learn")}>
          {sunMode === "learn" ? "Потренировать здесь" : "Смотреть формы"} <span aria-hidden="true">›</span>
        </button>
      </footer>
    </section>
  );
}
