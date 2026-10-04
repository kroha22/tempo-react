import { useRef, useState } from "react";
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
const slideLabels = ["Смысл", "Примеры", "Формы", "Проверка"] as const;

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
  const [slide, setSlide] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function showSlide(nextSlide: number) {
    setSlide(Math.max(0, Math.min(slideLabels.length - 1, nextSlide)));
  }

  function finishSwipe(x: number, y: number) {
    if (!touchStart.current) return;
    const deltaX = x - touchStart.current.x;
    const deltaY = y - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    showSlide(slide + (deltaX < 0 ? 1 : -1));
  }

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

      <nav className={styles.progress} aria-label="Шаги урока IR">
        {slideLabels.map((label, index) => <button
          key={label}
          aria-current={slide === index ? "step" : undefined}
          aria-label={`Шаг ${index + 1}: ${label}`}
          onClick={() => showSlide(index)}
        ><span>{index + 1}</span><b>{label}</b></button>)}
      </nav>

      <div
        className={styles.viewport}
        role="region"
        aria-label={`Шаг ${slide + 1} из ${slideLabels.length}: ${slideLabels[slide]}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") showSlide(slide - 1);
          if (event.key === "ArrowRight") showSlide(slide + 1);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          if (touch) finishSwipe(touch.clientX, touch.clientY);
        }}
      >
        <div className={styles.track} style={{ transform: `translateX(-${slide * 100}%)` }}>
        <section className={`${styles.slide} ${styles.meanings}`} aria-labelledby="ir-meanings-title" aria-hidden={slide !== 0}>
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

        <section className={`${styles.slide} ${styles.examples}`} aria-labelledby="ir-examples-title" aria-hidden={slide !== 1}>
          <div><span>Сравни конструкцию</span><h2 id="ir-examples-title">Одна форма IR — два продолжения</h2></div>
          <div className={styles.exampleGrid}>
            {examples.map(([movement, plan]) => <article key={movement}>
              <p><span>место</span><strong lang="pt-PT">{movement}</strong></p>
              <p><span>действие</span><strong lang="pt-PT">{plan}</strong></p>
            </article>)}
          </div>
          <p className={styles.markerNote}><strong>Маркеры плана:</strong> amanhã · logo · no fim de semana · na próxima semana</p>
        </section>

        <section className={`${styles.slide} ${styles.sunLesson}`} aria-labelledby="ir-sun-title" aria-hidden={slide !== 2}>
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

        <section className={`${styles.slide} ${styles.miniPractice}`} aria-labelledby="ir-practice-title" aria-hidden={slide !== 3}>
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
      </div>

      <footer className={styles.footer}>
        <button className={styles.previous} onClick={() => showSlide(slide - 1)} disabled={slide === 0}>← Назад</button>
        <p><strong>{slide + 1} из {slideLabels.length}</strong><span>Листай экран влево или вправо</span></p>
        {slide < slideLabels.length - 1
          ? <button onClick={() => showSlide(slide + 1)}>Дальше →</button>
          : <button onClick={() => showSlide(0)}>Пройти ещё раз</button>}
      </footer>
    </section>
  );
}
