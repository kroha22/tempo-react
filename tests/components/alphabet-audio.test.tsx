import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {expect,it,vi} from "vitest";
import {AlphabetLetter} from "@/features/practice/AlphabetLetter";
import {AlphabetSounds,PreparationPhonics} from "@/features/practice/PreparationPhonics";
import {startCardSpeech,finishCardSpeech} from "@/features/cards/speech-playback";

it("replays the normalized letter asset and coordinates with other speech",async()=>{
  const clips:{src:string;volume:number;currentTime:number;play:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>}[]=[];
  vi.stubGlobal("Audio",class{
    volume=0;currentTime=8;play=vi.fn().mockResolvedValue(undefined);pause=vi.fn();
    constructor(public src:string){clips.push(this);}
  });
  const synth={cancel:vi.fn(),speak:vi.fn(),paused:false} as unknown as SpeechSynthesis;
  vi.stubGlobal("speechSynthesis",synth);
  const utterance={} as SpeechSynthesisUtterance;
  startCardSpeech(synth,utterance);
  const {unmount}=render(<><AlphabetLetter letter="A" name="á"/><AlphabetLetter letter="H" name="agá"/></>);
  fireEvent.click(screen.getByRole("button",{name:"Буква A: á"}));
  expect(synth.cancel).toHaveBeenCalledOnce();
  expect(clips[0]).toMatchObject({src:"/audio/alphabet/pt-PT/a.wav",volume:1,currentTime:0});
  clips[0].currentTime=1;
  fireEvent.click(screen.getByRole("button",{name:"Буква A: á"}));
  expect(clips).toHaveLength(1);expect(clips[0].play).toHaveBeenCalledTimes(2);expect(clips[0].currentTime).toBe(0);
  fireEvent.click(screen.getByRole("button",{name:"Буква H: agá"}));
  expect(clips[0].pause).toHaveBeenCalled();expect(clips[1].src).toContain("/h.wav");
  startCardSpeech(synth,utterance);expect(clips[1].pause).toHaveBeenCalled();finishCardSpeech(utterance);
  unmount();
});

it("reports an unavailable clip instead of silently using quiet synthesis",async()=>{
  vi.stubGlobal("Audio",class{play=vi.fn().mockRejectedValue(new Error("missing"));pause=vi.fn();});
  render(<AlphabetLetter letter="A" name="á"/>);
  fireEvent.click(screen.getByRole("button",{name:"Буква A: á"}));
  await waitFor(()=>expect(screen.getByRole("status")).toHaveTextContent("Не удалось загрузить звук"));
});

it("colors vowel/consonant references but does not reveal practice answers early",()=>{
  const {unmount}=render(<AlphabetSounds/>);
  expect(screen.getByRole("button",{name:"Буква A: á"}).parentElement).toHaveAttribute("data-family","vowel");
  expect(screen.getByRole("button",{name:"Буква B: bê"}).parentElement).toHaveAttribute("data-family","consonant");
  unmount();render(<PreparationPhonics id="letters"/>);
  expect(screen.getByRole("button",{name:"A a"})).not.toHaveAttribute("data-family");
  fireEvent.click(screen.getByRole("button",{name:"Verificar"}));
  expect(screen.getByRole("button",{name:"A a"})).toHaveAttribute("data-family","vowel");
  expect(screen.getByRole("button",{name:"B b"})).toHaveAttribute("data-family","consonant");
});
