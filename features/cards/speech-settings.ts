export const defaultSpeechSettings = '{"language":"pt-PT","voice":""}';
const storageKey = "tempo-card-speech-settings";
const changeEvent = "tempo-card-speech-settings-changed";

export function speechSettingsSnapshot(): string {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value) {
      const parsed = JSON.parse(value);
      if (typeof parsed.language === "string" && typeof parsed.voice === "string") return migrateSpeechSettings(value);
    }
  } catch { /* Storage may be unavailable in a private browser. */ }
  return fallbackSettings;
}

export function migrateSpeechSettings(value: string): string {
  const settings = JSON.parse(value) as { language: string; voice: string };
  if (speechLanguage(settings.language) !== "pt") return value;
  // Resolve the former grouped locale once, preserving the user's chosen voice.
  const voiceLanguage = settings.voice.split("|")[0];
  return JSON.stringify({ language: /^pt-[a-z0-9-]+$/i.test(voiceLanguage) ? speechLocale(voiceLanguage) : "pt-PT", voice: settings.voice });
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
  const candidates = voices.filter((voice) => speechLanguage(voice.lang) === selectedLanguage);
  if (preferred) return candidates.find((voice) => speechVoiceKey(voice) === preferred);
  return (selectedLanguage === "pt-pt" ? candidates.find((voice) => voice.name.toLowerCase() === "joana") : undefined) ?? candidates[0];
}
