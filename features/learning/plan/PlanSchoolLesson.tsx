"use client";
import {useContext,useEffect,useRef,useState} from "react";
import {RelatedLearningNavigation} from "../../practice/RelatedLearningNavigation";
import {preparationUnits,type PrepTarget} from "../../content/test-preparation";
import {preparationWords} from "../../content/preparation-words";
import {TestPreparation} from "../../practice/TestPreparation";
import {VocabularyStudy} from "../../practice/VocabularyStudy";
import {VocabularyCards} from "../../practice/VocabularyCards";
import {PreparationWords} from "../../practice/PreparationWords";
import {LegacyLessonLink} from "../../practice/LegacyLessonLink";
import styles from "./GeneralPlan.module.css";
export function PlanSchoolLesson({unitId,wordsOnly=false}:{unitId?:string;wordsOnly?:boolean}){
  const navigate=useContext(RelatedLearningNavigation);
  const unit=preparationUnits.find(row=>row.id===unitId),[words,setWords]=useState(wordsOnly),[games,setGames]=useState(false),[related,setRelated]=useState<PrepTarget|null>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(words){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start",behavior:"instant"});}},[words,unitId]);
  if(!unit)return <section className={styles.plan}><h1>Урок не найден</h1><LegacyLessonLink href="/learning/plan">К общему плану →</LegacyLessonLink></section>;
  return <section className={styles.plan} aria-label={`Урок: ${unit.title[1]}`}><LegacyLessonLink href={wordsOnly?"/learning/plan/words":"/learning/plan"}>{wordsOnly?"← К словам и повторению":"← К общему плану"}</LegacyLessonLink>
    <div className={styles.filters} role="group" aria-label="Материалы урока"><button type="button" aria-pressed={!words} onClick={()=>setWords(false)}>Урок</button><button type="button" aria-pressed={words} onClick={()=>setWords(true)}>Учить слова</button></div>
    {words&&<h1 ref={heading} tabIndex={-1}>Слова: {unit.title[1]}</h1>}
    <div hidden={words||!!related}><TestPreparation key={unit.id} permanentTitle={unit.title[1]} separateWords active={!words&&!related} initialUnitId={unit.id} onUnitChange={()=>{}} onBack={()=>{if(navigate)navigate("/learning/plan");else window.location.assign("/learning/plan");}} onOpen={setRelated}/></div>
    {related&&!words&&<><button type="button" onClick={()=>setRelated(null)}>← К уроку: {unit.title[1]}</button><VocabularyStudy key={JSON.stringify(related)} initialTopicId={related.topicId} initialTarget={related}/></>}
    {words&&<>{games?<><button type="button" onClick={()=>setGames(false)}>Посмотреть карточки ещё раз</button><PreparationWords unitId={unit.id} view="games"/></>:<VocabularyCards key={unit.id} words={preparationWords(unit.id)} textOnly onComplete={()=>setGames(true)}/>}</>}
  </section>;
}
