"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { applyPracticePlanAction, emptyPracticePlanProgress, mergePracticePlanProgress, practicePlanSteps, type PracticePlanAction, type PracticePlanProgress, type PracticePlanStorage } from "./model";

type PlanContext = {progress:PracticePlanProgress;error:string|null;retry:()=>void;visit:(id:string)=>void;complete:(id:string,needsReview:boolean)=>void;completeWords:(ids:readonly string[],needsReview:boolean)=>void};
const Context=createContext<PlanContext|null>(null);
export const usePracticePlan = ()=>useContext(Context);

export function PracticePlanProvider({storage,children}:{storage:PracticePlanStorage;children:ReactNode}) {
  const [state,setState]=useState(()=>{try{return {progress:storage.load(),error:null as string|null};}catch{return {progress:emptyPracticePlanProgress(),error:"Не удалось прочитать сохранённый план. Попробуй ещё раз. Сохранённые данные не изменены."};}});
  const [pending,setPending]=useState<PracticePlanAction[]>([]);
  useEffect(()=>storage.subscribe?.(()=>{try{const saved=storage.load();setState(old=>({progress:mergePracticePlanProgress(old.progress,saved),error:null}));}catch{setState(old=>({...old,error:"Не удалось прочитать сохранённый план. Попробуй ещё раз."}));}}),[storage]);
  function persist(actions:PracticePlanAction[]) {
    try {
      let next=mergePracticePlanProgress(state.progress,storage.load());
      for(const action of actions)next=applyPracticePlanAction(next,action);
      if(actions.length)storage.save(next);
      setState({progress:next,error:null});setPending([]);
    }catch{
      setPending(actions);setState(old=>({...old,error:"Не удалось сохранить прогресс. Оставь страницу открытой и нажми «Сохранить ещё раз»."}));
    }
  }
  function complete(id:string,needsReview:boolean){persist([...pending,{type:"complete",stepId:id,needsReview}]);}
  return <Context value={{progress:state.progress,error:state.error,retry:()=>persist(pending),visit:id=>persist([...pending,{type:"visit",stepId:id}]),complete,completeWords:(ids,needsReview)=>{
    const completed=new Set(ids);
    const actions:PracticePlanAction[]=practicePlanSteps.filter(step=>step.kind==="words"&&step.wordIds.every(id=>completed.has(id))).map(step=>({type:"complete",stepId:step.id,needsReview}));
    if(actions.length)persist([...pending,...actions]);
  }}}>{state.error&&<aside role="alert"><p>{state.error}</p><button type="button" onClick={()=>persist(pending)}>Сохранить ещё раз</button></aside>}{children}</Context>;
}
