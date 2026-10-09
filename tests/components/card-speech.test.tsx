import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";
import { SpeechHelpButton } from "@/features/cards/components/SpeechHelpButton";
const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const grandpa = { name: "Grandpa (Portuguese (Brazil))", lang: "pt-BR", voiceURI: "grandpa" };
const speak = vi.fn();
const cancel = vi.fn();
let voices = [joana, grandpa];
beforeEach(() => {
  voices = [joana, grandpa];
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  localStorage.clear(); speak.mockClear(); cancel.mockClear();
  vi.stubGlobal("speechSynthesis", {getVoices: () => voices, speak, cancel, addEventListener: vi.fn(), removeEventListener: vi.fn()});
  vi.stubGlobal("SpeechSynthesisUtterance", class {text: string; constructor(text: string) {this.text = text;}});
});
function help(){fireEvent.click(screen.getByRole("button", {name: "Проблема с произношением"}));}
test("backup is shared, persisted and reversible without playing or flipping", async () => {
  render(<><SpeechHelpButton/><CardSpeechButton text="casa"/><CardSpeechButton text="escola"/></>);
  await waitFor(() => expect(screen.getByRole("button", {name:"Послушать: casa"})).toBeEnabled());
  help(); fireEvent.click(screen.getByRole("button", {name:"Включить запасной"}));
  expect(speak).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem("tempo-card-speech-settings")!)).toEqual({language:"pt-BR",voice:"pt-br|grandpa|Grandpa (Portuguese (Brazil))"});
  for(const text of ["casa","escola"]){fireEvent.click(screen.getByRole("button",{name:`Послушать: ${text}`}));const u=speak.mock.lastCall![0];expect(u).toMatchObject({voice:grandpa,lang:"pt-BR",rate:1,text});act(()=>u.onend());}
  help(); fireEvent.click(screen.getByRole("button",{name:"Вернуться к Joana"}));
  fireEvent.click(screen.getByRole("button",{name:"Послушать: casa"}));
  expect(speak.mock.lastCall![0]).toMatchObject({voice:joana,lang:"pt-PT"});
});
test("missing backup preserves existing settings and explains why", () => {
  voices=[joana]; render(<SpeechHelpButton/>);help();fireEvent.click(screen.getByRole("button",{name:"Включить запасной"}));
  expect(screen.getByRole("status")).toHaveTextContent("Запасной голос недоступен");
  expect(localStorage.getItem("tempo-card-speech-settings")).toBeNull();
});
test("cancel leaves voice unchanged and speaker no longer has a voice picker", async () => {
  render(<><SpeechHelpButton/><CardSpeechButton text="casa"/></>);help();fireEvent.click(screen.getByRole("button",{name:"Отмена"}));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  const button=screen.getByRole("button",{name:"Послушать: casa"});await waitFor(()=>expect(button).toBeEnabled());
  for(let i=0;i<3;i++){fireEvent.click(button);const u=speak.mock.lastCall![0];expect(u).toMatchObject({voice:joana,lang:"pt-PT",rate:1});act(()=>u.onend());}
  expect(cancel).not.toHaveBeenCalled();
});
