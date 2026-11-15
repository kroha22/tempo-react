"use client";
import {createContext,useContext,useState} from "react";
import {QuickWords} from "./QuickWords";
import {RelatedLearningNavigation} from "./RelatedLearningNavigation";
export const WordLearningReturn=createContext<(()=>void)|null>(null);

/** Local opening retains the parent lesson and its draft answers underneath. */
export function WordLearningEntry({sources,label="Учить слова"}:{sources:readonly string[];label?:string}){
  const [open,setOpen]=useState(false);
  return <><button type="button" onClick={()=>setOpen(true)}>{label}</button>{open&&<QuickWords sourceIds={sources} onBack={()=>setOpen(false)}/>}</>;
}
export function WordLearningRoute({sources,onBack}:{sources?:readonly string[];onBack?:()=>void}){
  const navigate=useContext(RelatedLearningNavigation);
  const returnToSource=useContext(WordLearningReturn);
  return <QuickWords sourceIds={sources} onBack={onBack??returnToSource??(()=>{if(navigate)navigate("/learning/plan");else window.location.assign("/learning/plan");})}/>;
}
