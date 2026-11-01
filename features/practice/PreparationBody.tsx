"use client";
import {catalogWords} from "../content/learning-catalog-view";
import {insideBodyImage} from "../content/body-scenes";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {ImageMatchingExercise} from "./ImageMatchingExercise";
import {LessonText} from "./LessonText";
import styles from "./TestPreparation.module.css";

export function PreparationBody({organs}:{organs:boolean}){
  const words=catalogWords.filter(word=>insideBodyImage.wordIds.includes(word.id));
  if(organs)return <section className={styles.embedded} aria-label="Органы: схема и практика"><h3><LessonText text="Por dentro do corpo" translation="Внутри тела" audio/></h3><p><LessonText text="Escolhe um nome e coloca-o no lugar certo. O osso e o músculo estão desenhados ao lado do corpo." translation="Выбери название и поставь его на нужное место. Кость и мышца нарисованы рядом с телом." audio/></p><ImageMatchingExercise embedded definition={insideBodyImage} words={words}/></section>;
  return <div className={styles.visualWords}>{words.filter(word=>word.label==="o osso"||word.label==="o músculo").map(word=><article key={word.id}>{word.illustration&&<VocabularyIllustration illustration={word.illustration}/>}<b><LessonText text={word.label} translation={word.translation} audio/></b>{word.example&&<p><LessonText text={word.example.pt} translation={word.example.ru} audio/></p>}</article>)}</div>;
}
