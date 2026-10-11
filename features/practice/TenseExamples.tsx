"use client";

import { useState } from "react";
import { tenseExamples, type ExampleTense } from "../content/tense-examples";

export function TenseExamples({ tense }: { tense: ExampleTense }) {
  const content = tenseExamples[tense];
  const [selected, setSelected] = useState(content.items[0].id);
  const [translated, setTranslated] = useState(false);
  const example = content.items.find(item => item.id === selected) ?? content.items[0];
  return <details className="tense-examples">
    <summary>Примеры из жизни · {tense === "present" ? "настоящее" : tense === "past" ? "прошедшее" : "будущее"}</summary>
    <h2>{content.title}</h2><p>{content.explanation}</p>
    <div className="tense-example-cues" role="group" aria-label="Выражения и примеры">{content.items.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setTranslated(false); }} lang="pt-PT">{item.cue}</button>)}</div>
    <article className="tense-example-card" aria-live="polite"><small>{example.kind}</small><p lang="pt-PT">{example.sentence}</p><button type="button" aria-expanded={translated} onClick={() => setTranslated(!translated)}>{translated ? "Скрыть перевод" : "Показать перевод"}</button>{translated && <div className="tense-example-translation"><b>{example.meaning}</b><p>{example.translation}</p></div>}</article>
    <p className="tense-example-prompt">Попробуй сказать похожее предложение о себе. Можно сначала по-русски, а затем по-португальски.</p>
  </details>;
}
