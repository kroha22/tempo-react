import type { ConjugationVerb, Forms, PersonKey } from "@/features/conjugation/data";
import styles from "./ActionGuide.module.css";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import type { ActionUse, PracticeMode } from "./practice-types";

type ActionGuideProps = {
  actionUse: ActionUse;
  childMode: boolean;
  kicker: string;
  quizChoice: string | null;
  sunVerb: ConjugationVerb;
  sunForms: Forms;
  sunMode: Extract<PracticeMode, "learn" | "practice">;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  placedChipKeys: PersonKey[];
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  completed: boolean;
  onBack: () => void;
  onChangeActionUse: (use: ActionUse) => void;
  onChooseQuizAnswer: (answer: string) => void;
  onSunModeChange: (mode: Extract<PracticeMode, "learn" | "practice">) => void;
  onPlace: (target: PersonKey, chip: PersonKey | null) => void;
  onSelectChip: (chip: PersonKey | null) => void;
  onRestartPractice: () => void;
};

const examples = [
  ["A Leonor lê antes de dormir.", "Agora está a ler uma mensagem."],
  ["Jogamos no parque aos domingos.", "Hoje estamos a jogar em casa."],
  ["O Rui trabalha numa oficina.", "Neste momento está a trabalhar."],
] as const;

const answers = ["joga", "está a jogar"] as const;

export function ActionGuide({
  actionUse,
  childMode,
  kicker,
  quizChoice,
  sunVerb,
  sunForms,
  sunMode,
  chips,
  placed,
  placedChipKeys,
  selectedChip,
  mistake,
  completed,
  onBack,
  onChangeActionUse,
  onChooseQuizAnswer,
  onSunModeChange,
  onPlace,
  onSelectChip,
  onRestartPractice,
}: ActionGuideProps) {
  const correctAnswer = actionUse === "habit" ? "joga" : "está a jogar";
  const answered = quizChoice !== null;
  const otherUse = actionUse === "habit" ? "now" : "habit";
  const sunTitle = actionUse === "habit" ? "FALAR в настоящем времени" : "ESTAR для действия сейчас";

  return (
    <section className={`${styles.guide} ${styles[actionUse]} ${childMode ? styles.kingdoms : styles.adult}`} aria-labelledby="action-guide-title">
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><span aria-hidden="true">‹</span> {childMode ? "К карте" : "К тренажёру"}</button>
        <div>
          <span className={styles.kicker}>{kicker}</span>
          <h2 id="action-guide-title">Обычно или сейчас?</h2>
        </div>
        <div className={styles.switch} role="group" aria-label="Выбрать обычное действие или действие сейчас">
          <button className={actionUse === "habit" ? styles.active : ""} aria-pressed={actionUse === "habit"} onClick={() => onChangeActionUse("habit")}>Обычно</button>
          <button className={actionUse === "now" ? styles.active : ""} aria-pressed={actionUse === "now"} onClick={() => onChangeActionUse("now")}>Сейчас</button>
        </div>
      </header>

      <div className={styles.lessonBody}>
        <section className={styles.forms} aria-labelledby="action-forms-title">
          <div className={styles.copy}>
            <span>{actionUse === "habit" ? "Presente simples" : "Estar a + infinitivo"}</span>
            <h2 id="action-forms-title">{actionUse === "habit" ? "То, что происходит обычно" : "То, что происходит прямо сейчас"}</h2>
            <p>{actionUse === "habit"
              ? "Берём обычную форму смыслового глагола. Она подходит для привычек, расписания и повторяющихся действий."
              : "Спрягаем ESTAR, добавляем a и оставляем смысловой глагол в инфинитиве."}</p>
            <div className={styles.markers} aria-label="Слова-подсказки">
              {(actionUse === "habit" ? ["normalmente", "todos os dias", "aos sábados"] : ["agora", "neste momento", "hoje"]).map((marker) => <span key={marker}>{marker}</span>)}
            </div>
          </div>
          <div className={styles.formulaBoard} aria-label="Схема выбора формы">
            <article className={actionUse === "habit" ? styles.selectedFormula : ""}>
              <span>обычно</span>
              <strong>falo</strong>
              <p>форма смыслового глагола</p>
            </article>
            <article className={actionUse === "now" ? styles.selectedFormula : ""}>
              <span>сейчас</span>
              <strong>estou a falar</strong>
              <p>ESTAR + a + infinitivo</p>
            </article>
          </div>
        </section>

        <section className={styles.examples} aria-labelledby="action-examples-title">
          <div className={styles.sectionHeading}>
            <span>Сравни смысл</span>
            <h2 id="action-examples-title">Одна ситуация — два взгляда</h2>
          </div>
          <div className={styles.pairs}>
            {examples.map(([habit, now]) => (
              <article key={habit}>
                <p><span>Обычно</span><strong>{habit}</strong></p>
                <p><span>Сейчас</span><strong>{now}</strong></p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.sunLesson} aria-labelledby="action-sun-title">
          <div className={styles.sunIntro}>
            <div>
              <span>Солнечный урок</span>
              <h2 id="action-sun-title">{sunTitle}</h2>
              <p>{actionUse === "habit"
                ? "Для привычного действия собираем формы самого глагола FALAR."
                : "Для действия сейчас сначала собираем формы ESTAR, потом добавляем a falar."}</p>
            </div>
            <div className={styles.sunModeSwitch} role="group" aria-label="Режим солнечного урока">
              <button className={sunMode === "learn" ? styles.active : ""} onClick={() => onSunModeChange("learn")}>Смотреть формы</button>
              <button className={sunMode === "practice" ? styles.active : ""} onClick={() => onSunModeChange("practice")}>Потренировать</button>
            </div>
          </div>
          {actionUse === "now" && (
            <p className={styles.formulaNote}><strong>Формула:</strong> forma de ESTAR + <b>a falar</b>. Например: <span>estou a falar</span>.</p>
          )}
          <SunFormExercise
            mode={sunMode}
            tense="present"
            verb={sunVerb}
            forms={sunForms}
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

        <section className={styles.miniPractice} aria-labelledby="action-practice-title">
          <div>
            <span>Мини-практика</span>
            <h2 id="action-practice-title">{actionUse === "habit" ? "Aos sábados, a Marta ___ ténis." : "Agora a Marta ___ ténis."}</h2>
          </div>
          <div className={styles.answerOptions} role="group" aria-label="Выбрать правильную форму">
            {answers.map((answer) => {
              const correct = answer === correctAnswer;
              return <button
                key={answer}
                disabled={answered}
                className={answered && correct ? styles.correct : answered && quizChoice === answer ? styles.wrong : ""}
                onClick={() => onChooseQuizAnswer(answer)}
              >{answer}</button>;
            })}
          </div>
          <p className={styles.feedback} aria-live="polite">{quizChoice === null
            ? "Выбери форму, которая совпадает со словом-подсказкой."
            : quizChoice === correctAnswer ? "Верно! Слово-подсказка сразу показывает нужный способ." : `Почти. Здесь подходит: ${correctAnswer}.`}</p>
        </section>
      </div>

      <footer className={styles.footer}>
        <button className={styles.other} onClick={() => onChangeActionUse(otherUse)}>Сравнить: {actionUse === "habit" ? "сейчас" : "обычно"}</button>
        <button className={styles.practiceButton} onClick={() => onSunModeChange(sunMode === "learn" ? "practice" : "learn")}>
          {sunMode === "learn" ? "Потренировать здесь" : "Смотреть формы"} <span aria-hidden="true">›</span>
        </button>
      </footer>
    </section>
  );
}
