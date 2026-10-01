"use client";

import Link from "next/link";
import { useState } from "react";
import { people, verbs, type PersonKey } from "@/features/conjugation/data";
import { ActionGuide } from "@/features/practice/ActionGuide";
import { AdultRulePanel } from "@/features/practice/AdultRulePanel";
import { BeingGuide } from "@/features/practice/BeingGuide";
import { KingdomMap } from "@/features/practice/KingdomMap";
import { PracticeControls } from "@/features/practice/PracticeControls";
import { QuizExercise } from "@/features/practice/QuizExercise";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import { TerGuide } from "@/features/practice/TerGuide";
import { Button } from "@/shared/ui/Button";
import { ChoiceGroup } from "@/shared/ui/ChoiceGroup";
import { Feedback } from "@/shared/ui/Feedback";
import { catalogStates, type CatalogStateId } from "./catalog-states";
import styles from "./UiCatalog.module.css";

const chips = people.map((person) => person.key);
const noOperation = () => {};
const noPlacement: (target: PersonKey, chip: PersonKey | null) => void = () => {};
const noSelection: (chip: PersonKey | null) => void = () => {};

type UiCatalogProps = {
  state: CatalogStateId | null;
};

function StoryHeader({ state }: { state: CatalogStateId }) {
  const story = catalogStates.find((item) => item.id === state)!;
  return <header className={styles.storyHeader}>
    <div>
      <span>Зафиксированное состояние</span>
      <h2>{story.label}</h2>
      <p>{story.description}</p>
    </div>
    <code>{state}</code>
  </header>;
}

function SharedUiStory() {
  const [choice, setChoice] = useState("hello");
  return <div className={styles.sharedGrid}>
    <section>
      <h3>Button</h3>
      <div className={styles.buttonRow}>
        <Button>Продолжить</Button>
        <Button variant="secondary">Вернуться</Button>
        <Button disabled>Недоступно</Button>
        <Button pending>Сохраняем…</Button>
      </div>
    </section>
    <section>
      <h3>Feedback</h3>
      <Feedback tone="status">Ответ сохранён. Можно продолжать урок.</Feedback>
      <Feedback tone="error" action={{ label: "Повторить", onClick: noOperation }}>Не удалось сохранить ответ. Выбор не потерян.</Feedback>
    </section>
    <section>
      <h3>ChoiceGroup</h3>
      <ChoiceGroup
        label="Как представиться?"
        value={choice}
        onChange={setChoice}
        optionLang="pt-PT"
        options={[
          { value: "hello", label: "Olá, chamo-me Rita." },
          { value: "state", label: "Estou em casa." },
          { value: "locked", label: "Até amanhã.", disabled: true },
        ]}
      />
    </section>
  </div>;
}

function SunStory({ verbKey, practice = false }: { verbKey: "fazer" | "ser" | "falar" | "estar" | "ter"; practice?: boolean }) {
  const verb = verbs[verbKey];
  const placed = practice ? { eu: "eu" as PersonKey } : {};
  return <SunFormExercise
    mode={practice ? "practice" : "learn"}
    tense="present"
    verb={verb}
    forms={verb.forms.present}
    chips={chips}
    placed={placed}
    placedChipKeys={Object.values(placed)}
    selectedChip={practice ? "tu" : null}
    mistake={null}
    completed={false}
    onPlace={noPlacement}
    onSelectChip={noSelection}
    onRestartPractice={noOperation}
  />;
}

function AdultPracticeStory() {
  const verb = verbs.fazer;
  return <div className={styles.practiceStory}>
    <PracticeControls
      childMode={false}
      group="irregular"
      irregularPlaceName="Волшебный замок"
      mode="practice"
      tense="present"
      verb={verb}
      onReturnToChildRules={noOperation}
      onChangeTense={noOperation}
      onChangeGroup={noOperation}
      onOpenBeingGuide={noOperation}
      onOpenActionGuide={noOperation}
      onOpenTerGuide={noOperation}
      onStepVerb={noOperation}
      onModeChange={noOperation}
    />
    <AdultRulePanel group="irregular" tense="present" verb={verb} forms={verb.forms.present} />
    <SunStory verbKey="fazer" practice />
  </div>;
}

function KidsMapStory() {
  return <div className={`${styles.kidsStory} kids-mode kingdom-irregular`}>
    <KingdomMap
      group="irregular"
      worldName="Королевство глаголов"
      worldPrompt="Выбери замок"
      irregularPlaceName="Волшебный замок"
      onChooseKingdom={noOperation}
      onOpenBeingGuide={noOperation}
      onOpenActionGuide={noOperation}
      onOpenTerGuide={noOperation}
    />
  </div>;
}

