"use client";
import {homeIntroductions,homeGlossary,type HomeFlowTopic} from "../content/home-flow";
import {homeCardWords,homeBatchSources} from "../content/home-cards";
import {DescriptionReading,DescriptionParagraph} from "./DescriptionReading";
import {StudyItemCardSave} from "../cards/saved-items/ReadingCardSave";
export function HomeExplanation({topic}:{topic:HomeFlowTopic}){
  const source=homeBatchSources.find(source=>source.id===`lesson:home:${topic}`)!;
  return <section aria-label={`Объяснение дома: ${topic}`}><DescriptionReading source={source} glossary={homeGlossary} wordAction={pt=>{
    const form=pt.normalize("NFC").toLocaleLowerCase("pt-PT");
    const choice=homeCardWords.find(word=>word.display.type==="noun"?[word.display.lemma,word.display.plural].includes(form):word.key==="onde-esta"?form==="onde está":word.pt.toLocaleLowerCase("pt-PT")===form);
    return choice?<><p>Карточка: <span lang="pt-PT">{choice.pt}</span></p><StudyItemCardSave key={`${source.id}:${choice.studyItemId}`} choice={choice} source={source}/></>:null;
  }}>{homeIntroductions[topic].map(([pt,ru])=><DescriptionParagraph key={pt} pt={pt} ru={ru}/>)}</DescriptionReading></section>;
}
