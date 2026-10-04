import { SunFormExercise } from "@/features/practice/SunFormExercise";
import type { ConjugationVerb, Forms, PersonKey } from "@/features/conjugation/data";
import type { PracticeMode } from "./practice-types";
import styles from "./IrGuide.module.css";

type IrGuideProps = {
  childMode: boolean;
  verb: ConjugationVerb;
  forms: Forms;
  sunMode: Extract<PracticeMode, "learn" | "practice">;
  quizChoice: string | null;
  chips: PersonKey[];
  placed: Partial<Record<PersonKey, PersonKey>>;
  placedChipKeys: PersonKey[];
  selectedChip: PersonKey | null;
  mistake: PersonKey | null;
  completed: boolean;
  onBack: () => void;
  onSunModeChange: (mode: Extract<PracticeMode, "learn" | "practice">) => void;
  onChooseQuizAnswer: (choice: string) => void;
  onPlace: (target: PersonKey, chip: PersonKey | null) => void;
  onSelectChip: (chip: PersonKey | null) => void;
  onRestartPractice: () => void;
};

const examples = [
  ["Vou ao mercado.", "Vou comprar pão."],
  ["Vamos para o Porto.", "Vamos visitar o Porto."],
] as const;

const answers = ["vamos", "vão", "estamos a"] as const;

export function IrGuide({
  childMode,
  verb,
  forms,
  sunMode,
  quizChoice,
  chips,
  placed,
  placedChipKeys,
  selectedChip,
  mistake,
  completed,
  onBack,
  onSunModeChange,
  onChooseQuizAnswer,
  onPlace,
  onSelectChip,
  onRestartPractice,
}: IrGuideProps) {
  const correctAnswer = "vamos";
  const answered = quizChoice !== null;

  return (
    <section className={`${styles.guide} ${childMode ? styles.child : styles.adult}`} aria-labelledby="ir-guide-title">
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}><span aria-hidden="true">‹</span> {childMode ? "К урокам" : "К тренажёру"}</button>
        <div>
          <span className={styles.kicker}>Основной глагол · движение и планы</span>
          <h2 id="ir-guide-title">IR</h2>
          <p>идти · ехать · собираться что-то сделать</p>
        </div>
        <div className={styles.badge} aria-label="Глагол с особыми формами"><span aria-hidden="true">→</span><strong>vou</strong></div>
      </header>

      <div className={styles.content}>
        <section className={styles.meanings} aria-labelledby="ir-meanings-title">
          <div className={styles.copy}>
            <span>Два полезных шаблона</span>
            <h2 id="ir-meanings-title">Куда идём и что будем делать</h2>
            <p>Когда после формы IR стоит место, речь идёт о движении. Когда следом идёт другой глагол в инфинитиве, мы говорим о плане.</p>
          </div>
          <div className={styles.patterns}>
            <article>
              <span>движение</span>
              <strong>IR + a / para + lugar</strong>
              <p><b>Vou ao mercado.</b> — Я иду на рынок.</p>
            </article>
            <article>
              <span>план</span>
              <strong>IR + infinitivo</strong>
              <p><b>Vou comprar pão.</b> — Я собираюсь купить хлеб.</p>
            </article>
          </div>
        </section>

        <section className={styles.examples} aria-labelledby="ir-examples-title">
          <div><span>Сравни конструкцию</span><h2 id="ir-examples-title">Одна форма IR — два продолжения</h2></div>
          <div className={styles.exampleGrid}>
            {examples.map(([movement, plan]) => <article key={movement}>
              <p><span>место</span><strong lang="pt-PT">{movement}</strong></p>
              <p><span>действие</span><strong lang="pt-PT">{plan}</strong></p>
            </article>)}
          </div>
          <p className={styles.markerNote}><strong>Маркеры плана:</strong> amanhã · logo · no fim de semana · na próxima semana</p>
        </section>

        <section className={styles.sunLesson} aria-labelledby="ir-sun-title">
          <div className={styles.sunIntro}>
            <div>
              <span>Солнечный урок</span>
              <h2 id="ir-sun-title">IR в настоящем времени</h2>
              <p>Для будущего плана меняется только IR: <b>vou, vais, vai, vamos, vão</b>. Второй глагол остаётся в инфинитиве.</p>
            </div>
            <div className={styles.sunModeSwitch} role="group" aria-label="Режим солнечного урока">
              <button className={sunMode === "learn" ? styles.active : ""} onClick={() => onSunModeChange("learn")}>Смотреть формы</button>
              <button className={sunMode === "practice" ? styles.active : ""} onClick={() => onSunModeChange("practice")}>Расставить формы</button>
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

        <section className={styles.miniPractice} aria-labelledby="ir-practice-title">
          <div><span>Мини-практика · планы</span><h2 id="ir-practice-title">Amanhã nós ___ estudar português.</h2></div>
          <div className={styles.answers} role="group" aria-label="Выбрать форму для плана">
            {answers.map(answer => {
              const correct = answer === correctAnswer;
              return <button
                key={answer}
                disabled={answered}
                className={answered && correct ? styles.correct : answered && quizChoice === answer ? styles.wrong : ""}
                onClick={() => onChooseQuizAnswer(answer)}
              >{answer}</button>;
            })}
          </div>
          <p aria-live="polite">{quizChoice === null
            ? "Подсказка: amanhã указывает на план, а nós требует форму IR для «мы»."
            : quizChoice === correctAnswer
              ? "Верно: Amanhã nós vamos estudar português."
              : "Здесь подходит vamos: форма IR для nós + estudar в инфинитиве."}</p>
        </section>
      </div>

      <footer className={styles.footer}>
        <p><strong>Дальше:</strong> этот же шаблон будет связан с уроками PODER, QUERER и TER DE.</p>
        <button onClick={() => onSunModeChange(sunMode === "learn" ? "practice" : "learn")}>{sunMode === "learn" ? "Расставить формы" : "Смотреть формы"}</button>
      </footer>
    </section>
  );
}
