"use client";
import {bodyCardWords} from "../../content/body-cards";
import type {ReadingSource} from "../../content/reading-sources";
import {StudyItemCardSave} from "./ReadingCardSave";
export function BodyCardHint({pt,source}:{pt:string;source:ReadingSource}){
  const form=pt.normalize("NFC").toLocaleLowerCase("pt-PT");
  const choice=bodyCardWords.find(word=>word.noun?[word.noun.lemma,word.noun.plural].includes(form):word.forms.split(" / ").includes(form));
  return choice?<><p>Карточка: <span lang="pt-PT">{choice.pt}</span></p><StudyItemCardSave key={`${source.id}:${choice.studyItemId}`} choice={choice} source={source}/></>:null;
}
