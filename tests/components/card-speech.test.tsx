import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";

const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const english = { name: "Daniel", lang: "en-GB", voiceURI: "daniel" };
const brazilian = { name: "Luciana", lang: "pt-BR", voiceURI: "luciana" };
const french = { name: "Thomas", lang: "fr-FR", voiceURI: "thomas" };
const speak = vi.fn();
const cancel = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [english, brazilian, french, joana], speak, cancel,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  vi.stubGlobal("SpeechSynthesisUtterance", class {
    text: string;
    constructor(text: string) { this.text = text; }
  });
});

test("only the two Portuguese locales are offered and removed preferences return to Joana", async () => {
  localStorage.setItem("tempo-card-speech-settings", JSON.stringify({ language: "en-GB", voice: "en-gb|daniel|Daniel" }));
  render(<CardSpeechButton text="falar" />);
  const button = screen.getByRole("button", { name: "Послушать: falar" });
  await waitFor(() => expect(button).toBeEnabled());
  const language = screen.getByLabelText("Язык озвучки: falar") as HTMLSelectElement;
  expect(Array.from(language.options, (option) => option.value)).toEqual(["pt-pt", "pt-br"]);
  expect(language).toHaveValue("pt-pt");
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
});

test("an existing grouped Brazilian preference is preserved after locales are separated", async () => {
  localStorage.setItem("tempo-card-speech-settings", JSON.stringify({ language: "pt", voice: "pt-br|luciana|Luciana" }));
  render(<CardSpeechButton text="falar" />);
  const button = screen.getByRole("button", { name: "Послушать: falar" });
  await waitFor(() => expect(button).toBeEnabled());
  expect(screen.getByLabelText("Язык озвучки: falar")).toHaveValue("pt-br");
  expect(screen.getByLabelText("Голос озвучки: falar")).toHaveValue("pt-br|luciana|Luciana");
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: brazilian, lang: "pt-BR" });
});

test("Portugal and Brazil have separate voice lists and keep the explicit locale", async () => {
  render(<CardSpeechButton text="falar" />);
  const button = screen.getByRole("button", { name: "Послушать: falar" });
  await waitFor(() => expect(button).toBeEnabled());
  const voices = screen.getByLabelText("Голос озвучки: falar");
  expect(voices).toHaveTextContent("Joana");
  expect(voices).not.toHaveTextContent("Luciana");
  fireEvent.change(screen.getByLabelText("Язык озвучки: falar"), { target: { value: "pt-br" } });
  expect(voices).toHaveTextContent("Luciana");
  expect(voices).not.toHaveTextContent("Joana");
  fireEvent.change(voices, { target: { value: "pt-br|luciana|Luciana" } });
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: brazilian, lang: "pt-BR" });
  fireEvent.change(screen.getByLabelText("Язык озвучки: falar"), { target: { value: "pt-pt" } });
});

