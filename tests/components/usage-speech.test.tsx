import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { UsagePractice } from "@/features/practice/UsagePractice";
import { learningCatalog } from "@/features/content/learning-catalog";

const phraseModule = learningCatalog.usageModules[0];
const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const speak = vi.fn();
const cancel = vi.fn();

beforeEach(() => {
  localStorage.setItem("tempo-card-speech-settings", '{"language":"pt-PT","voice":""}');
  vi.stubGlobal("speechSynthesis", { getVoices: () => [joana], speak, cancel, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
});

test("phrase examples speak Portuguese with the shared voice and do not expose the exercise answer", async () => {
  render(<UsagePractice module={phraseModule} />);
  const example = screen.getByRole("button", { name: `Послушать: ${phraseModule.examples[0].portuguese}` });
  await waitFor(() => expect(example).toBeEnabled());
  fireEvent.click(example);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ text: phraseModule.examples[0].portuguese, voice: joana, lang: "pt-PT" });
  expect(screen.queryByRole("button", { name: /^Послушать фразу:/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/^Голос:/)).not.toBeInTheDocument();
});

test("after a wrong answer the full correct sentence is playable and hiding the mode stops speech", async () => {
  const view = render(<UsagePractice module={phraseModule} />);
  fireEvent.click(screen.getByRole("button", { name: "a régua" }));
  fireEvent.click(screen.getByRole("button", { name: "Проверить" }));
  const answer = screen.getByRole("button", { name: "Послушать фразу: Para ler, abro o livro." });
  await waitFor(() => expect(answer).toBeEnabled());
  fireEvent.click(answer);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ text: "Para ler, abro o livro.", lang: "pt-PT" });
  const cancellations = cancel.mock.calls.length;
  view.rerender(<UsagePractice module={phraseModule} active={false} />);
  expect(cancel).toHaveBeenCalledTimes(cancellations + 1);
  expect(answer).toBeDisabled();
  view.rerender(<UsagePractice module={phraseModule} active />);
  expect(screen.getByText("Посмотри на правильный вариант")).toBeInTheDocument();
});
