"use client";
import type {ReactNode} from "react";
import type {WordLearningSet} from "../content/word-learning-library";
import {groupTopicWordSets} from "../content/topic-navigation";
import styles from "./QuickWords.module.css";
export function WordTopicSections({sets,expanded=false,scoped=false,renderItem}:{sets:readonly WordLearningSet[];expanded?:boolean;scoped?:boolean;renderItem:(set:WordLearningSet,index:number)=>ReactNode}){
  return <div>{groupTopicWordSets(sets).map(group=><details className={styles.topicSection} key={`${group.id}:${expanded}`} open={scoped||expanded||group.id==="other"}>
    <summary><strong>{group.title}</strong><span>{group.sets.length} подборок</span></summary><div className={styles.grid}>{group.sets.map(renderItem)}</div>
  </details>)}</div>;
}
