import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";

const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const english = { name: "Daniel", lang: "en-GB", voiceURI: "daniel" };
const brazilian = { name: "Luciana", lang: "pt-BR", voiceURI: "luciana" };
const speak = vi.fn();
const cancel = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [english, brazilian, joana], speak, cancel,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  vi.stubGlobal("SpeechSynthesisUtterance", class {
    text: string;
    constructor(text: string) { this.text = text; }
  });
});

test("Portuguese voice picker includes both accents and uses the explicitly selected locale", async () => {
  render(<CardSpeechButton text="falar" />);
  const button = screen.getByRole("button", { name: "Послушать: falar" });
  await waitFor(() => expect(button).toBeEnabled());
  const voices = screen.getByLabelText("Голос озвучки: falar");
  expect(voices).toHaveTextContent("Joana — Португалия");
  expect(voices).toHaveTextContent("Luciana — Бразилия");
  fireEvent.change(voices, { target: { value: "pt-br|luciana|Luciana" } });
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: brazilian, lang: "pt-BR" });
  fireEvent.change(voices, { target: { value: "pt-pt|joana|Joana" } });
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
  fireEvent.change(screen.getByLabelText("Язык озвучки: eleger"), { target: { value: "pt" } });
  expect(screen.getByRole("button", { name: "Послушать: eleger" })).toHaveTextContent("Послушать");
  fireEvent.click(screen.getByRole("button", { name: "Послушать: eleger" }));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
});
