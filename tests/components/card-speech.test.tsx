import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";

const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const english = { name: "Daniel", lang: "en-GB", voiceURI: "daniel" };
const speak = vi.fn();
const cancel = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [english, joana], speak, cancel,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  vi.stubGlobal("SpeechSynthesisUtterance", class {
    text: string;
    constructor(text: string) { this.text = text; }
  });
});

test("card playback sends the explicitly selected voice and its language", async () => {
  const { unmount } = render(<CardSpeechButton text="eleger" />);
  const button = screen.getByRole("button", { name: "Послушать: eleger" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
  unmount();
  expect(cancel).toHaveBeenCalled();
});

test("language choice updates every card and reload preserves the selected voice", async () => {
  const { unmount } = render(<><CardSpeechButton text="eleger" /><CardSpeechButton text="falar" /></>);
  await waitFor(() => expect(screen.getByRole("button", { name: "Послушать: eleger" })).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Язык озвучки: eleger"), { target: { value: "en-gb" } });
  fireEvent.click(screen.getByRole("button", { name: "Послушать: falar" }));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: english, lang: "en-GB" });
  unmount();
  render(<CardSpeechButton text="eleger" />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Послушать: eleger" })).toBeEnabled());
  expect(screen.getByLabelText("Язык озвучки: eleger")).toHaveValue("en-gb");
  fireEvent.change(screen.getByLabelText("Язык озвучки: eleger"), { target: { value: "pt-pt" } });
  expect(screen.getByRole("button", { name: "Послушать: eleger" })).toHaveTextContent("Послушать");
  fireEvent.click(screen.getByRole("button", { name: "Послушать: eleger" }));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
});
