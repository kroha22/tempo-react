"use client";

import { useState } from "react";
import { catalogWords as pairVocabulary, catalogGroups as studyVocabularyGroups } from "../content/learning-catalog-view";
import { learningCatalog } from "../content/learning-catalog";
import { vocabularySets } from "../content/vocabulary-model";
import { houseImageActivity } from "../content/house";
import { WordPairs } from "./WordPairs";
import { VocabularyCards } from "./VocabularyCards";
import { VocabularyWriting } from "./VocabularyWriting";
import { OddWordExercise } from "./OddWordExercise";
import { ImageMatchingExercise } from "./ImageMatchingExercise";
import { WordSearch } from "./WordSearch";
import { UsagePractice } from "./UsagePractice";
import { searchWords } from "./word-search";
import { sceneImageActivities } from "../content/picture-scenes";
import { clothingImageActivity } from "../content/clothing";
import { vocabularyTitlesPt } from "../content/vocabulary-titles";
import styles from "./VocabularyStudy.module.css";

type Mode = "cards" | "writing" | "pairs" | "odd" | "common" | "image" | "search" | "usage";
const modeLabels: Record<Mode, string> = { cards: "Карточки", writing: "Напиши слово", pairs: "Пары", odd: "Найди лишнее", common: "Что общего?", image: "Картинка", search: "Поиск слов", usage: "Фразы" };
const modeLabelsPt: Record<Mode, string> = { cards:"Cartões", writing:"Escreve", pairs:"Pares", odd:"Intruso", common:"Em comum", image:"Imagem", search:"Procura", usage:"Frases" };
const modePaths: Record<Mode, string> = {
  cards:"M7 7h13v14H7z M4 17V3h12", writing:"m4 16 12-12 4 4L8 20H4v-4Z M13 7l4 4", pairs:"M3 4h7v7H3z M14 13h7v7h-7z M14 7h5v3 M10 17H5v-3",
  odd:"M4 5h6v6H4z M14 5h6v6h-6z M4 15h6v6H4z m10 0 6 6 m0-6-6 6", common:"M14 6a5 5 0 1 0 0 12 M10 6a5 5 0 1 1 0 12 M10 12h4",
  image:"M3 4h18v16H3z m0 12 6-6 5 5 3-3 4 4 M16 8h.01", search:"M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z m-1 5 6 6", usage:"M3 4h18v13H9l-6 4V4Z M7 8h10 M7 12h7",
};
function ModeIcon({ mode }: {mode:Mode}) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={modePaths[mode]} /></svg>; }
function TopicTitle({title}:{title:string}) { return <><span lang="pt-PT">{vocabularyTitlesPt[title] ?? title}</span>{vocabularyTitlesPt[title] && <span className={styles.translation} lang="ru"> — {title}</span>}</>; }
const images = [houseImageActivity, clothingImageActivity, ...sceneImageActivities];

