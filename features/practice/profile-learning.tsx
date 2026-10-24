"use client";
import {createContext,useContext} from "react";
import {feelingWords} from "../content/feelings-lesson";
import {parseActivityResults,type ActivityResult} from "./learning-rewards";
export type TopicPhase="words"|"examples"|"practice";
export type ProfileLearning={version:1;lastTopicId:string|null;activities?:Record<string,ActivityResult>;feelings:{viewed:string[];practised:boolean;repeated:boolean;phase:TopicPhase}};
export const emptyProfileLearning=():ProfileLearning=>({version:1,lastTopicId:null,feelings:{viewed:[],practised:false,repeated:false,phase:"words"}});
export function parseProfileLearning(value:unknown):ProfileLearning{
  if(value===undefined)return emptyProfileLearning();
  const data=value as ProfileLearning;
  const allowed=new Set(feelingWords.map(word=>word.id));
  if(!data||data.version!==1||!(data.lastTopicId===null||typeof data.lastTopicId==="string"&&/^[a-zA-Z0-9:-]{1,100}$/.test(data.lastTopicId))||!data.feelings||!Array.isArray(data.feelings.viewed)||data.feelings.viewed.length>6||!data.feelings.viewed.every(id=>allowed.has(id))||new Set(data.feelings.viewed).size!==data.feelings.viewed.length||typeof data.feelings.practised!=="boolean"||typeof data.feelings.repeated!=="boolean"||!["words","examples","practice"].includes(data.feelings.phase))throw new Error("Invalid profile learning");
  return {version:1,lastTopicId:data.lastTopicId,feelings:{...data.feelings},activities:parseActivityResults(data.activities)};
}
type LearningContext={profile:{id:string;child:boolean};learning:ProfileLearning;savingError:boolean;openAlbum?:()=>void;albumOpen?:boolean;toggleAlbum?:()=>void;update:(change:(current:ProfileLearning)=>ProfileLearning)=>boolean};
export const ProfileLearningContext=createContext<LearningContext|null>(null);
export const useProfileLearning=()=>useContext(ProfileLearningContext);
export function feelingsRewards(data:ProfileLearning){const words=data.feelings.viewed.length===6,practice=words&&data.feelings.practised;return [words,practice,practice&&data.feelings.repeated];}
