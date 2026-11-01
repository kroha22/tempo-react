import { useMemo, useRef,useState, type ReactNode } from "react";
import { createProfile, hasLegacyProgress, loadProfiles, profileStores, selectProfile, updateProfile, type LocalProfile } from "./profiles";
import { PracticePlanProvider, usePracticePlan } from "../features/practice/plan/PracticePlanContext";
import { LocalCardProgress } from "../features/cards/query/LocalCardProgress";
import { SessionQueryBoundary } from "../shared/query/SessionQueryBoundary";
import "./profiles.css";
import {ChildAvatar,ChildAlbum} from "../features/practice/ChildProfile";
import {rewardAlbum} from "../features/practice/learning-rewards";
import type {ChildAvatarId} from "../features/practice/child-avatars";
import {ProfileLearningContext,useProfileLearning,type ProfileLearning} from "../features/practice/profile-learning";
import {isPracticeStepComplete,practicePlanSteps,nextPracticeStep} from "../features/practice/plan/model";

export function ProfileManager({children}:{children:(profile:LocalProfile)=>ReactNode}) {
  const [state,setState]=useState(()=>{try{const registry=loadProfiles();let profile=registry.profiles.find(p=>p.id===registry.activeId)??null;if(profile){try{profileStores(profile.id).learning.load();}catch{profile=null;}}return {profile,error:""};}catch{return {profile:null,error:"Не удалось прочитать профили. Данные сохранены. Попробуй перезагрузить страницу."};}});
  const [manage,setManage]=useState(false);
  const [revision,setRevision]=useState(0);
  function choose(profile:LocalProfile){setState({profile,error:""});setRevision(n=>n+1);setManage(false);window.location.hash="";const url=new URL(window.location.href);if(profile.child)url.searchParams.set("mode","child");else url.searchParams.delete("mode");window.history.replaceState(null,"",url.pathname+url.search);window.scrollTo(0,0);}
  if(state.error)return <section className="profile-panel" role="alert"><p>{state.error}</p><button onClick={()=>window.location.reload()}>Перезагрузить</button></section>;
  if(!state.profile)return <ProfilePicker onChoose={choose}/>;
  return <ProfileSession key={`${state.profile.id}:${revision}`} profile={state.profile}>
    <ProfileControls profile={state.profile} onManage={()=>setManage(true)}/>
    {manage&&<ProfilePicker current={state.profile} onChoose={choose} onCancel={()=>setManage(false)}/>}
    <div hidden={manage}>{children(state.profile)}</div>
  </ProfileSession>;
}
function ProfileSession({profile,children}:{profile:LocalProfile;children:ReactNode}) {
  const stores=useMemo(()=>profileStores(profile.id),[profile.id]);
  const [learning,setLearning]=useState(()=>stores.learning.load()),[error,setError]=useState(false);
  const pending=useRef<ProfileLearning|null>(null);
  const [album,setAlbum]=useState(false);
  function save(next:ProfileLearning){try{stores.learning.save(next);setLearning(next);pending.current=null;setError(false);return true;}catch{pending.current=next;setError(true);return false;}}
  return <SessionQueryBoundary scopeKey={`local-profile:${profile.id}`}><ProfileLearningContext value={{profile,learning,savingError:error,albumOpen:album,openAlbum:()=>{setAlbum(true);requestAnimationFrame(()=>document.getElementById("child-album-title")?.focus());},toggleAlbum:()=>setAlbum(value=>!value),update:change=>{try{return save(change(pending.current??stores.learning.load()));}catch{setError(true);return false;}}}}>{error&&<aside role="alert">Не удалось сохранить результаты темы. Оставь страницу открытой.<button type="button" onClick={()=>{if(pending.current)save(pending.current);}}>Сохранить результаты ещё раз</button></aside>}<LocalCardProgress storage={stores.cards}><PracticePlanProvider storage={stores.plan}>{children}</PracticePlanProvider></LocalCardProgress></ProfileLearningContext></SessionQueryBoundary>;
}
function ProfileControls({profile,onManage}:{profile:LocalProfile;onManage:()=>void}) {
  const plan=usePracticePlan();
  const learner=useProfileLearning();
  const album=!!learner?.albumOpen;
  return <><div className="profile-bar" data-child={profile.child}><span>На этом устройстве</span>{profile.child&&<button type="button" aria-expanded={album} aria-controls="child-award-album" onClick={learner?.toggleAlbum}>Мои награды</button>}<button type="button" disabled={!!plan?.error||learner?.savingError} onClick={onManage} aria-label="Сменить профиль или настройки">{profile.child&&<ChildAvatar id={profile.avatar}/>} {profile.name} · {profile.child?"Ребёнок":"Взрослый"} ▾</button></div>{profile.child&&album&&<div id="child-award-album"><ChildAlbum avatar={profile.avatar}/></div>}</>;
}
function ProfilePicker({current,onChoose,onCancel}:{current?:LocalProfile;onChoose:(profile:LocalProfile)=>void;onCancel?:()=>void}) {
  const [registry,setRegistry]=useState(()=>loadProfiles());
  const [name,setName]=useState(""),[child,setChild]=useState(true),[transfer,setTransfer]=useState(false),[error,setError]=useState("");
  const [editing,setEditing]=useState(false);
  const [avatar,setAvatar]=useState<ChildAvatarId>("boy");
  const [legacy]=useState(()=>hasLegacyProgress());
  function run(action:()=>void){try{action();}catch{setError("Не удалось сохранить профиль. Проверь доступ к хранилищу браузера и попробуй снова. Старые результаты не изменены.");}}
  return <section className="profile-panel" aria-label="Профили занятий"><header><span className="tempo-kicker">Tempo · португальский</span><h1 tabIndex={-1}>{registry.profiles.length?"Кто будет заниматься?":"Давай познакомимся"}</h1><p>У каждого — свои занятия, карточки и награды.</p></header>
    {onCancel&&<button type="button" onClick={onCancel}>‹ Вернуться к занятию</button>}
    <div className="profile-list">{registry.profiles.map(profile=>{
      let summary;try{const stores=profileStores(profile.id),progress=stores.plan.load(),learning=stores.learning.load(),earned=rewardAlbum(learning,progress).filter(entry=>entry.earned);summary={done:practicePlanSteps.filter(step=>isPracticeStepComplete(progress,step)).length,rewards:rewardAlbum(learning,progress).filter(entry=>entry.earned).length,badges:earned.slice(-3).map(entry=>entry.title),next:learning.lastTopicId?learning.lastTopicId==="topic:people"?"Как я себя чувствую":"Тема со словами":nextPracticeStep(progress).title};}catch{return <article key={profile.id}><strong>{profile.name}</strong><p role="alert">Не удалось прочитать результаты. Данные не изменены.</p></article>;}
      return <article key={profile.id} data-child={profile.child} aria-label={`Профиль ${profile.name}`}><div className="profile-avatar">{profile.child?<ChildAvatar id={profile.avatar}/>:"❋"}</div><strong>{profile.name}</strong><span>{profile.child?"Детская подача":"Взрослая подача"}</span><small>Начальный этап · {summary.done} из {practicePlanSteps.length} занятий</small><progress aria-label={`Прогресс ${profile.name}`} value={summary.done} max={practicePlanSteps.length}/><span className="profile-awards">{profile.child?"🏅":"✓"} Награды: {summary.rewards}</span><small>{summary.badges.length?summary.badges.join(" · "):"Первые награды ещё впереди"}</small><small>Продолжить: {summary.next}</small><button type="button" aria-current={profile.id===current?.id?"true":undefined} aria-label={`Продолжить — ${profile.name}`} onClick={()=>run(()=>onChoose(selectProfile(profile.id)))}>Продолжить →</button></article>;
    })}</div>
    {current&&<button type="button" onClick={()=>{setEditing(true);setName(current.name);setChild(current.child);setAvatar(current.avatar??"boy");setError("");}}>Изменить имя или оформление</button>}
    <form onSubmit={event=>{event.preventDefault();run(()=>{if(editing&&current){const next={...current,name:name.trim(),child,avatar};updateProfile(next);onChoose(next);}else onChoose(createProfile(name,child,transfer,avatar));setRegistry(loadProfiles());});}}>
      <h2>{editing?"Настройки профиля":registry.profiles.length?"Добавить участника":"Первый профиль"}</h2>
      <label>Имя<input autoComplete="off" required maxLength={40} value={name} onChange={event=>setName(event.target.value)}/></label>
      <fieldset><legend>Оформление занятий</legend><label><input type="radio" name="presentation" checked={child} onChange={()=>setChild(true)}/> Ребёнок</label><label><input type="radio" name="presentation" checked={!child} onChange={()=>setChild(false)}/> Взрослый</label></fieldset>
      <small>Содержание общее. Смена оформления сохраняет твой прогресс.</small>
      {legacy&&!editing&&<label className="profile-transfer"><input type="checkbox" checked={transfer} onChange={event=>setTransfer(event.target.checked)}/> Скопировать прежние результаты в этот профиль<small>Исходные результаты останутся сохранены отдельно. Можно перенести их и в новый профиль позже.</small></label>}
      {error&&<p role="alert">{error}</p>}
      <button type="submit" className="profile-primary" disabled={!name.trim()}>{editing?"Сохранить настройки":"Создать профиль и начать"}</button>
      {editing&&<button type="button" onClick={()=>{setEditing(false);setName("");}}>Добавить другого участника</button>}
    </form><p className="profile-footnote">Профили сохраняются только в этом браузере. На другом устройстве они не появятся. Это не защищённые паролем аккаунты.</p>
  </section>;
}
