import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { people, verbs } from "@/features/conjugation/data";
import { ActionGuide } from "@/features/practice/ActionGuide";
import { BeingGuide } from "@/features/practice/BeingGuide";
import { KingdomMap } from "@/features/practice/KingdomMap";
import { PracticeControls } from "@/features/practice/PracticeControls";
import { TerGuide } from "@/features/practice/TerGuide";
import PracticeScreen from "@/features/practice/PracticeScreen";
import { PracticeTopbar } from "@/features/practice/PracticeTopbar";
import { QuizExercise } from "@/features/practice/QuizExercise";
import { RulesDeck } from "@/features/practice/RulesDeck";

describe("Practice composition controls", () => {

  it("opens the themed vocabulary section from the main navigation", async () => {
    const toggle = vi.fn();
    const changeSection = vi.fn();
    render(
      <PracticeTopbar section="trainer" childMode={false} tense="present" onSectionChange={changeSection} onToggleChildMode={toggle} />,
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Слова" }));
    expect(changeSection).toHaveBeenCalledWith("vocabulary");
  });

  it("labels the presentation toggle by the next available mode", async () => {
    const toggle = vi.fn();
    const changeSection = vi.fn();

    const { rerender } = render(
      <PracticeTopbar section="trainer" childMode={false} tense="present" onSectionChange={changeSection} onToggleChildMode={toggle} />,
    );

    expect(screen.getByRole("button", { name: /Для детей/ })).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(screen.getByRole("button", { name: /Для детей/ }));
    expect(toggle).toHaveBeenCalledOnce();

    rerender(<PracticeTopbar section="trainer" childMode tense="present" onSectionChange={changeSection} onToggleChildMode={toggle} />);

    expect(screen.getByRole("button", { name: /Взрослый/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the child map for free child practice and keeps deep-linked verbs on the sun", () => {
    const mapRender = render(<PracticeScreen initialChildMode initialChildStep="kingdom" />);

    expect(screen.getByRole("group", { name: "Королевства глаголов" })).toBeInTheDocument();
    expect(screen.queryByText("FAZER")).not.toBeInTheDocument();

    mapRender.unmount();
    render(<PracticeScreen initialChildMode initialChildStep="exercise" initialVerbKey="fazer" />);

    expect(screen.getByText("faço")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Королевства глаголов" })).not.toBeInTheDocument();
  });

  it("keeps the practice presentation URL in sync with the toggle", async () => {
    window.history.pushState(null, "", "/learning/practice?verb=fazer&tense=present&mode=kingdoms");
    render(<PracticeScreen initialChildMode initialChildStep="exercise" initialVerbKey="fazer" />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Взрослый/ }));
    expect(window.location.search).toBe("?verb=fazer&tense=present");

    await user.click(screen.getByRole("button", { name: /Для детей/ }));
    expect(window.location.search).toBe("?verb=fazer&tense=present&mode=kingdoms");
  });

  it("keeps the child kingdom map as a callback-only view", async () => {
    const choose = vi.fn();
    const openBeing = vi.fn();
    const openAction = vi.fn();
    const openTer = vi.fn();
    render(
      <KingdomMap
        group="ar"
        worldName="Королевство глаголов"
        worldPrompt="Выбери замок"
        irregularPlaceName="Волшебный замок"
        onChooseKingdom={choose}
        onOpenBeingGuide={openBeing}
        onOpenActionGuide={openAction}
        onOpenTerGuide={openTer}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /-ER/ }));
    await user.click(screen.getByRole("button", { name: /SER/ }));
    await user.click(screen.getByRole("button", { name: /Сейчас/ }));
    await user.click(screen.getByRole("button", { name: /TER/ }));

    expect(choose).toHaveBeenCalledWith("er");
    expect(openBeing).toHaveBeenCalledWith("ser");
    expect(openAction).toHaveBeenCalledWith("now");
    expect(openTer).toHaveBeenCalledOnce();
  });

  it("routes Practice controls back to parent-owned state changes", async () => {
    const changeTense = vi.fn();
    const changeGroup = vi.fn();
    const stepVerb = vi.fn();
    const modeChange = vi.fn();
    const openTer = vi.fn();
    render(
      <PracticeControls
        childMode={false}
        group="ar"
        irregularPlaceName="Волшебный замок"
        mode="learn"
        tense="present"
        verb={verbs.falar}
        onReturnToChildRules={() => {}}
        onChangeTense={changeTense}
        onChangeGroup={changeGroup}
        onOpenBeingGuide={() => {}}
        onOpenActionGuide={() => {}}
        onOpenTerGuide={openTer}
        onStepVerb={stepVerb}
        onModeChange={modeChange}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Прошедшее" }));
    await user.click(screen.getByRole("button", { name: "-IR" }));
    await user.click(screen.getByRole("button", { name: "Следующий глагол" }));
    await user.click(screen.getByRole("button", { name: /02\s+Практика/ }));
    await user.click(screen.getByRole("button", { name: "TER" }));

    expect(changeTense).toHaveBeenCalledWith("past");
    expect(changeGroup).toHaveBeenCalledWith("ir");
    expect(stepVerb).toHaveBeenCalledWith(1);
    expect(modeChange).toHaveBeenCalledWith("practice");
    expect(openTer).toHaveBeenCalledOnce();
  });

  it("keeps the SER/ESTAR solar lesson transitions parent-owned", async () => {
    const back = vi.fn();
    const change = vi.fn();
    const modeChange = vi.fn();
    const place = vi.fn();
    const selectChip = vi.fn();
    const restart = vi.fn();

    render(
      <BeingGuide
        beingVerb="ser"
        childMode={false}
        kicker="Правила SER и ESTAR"
        illustrationTitle="Идентичность и определение"
        onBack={back}
        tense="present"
        verb={verbs.ser}
        forms={verbs.ser.forms.present}
        sunMode="learn"
        chips={people.map((person) => person.key)}
        placed={{}}
        placedChipKeys={[]}
        selectedChip={null}
        mistake={null}
        completed={false}
        onChangeBeingVerb={change}
        onSunModeChange={modeChange}
        onPlace={place}
        onSelectChip={selectChip}
        onRestartPractice={restart}
      />,
    );

    expect(screen.getByText("Солнечный урок")).toBeInTheDocument();
    expect(screen.getByText("sou")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "ESTAR" }));
    await user.click(screen.getByRole("button", { name: /К тренажёру/ }));
    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(change).toHaveBeenCalledWith("estar");
    expect(back).toHaveBeenCalledOnce();
    expect(modeChange).toHaveBeenCalledWith("practice");
    expect(place).not.toHaveBeenCalled();
    expect(selectChip).not.toHaveBeenCalled();
    expect(restart).not.toHaveBeenCalled();
  });

  it("opens SER/ESTAR from the child map as an inline solar lesson", async () => {
    render(<PracticeScreen initialChildMode initialChildStep="kingdom" />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /SER/ }));

    expect(screen.getByText("Солнечный урок")).toBeInTheDocument();
    expect(screen.getByText("SER в настоящем времени")).toBeInTheDocument();
    expect(screen.getByText("sou")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(screen.getByRole("complementary", { name: "Формы глагола для расстановки" })).toBeInTheDocument();
  });

  it("keeps the action solar lesson answer and practice transitions parent-owned", async () => {
    const back = vi.fn();
    const change = vi.fn();
    const choose = vi.fn();
    const modeChange = vi.fn();
    const place = vi.fn();
    const selectChip = vi.fn();
    const restart = vi.fn();

    render(
      <ActionGuide
        actionUse="habit"
        childMode={false}
        kicker="Один урок · два способа говорить о настоящем"
        quizChoice={null}
        sunVerb={verbs.falar}
        sunForms={verbs.falar.forms.present}
        sunMode="learn"
        chips={people.map((person) => person.key)}
        placed={{}}
        placedChipKeys={[]}
        selectedChip={null}
        mistake={null}
        completed={false}
        onBack={back}
        onChangeActionUse={change}
        onChooseQuizAnswer={choose}
        onSunModeChange={modeChange}
        onPlace={place}
        onSelectChip={selectChip}
        onRestartPractice={restart}
      />,
    );

    expect(screen.getByText("Солнечный урок")).toBeInTheDocument();
    expect(screen.getByText("FALAR в настоящем времени")).toBeInTheDocument();
    expect(screen.getAllByText("falo").length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Сейчас" }));
    await user.click(screen.getByRole("button", { name: "joga" }));
    await user.click(screen.getByRole("button", { name: /К тренажёру/ }));
    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(change).toHaveBeenCalledWith("now");
    expect(choose).toHaveBeenCalledWith("joga");
    expect(back).toHaveBeenCalledOnce();
    expect(modeChange).toHaveBeenCalledWith("practice");
    expect(place).not.toHaveBeenCalled();
    expect(selectChip).not.toHaveBeenCalled();
    expect(restart).not.toHaveBeenCalled();
  });

  it("opens the child action lesson with an inline ESTAR sun for now", async () => {
    render(<PracticeScreen initialChildMode initialChildStep="kingdom" />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Сейчас/ }));

    expect(screen.getByText("ESTAR для действия сейчас")).toBeInTheDocument();
    expect(screen.getByText(/forma de ESTAR/)).toBeInTheDocument();
    expect(screen.getAllByText("estou").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(screen.getByRole("complementary", { name: "Формы глагола для расстановки" })).toBeInTheDocument();
  });

  it("keeps the TER solar lesson transitions parent-owned", async () => {
    const back = vi.fn();
    const modeChange = vi.fn();
    const place = vi.fn();
    const selectChip = vi.fn();
    const restart = vi.fn();

    render(
      <TerGuide
        childMode={false}
        kicker="Неправильный паттерн · TER"
        verb={verbs.ter}
        forms={verbs.ter.forms.present}
        sunMode="learn"
        chips={people.map((person) => person.key)}
        placed={{}}
        placedChipKeys={[]}
        selectedChip={null}
        mistake={null}
        completed={false}
        onBack={back}
        onSunModeChange={modeChange}
        onPlace={place}
        onSelectChip={selectChip}
        onRestartPractice={restart}
      />,
    );

    expect(screen.getByText("TER в настоящем времени")).toBeInTheDocument();
    expect(screen.getAllByText("tenho").length).toBeGreaterThan(0);
    expect(screen.getAllByText("têm").length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /К тренажёру/ }));
    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(back).toHaveBeenCalledOnce();
    expect(modeChange).toHaveBeenCalledWith("practice");
    expect(place).not.toHaveBeenCalled();
    expect(selectChip).not.toHaveBeenCalled();
    expect(restart).not.toHaveBeenCalled();
  });

  it("opens TER from the child map as an inline solar lesson", async () => {
    render(<PracticeScreen initialChildMode initialChildStep="kingdom" />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /TER/ }));

    expect(screen.getByText("TER в настоящем времени")).toBeInTheDocument();
    expect(screen.getAllByText("tenho").length).toBeGreaterThan(0);
    expect(screen.getAllByText("têm").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Потренировать здесь/ }));

    expect(screen.getByRole("complementary", { name: "Формы глагола для расстановки" })).toBeInTheDocument();
  });


  it("routes rules deck actions back to parent state", async () => {
    const back = vi.fn();
    const changeTense = vi.fn();
    const startPractice = vi.fn();
    render(
      <RulesDeck
        group="ar"
        tense="present"
        onBack={back}
        onChangeTense={changeTense}
        onStartPractice={startPractice}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Другой замок/ }));
    await user.click(screen.getByRole("button", { name: "Раньше" }));
    await user.click(screen.getByRole("button", { name: /К глаголам/ }));

    expect(back).toHaveBeenCalledOnce();
    expect(changeTense).toHaveBeenCalledWith("past");
    expect(startPractice).toHaveBeenCalledOnce();
  });

  it("keeps quiz answer validation parent-owned", async () => {
    const answer = vi.fn();
    const next = vi.fn();
    render(
      <QuizExercise
        mode="choose"
        round={0}
        tense="present"
        verb={verbs.falar}
        forms={verbs.falar.forms.present}
        questionPerson={{ key: "eu", label: "Eu", angle: -90 }}
        correctForm="falo"
        chooseOptions={["falo", "falas", "fala"]}
        quizSelection={null}
        quizResult={null}
        onAnswer={answer}
        onNext={next}
      />,
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "falo" }));

    expect(answer).toHaveBeenCalledWith("falo", true);
    expect(next).not.toHaveBeenCalled();
  });

  it("shows quiz feedback and next action after a result", async () => {
    const answer = vi.fn();
    const next = vi.fn();
    render(
      <QuizExercise
        mode="reverse"
        round={0}
        tense="present"
        verb={verbs.falar}
        forms={verbs.falar.forms.present}
        questionPerson={{ key: "eu", label: "Eu", angle: -90 }}
        correctForm="falo"
        chooseOptions={["falo", "falas", "fala"]}
        quizSelection="tu"
        quizResult="wrong"
        onAnswer={answer}
        onNext={next}
      />,
    );

    expect(screen.getByText(/Правильный ответ: Eu/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: /Следующий/ }));

    expect(answer).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

});
