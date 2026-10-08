export const defaultSpeechSettings = '{"language":"pt-PT","voice":""}';
const storageKey = "tempo-card-speech-settings";
const changeEvent = "tempo-card-speech-settings-changed";

export function speechSettingsSnapshot(): string {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value) {
      const parsed = JSON.parse(value);
      if (typeof parsed.language === "string" && typeof parsed.voice === "string") return value;
    }
  } catch { /* Storage may be unavailable in a private browser. */ }
  return fallbackSettings;
}

let fallbackSettings = defaultSpeechSettings;

export function subscribeSpeechSettings(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveSpeechSettings(language: string, voice: string) {
  fallbackSettings = JSON.stringify({ language, voice });
  try { window.localStorage.setItem(storageKey, fallbackSettings); } catch { /* Keep the preference for this session. */ }
  window.dispatchEvent(new Event(changeEvent));
}

export function speechLanguage(language: string): string {
  return language.replaceAll("_", "-").trim().toLowerCase();
}

export function speechLocale(language: string): string {
  const normalized = language.replaceAll("_", "-").trim();
  try { return Intl.getCanonicalLocales(normalized)[0] ?? normalized; } catch { return normalized; }
}

export function speechVoiceKey(voice: Pick<SpeechSynthesisVoice, "lang" | "name" | "voiceURI">): string {
  return `${speechLanguage(voice.lang)}|${voice.voiceURI}|${voice.name}`;
}

export function chooseSpeechVoice<T extends Pick<SpeechSynthesisVoice, "lang" | "name" | "voiceURI">>(voices: T[], language: string, preferred: string): T | undefined {
  const selectedLanguage = speechLanguage(language);
  const candidates = voices.filter((voice) => selectedLanguage === "pt" ? speechLanguage(voice.lang).startsWith("pt-") : speechLanguage(voice.lang) === selectedLanguage);
  if (preferred) return candidates.find((voice) => speechVoiceKey(voice) === preferred);
  const defaults = selectedLanguage === "pt" ? candidates.filter((voice) => speechLanguage(voice.lang) === "pt-pt") : candidates;
  return defaults.find((voice) => voice.name.toLowerCase() === "joana") ?? defaults[0];
}
