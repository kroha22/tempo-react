"use client";
import {useEffect,useId,useRef,useState} from "react";
import {publicAssetUrl} from "../../shared/public-asset";
import {finishCardAudio,startCardAudio,stopCardAudio} from "../cards/speech-playback";

export function AlphabetLetter({letter,name}:{letter:string;name:string}){
  const descriptionId=useId();
  const audio=useRef<HTMLAudioElement|null>(null);
  const [error,setError]=useState(false);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>()=>{if(audio.current){audio.current.onended=null;audio.current.onerror=null;audio.current.onplaying=null;audio.current.onpause=null;stopCardAudio(audio.current);}},[]);
  function createClip(){
    const clip=new Audio(publicAssetUrl(`/audio/alphabet/pt-PT/${letter.toLowerCase()}.wav`));
    clip.onplaying=()=>setPlaying(true);
    clip.onpause=()=>setPlaying(false);
    clip.onended=()=>{finishCardAudio(clip);setPlaying(false);};
    clip.onerror=()=>{finishCardAudio(clip);setPlaying(false);setError(true);};
    return clip;
  }
  function play(){
    setError(false);
    const clip=audio.current??createClip();
    audio.current=clip;
    void startCardAudio(clip).catch(error=>{finishCardAudio(clip);if(error?.name!=="AbortError"){setPlaying(false);setError(true);}});
  }
  return <><button type="button" aria-label={`Буква ${letter}: ${name}`} aria-describedby={descriptionId} aria-busy={playing} onClick={play}><span>{letter} {letter.toLowerCase()}</span></button><span id={descriptionId} hidden>{"AEIOU".includes(letter)?"Vogal — гласная буква":"Consoante — согласная буква"}</span><small lang="pt-PT">{name}</small>{error&&<small role="status">Не удалось загрузить звук. Нажми ещё раз.</small>}</>;
}
