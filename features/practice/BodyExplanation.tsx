"use client";
import {bodyIntroductions,bodyGlossary} from "../content/body-flow";
import {bodyCardWords,bodyCardSources,type BodyCardTopic} from "../content/body-cards";
import {DescriptionReading,DescriptionParagraph} from "./DescriptionReading";
import {BodyCardHint} from "../cards/saved-items/BodyCardHint";
export function BodyExplanation({topic}:{topic:BodyCardTopic}){
  const source=bodyCardSources.find(source=>source.id===`lesson:body:${topic}`)!;
  return <section aria-label={`Объяснение тела: ${topic}`}><DescriptionReading glossary={bodyGlossary} source={source} wordAction={pt=><BodyCardHint pt={pt} source={source}/>}>
    <BodyReadingContent topic={topic}/>
  </DescriptionReading></section>;
}
export function BodyReadingContent({topic}:{topic:BodyCardTopic}){
  return <>{bodyIntroductions[topic].map(([pt,ru])=><DescriptionParagraph key={pt} pt={pt} ru={ru}/>)}<div className="usage-examples">{bodyCardWords.filter(word=>word.topic===topic).map(word=><article key={word.wordId}><DescriptionParagraph pt={word.example.pt} ru={word.example.ru}/></article>)}</div></>;
}
