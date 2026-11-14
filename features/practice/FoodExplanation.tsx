"use client";
import {foodIntroductions,foodGlossary} from "../content/food-flow";
import {foodProductWords,foodCardSources} from "../content/food-cards";
import {DescriptionReading,DescriptionParagraph} from "./DescriptionReading";
import {FoodCardHint} from "../cards/saved-items/FoodCardHint";
export function FoodExplanation({topic}:{topic:"fruit"|"meals"}){
  const source=foodCardSources.find(source=>source.id===`lesson:food:${topic}`)!;
  return <section aria-label={`Объяснение еды: ${topic==="fruit"?"фрукты":"продукты"}`}><DescriptionReading source={source} glossary={foodGlossary} wordAction={pt=><FoodCardHint pt={pt} source={source}/>}>
    {foodIntroductions[topic].map(([pt,ru])=><DescriptionParagraph key={pt} pt={pt} ru={ru}/>)}
    <div className="usage-examples">{foodProductWords.filter(word=>word.topic===topic).map(word=><article key={word.wordId}><DescriptionParagraph pt={word.example.pt} ru={word.example.ru}/></article>)}</div>
  </DescriptionReading></section>;
}
