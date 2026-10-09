"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cardSpeechLocales, chooseSpeechVoice, defaultSpeechSettings, speechLanguage, speechLocale, speechSettingsSnapshot, speechVoiceKey, subscribeSpeechSettings } from "../speech-settings";
import styles from "./card-speech.module.css";
import { finishCardSpeech, startCardSpeech, stopCardSpeech } from "../speech-playback";

export function CardSpeechButton({ text, label = "Послушать", disabled = false }: { text: string; label?: string; disabled?: boolean }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [catalogueStatus, setCatalogueStatus] = useState<"loading" | "ready" | "unsupported">("loading");
  const storedSettings = JSON.parse(useSyncExternalStore(subscribeSpeechSettings, speechSettingsSnapshot, () => defaultSpeechSettings)) as { language: string; voice: string };
  const settings = cardSpeechLocales.some((locale) => speechLanguage(locale) === speechLanguage(storedSettings.language)) ? storedSettings : JSON.parse(defaultSpeechSettings) as { language: string; voice: string };
  const voice = chooseSpeechVoice(voices, settings.language, settings.voice);
  const language = speechLanguage(settings.language);
  const voiceKey = voice ? speechVoiceKey(voice) : "";
  const playbackKey = `${text}|${language}|${voiceKey}`;
  const [speaking, setSpeaking] = useState("");
  const [message, setMessage] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      const timer = setTimeout(() => {
        setCatalogueStatus("unsupported");
        setMessage("Этот браузер не поддерживает озвучку.");
      }, 0);
      return () => clearTimeout(timer);
    }
    const synth = window.speechSynthesis;
    const timers: number[] = [];
    const refresh = (finalAttempt = false) => {
      const available = Array.from(new Map(synth.getVoices().map((item) => [speechVoiceKey(item), item])).values());
      setVoices(available);
      if (available.length || finalAttempt) setCatalogueStatus("ready");
      if (available.length) timers.forEach(window.clearTimeout);
    };
    // Some browsers populate voices late without reliably dispatching voiceschanged.
    [0, 100, 300, 1000, 3000].forEach((delay, index) => {
      timers.push(window.setTimeout(() => refresh(index === 4), delay));
    });
    const onVoicesChanged = () => refresh();
    synth.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      timers.forEach(window.clearTimeout);
      synth.removeEventListener("voiceschanged", onVoicesChanged);
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
  }, [text, language, voiceKey, disabled]);

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
    next.lang = speechLocale(currentVoice.lang);
    next.rate = 1;
    next.pitch = 1;
    next.volume = 1;
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

  return <div className={styles.control}>
    <button type="button" className={`${styles.button} ${styles.icon}`} disabled={disabled || catalogueStatus !== "ready" || !voice} aria-busy={speaking === playbackKey} title="Послушать" onClick={() => speak()} aria-label={`${label}: ${text}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4 6 8H3v8h3l5 4V4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>
    </button>
    <span className={styles.message} role="status">{message || (catalogueStatus === "loading" ? "Загружаем голоса устройства…" : !voice && "Голос недоступен. Нажмите значок помощи с озвучкой.")}</span>
  </div>;
}
