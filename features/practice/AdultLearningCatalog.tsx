"use client";
import {useMemo} from "react";
import {adultCatalogGroups,adultCatalogShared,adultCatalogLegacy,catalogText} from "../content/adult-catalog";
import {adultMaterialKey,type AdultRouteBlockKey} from "../content/adult-route";
import {navigationTopic,type NavigationTopicId} from "../content/topic-navigation";
import {RegisteredTopicCard} from "./RegisteredTopicCard";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./AdultLearningCatalog.module.css";

export function AdultLearningCatalog({query,onQueryChange,openBlocks,onToggleBlock,onOpenLegacy}:{query:string;onQueryChange:(query:string)=>void;openBlocks:readonly AdultRouteBlockKey[];onToggleBlock:(key:AdultRouteBlockKey,open:boolean)=>void;onOpenLegacy:(id:string)=>void}){
  const groups=useMemo(()=>adultCatalogGroups(query),[query]);
  const shared=useMemo(()=>adultCatalogShared().filter(source=>!query.trim()||catalogText(`${source.title} ${source.sourceId}`).includes(catalogText(query))),[query]);
  const sharedLegacy=adultCatalogLegacy(query).filter(entry=>entry.block===null);
  return <section className={styles.catalog} aria-label="Каталог единого маршрута">
    <p>Материалы общего плана — для свободного выбора.</p>
    <nav className={styles.tools} aria-label="Общее обучение"><LegacyLessonLink href="/learning/quick-words">Слова и повторение →</LegacyLessonLink></nav>
    <label className={styles.search}>Поиск<input type="search" value={query} onChange={event=>onQueryChange(event.target.value)} placeholder="Например, семья, SER или часы"/></label>
    {query&&<button type="button" onClick={()=>onQueryChange("")}>Очистить поиск</button>}
    {!groups.length&&!shared.length&&!sharedLegacy.length&&<p role="status">Материалов не найдено. Попробуйте другое слово.</p>}
    {groups.map(({block,entries,legacy})=><details className={styles.block} key={block.key} data-catalog-block={block.key} open={!!query.trim()||openBlocks.includes(block.key)} onToggle={event=>{if(!query.trim())onToggleBlock(block.key,event.currentTarget.open);}}>
      <summary><strong>{block.title}</strong><span>Материалы · {entries.length}</span></summary><p>{block.goal}</p>
      <div className={styles.entries}>{entries.map(({material})=>{
        const topic=material.kind==="topic"?navigationTopic(material.sourceId as NavigationTopicId):undefined;
        if(topic)return <RegisteredTopicCard key={adultMaterialKey(material)} topic={topic} className={styles.topic} onOpenLegacy={onOpenLegacy}/>;
        return <article key={adultMaterialKey(material)} data-catalog-material={adultMaterialKey(material)}><strong>{material.title}</strong>
          {material.legacyOnly&&<small>Прежняя подборка</small>}
          {material.availability==="planned"&&<small>Объяснение и задания готовятся · слова доступны</small>}
          <nav className={styles.links} aria-label={`Материалы: ${material.title}`}>
            {material.href&&<LegacyLessonLink href={material.href}>Открыть →</LegacyLessonLink>}
            {material.explanationHref&&<LegacyLessonLink href={material.explanationHref}>Объяснение →</LegacyLessonLink>}
            {material.wordsHref&&<LegacyLessonLink href={material.wordsHref}>Слова занятия →</LegacyLessonLink>}
            {material.kind==="word-set"&&<LegacyLessonLink href={`/learning/quick-words?set=${encodeURIComponent(material.sourceId)}`}>Посмотреть слова →</LegacyLessonLink>}
          </nav>
        </article>;
      })}</div>
      {legacy.length>0&&<details><summary>Прежние упражнения</summary>{legacy.map(({group})=><p key={group.id}><button type="button" data-topic-id={group.id} onClick={()=>onOpenLegacy(group.id)}>{group.title}</button></p>)}</details>}
    </details>)}
    {(shared.length>0||sharedLegacy.length>0)&&<details className={styles.block} open={!!query.trim()}><summary>Справочники и тренажёры</summary><nav className={styles.links} aria-label="Общие инструменты">{shared.map(source=><LegacyLessonLink key={adultMaterialKey(source)} href={source.href??`/learning/quick-words?set=${encodeURIComponent(source.sourceId)}`}>{source.title} →</LegacyLessonLink>)}</nav>{sharedLegacy.map(({group})=><p key={group.id}><button type="button" data-topic-id={group.id} onClick={()=>onOpenLegacy(group.id)}>{group.title}: прежние упражнения</button></p>)}</details>}
  </section>;
}
