"use client";
import type {ReactNode} from "react";
import type {WordLearningSet} from "../content/word-learning-library";
import {wordCollections} from "../content/word-collections";
import styles from "./QuickWords.module.css";
export function WordTopicSections({sets,expanded=false,scoped=false,initiallyOpen=false,renderItem}:{sets:readonly WordLearningSet[];expanded?:boolean;scoped?:boolean;initiallyOpen?:boolean;renderItem:(set:WordLearningSet,index:number)=>ReactNode}){
  return <div>{wordCollections(sets).map(group=><details className={styles.topicSection} key={`${group.id}:${expanded}`} open={initiallyOpen||scoped||expanded||group.id==="other"}>
    <summary><strong>{group.title}</strong><span>Подборок: {group.sets.length}</span></summary><div className={styles.grid}>{group.sets.map(renderItem)}</div>
  </details>)}</div>;
}
