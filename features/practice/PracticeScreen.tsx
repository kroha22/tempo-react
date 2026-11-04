"use client";

import {ChildPresentation} from "./ActivityCompletion";
import { useMemo, useReducer, useState } from "react";
import Flashcards from "@/features/cards/components/Flashcards";
import AdultLessons from "@/features/practice/AdultLessons";
import { ActionGuide } from "@/features/practice/ActionGuide";
import { AdultRulePanel } from "@/features/practice/AdultRulePanel";
import { BeingGuide } from "@/features/practice/BeingGuide";
import { KingdomMap } from "@/features/practice/KingdomMap";
import { IrGuide } from "@/features/practice/IrGuide";
import { PracticeControls } from "@/features/practice/PracticeControls";
import { PracticeTopbar } from "@/features/practice/PracticeTopbar";
import { QuizExercise } from "@/features/practice/QuizExercise";
import { RulesDeck } from "@/features/practice/RulesDeck";
import { SunFormExercise } from "@/features/practice/SunFormExercise";
import { TerGuide } from "@/features/practice/TerGuide";
import { VocabularyHub } from "@/features/practice/VocabularyHub";
import {useProfileLearning} from "./profile-learning";

import { people, verbs, type PersonKey, type Tense, type VerbGroup, type VerbKey } from "@/features/conjugation/data";
import { createPracticeSession, practiceSessionReducer } from "./practice-session";
import type { ActionUse, BeingVerb, ChildStep, LessonPracticeTarget, PracticeMode, PracticeSection } from "./practice-types";
import styles from "./PracticeScreen.module.css";
import { ChildPracticePlan } from "./plan/ChildPracticePlan";
import { usePracticePlan } from "./plan/PracticePlanContext";
import { practicePlanSteps,nextPracticeStep } from "./plan/model";
import { PracticeWelcome } from "./plan/PracticeWelcome";


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
  initialSection?: PracticeSection;
  profileName?:string;
  resumeTopicId?:string|null;
  resumePlan?:boolean;
  initialGrammarLessonId?:string;
  onOpenLessons?:()=>void;
  focusedBeing?:boolean;
  onOpenGeneralPlan?:()=>void;
  onOpenGeneralCards?:()=>void;
};

