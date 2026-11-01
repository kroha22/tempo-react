// Card speech has one browser output. Do not reset an already idle system engine.
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;

export function startCardSpeech(synth: SpeechSynthesis, utterance: SpeechSynthesisUtterance) {
  if (activeAudio) { activeAudio.pause(); activeAudio = null; }
  if (activeUtterance) {
    activeUtterance = null;
    synth.cancel();
  }
  if (synth.paused) synth.resume();
  activeUtterance = utterance;
  synth.speak(utterance);
}

export function startCardAudio(audio: HTMLAudioElement) {
  if (activeUtterance) {
    activeUtterance = null;
    window.speechSynthesis?.cancel();
  }
  if (activeAudio) activeAudio.pause();
  activeAudio = audio;
  audio.currentTime = 0;
  audio.volume = 1;
  return audio.play();
}

export function finishCardAudio(audio: HTMLAudioElement) {
  if (activeAudio === audio) activeAudio = null;
}

export function stopCardAudio(audio: HTMLAudioElement) {
  audio.pause();
  finishCardAudio(audio);
}

export function finishCardSpeech(utterance: SpeechSynthesisUtterance) {
  if (activeUtterance === utterance) activeUtterance = null;
}

export function stopCardSpeech(synth: SpeechSynthesis, utterance: SpeechSynthesisUtterance) {
  if (activeUtterance !== utterance) return;
  activeUtterance = null;
  synth.cancel();
}
