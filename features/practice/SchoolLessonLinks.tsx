"use client";
import {preparationUnits} from "../content/test-preparation";
import type {SchoolLessonSection} from "../content/permanent-preparation-lessons";

export function SchoolLessonLinks({section,onOpen}:{section?:SchoolLessonSection;onOpen:(id:string)=>void}){
  if(!section)return null;
  return <section aria-label="Постоянные уроки темы"><h2>Уроки по теме</h2><div className="vocabulary-modes">{section.unitIds.map(id=>{
    const unit=preparationUnits.find(unit=>unit.id===id)!;
    return <button type="button" key={id} onClick={()=>onOpen(id)}><span lang="pt-PT">{unit.title[0]}</span><span> · {unit.title[1]}</span></button>;
  })}</div></section>;
}