function BeingStory() {
  const verb = verbs.ser;
  return <BeingGuide
    beingVerb="ser"
    childMode={false}
    kicker="Правила SER и ESTAR"
    illustrationTitle="Идентичность и определение"
    onBack={noOperation}
    tense="present"
    verb={verb}
    forms={verb.forms.present}
    sunMode="learn"
    chips={chips}
    placed={{}}
    placedChipKeys={[]}
    selectedChip={null}
    mistake={null}
    completed={false}
    onChangeBeingVerb={noOperation}
    onSunModeChange={noOperation}
    onPlace={noPlacement}
    onSelectChip={noSelection}
    onRestartPractice={noOperation}
  />;
}

function ActionStory() {
  const verb = verbs.estar;
  return <ActionGuide
    actionUse="now"
    childMode={false}
    kicker="Один урок · два способа говорить о настоящем"
    quizChoice="joga"
    sunVerb={verb}
    sunForms={verb.forms.present}
    sunMode="learn"
    chips={chips}
    placed={{}}
    placedChipKeys={[]}
    selectedChip={null}
    mistake={null}
    completed={false}
    onBack={noOperation}
    onChangeActionUse={noOperation}
    onChooseQuizAnswer={noOperation}
    onSunModeChange={noOperation}
    onPlace={noPlacement}
    onSelectChip={noSelection}
    onRestartPractice={noOperation}
  />;
}

function TerStory() {
  const verb = verbs.ter;
  return <TerGuide
    childMode={false}
    kicker="Неправильный паттерн · TER"
    verb={verb}
    forms={verb.forms.present}
    sunMode="learn"
    chips={chips}
    placed={{}}
    placedChipKeys={[]}
    selectedChip={null}
    mistake={null}
    completed={false}
    onBack={noOperation}
    onSunModeChange={noOperation}
    onPlace={noPlacement}
    onSelectChip={noSelection}
    onRestartPractice={noOperation}
  />;
}

function QuizStory() {
  const verb = verbs.fazer;
  return <div className={styles.quizStory}>
    <QuizExercise
      mode="choose"
      round={0}
      tense="present"
      verb={verb}
      forms={verb.forms.present}
      questionPerson={people[0]}
      correctForm="faço"
      chooseOptions={["faço", "faz", "fazem"]}
      quizSelection="faz"
      quizResult="wrong"
      onAnswer={noOperation}
      onNext={noOperation}
    />
  </div>;
}

function Story({ state }: { state: CatalogStateId }) {
  if (state === "shared-ui") return <SharedUiStory />;
  if (state === "adult-practice") return <AdultPracticeStory />;
  if (state === "kids-map") return <KidsMapStory />;
  if (state === "ser-estar") return <BeingStory />;
  if (state === "action") return <ActionStory />;
  if (state === "ter") return <TerStory />;
  return <QuizStory />;
}

export function UiCatalog({ state }: UiCatalogProps) {
  return <div className={styles.catalog}>
    <header className={styles.intro}>
      <Link href="/learning">← Обучение</Link>
      <span>Tempo UI</span>
      <h1>Лаборатория интерфейса</h1>
      <p>Реальные компоненты приложения в фиксированных состояниях для проверки адаптивности, доступности и визуальных изменений.</p>
    </header>

    <nav className={styles.stateNav} aria-label="Состояния интерфейса">
      <Link href="/ui" aria-current={state === null ? "page" : undefined}>Все состояния</Link>
      {catalogStates.map((item) => <Link key={item.id} href={`/ui?state=${item.id}`} aria-current={state === item.id ? "page" : undefined}>{item.label}</Link>)}
    </nav>

    {state ? <section className={styles.story} data-catalog-state={state}>
      <StoryHeader state={state} />
      <Story state={state} />
    </section> : <section className={styles.index} aria-labelledby="catalog-index-title">
      <div className={styles.indexHeading}>
        <span>7 эталонных состояний</span>
        <h2 id="catalog-index-title">Выбери экран для проверки</h2>
      </div>
      <div className={styles.indexGrid}>
        {catalogStates.map((item, index) => <Link key={item.id} href={`/ui?state=${item.id}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.label}</strong>
          <p>{item.description}</p>
          <b aria-hidden="true">→</b>
        </Link>)}
      </div>
    </section>}
  </div>;
}
