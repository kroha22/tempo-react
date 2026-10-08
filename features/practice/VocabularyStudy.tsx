"use client";

import { useState } from "react";
import { catalogWords as pairVocabulary, catalogGroups as studyVocabularyGroups } from "../content/learning-catalog-view";
import { learningCatalog } from "../content/learning-catalog";
import { vocabularySets } from "../content/vocabulary-model";
import { houseImageActivity } from "../content/house";
import { WordPairs } from "./WordPairs";
import { VocabularyCards } from "./VocabularyCards";
import { OddWordExercise } from "./OddWordExercise";
import { ImageMatchingExercise } from "./ImageMatchingExercise";
import { WordSearch } from "./WordSearch";
import { UsagePractice } from "./UsagePractice";
import { searchWords } from "./word-search";
import { sceneImageActivities } from "../content/picture-scenes";
import { clothingImageActivity } from "../content/clothing";

type Mode = "cards" | "pairs" | "odd" | "common" | "image" | "search" | "usage";
const modeLabels: Record<Mode, string> = { cards: "Карточки", pairs: "Пары", odd: "Найди лишнее", common: "Что общего?", image: "Картинка", search: "Поиск слов", usage: "Фразы" };
const images = [houseImageActivity, clothingImageActivity, ...sceneImageActivities];

export function VocabularyStudy({ onOpenCards }: { onOpenCards?: () => void } = {}) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);
  const group = studyVocabularyGroups.find(group => group.id === groupId);
  if (!group) return <section className="house-activity vocabulary-study"><span className="tempo-kicker">Изучение слов</span><h1>Выбери тему</h1><p>Карточки, пары и задания на смысл — с одними и теми же словами.</p><div className="pair-catalog-grid">{studyVocabularyGroups.map(group => {
    const wordCount = new Set(group.subgroups.flatMap(subgroup => subgroup.sets.flatMap(set => set.words))).size;
    const examples = group.subgroups.slice(0, 2).map(subgroup => subgroup.title).join(" · ");
    return <button type="button" className="pair-topic" key={group.id} onClick={() => { setGroupId(group.id); setMode("cards"); }}><strong>{group.title}</strong><span>{wordCount} слов{examples ? ` · ${examples}` : ""}</span></button>;
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
  const modes: Mode[] = ["cards", "pairs", ...(usageModules.length ? ["usage"] as const : []), ...(hasSearch ? ["search"] as const : []), ...(oddSets.length ? ["odd", "common"] as const : []), ...(availableImages.length ? ["image"] as const : [])];
  return <section className="house-activity vocabulary-study">
    <div className="vocabulary-topic-heading"><button type="button" className="pair-back" aria-label="Назад ко всем темам" onClick={() => { setGroupId(null); setSetId(null); setMode(null); setUsageId(null); }}>←</button><div><span className="tempo-kicker">Слова</span><h1>{group.title}</h1></div><span>{words.length} слов</span></div>
    <label className="vocabulary-set-label">Набор слов<select aria-label="Набор слов" value={setId ?? ""} onChange={event => { setSetId(event.target.value || null); setMode("cards"); setUsageId(null); }}><option value="">Все наборы темы</option>{group.subgroups.map(subgroup => <optgroup key={subgroup.id} label={subgroup.title}>{subgroup.sets.map(set => <option key={set.id} value={set.id}>{set.title} · {set.words.length}</option>)}</optgroup>)}</select></label>
    <nav className="vocabulary-modes" aria-label="Способ изучения">{modes.map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{modeLabels[value]}</button>)}</nav>
    {!mode && <p className="vocabulary-mode-prompt">Выбери способ изучения.</p>}
    {/* Keep each visited mechanic mounted while switching modes in this theme. */}
    <div hidden={mode !== "cards"}><VocabularyCards key={`cards-${setId}`} words={words} active={mode === "cards"} /></div>
    {hasSearch && <div hidden={mode !== "search"}><WordSearch key={`search-${setId}`} words={words} /></div>}
    <div hidden={mode !== "pairs"}><WordPairs key={`pairs-${setId}`} words={pairVocabulary} blocks={sets} onComplete={() => setMode(null)} completionLabel="Выбрать способ изучения" /></div>
    {activeUsage && <div hidden={mode !== "usage"}>{usageModules.length > 1 && <label className="vocabulary-set-label">Блок фраз<select aria-label="Блок фраз" value={activeUsage.id} onChange={event => setUsageId(event.target.value)}>{usageModules.map(module => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>}<UsagePractice key={activeUsage.id} module={activeUsage} active={mode === "usage"} /></div>}
    {!!oddSets.length && <><div hidden={mode !== "odd"}><OddWordExercise key={`odd-${setId}`} words={pairVocabulary} sets={oddSets} /></div><div hidden={mode !== "common"}><OddWordExercise key={`common-${setId}`} words={pairVocabulary} sets={oddSets} mode="common" /></div></>}
    {activeImage && <div hidden={mode !== "image"}>{availableImages.length > 1 && <label className="vocabulary-set-label">Картинка<select aria-label="Картинка" value={activeImage.id} onChange={event => setImageId(event.target.value)}>{availableImages.map(image => <option key={image.id} value={image.id}>{image.title}</option>)}</select></label>}<ImageMatchingExercise key={activeImage.id} definition={activeImage} words={pairVocabulary} /></div>}
  </section>;
}
