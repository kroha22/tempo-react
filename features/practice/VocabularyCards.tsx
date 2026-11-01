"use client";

import { useState } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";
import { CardSpeechButton } from "../cards/components/CardSpeechButton";
import { SpeechHelpButton } from "../cards/components/SpeechHelpButton";
import styles from "./VocabularyCards.module.css";
import { VocabularyIllustration } from "./VocabularyIllustration";

export function VocabularyCards({ words, active = true,onReveal }: { words: readonly VocabularyWord[]; active?: boolean;onReveal?:(wordId:string)=>void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];
  const showTranslation = flipped;
  const textVariants = [...new Set(words.flatMap(item=>[item.label,item.translation]))];
  function move(nextIndex: number) { setIndex(nextIndex); setFlipped(false); }
  return <section className={`house-activity vocabulary-cards ${styles.compact}`}>
    <div className="vocabulary-card-counter" aria-live="polite">{index + 1} / {words.length}</div>
    <div className="vocabulary-card-carousel">
      <button type="button" className="vocabulary-page-arrow" aria-label="Предыдущая карточка" disabled={index === 0} onClick={() => move(index - 1)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg></button>
      <div className="vocabulary-card-glass" data-tone={index % 3}>
        <div className="speech-help-corner"><SpeechHelpButton /></div>
        <button type="button" className="vocabulary-flashcard" aria-label="Перевернуть карточку" aria-pressed={flipped} onClick={() => {if(!flipped)onReveal?.(word.id);setFlipped(!flipped);}}><small>{showTranslation ? "Русский" : "Português"}</small><span className={styles.imageSlot} aria-hidden="true">{word.illustration && <VocabularyIllustration illustration={word.illustration}/>}</span><span className={styles.textSlot}><strong lang={showTranslation ? "ru" : "pt-PT"}>{showTranslation ? word.translation : word.label}</strong>{textVariants.map(text=><span key={text} className={styles.textMeasure} data-text={text} aria-hidden="true"/>)}</span><span className="vocabulary-tap-hint"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M13 21V11a2 2 0 0 1 4 0v7l2-2 5 3v5c0 4-3 6-6 6h-2l-7-8a2 2 0 0 1 3-3l1 2Z"/><path d="M15 3V1m-6 5L7 4m14 2 2-2M6 11H3m21 0h3"/></svg>Нажми, чтобы перевернуть</span></button>
        <div className="vocabulary-card-speaker"><CardSpeechButton key={word.id} text={word.label} disabled={!active} /></div>
      </div>
      <button type="button" className="vocabulary-page-arrow" aria-label={index === words.length - 1 ? "Повторить набор" : "Следующая карточка"} onClick={() => move((index + 1) % words.length)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg></button>
    </div>
    {words.some(item=>item.noun)&&<div className={styles.details}>{[
      {lang:"pt-PT",text:word.noun?`${word.noun.article} ${word.noun.lemma} → ${word.noun.pluralArticle} ${word.noun.plural}`:"",variants:words.map(item=>item.noun?`${item.noun.article} ${item.noun.lemma} → ${item.noun.pluralArticle} ${item.noun.plural}`:"")},
      ...words.some(item=>item.noun&&item.example)?[
        {lang:"pt-PT",text:flipped&&word.noun?word.example?.pt??"":"",variants:words.filter(item=>item.noun).map(item=>item.example?.pt??"")},
        {lang:"ru",text:flipped&&word.noun?word.example?.ru??"":"",variants:words.filter(item=>item.noun).map(item=>item.example?.ru??"")},
      ]:[],
    ].map((row,i)=><div className={styles.detailSlot} key={i}><span lang={row.lang}>{row.text}</span>{[...new Set(row.variants)].map(text=><span key={text} className={styles.textMeasure} data-text={text} aria-hidden="true"/>)}</div>)}</div>}
  </section>;
}
