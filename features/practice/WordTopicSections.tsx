"use client";
import type {ReactNode} from "react";
import type {WordLearningSet} from "../content/word-learning-library";
import {wordCollections} from "../content/word-collections";
import {groupTopicWordSets} from "../content/topic-navigation";
import {wordCollectionArt} from "../content/word-collection-art";
import {VocabularyIllustration} from "./VocabularyIllustration";
import styles from "./QuickWords.module.css";
export function WordTopicSections({sets,expanded=false,scoped=false,child=false,activeGroup,onOpenGroup,renderItem}:{sets:readonly WordLearningSet[];expanded?:boolean;scoped?:boolean;child?:boolean;activeGroup?:string;onOpenGroup?:(group:{id:string;title:string})=>void;renderItem:(set:WordLearningSet,index:number)=>ReactNode}){
  const groups=scoped?groupTopicWordSets(sets):wordCollections(sets,child);
  if(scoped||expanded)return <div className={styles.grid}>{sets.map(renderItem)}</div>;
  if(activeGroup)return <div className={styles.grid}>{groups.find(group=>group.id===activeGroup)?.sets.map(renderItem)}</div>;
  const pt:Record<string,string>={"Самое нужное":"O essencial","Моя семья и близкие":"A minha família","Еда и предпочтения":"Comer e beber","Время и календарь":"O tempo e o calendário","Тело и здоровье":"O corpo e a saúde","Дом и расположение":"A casa e o espaço","Общение на каждый день":"Vamos conversar","Школа, друзья и игры":"Escola, amigos e jogos","Глаголы и действия":"Verbos e ações","Цвета и одежда":"Cores e roupa","Мир вокруг нас":"O mundo à nossa volta","Другие подборки":"Mais palavras"};
  return <div className={styles.grid}>{groups.map((group,index)=>group.sets.length===1?renderItem(group.sets[0],index):<button type="button" className={`${styles.pack} ${styles.collectionCard}`} data-tone={index%5} data-collection-id={group.id} key={group.id} aria-label={`${group.title} · ${group.sets.length} подборок`} onClick={()=>onOpenGroup?.({id:group.id,title:group.title})}><strong lang="pt-PT">{pt[group.title]??group.title}</strong><span>{group.title}</span><small>Подборок: {group.sets.length} ›</small><span className={styles.packArt} aria-hidden="true"><VocabularyIllustration illustration={wordCollectionArt(group.id,group.title)}/></span></button>)}</div>;
}
