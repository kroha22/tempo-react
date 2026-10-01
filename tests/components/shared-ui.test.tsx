import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/shared/ui/Button";
import { Feedback } from "@/shared/ui/Feedback";
import { ChoiceGroup } from "@/shared/ui/ChoiceGroup";

const options = [{ value: "a", label: "Olá!" }, { value: "b", label: "Sou a Rita.", disabled: true }, { value: "c", label: "Muito prazer." }];
function Choices() {
  const [value, setValue] = useState<string | null>(null);
  return <><ChoiceGroup label="Ответ" options={options} value={value} onChange={setValue} optionLang="pt-PT" /><Button>Продолжить</Button></>;
}

describe("shared UI contracts", () => {
  it("uses one tab stop for radio choices, arrows skip disabled options and Tab leaves the group", async () => {
    const user = userEvent.setup();
    render(<Choices />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Olá!" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Olá!" })).toBeChecked();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Muito prazer." })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Muito prazer." })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Продолжить" })).toHaveFocus();
  });

  it("keeps a submitted answer frozen while the group is disabled", async () => {
    const onChange = vi.fn();
    render(<ChoiceGroup label="Ответ" options={options} value="a" onChange={onChange} disabled />);
    await userEvent.setup().click(screen.getByText("Muito prazer."));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Olá!" })).toBeChecked();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("does not submit a form by default and prevents activation while pending", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const click = vi.fn();
    const user = userEvent.setup();
    const view = render(<form onSubmit={submit}><Button onClick={click}>Сохранить</Button></form>);
    await user.click(screen.getByRole("button"));
    expect(click).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
    view.rerender(<Button pending onClick={click}>Сохраняем…</Button>);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("announces an error without including its retry control in the alert", async () => {
    const retry = vi.fn();
    render(<Feedback tone="error" action={{ label: "Повторить", onClick: retry }}>Не удалось сохранить.</Feedback>);
    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось сохранить.");
    expect(screen.getByRole("alert")).not.toContainElement(screen.getByRole("button"));
    await userEvent.setup().click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("hydrates server-rendered radio IDs and preserves accessible selection", async () => {
    const errors = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const element = <ChoiceGroup label="Ответ" options={options} value="c" onChange={() => {}} />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    const ids = Array.from(container.querySelectorAll("input"), (input) => input.id);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => { root = hydrateRoot(container, element, { onRecoverableError: errors }); });
      expect(Array.from(container.querySelectorAll("input"), (input) => input.id)).toEqual(ids);
      expect(screen.getByRole("radiogroup", { name: "Ответ" })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Muito prazer." })).toBeChecked();
      expect(errors).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
