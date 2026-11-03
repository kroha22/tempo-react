import { useEffect, useState, type ReactNode } from "react";
import { activateLocalTransport } from "../shared/http/local-transport";
import { openLearningStore, type LearningStore } from "./local-learning-store";
import { createLocalLearningApi } from "./local-learning-api";
import { exportProfile, importProfile, parseBackup, recoverImport, type ProfileBackup } from "./local-backup";
import type { LocalProfile } from "./profiles";

export function LocalLearningBoundary({profile,children}:{profile:LocalProfile;children:ReactNode}){
  const [store,setStore]=useState<LearningStore|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let live=true,opened:LearningStore|undefined,release:(()=>void)|undefined;
    void openLearningStore(profile.id).then(async next=>{
      opened=next;
      if(!live){next.close();return;}
      await recoverImport(profile.id,next);
      await next.read(); // A corrupt record must never be replaced by an empty document.
      if(!live){next.close();return;}
      release=activateLocalTransport(createLocalLearningApi(next));setStore(next);
      void navigator.storage?.persist?.().catch(()=>false);
    }).catch(()=>{if(live)setError(true);});
    return()=>{live=false;release?.();opened?.close();};
  },[profile.id,retry]);
  if(error)return <section className="profile-panel" role="alert"><h1>Не удалось открыть сохранения</h1><p>Данные не удалены. Проверьте свободное место и доступ к хранилищу браузера. Если Tempo открыт в других вкладках, закройте их.</p><button onClick={()=>{setError(false);setRetry(n=>n+1);}}>Повторить</button></section>;
  if(!store)return <p role="status">Открываем сохранения профиля…</p>;
  return <><BackupControls profile={profile} store={store}/>{children}</>;
}
function BackupControls({profile,store}:{profile:LocalProfile;store:LearningStore}){
  const [file,setFile]=useState<ProfileBackup|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  async function download(){
    setBusy(true);setMessage("");
    try{
      const backup=await exportProfile(profile,store);
      const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:"application/json"}));
      const a=document.createElement("a");a.href=url;a.download=`tempo-${profile.id}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
      setMessage("Файл подготовлен. Сохраните его в удобное место.");
    }catch{setMessage("Не удалось подготовить копию. Сохранения не изменены.");}finally{setBusy(false);}
  }
  async function restore(){
    if(!file)return;setBusy(true);setMessage("");
    try{await importProfile(profile.id,store,file);window.location.reload();}
    catch{setMessage("Импорт не завершён. Исходный файл и текущие данные сохранены. Освободите место и повторите; незавершённый импорт также продолжится при открытии профиля.");setBusy(false);}
  }
  return <details className="profile-panel local-backup"><summary>Сохранения и резервная копия</summary><p>Карточки, интервалы повторения и результаты сохраняются автоматически на этом устройстве. Скачивайте копию после занятий: очистка браузера может удалить локальные данные.</p><p>Копия содержит только профиль «{profile.name}». Для другого устройства создайте или выберите профиль и импортируйте файл.</p>
    <button disabled={busy} onClick={()=>void download()}>Скачать JSON</button>
    <label>Открыть резервную копию<input type="file" accept=".json,application/json" disabled={busy} onChange={event=>{const input=event.currentTarget,selected=input.files?.[0];input.value="";setFile(null);setMessage("");if(!selected)return;if(selected.size>10*1024*1024){setMessage("Файл больше 10 МБ.");return;}setBusy(true);void selected.text().then(text=>setFile(parseBackup(text))).catch(()=>setMessage("Файл повреждён или имеет неподдерживаемый формат. Данные не изменены.")).finally(()=>setBusy(false));}}/></label>
    {file&&<section aria-label="Проверка резервной копии"><p>Профиль в файле: {file.profile.name}. Дата: {new Date(file.exportedAt).toLocaleDateString("ru")}. Карточек: {file.learning.items.length + file.browser.cards.length}; уроков: {file.learning.progress.length}.</p><p>Объединить с «{profile.name}»: карточки и источники добавятся без дублей, для SRS Gramática Ativa выберется более свежая оценка. При совпадении старых карточек сохранятся текущие интервалы. Завершённые уроки сохранятся.</p><button disabled={busy} onClick={()=>void restore()}>Объединить и восстановить</button><button disabled={busy} onClick={()=>setFile(null)}>Отмена</button></section>}
    {message&&<p role="status">{message}</p>}
  </details>;
}
