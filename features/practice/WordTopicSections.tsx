"use client";
import type {ReactNode} from "react";
import type {WordLearningSet} from "../content/word-learning-library";
import {wordCollections} from "../content/word-collections";
import {groupTopicWordSets} from "../content/topic-navigation";
import styles from "./QuickWords.module.css";
export function WordTopicSections({sets,expanded=false,scoped=false,child=false,renderItem}:{sets:readonly WordLearningSet[];expanded?:boolean;scoped?:boolean;child?:boolean;renderItem:(set:WordLearningSet,index:number)=>ReactNode}){
  const groups=scoped?groupTopicWordSets(sets):wordCollections(sets,child);
  return <div>{groups.map(group=><details className={styles.topicSection} key={`${group.id}:${expanded}`} open={scoped||expanded}>
    <summary><strong>{group.title}</strong><span>Подборок: {group.sets.length}</span></summary><div className={styles.grid}>{group.sets.map(renderItem)}</div>
  </details>)}</div>;
}
