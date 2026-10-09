"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { defaultSpeechSettings, saveSpeechSettings, speechLanguage, speechSettingsSnapshot, speechVoiceKey, subscribeSpeechSettings } from "../speech-settings";
import styles from "./card-speech.module.css";

export function SpeechHelpButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const settings = JSON.parse(useSyncExternalStore(subscribeSpeechSettings, speechSettingsSnapshot, () => defaultSpeechSettings)) as {language: string; voice: string};
  const backup = speechLanguage(settings.language) === "pt-br";
  function switchVoice() {
    const voice = (window.speechSynthesis?.getVoices() ?? []).find(item => speechLanguage(item.lang) === (backup ? "pt-pt" : "pt-br") && (backup ? /^joana$/i : /^grandpa(?:\s|$)/i).test(item.name));
    if (!voice) { setMessage(backup ? "Joana недоступна на этом устройстве. Текущий голос сохранён." : "Запасной голос недоступен на этом устройстве. Текущий голос сохранён."); return; }
    saveSpeechSettings(voice.lang, speechVoiceKey(voice));
    dialog.current?.close();
  }
  return <div className={styles.help}>
    <button type="button" className={styles.helpIcon} aria-label="Проблема с произношением" title={backup ? "Запасной голос · бразильский португальский" : "Проблема с произношением"} onClick={() => {setMessage(""); dialog.current?.showModal();}}>
      <svg aria-hidden="true" viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m12 4-6 4H3v8h3l6 4V4Z"/><path d="M16 8a6 6 0 0 1 0 8M23 5v8"/><circle cx="23" cy="18" r="1" fill="currentColor" stroke="none"/></svg>
    </button>
    <dialog ref={dialog} className={styles.settings} aria-label="Помощь с озвучкой" onClick={event => {if(event.target === event.currentTarget) dialog.current?.close();}}>
      <h2>{backup ? "Включён запасной голос" : "Голос звучит неправильно?"}</h2>
      <p>{backup ? "Сейчас используется бразильский вариант португальского. Можно вернуться к европейскому голосу Joana." : "Если голос звучит неправильно, попробуйте запасной. Доступен бразильский вариант португальского."}</p>
      <p className={styles.message} role="status">{message}</p>
      <div className={styles.actions}><button type="button" className={styles.button} onClick={switchVoice}>{backup ? "Вернуться к Joana" : "Включить запасной"}</button><button type="button" className={styles.button} onClick={() => dialog.current?.close()}>Отмена</button></div>
    </dialog>
  </div>;
}
