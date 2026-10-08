// Card speech has one browser output. Do not reset an already idle system engine.
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function startCardSpeech(synth: SpeechSynthesis, utterance: SpeechSynthesisUtterance) {
  if (activeUtterance) {
    activeUtterance = null;
    synth.cancel();
  }
  activeUtterance = utterance;
  synth.speak(utterance);
}

export function finishCardSpeech(utterance: SpeechSynthesisUtterance) {
  if (activeUtterance === utterance) activeUtterance = null;
}

export function stopCardSpeech(synth: SpeechSynthesis, utterance: SpeechSynthesisUtterance) {
  if (activeUtterance !== utterance) return;
  activeUtterance = null;
  synth.cancel();
}
