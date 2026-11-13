"use client";
import {familyExplanation,familyGlossary} from "../content/family-flow";
import {familyPossessives,familyExamples,familyPossessiveExamples} from "../content/family-lesson";
import {familyCardWords,familyCardSources,type FamilyCardTopic} from "../content/family-cards";
import {professionWords} from "../content/identity";
import {LessonText,LessonTextContext} from "./LessonText";
import {useTextHelp} from "./LessonHelp";
import {StudyItemCardSave} from "../cards/saved-items/ReadingCardSave";
import {LegacyLessonLink} from "./LegacyLessonLink";

export function FamilyExplanation({topic}:{topic:FamilyCardTopic}){
  const source=familyCardSources.find(source=>source.id===`lesson:family:${topic}`)!;
  const rows=familyExplanation[topic];
  const {help,controls,popup}=useTextHelp({},familyGlossary,{simple:true,translationLabel:"Показать по-русски",portugueseLabel:"Вернуться к португальскому",wordAction:(pt)=>{
    const form=pt.toLocaleLowerCase("pt-PT");
    const choice=familyCardWords.find(word=>word.noun?[word.noun.lemma,word.noun.plural].includes(form):professionWords.find(role=>role.id===word.wordId)?.acceptedAnswers?.pt?.includes(form));
    return choice?<><p>Карточка: <span lang="pt-PT">{choice.pt}</span></p><StudyItemCardSave key={`${source.id}:${choice.studyItemId}`} choice={choice} source={source}/></>:null;
  }});
  const examples=topic==="close"?[...familyExamples,...familyPossessiveExamples].map(row=>({pt:row.pt,ru:row.ru})):familyCardWords.filter(word=>word.topic==="relatives").map(word=>word.example);
  return <LessonTextContext value={help}><section aria-label={`Объяснение семьи: ${topic==="close"?"близкие":"родственники"}`}>
    {controls}<h3><LessonText text={rows[0][0]} translation={rows[0][1]} plain/></h3>
    {rows.slice(1).map(([pt,ru])=><p key={pt}><LessonText text={pt} translation={ru}/></p>)}
    {topic==="close"&&<div className="usage-examples">{familyPossessives.map(row=><article key={row.form}><strong><LessonText text={row.example} translation={row.translation} keepPortuguese/></strong><p>{help.translated?row.meaning:row.form}</p></article>)}</div>}
    <h3>{help.translated?"Готовые примеры":"Exemplos"}</h3>
    <div className="usage-examples">{examples.map(row=><article key={row.pt}><p><LessonText text={row.pt} translation={row.ru}/></p></article>)}</div>
    <p><LegacyLessonLink href="/learning/practice?lesson=ser-estar">SER / ESTAR: объяснение и формы →</LegacyLessonLink></p>
    <p><LegacyLessonLink href="/learning/lessons/lesson%3Aa1-1%3Apossession-and-presence">TER / HÁ: у меня есть / здесь есть →</LegacyLessonLink></p>
    {popup}
  </section></LessonTextContext>;
}
