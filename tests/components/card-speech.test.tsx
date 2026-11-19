import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CardSpeechButton } from "@/features/cards/components/CardSpeechButton";
import { SpeechHelpButton } from "@/features/cards/components/SpeechHelpButton";
const joana = { name: "Joana", lang: "pt-PT", voiceURI: "joana" };
const grandpa = { name: "Grandpa (Portuguese (Brazil))", lang: "pt-BR", voiceURI: "grandpa" };
const speak = vi.fn();
const cancel = vi.fn();
let voiceEvents: EventTarget;
let voices = [joana, grandpa];
beforeEach(() => {
  voices = [joana, grandpa];
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  localStorage.clear(); speak.mockClear(); cancel.mockClear();
  voiceEvents = new EventTarget();
  vi.stubGlobal("speechSynthesis", Object.assign(voiceEvents, {getVoices: () => voices, speak, cancel}));
  vi.stubGlobal("SpeechSynthesisUtterance", class {text: string; constructor(text: string) {this.text = text;}});
});
function help(){fireEvent.click(screen.getByRole("button", {name: "Проблема с произношением"}));}
test("backup is shared, persisted and reversible without playing or flipping", () => {
  render(<><SpeechHelpButton/><CardSpeechButton text="casa"/><CardSpeechButton text="escola"/></>);
  act(() => {voiceEvents.dispatchEvent(new Event("voiceschanged"));});
  expect(screen.getByRole("button", {name:"Послушать: casa"})).toBeEnabled();
  help(); fireEvent.click(screen.getByRole("button", {name:"Включить запасной"}));
  expect(speak).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem("tempo-card-speech-settings")!)).toEqual({language:"pt-BR",voice:"pt-br|grandpa|Grandpa (Portuguese (Brazil))"});
  for(const text of ["casa","escola"]){fireEvent.click(screen.getByRole("button",{name:`Послушать: ${text}`}));const u=speak.mock.lastCall![0];expect(u).toMatchObject({voice:grandpa,lang:"pt-BR",rate:1,text});act(()=>u.onend());}
  help(); fireEvent.click(screen.getByRole("button",{name:"Вернуться к Joana"}));
  fireEvent.click(screen.getByRole("button",{name:"Послушать: casa"}));
  expect(speak.mock.lastCall![0]).toMatchObject({voice:joana,lang:"pt-PT"});
  // Finish the final mocked utterance before the next test replaces the browser engine.
  act(()=>speak.mock.lastCall![0].onend());
});
test("missing backup preserves existing settings and explains why", () => {
  voices=[joana]; render(<SpeechHelpButton/>);help();fireEvent.click(screen.getByRole("button",{name:"Включить запасной"}));
  expect(screen.getByRole("status")).toHaveTextContent("Запасной голос недоступен");
  expect(localStorage.getItem("tempo-card-speech-settings")).toBeNull();
});
test("cancel leaves voice unchanged and speaker no longer has a voice picker", () => {
  render(<><SpeechHelpButton/><CardSpeechButton text="casa"/></>);
  act(() => {voiceEvents.dispatchEvent(new Event("voiceschanged"));});
  help();fireEvent.click(screen.getByRole("button",{name:"Отмена"}));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  const button=screen.getByRole("button",{name:"Послушать: casa"});expect(button).toBeEnabled();
  for(let i=0;i<3;i++){
    fireEvent.click(button);
    expect(speak).toHaveBeenCalledTimes(i+1);
    const utterance=speak.mock.lastCall![0];
    expect(utterance).toMatchObject({voice:joana,lang:"pt-PT",rate:1});
    act(()=>utterance.onend());
    expect(button).toHaveAttribute("aria-busy","false");
  }
  expect(cancel).not.toHaveBeenCalled();
});
