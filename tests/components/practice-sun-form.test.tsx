import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { verbs, type PersonKey } from "@/features/conjugation/data";
import { SunFormExercise } from "@/features/practice/SunFormExercise";

describe("SunFormExercise", () => {
  it("renders the selected verb forms in learn mode", () => {
    render(
      <SunFormExercise
        mode="learn"
        tense="present"
        verb={verbs.fazer}
        forms={verbs.fazer.forms.present}
        chips={[]}
        placed={{}}
        placedChipKeys={[]}
        selectedChip={null}
        mistake={null}
        completed={false}
        onPlace={() => {}}
        onSelectChip={() => {}}
        onRestartPractice={() => {}}
      />,
    );

    expect(screen.getByText("fazer")).toBeInTheDocument();
    expect(screen.getByText("faço")).toBeInTheDocument();
    expect(screen.getByText("fazemos")).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Формы глагола для расстановки" })).not.toBeInTheDocument();
  });

  it("keeps placement state owned by the parent", async () => {
    const onPlace = vi.fn();
    const onSelectChip = vi.fn();
    const chips: PersonKey[] = ["eu", "tu"];
    render(
      <SunFormExercise
        mode="practice"
        tense="present"
        verb={verbs.fazer}
        forms={verbs.fazer.forms.present}
        chips={chips}
        placed={{}}
        placedChipKeys={[]}
        selectedChip="eu"
        mistake={null}
        completed={false}
        onPlace={onPlace}
        onSelectChip={onSelectChip}
        onRestartPractice={() => {}}
      />,
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Форма для Eu" }));

    expect(onPlace).toHaveBeenCalledWith("eu", "eu");
    expect(onSelectChip).not.toHaveBeenCalled();
    expect(screen.getByRole("complementary", { name: "Формы глагола для расстановки" })).toBeInTheDocument();
  });
});