test("card playback sends the explicitly selected voice and its language", async () => {
  const { unmount } = render(<CardSpeechButton text="eleger" />);
  const button = screen.getByRole("button", { name: "Послушать: eleger" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(speak.mock.lastCall?.[0]).toMatchObject({ text: "eleger", voice: joana, lang: "pt-PT", rate: 1, pitch: 1, volume: 1 });
  unmount();
  expect(cancel).toHaveBeenCalled();
});

test("voices that arrive without voiceschanged become available through bounded retries", async () => {
  vi.useFakeTimers();
  let available: typeof joana[] = [];
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => available, speak, cancel,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  const view = render(<CardSpeechButton text="eleger" />);
  try {
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByRole("status")).toHaveTextContent("Загружаем голоса");
    expect(screen.getByRole("button", { name: "Послушать: eleger" })).toBeDisabled();
    available = [joana];
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    fireEvent.click(screen.getByRole("button", { name: "Послушать: eleger" }));
    expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
  } finally {
    view.unmount();
    vi.useRealTimers();
  }
});

test("a paused engine resumes before the selected utterance is spoken", async () => {
  const resume = vi.fn();
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [joana], speak, cancel, paused: true, resume,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  render(<CardSpeechButton text="eleger" />);
  const button = screen.getByRole("button", { name: "Послушать: eleger" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(resume).toHaveBeenCalledTimes(1);
  expect(resume.mock.invocationCallOrder[0]).toBeLessThan(speak.mock.invocationCallOrder[0]);
});

test("three completed repetitions retain voice and language without resetting the engine", async () => {
  render(<CardSpeechButton text="eleger" />);
  const button = screen.getByRole("button", { name: "Послушать: eleger" });
  await waitFor(() => expect(button).toBeEnabled());
  for (let index = 0; index < 3; index += 1) {
    fireEvent.click(button);
    const utterance = speak.mock.lastCall?.[0];
    expect(utterance).toMatchObject({ voice: joana, lang: "pt-PT" });
    act(() => utterance.onend());
  }
  expect(cancel).not.toHaveBeenCalled();
});

test("a new card cancels active playback once, and old cleanup cannot stop the new voice", async () => {
  const first = render(<CardSpeechButton text="eleger" />);
  const second = render(<CardSpeechButton text="falar" />);
  const firstButton = screen.getByRole("button", { name: "Послушать: eleger" });
  const secondButton = screen.getByRole("button", { name: "Послушать: falar" });
  await waitFor(() => expect(firstButton).toBeEnabled());
  await waitFor(() => expect(secondButton).toBeEnabled());
  fireEvent.click(firstButton);
  fireEvent.click(secondButton);
  expect(cancel).toHaveBeenCalledTimes(1);
  first.unmount();
  expect(cancel).toHaveBeenCalledTimes(1);
  second.unmount();
  expect(cancel).toHaveBeenCalledTimes(2);
});

test("language choice updates every card and reload preserves the selected voice", async () => {
  const { unmount } = render(<><CardSpeechButton text="eleger" /><CardSpeechButton text="falar" /></>);
  await waitFor(() => expect(screen.getByRole("button", { name: "Послушать: eleger" })).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Язык озвучки: eleger"), { target: { value: "pt-br" } });
  fireEvent.click(screen.getByRole("button", { name: "Послушать: falar" }));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: brazilian, lang: "pt-BR" });
  unmount();
  render(<CardSpeechButton text="eleger" />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Послушать: eleger" })).toBeEnabled());
  expect(screen.getByLabelText("Язык озвучки: eleger")).toHaveValue("pt-br");
  fireEvent.change(screen.getByLabelText("Язык озвучки: eleger"), { target: { value: "pt-pt" } });
  expect(screen.getByRole("button", { name: "Послушать: eleger" })).toHaveTextContent("Послушать");
  fireEvent.click(screen.getByRole("button", { name: "Послушать: eleger" }));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ voice: joana, lang: "pt-PT" });
});

test.each([joana, brazilian])("$name follows the same explicit voice/language path on repeated playback", async (voice) => {
  render(<CardSpeechButton text="palavra" />);
  const button = screen.getByRole("button", { name: "Послушать: palavra" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Язык озвучки: palavra"), { target: { value: voice.lang.toLowerCase() } });
  fireEvent.change(screen.getByLabelText("Голос озвучки: palavra"), { target: { value: `${voice.lang.toLowerCase()}|${voice.voiceURI}|${voice.name}` } });
  for (let index = 0; index < 3; index += 1) {
    fireEvent.click(button);
    const utterance = speak.mock.lastCall?.[0];
    expect(utterance).toMatchObject({ text: "palavra", voice, lang: voice.lang, rate: 1, pitch: 1, volume: 1 });
    act(() => utterance.onend());
  }
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Проверить голос"));
  expect(speak.mock.lastCall?.[0]).toMatchObject({ text: "palavra", voice, lang: voice.lang });
});