export function VocabularyStudy({ onOpenCards }: { onOpenCards?: () => void } = {}) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);
  const group = studyVocabularyGroups.find(group => group.id === groupId);
  if (!group) return <section className="house-activity vocabulary-study"><span className="tempo-kicker" lang="pt-PT">Palavras · Слова</span><h1><span lang="pt-PT">Escolhe um tema</span><span className={styles.translation}> — Выбери тему</span></h1><p>Карточки, пары и задания на смысл — с одними и теми же словами.</p><div className="pair-catalog-grid">{studyVocabularyGroups.map(group => {
    const wordCount = new Set(group.subgroups.flatMap(subgroup => subgroup.sets.flatMap(set => set.words))).size;
    const examples = group.subgroups.slice(0, 2).map(subgroup => subgroup.title).join(" · ");
    return <button type="button" className="pair-topic" key={group.id} onClick={() => { setGroupId(group.id); setMode("cards"); }}><strong lang="pt-PT">{vocabularyTitlesPt[group.title] ?? group.title}</strong><small className={styles.catalogTranslation}>{group.title}</small><span>{wordCount} слов{examples ? ` · ${examples}` : ""}</span></button>;
  })}</div>{onOpenCards && <p><button type="button" onClick={onOpenCards}>Мои карточки и повторение</button></p>}</section>;
  const allSets = vocabularySets(group);
  const sets = setId ? allSets.filter(set => set.id === setId) : allSets;
  const ids = new Set(sets.flatMap(set => set.words));
  const words = pairVocabulary.filter(word => ids.has(word.id));
  const oddSets = sets.filter(set => set.oddOneOut);
  const availableImages = images.filter(image => group.imageActivityIds?.includes(image.id) && (!setId || image.wordIds.every(id => ids.has(id))));
  const activeImage = availableImages.find(image => image.id === imageId) ?? availableImages[0];
  const usageModules = learningCatalog.usageModules.filter(module => module.collectionIds.some(id => sets.some(set => set.id === id)));
  const activeUsage = usageModules.find(module => module.id === usageId) ?? usageModules[0];
  const hasSearch = searchWords(words).length > 0;
  const modes: Mode[] = ["cards", "writing", "pairs", ...(usageModules.length ? ["usage"] as const : []), ...(hasSearch ? ["search"] as const : []), ...(oddSets.length ? ["odd", "common"] as const : []), ...(availableImages.length ? ["image"] as const : [])];
  return <section className="house-activity vocabulary-study">
    <div className="vocabulary-topic-heading"><button type="button" className="pair-back" aria-label="Назад ко всем темам" onClick={() => { setGroupId(null); setSetId(null); setMode(null); setUsageId(null); }}><svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg></button><div><span className="tempo-kicker">Palavras · Слова</span><h1><TopicTitle title={group.title} /></h1></div><span>{words.length} слов</span></div>
    <div className={styles.selector}><div className={styles.label}><b lang="pt-PT">Conjuntos</b><span>· Наборы слов</span></div><div className={styles.tags} role="group" aria-label="Набор слов">
      <button type="button" className={styles.tag} aria-pressed={!setId} onClick={() => {setSetId(null);setMode("cards");setUsageId(null);}}><strong lang="pt-PT">Todos</strong><small>Все слова темы</small></button>
      {allSets.map((set,index)=><button type="button" key={set.id} className={styles.tag} data-tone={index%5} aria-pressed={setId===set.id} onClick={()=>{setSetId(set.id);setMode("cards");setUsageId(null);}}><strong lang="pt-PT">{vocabularyTitlesPt[set.title] ?? set.title}</strong><small>{set.title}</small><em>{set.words.length}</em></button>)}
    </div></div>
    <nav className={styles.modes} aria-label="Способ изучения">{modes.map(value => <button type="button" className={styles.mode} key={value} aria-pressed={mode === value} onClick={() => setMode(value)}><ModeIcon mode={value}/><span><b lang="pt-PT">{modeLabelsPt[value]}</b><small>{modeLabels[value]}</small></span></button>)}</nav>
    {!mode && <p className="vocabulary-mode-prompt">Выбери способ изучения.</p>}
    {/* Keep each visited mechanic mounted while switching modes in this theme. */}
    <div hidden={mode !== "cards"}><VocabularyCards key={`cards-${setId}`} words={words} active={mode === "cards"} /></div>
    <div hidden={mode !== "writing"}><VocabularyWriting key={`writing-${setId}`} words={words} active={mode === "writing"} /></div>
    {hasSearch && <div hidden={mode !== "search"}><WordSearch key={`search-${setId}`} words={words} /></div>}
    <div hidden={mode !== "pairs"}><WordPairs key={`pairs-${setId}`} words={pairVocabulary} blocks={sets} onComplete={() => setMode(null)} completionLabel="Выбрать способ изучения" /></div>
    {activeUsage && <div hidden={mode !== "usage"}>{usageModules.length > 1 && <label className="vocabulary-set-label">Блок фраз<select aria-label="Блок фраз" value={activeUsage.id} onChange={event => setUsageId(event.target.value)}>{usageModules.map(module => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>}<UsagePractice key={activeUsage.id} module={activeUsage} active={mode === "usage"} /></div>}
    {!!oddSets.length && <><div hidden={mode !== "odd"}><OddWordExercise key={`odd-${setId}`} words={pairVocabulary} sets={oddSets} /></div><div hidden={mode !== "common"}><OddWordExercise key={`common-${setId}`} words={pairVocabulary} sets={oddSets} mode="common" /></div></>}
    {activeImage && <div hidden={mode !== "image"}>{availableImages.length > 1 && <label className="vocabulary-set-label">Картинка<select aria-label="Картинка" value={activeImage.id} onChange={event => setImageId(event.target.value)}>{availableImages.map(image => <option key={image.id} value={image.id}>{image.title}</option>)}</select></label>}<ImageMatchingExercise key={activeImage.id} definition={activeImage} words={pairVocabulary} /></div>}
  </section>;
}
