"use client";

import { useMemo, useReducer } from "react";
import Flashcards from "@/features/cards/components/Flashcards";
import AdultLessons from "@/features/practice/AdultLessons";
import { ActionGuide } from "@/features/practice/ActionGuide";
import { AdultRulePanel } from "@/features/practice/AdultRulePanel";
import { BeingGuide } from "@/features/practice/BeingGuide";
import { KingdomMap } from "@/features/practice/KingdomMap";
import { PracticeControls } from "@/features/practice/PracticeControls";
import { PracticeTopbar } from "@/features/practice/PracticeTopbar";
import { QuizExercise } from "@/features/practice/QuizExercise";
import { RulesDeck } from "@/features/practice/RulesDeck";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import { TerGuide } from "@/features/practice/TerGuide";
import { VocabularyHub } from "@/features/practice/VocabularyHub";

import { people, verbs, type PersonKey, type Tense, type VerbGroup, type VerbKey } from "@/features/conjugation/data";
import { createPracticeSession, practiceSessionReducer } from "./practice-session";
import type { ActionUse, BeingVerb, ChildStep, PracticeMode } from "./practice-types";
import styles from "./PracticeScreen.module.css";


function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type PracticeClientProps = {
  initialVerbKey?: VerbKey;
  initialTense?: Tense;
  initialChildMode?: boolean;
  initialChildStep?: ChildStep;
};

