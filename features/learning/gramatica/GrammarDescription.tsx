import type {GrammarLesson} from "../../content/gramatica-ativa";
import {grammarReading} from "../../content/grammar-reading";
import {DescriptionReading,DescriptionParagraph,DescriptionExamples} from "../../practice/DescriptionReading";

export function GrammarDescription({lesson}:{lesson:GrammarLesson}){
  const reading=grammarReading[lesson.slug];
  if(!reading)return <><p>{lesson.canDo}</p><p>{lesson.rule}</p><div>{lesson.examples.map(example=><p key={example.pt}><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></p>)}</div></>;
  return <DescriptionReading key={lesson.id}><DescriptionParagraph pt={reading.goal} ru={lesson.canDo}/><DescriptionParagraph pt={reading.rule} ru={lesson.rule}/><DescriptionExamples examples={lesson.examples}/></DescriptionReading>;
}