export default function PracticeScreen({ initialVerbKey = "fazer", initialTense = "present", initialChildMode = false, initialChildStep, initialSection = "trainer",profileName,resumeTopicId,resumePlan=false,initialGrammarLessonId,onOpenLessons,focusedBeing=false,onOpenGeneralPlan,onOpenGeneralCards }: PracticeClientProps) {
  const learner=useProfileLearning();
  const plan=usePracticePlan();
  const [allLessons,setAllLessons]=useState(!!initialGrammarLessonId);
  const [catalogRevision,setCatalogRevision]=useState(0);
  const [home,setHome]=useState(!!profileName&&!resumeTopicId&&!resumePlan);
  const [launch,setLaunch]=useState<{id:string|null;revision:number}>({id:resumePlan&&plan?nextPracticeStep(plan.progress).id:null,revision:0});
  const [lessonPracticeOpen, setLessonPracticeOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(initialGrammarLessonId??"ser");
  const [session, dispatch] = useReducer(
    practiceSessionReducer,
    { initialVerbKey, initialTense, initialChildMode:learner?.profile.child??initialChildMode, initialChildStep, initialSection },
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
    adultIrGuide,
    actionQuizChoice,
    irQuizChoice,
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
  const planEnabled=!!plan&&(childMode||!!profileName);

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
  const childWorldName = "Замки спряжений";
  const childWorldPrompt = "Выбери замок";
  const irregularPlaceName = "Волшебный замок";
  const beingGuideKicker = childMode
    ? "Понятное правило"
    : "Правила SER и ESTAR";
  const beingIllustrationTitle = childMode
    ? beingVerb === "ser" ? "Кто или что" : "Как или где"
    : beingVerb === "ser" ? "Идентичность и определение" : "Состояние и место";
  const actionLessonKicker = childMode
    ? "Два способа говорить о настоящем"
    : "Один урок · два способа говорить о настоящем";
  const terLessonKicker = childMode ? "TER · особые формы" : "Неправильный паттерн · TER";

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

  function changeIrSunMode(nextMode: Extract<PracticeMode, "learn" | "practice">) {
    dispatch({ type: "irSunModeChanged", mode: nextMode, chips: shuffledChips() });
  }

  function returnToChildRules() {
    dispatch({ type: "childRulesRequested" });
  }

  function syncChildModeUrl(nextChildMode: boolean) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextChildMode) url.searchParams.set("mode", "child");
    else url.searchParams.delete("mode");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function toggleChildMode() {
    if(learner)return;
    const nextChildMode = !childMode;
    syncChildModeUrl(nextChildMode);
    dispatch({ type: "childModeChanged", childMode: nextChildMode });
  }

  function changeSection(nextSection: PracticeSection) {
    if(nextSection==="lessons"&&onOpenGeneralPlan){onOpenGeneralPlan();return;}
    window.scrollTo(0,0);
    if(nextSection==="vocabulary"&&onOpenLessons){onOpenLessons();return;}
    if(nextSection==="vocabulary")setCatalogRevision(value=>value+1);
    if(nextSection==="lessons")learner?.update(current=>({...current,lastTopicId:null}));
    setHome(false);
    setAllLessons(false);
    setLaunch(old=>({id:null,revision:old.revision+1}));
    setLessonPracticeOpen(false);
    dispatch({ type: "sectionChanged", section: nextSection });
  }

  function openLessonPractice(target: LessonPracticeTarget) {
    setLessonPracticeOpen(true);
    dispatch({ type: "lessonPracticeOpened", target, chips: shuffledChips() });
  }

  function returnToLessons() {
    setLessonPracticeOpen(false);
    dispatch({ type: "sectionChanged", section: "lessons" });
  }

  function openConjugationOverview() {
    setLessonPracticeOpen(true);
    dispatch({ type: "conjugationOverviewOpened" });
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

  const formExercise=(mode==="learn"||mode==="practice")?<SunFormExercise mode={mode} tense={tense} verb={verb} forms={forms} chips={chips} placed={placed} placedChipKeys={placedChipKeys} selectedChip={selectedChip} mistake={mistake} completed={completed} onPlace={tryPlace} onSelectChip={chip=>dispatch({type:"chipSelected",chip})} onRestartPractice={()=>reset("practice")}/>:<QuizExercise key={`${mode}:${verb.infinitive}:${tense}`} mode={mode} round={round} tense={tense} verb={verb} forms={forms} questionPerson={questionPerson} correctForm={correctForm} chooseOptions={chooseOptions} quizSelection={quizSelection} quizResult={quizResult} onAnswer={answerQuiz} onNext={nextQuestion}/>;

  if(focusedBeing)return <ChildPresentation value={childMode}><section className={styles.beingForms} aria-label={`Тренажёр форм ${verb.infinitive.toUpperCase()}`}>
    <div className={styles.beingModes} role="group" aria-label="Режим тренировки форм">
      <button type="button" aria-pressed={mode==="learn"} onClick={()=>reset("learn")}>Смотреть формы</button>
      <button type="button" aria-pressed={mode==="practice"} onClick={()=>reset("practice")}>Собрать формы</button>
      <button type="button" aria-pressed={mode==="choose"} onClick={()=>reset("choose")}>Выбрать форму</button>
      <button type="button" aria-pressed={mode==="reverse"} onClick={()=>reset("reverse")}>Узнать местоимение</button>
    </div>
    {formExercise}
  </section></ChildPresentation>;

  return (
    <ChildPresentation value={childMode}><div className={`${styles.screen} practice-screen ${childMode ? "kids-mode kids-theme" : ""} kingdom-${group}`}>
      {!onOpenGeneralPlan&&<PracticeTopbar
        onHome={profileName?()=>setHome(true):onOpenLessons}
        home={home}
        profileMode={!!profileName||!!learner}
        planCount={planEnabled&&!allLessons?practicePlanSteps.length:undefined}
        section={section}
        childMode={childMode}
        tense={tense}
        onSectionChange={changeSection}
        onToggleChildMode={toggleChildMode}
      />}

      {childMode && !home && section !== "trainer" && !(section==="lessons"&&planEnabled&&!allLessons) && (
        <aside className={styles.childAccent} aria-label="Включено детское оформление">
          <span className={styles.childMascot} aria-hidden="true">🦉</span>
          <span>
            <strong>{section === "lessons" ? "Разберём правило по шагам" : section === "vocabulary" ? "Выбирай тему и играй со словами" : "Повторяй в своём темпе"}</strong>
            <small>Задания и ответы такие же, меняется только оформление.</small>
          </span>
          <span className={styles.childStars} aria-hidden="true">✦ · ✦</span>
        </aside>
      )}

      {home&&profileName&&plan?<PracticeWelcome name={profileName} onContinue={id=>{changeSection("lessons");plan.visit(id);setLaunch(old=>({id,revision:old.revision+1}));}} onPlan={()=>changeSection("lessons")} onWords={()=>changeSection("vocabulary")} onCards={()=>changeSection("cards")}/>:section === "trainer" ? <section className={styles.workspace} id="trainer" aria-label="Тренажёр спряжения глаголов">
        {lessonPracticeOpen && <button className={styles.lessonBack} onClick={returnToLessons}>← К урокам</button>}
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
        {((childMode && childStep === "ir") || (!childMode && adultIrGuide)) && (
          <IrGuide
            childMode={childMode}
            verb={verbs.ir}
            forms={verbs.ir.forms.present}
            sunMode={mode === "practice" ? "practice" : "learn"}
            quizChoice={irQuizChoice}
            chips={chips}
            placed={placed}
            placedChipKeys={placedChipKeys}
            selectedChip={selectedChip}
            mistake={mistake}
            completed={completed}
            onBack={() => dispatch({ type: "irGuideClosed" })}
            onSunModeChange={changeIrSunMode}
            onChooseQuizAnswer={(choice) => dispatch({ type: "irQuizAnswered", choice })}
            onPlace={tryPlace}
            onSelectChip={(chip) => dispatch({ type: "chipSelected", chip })}
            onRestartPractice={() => reset("practice", "ir")}
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
        {((!childMode && !adultBeingGuide && !adultActionGuide && !adultTerGuide && !adultIrGuide) || (childMode && childStep === "exercise")) && <>
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

        {formExercise}
        </>}
      </section> : section === "lessons"&&planEnabled&&!allLessons ? <ChildPracticePlan key={launch.revision} initialStepId={launch.id} onOpenCatalog={()=>changeSection("vocabulary")}/> : section === "lessons"&&initialGrammarLessonId ? <><button type="button" onClick={openConjugationOverview}>Все спряжения →</button><AdultLessons singleLesson showPractice consolidateBeing childMode={childMode} activeLessonId={activeLessonId} onLessonChange={setActiveLessonId} onOpenPractice={openLessonPractice} onOpenConjugationOverview={openConjugationOverview}/></> : section === "vocabulary"||section === "lessons" ? <VocabularyHub key={catalogRevision} initialChildMode={childMode} initialTopicId={catalogRevision===0?resumeTopicId:null} onOpenPlan={onOpenGeneralPlan??(plan?()=>changeSection("lessons"):undefined)} planLabel={onOpenGeneralPlan?"Общий план":undefined} onOpenCards={onOpenGeneralCards??(() => changeSection("cards"))} /> : <Flashcards />}

      <footer><span>{section === "cards" ? "Колоды: базовые слова, глаголы и тематические наборы" : section === "vocabulary" ? "Темы, карточки, пары и задания на смысл" : section === "lessons" ? "Коротко о форме — сразу в живом примере" : "Учи форму вместе с местоимением"}</span><span>Português · A1–B2</span></footer>
    </div></ChildPresentation>
  );
}
