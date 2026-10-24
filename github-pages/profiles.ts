import { emptyPracticePlanProgress, parsePracticePlanProgress, type PracticePlanStorage } from "../features/practice/plan/model";
import { parseLegacyProgressPayload } from "../features/cards/progress-contract";
import type { LocalCardProgressStorage } from "../features/cards/api/progress";
import { practicePlanStorageKey } from "./practice-plan-storage";
import {parseProfileLearning} from "../features/practice/profile-learning";
import {childAvatars,type ChildAvatarId} from "../features/practice/child-avatars";

export type LocalProfile = {id:string;name:string;child:boolean;avatar?:ChildAvatarId};
type Registry = {version:1;activeId:string|null;profiles:LocalProfile[]};
export const profilesKey="tempo-react:github-pages:profiles:v1";
const legacyCardsKey="tempo-react:github-pages:card-progress";
const dataKey=(id:string)=>`tempo-react:github-pages:profile:${id}:v1`;
function readCards(value:unknown){
  if(!Array.isArray(value))throw new Error("Invalid card progress");
  return value.map(row=>{const parsed=parseLegacyProgressPayload(row);if(!parsed)throw new Error("Invalid card progress");return parsed;});
}
export function loadProfiles():Registry {
  const raw=localStorage.getItem(profilesKey);
  if(raw===null)return {version:1,activeId:null,profiles:[]};
  const value=JSON.parse(raw) as Registry;
  if(value?.profiles?.some(p=>p?.avatar!==undefined&&!childAvatars.some(avatar=>avatar.id===p.avatar)))throw new Error("Invalid avatar");
  if(value.version!==1||!Array.isArray(value.profiles)||value.profiles.length>100||!value.profiles.every(p=>p&&typeof p.id==="string"&&/^[a-zA-Z0-9-]{1,80}$/.test(p.id)&&typeof p.name==="string"&&p.name.trim().length>0&&p.name.length<=40&&typeof p.child==="boolean")||new Set(value.profiles.map(p=>p.id)).size!==value.profiles.length||!(value.activeId===null||value.profiles.some(p=>p.id===value.activeId)))throw new Error("Invalid profiles");
  return value;
}
export function hasLegacyProgress(){return localStorage.getItem(practicePlanStorageKey)!==null||localStorage.getItem(legacyCardsKey)!==null;}
export function selectProfile(id:string){const registry=loadProfiles();if(!registry.profiles.some(p=>p.id===id))throw new Error("Unknown profile");localStorage.setItem(profilesKey,JSON.stringify({...registry,activeId:id}));return registry.profiles.find(p=>p.id===id)!;}
export function createProfile(name:string,child:boolean,importLegacy:boolean,avatar?:ChildAvatarId):LocalProfile {
  const registry=loadProfiles(),clean=name.trim();
  if(!clean||clean.length>40||registry.profiles.length>=100)throw new Error("Invalid profile");
  if(avatar!==undefined&&!childAvatars.some(item=>item.id===avatar))throw new Error("Invalid avatar");
  const profile={id:crypto.randomUUID(),name:clean,child,...(avatar?{avatar}:{})};
  const plan=importLegacy?parsePracticePlanProgress(JSON.parse(localStorage.getItem(practicePlanStorageKey)??JSON.stringify(emptyPracticePlanProgress()))):emptyPracticePlanProgress();
  const cards=importLegacy?readCards(JSON.parse(localStorage.getItem(legacyCardsKey)??"[]")):[];
  // Copy first, register last. Legacy keys remain untouched, even if any write fails.
  localStorage.setItem(dataKey(profile.id),JSON.stringify({version:1,plan,cards}));
  localStorage.setItem(profilesKey,JSON.stringify({version:1,activeId:profile.id,profiles:[...registry.profiles,profile]}));
  return profile;
}
export function updateProfile(profile:LocalProfile){const registry=loadProfiles();if(!profile.name.trim()||profile.name.length>40||!registry.profiles.some(p=>p.id===profile.id))throw new Error("Invalid profile");localStorage.setItem(profilesKey,JSON.stringify({...registry,profiles:registry.profiles.map(p=>p.id===profile.id?{...profile,name:profile.name.trim()}:p)}));}
export function profileStores(id:string){
  function load(){const raw=localStorage.getItem(dataKey(id));if(raw===null)throw new Error("Missing profile data");const data=JSON.parse(raw);if(data?.version!==1)throw new Error("Invalid profile data");return {version:1,plan:parsePracticePlanProgress(data.plan),cards:readCards(data.cards),learning:parseProfileLearning(data.learning)};}
  const plan:PracticePlanStorage={load:()=>load().plan,save:next=>localStorage.setItem(dataKey(id),JSON.stringify({...load(),plan:next})),subscribe:listener=>{const handler=(event:StorageEvent)=>{if(event.key===dataKey(id)||event.key===null)listener();};window.addEventListener("storage",handler);return()=>window.removeEventListener("storage",handler);}};
  const cards:LocalCardProgressStorage={load:()=>load().cards,save:next=>{const data=load();const parsed=readCards([next])[0];localStorage.setItem(dataKey(id),JSON.stringify({...data,cards:[...data.cards.filter(row=>row.cardId!==parsed.cardId),parsed]}));return parsed;}};
  const learning={load:()=>load().learning,save:(next:ReturnType<typeof parseProfileLearning>)=>localStorage.setItem(dataKey(id),JSON.stringify({...load(),learning:parseProfileLearning(next)}))};
  return {plan,cards,learning};
}
