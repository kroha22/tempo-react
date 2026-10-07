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
  return language.replaceAll("_", "-").toLowerCase();
}

export function speechVoiceKey(voice: Pick<SpeechSynthesisVoice, "lang" | "name" | "voiceURI">): string {
  return `${speechLanguage(voice.lang)}|${voice.voiceURI}|${voice.name}`;
}

export function chooseSpeechVoice<T extends Pick<SpeechSynthesisVoice, "lang" | "name" | "voiceURI">>(voices: T[], language: string, preferred: string): T | undefined {
  const candidates = voices.filter((voice) => speechLanguage(voice.lang) === speechLanguage(language));
  if (preferred) return candidates.find((voice) => speechVoiceKey(voice) === preferred);
  return candidates.find((voice) => voice.name.toLowerCase() === "joana") ?? candidates[0];
}

/** Safari supports an explicit language span in SSML; other engines receive plain text. */
export function cardSpeechText(text: string, language: string, userAgent: string): string {
  if (!/AppleWebKit/i.test(userAgent) || /Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(userAgent)) return text;
  const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
  return `<speak xmlns="http://www.w3.org/2001/10/synthesis" version="1.0"><lang xml:lang="${escapeXml(language)}">${escapeXml(text)}</lang></speak>`;
}
