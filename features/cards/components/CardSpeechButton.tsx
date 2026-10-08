"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { chooseSpeechVoice, defaultSpeechSettings, saveSpeechSettings, speechLanguage, speechSettingsSnapshot, speechVoiceKey, subscribeSpeechSettings } from "../speech-settings";
import styles from "./card-speech.module.css";
import { finishCardSpeech, startCardSpeech, stopCardSpeech } from "../speech-playback";

export function CardSpeechButton({ text, label = "Послушать", disabled = false }: { text: string; label?: string; disabled?: boolean }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const settings = JSON.parse(useSyncExternalStore(subscribeSpeechSettings, speechSettingsSnapshot, () => defaultSpeechSettings)) as { language: string; voice: string };
  const voice = chooseSpeechVoice(voices, settings.language, settings.voice);
  const language = speechLanguage(settings.language);
  const languageGroup = language === "pt" || language.startsWith("pt-") ? "pt" : language;
  const voiceKey = voice ? speechVoiceKey(voice) : "";
  const playbackKey = `${text}|${language}|${voiceKey}`;
  const [speaking, setSpeaking] = useState("");
  const [message, setMessage] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      const timer = setTimeout(() => setMessage("Этот браузер не поддерживает озвучку."), 0);
      return () => clearTimeout(timer);
    }
    const synth = window.speechSynthesis;
    const refresh = () => {
      setVoices(Array.from(new Map(synth.getVoices().map((item) => [speechVoiceKey(item), item])).values()));
    };
    const timer = window.setTimeout(refresh, 0);
    synth.addEventListener("voiceschanged", refresh);
    return () => {
      window.clearTimeout(timer);
      synth.removeEventListener("voiceschanged", refresh);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (utterance.current) {
        // Invalidate callbacks before cancellation or moving to another card.
        const previous = utterance.current;
        utterance.current = null;
        stopCardSpeech(window.speechSynthesis, previous);
        setSpeaking("");
      }
    };
  }, [text, language, voiceKey]);

  function speak(spokenText = text) {
    const synth = window.speechSynthesis;
    const currentVoice = chooseSpeechVoice(synth.getVoices(), settings.language, settings.voice);
    if (!currentVoice) {
      setMessage("Выбранный голос недоступен. Выберите другой голос или язык.");
      return;
    }
    utterance.current = null;
    const next = new SpeechSynthesisUtterance(spokenText);
    next.voice = currentVoice;
    next.lang = currentVoice.lang.replaceAll("_", "-");
    next.rate = 0.9;
    utterance.current = next;
    setMessage("");
    setSpeaking(playbackKey);
    next.onend = () => {
      finishCardSpeech(next);
      if (utterance.current !== next) return;
      utterance.current = null;
      setSpeaking("");
    };
    next.onerror = (event) => {
      finishCardSpeech(next);
      if (utterance.current !== next) return;
      utterance.current = null;
      setSpeaking("");
      if (event.error !== "interrupted" && event.error !== "canceled") setMessage("Не удалось воспроизвести звук. Попробуйте ещё раз.");
    };
    try { startCardSpeech(synth, next); } catch {
      finishCardSpeech(next);
      utterance.current = null;
      setSpeaking("");
      setMessage("Не удалось воспроизвести звук. Попробуйте ещё раз.");
    }
  }

  const groupLanguage = (value: string) => value === "pt" || value.startsWith("pt-") ? "pt" : value;
  const languages = Array.from(new Set([languageGroup, ...voices.map((item) => groupLanguage(speechLanguage(item.lang)))])).sort((a, b) => a === "pt" ? -1 : b === "pt" ? 1 : a.localeCompare(b));
  const languageVoices = voices.filter((item) => groupLanguage(speechLanguage(item.lang)) === languageGroup);
  const displayedLanguage = voice ? speechLanguage(voice.lang) : language;
  function languageLabel(value: string) {
    try { return `${new Intl.DisplayNames(["ru"], { type: "language" }).of(value)} · ${value}`; } catch { return value; }
  }
  function changeSettings(nextLanguage: string, nextVoice: string) {
    setMessage("");
    saveSpeechSettings(nextLanguage, nextVoice);
  }

  return <div className={styles.control}>
    <button type="button" className={styles.button} disabled={disabled || !voice} onClick={() => speak()} aria-label={`${label}: ${text}`}>
      <span aria-hidden="true">🔊</span> {speaking === playbackKey ? "Послушать ещё раз" : label}
    </button>
    <details className={styles.settings}>
      <summary>Голос: {voice?.name ?? "не выбран"} · {displayedLanguage}</summary>
      <div className={styles.fields}>
        <label>Язык<select aria-label={`Язык озвучки: ${text}`} value={languageGroup} onChange={(event) => changeSettings(event.target.value, "")}>
          {languages.map((value) => <option key={value} value={value}>{languageLabel(value)}</option>)}
        </select></label>
        <label>Голос<select aria-label={`Голос озвучки: ${text}`} value={voiceKey} disabled={!languageVoices.length} onChange={(event) => changeSettings(languageGroup, event.target.value)}>
          {!voice && <option value="">{languageVoices.length ? "Выберите голос" : "Нет доступных голосов"}</option>}
          {languageVoices.map((item) => <option key={speechVoiceKey(item)} value={speechVoiceKey(item)}>{item.name}{languageGroup === "pt" ? ` — ${speechLanguage(item.lang) === "pt-pt" ? "Португалия" : speechLanguage(item.lang) === "pt-br" ? "Бразилия" : item.lang}` : ""}</option>)}
        </select></label>
      </div>
      <button type="button" className={styles.button} disabled={!voice} onClick={() => speak("Olá! Estou a falar português de Portugal.")}>Проверить голос</button>
      <p className={styles.message}>Если язык сбивается при повторном прослушивании, попробуйте голос с языком в скобках в названии, например Eddy. Вариант страны указан в списке.</p>
    </details>
    <span className={styles.message} role="status">{message || (!voice && "Нет доступного голоса для выбранного языка. Выберите голос в настройках озвучки.")}</span>
  </div>;
}
