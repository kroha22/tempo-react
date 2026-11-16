"use client";
import {TestPreparation} from "./TestPreparation";
/** Route adapter only: the existing reading lesson and progress owners are unchanged. */
export function ReadingLessons({onBack}:{onBack:()=>void}){
  return <TestPreparation reading initialUnitId={null} onUnitChange={()=>{}} onBack={onBack} onOpen={()=>{}}/>;
}