export default function PracticeScreen({ initialVerbKey = "fazer", initialTense = "present", initialChildMode = false, initialChildStep }: PracticeClientProps) {
  const [session, dispatch] = useReducer(
    practiceSessionReducer,
    { initialVerbKey, initialTense, initialChildMode, initialChildStep },
    createPracticeSession,
  );
  const {
    section,
    childMode,
    childStep,
    beingVerb,
    adultBeingGuide,
    actionUse,
    adultActionGuide,
    adultTerGuide,
    actionQuizChoice,
    verbKey,
    tense,
    group,
    mode,
    round,
    chips,
    placed,
    selectedChip,
    mistake,
    quizSelection,
    quizResult,
  } = session;

  const verb = verbs[verbKey];
  const forms = verb.forms[tense];
  const placedChipKeys = Object.values(placed);
  const completed = Object.keys(placed).length === people.length;
  const questionPerson = people[round % people.length];
  const correctForm = forms[questionPerson.key];
  const chooseOptions = useMemo(() => {
    const activeVerb = verbs[verbKey];
    const person = people[round % people.length];
    const correct = activeVerb.forms[tense][person.key];
    const uniqueForms = Array.from(new Set(Object.values(activeVerb.forms[tense])));
    return shuffle([correct, ...shuffle(uniqueForms.filter((form) => form !== correct)).slice(0, 2)]);
  }, [verbKey, round, tense]);
  const childWorldName = "Королевство глаголов";
  const childWorldPrompt = "Выбери замок";
  const irregularPlaceName = "Волшебный замок";
  const beingGuideKicker = childMode
    ? "Зал волшебных правил"
    : "Правила SER и ESTAR";
  const beingIllustrationTitle = childMode
    ? beingVerb === "ser" ? "Зал личности" : "Башня состояний"
    : beingVerb === "ser" ? "Идентичность и определение" : "Состояние и место";
  const actionLessonKicker = childMode
    ? "Мастерская времени"
    : "Один урок · два способа говорить о настоящем";
  const terLessonKicker = childMode ? "Сокровищница TER" : "Неправильный паттерн · TER";

  function shuffledChips() {
    return shuffle(people.map((person) => person.key));
  }

  function reset(nextMode = mode, nextVerb = verbKey) {
    dispatch({ type: "exerciseReset", payload: { mode: nextMode, verbKey: nextVerb, chips: shuffledChips() } });
  }

  function tryPlace(target: PersonKey, chip: PersonKey | null) {
    if (!chip || placed[target] || placedChipKeys.includes(chip)) return;
    const correct = forms[target] === forms[chip];
    dispatch({ type: "chipPlaced", target, chip, correct });
    if (!correct) window.setTimeout(() => dispatch({ type: "mistakeCleared", target }), 450);
  }

  function stepVerb(direction: -1 | 1) {
    dispatch({ type: "verbStepped", direction, chips: shuffledChips() });
  }

  function changeGroup(nextGroup: VerbGroup) {
    dispatch({ type: "groupChanged", group: nextGroup, chips: shuffledChips() });
  }

  function chooseKingdom(nextGroup: VerbGroup) {
    dispatch({ type: "kingdomChosen", group: nextGroup, chips: shuffledChips() });
  }

  function openBeingGuide(nextVerb: BeingVerb) {
    dispatch({ type: "beingGuideOpened", beingVerb: nextVerb, chips: shuffledChips() });
  }

  function changeBeingVerb(nextVerb: BeingVerb) {
    dispatch({ type: "beingVerbChanged", beingVerb: nextVerb, chips: shuffledChips() });
  }

  function changeBeingSunMode(nextMode: Extract<PracticeMode, "learn" | "practice">) {
    dispatch({ type: "beingSunModeChanged", mode: nextMode, chips: shuffledChips() });
  }

  function openActionGuide(nextUse: ActionUse) {
    dispatch({ type: "actionGuideOpened", actionUse: nextUse, chips: shuffledChips() });
  }

  function changeActionUse(nextUse: ActionUse) {
    dispatch({ type: "actionUseChanged", actionUse: nextUse, chips: shuffledChips() });
  }

  function changeActionSunMode(nextMode: Extract<PracticeMode, "learn" | "practice">) {
    dispatch({ type: "actionSunModeChanged", mode: nextMode, chips: shuffledChips() });
  }

  function openTerGuide() {
    dispatch({ type: "terGuideOpened", chips: shuffledChips() });
  }

  function changeTerSunMode(nextMode: Extract<PracticeMode, "learn" | "practice">) {
    dispatch({ type: "terSunModeChanged", mode: nextMode, chips: shuffledChips() });
  }

  function returnToChildRules() {
    dispatch({ type: "childRulesRequested" });
  }

  function syncChildModeUrl(nextChildMode: boolean) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextChildMode) url.searchParams.set("mode", "kingdoms");
    else url.searchParams.delete("mode");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function toggleChildMode() {
    const nextChildMode = !childMode;
    syncChildModeUrl(nextChildMode);
    dispatch({ type: "childModeChanged", childMode: nextChildMode });
  }

  function changeTense(nextTense: Tense) {
    dispatch({ type: "tenseChanged", tense: nextTense, chips: shuffledChips() });
  }

  function answerQuiz(selection: string, correct: boolean) {
    dispatch({ type: "quizAnswered", selection, correct });
  }

  function nextQuestion() {
    dispatch({ type: "nextQuestion", chips: shuffledChips() });
  }

  return (
    <div className={`${styles.screen} practice-screen ${section === "trainer" && childMode ? "kids-mode kids-theme-kingdoms" : ""} kingdom-${group}`}>
      <PracticeTopbar
        section={section}
        childMode={childMode}
        tense={tense}
        onSectionChange={(nextSection) => dispatch({ type: "sectionChanged", section: nextSection })}
        onToggleChildMode={toggleChildMode}
      />

      {section === "trainer" ? <section className={styles.workspace} id="trainer" aria-label="Тренажёр спряжения глаголов">
        {childMode && childStep === "kingdom" && (
          <KingdomMap
            group={group}
            worldName={childWorldName}
            worldPrompt={childWorldPrompt}
            irregularPlaceName={irregularPlaceName}
            onChooseKingdom={chooseKingdom}
            onOpenBeingGuide={openBeingGuide}
            onOpenActionGuide={openActionGuide}
            onOpenTerGuide={openTerGuide}
          />
        )}
        {((childMode && childStep === "special") || (!childMode && adultBeingGuide)) && (
          <BeingGuide
            beingVerb={beingVerb}
            childMode={childMode}
            kicker={beingGuideKicker}
            illustrationTitle={beingIllustrationTitle}
            onBack={() => dispatch({ type: "beingGuideClosed" })}
            tense={tense}
            verb={verb}
            forms={forms}
            sunMode={mode === "practice" ? "practice" : "learn"}
            chips={chips}
            placed={placed}
            placedChipKeys={placedChipKeys}
            selectedChip={selectedChip}
            mistake={mistake}
            completed={completed}
            onChangeBeingVerb={changeBeingVerb}
            onSunModeChange={changeBeingSunMode}
            onPlace={tryPlace}
            onSelectChip={(chip) => dispatch({ type: "chipSelected", chip })}
            onRestartPractice={() => reset("practice", beingVerb)}
          />
        )}
        {((childMode && childStep === "action") || (!childMode && adultActionGuide)) && (
          <ActionGuide
            actionUse={actionUse}
            childMode={childMode}
            kicker={actionLessonKicker}
            quizChoice={actionQuizChoice}
            onBack={() => dispatch({ type: "actionGuideClosed" })}
            sunVerb={verb}
            sunForms={forms}
            sunMode={mode === "practice" ? "practice" : "learn"}
            chips={chips}
            placed={placed}
            placedChipKeys={placedChipKeys}
            selectedChip={selectedChip}
            mistake={mistake}
            completed={completed}
            onChangeActionUse={changeActionUse}
            onChooseQuizAnswer={(choice) => dispatch({ type: "actionQuizAnswered", choice })}
            onSunModeChange={changeActionSunMode}
            onPlace={tryPlace}
            onSelectChip={(chip) => dispatch({ type: "chipSelected", chip })}
            onRestartPractice={() => reset("practice", actionUse === "habit" ? "falar" : "estar")}
          />
        )}
        {((childMode && childStep === "ter") || (!childMode && adultTerGuide)) && (
          <TerGuide
            childMode={childMode}
            kicker={terLessonKicker}
            verb={verb}
            forms={forms}
            sunMode={mode === "practice" ? "practice" : "learn"}
            chips={chips}
            placed={placed}
            placedChipKeys={placedChipKeys}
            selectedChip={selectedChip}
            mistake={mistake}
            completed={completed}
            onBack={() => dispatch({ type: "terGuideClosed" })}
            onSunModeChange={changeTerSunMode}
            onPlace={tryPlace}
            onSelectChip={(chip) => dispatch({ type: "chipSelected", chip })}
            onRestartPractice={() => reset("practice", "ter")}
          />
        )}
        {childMode && childStep === "rules" && (
          <RulesDeck
            group={group}
            tense={tense}
            onBack={() => dispatch({ type: "childStepChanged", childStep: "kingdom" })}
            onChangeTense={changeTense}
            onStartPractice={() => dispatch({ type: "childStepChanged", childStep: "exercise" })}
          />
        )}
        {((!childMode && !adultBeingGuide && !adultActionGuide && !adultTerGuide) || (childMode && childStep === "exercise")) && <>
        <PracticeControls
          childMode={childMode}
          group={group}
          irregularPlaceName={irregularPlaceName}
          mode={mode}
          tense={tense}
          verb={verb}
          onReturnToChildRules={returnToChildRules}
          onChangeTense={changeTense}
          onChangeGroup={changeGroup}
          onOpenBeingGuide={openBeingGuide}
          onOpenActionGuide={openActionGuide}
          onOpenTerGuide={openTerGuide}
          onStepVerb={stepVerb}
          onModeChange={reset}
        />
        {!childMode && <AdultRulePanel group={group} tense={tense} verb={verb} forms={forms} />}

        {(mode === "learn" || mode === "practice") ? (
          <SunFormExercise
            mode={mode}
            tense={tense}
            verb={verb}
            forms={forms}
            chips={chips}
            placed={placed}
            placedChipKeys={placedChipKeys}
            selectedChip={selectedChip}
            mistake={mistake}
            completed={completed}
            onPlace={tryPlace}
            onSelectChip={(chip) => dispatch({ type: "chipSelected", chip })}
            onRestartPractice={() => reset("practice")}
          />
        ) : (
          <QuizExercise
            mode={mode}
            round={round}
            tense={tense}
            verb={verb}
            forms={forms}
            questionPerson={questionPerson}
            correctForm={correctForm}
            chooseOptions={chooseOptions}
            quizSelection={quizSelection}
            quizResult={quizResult}
            onAnswer={answerQuiz}
            onNext={nextQuestion}
          />
        )}
        </>}
      </section> : section === "lessons" ? <AdultLessons /> : section === "vocabulary" ? <VocabularyHub onOpenCards={() => dispatch({ type: "sectionChanged", section: "cards" })} /> : <Flashcards />}

      <footer><span>{section === "cards" ? "Две колоды: общие слова и частотные глаголы" : section === "vocabulary" ? "Темы, карточки, пары и задания на смысл" : section === "lessons" ? "Коротко о форме — сразу в живом примере" : "Учи форму вместе с местоимением"}</span><span>Português · A1–B2</span></footer>
    </div>
  );
}
