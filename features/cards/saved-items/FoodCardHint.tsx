"use client";
import {foodProductWords,foodPreferenceCard} from "../../content/food-cards";
import type {ReadingSource} from "../../content/reading-sources";
import {StudyItemCardSave} from "./ReadingCardSave";
export function FoodCardHint({pt,source}:{pt:string;source:ReadingSource}){
  const form=pt.normalize("NFC").toLocaleLowerCase("pt-PT");
  const choice=["gostar","gostar de","gosto de","gostas de","gosta de"].includes(form)?foodPreferenceCard:foodProductWords.find(word=>[word.noun.lemma,word.noun.plural].includes(form));
  return choice?<><p>Карточка: <span lang="pt-PT">{choice.pt}</span></p><StudyItemCardSave key={`${source.id}:${choice.studyItemId}`} choice={choice} source={source}/></>:null;
}
