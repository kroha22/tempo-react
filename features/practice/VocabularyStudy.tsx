"use client";

import { useState } from "react";
import { catalogWords as pairVocabulary, catalogGroups as studyVocabularyGroups } from "../content/learning-catalog-view";
import { learningCatalog } from "../content/learning-catalog";
import {lessonCovers} from "./lesson-covers";
import {publicAssetUrl} from "../../shared/public-asset";
import {VocabularyIllustration} from "./VocabularyIllustration";
import type {VocabularyWord} from "../content/vocabulary-model";
import { vocabularySets } from "../content/vocabulary-model";
import { WordPairs } from "./WordPairs";
import { VocabularyCards } from "./VocabularyCards";
import { VocabularyWriting } from "./VocabularyWriting";
import { OddWordExercise } from "./OddWordExercise";
import { ImageMatchingExercise } from "./ImageMatchingExercise";
import { WordSearch } from "./WordSearch";
import { UsagePractice } from "./UsagePractice";
import { searchWords } from "./word-search";
import { vocabularyImages } from "../content/vocabulary-images";
import { vocabularyTitlesPt } from "../content/vocabulary-titles";
import styles from "./VocabularyStudy.module.css";
import { TopicCover } from "./TopicCover";
import {MyDayOverview} from "./MyDayOverview";
import {CooperationLesson} from "./CooperationLesson";
import {TestPreparation} from "./TestPreparation";
import {CalendarLesson} from "./CalendarLesson";
import {ClockLesson} from "./ClockLesson";
import {FeelingsLesson} from "./FeelingsLesson";
import {FamilyLesson} from "./FamilyLesson";
import {FirstSteps} from "./FirstSteps";
import {useProfileLearning} from "./profile-learning";
import {LearningLibrary} from "./LearningLibrary";

const foundationTopics=[
  {id:"foundation:hello",pt:"Olá!",ru:"Приветствия и общение",step:0,cover:lessonCovers["foundation:hello"]},
  {id:"foundation:identity",pt:"Quem sou?",ru:"Кто я",step:1,cover:lessonCovers["foundation:identity"]},
  {id:"foundation:being",pt:"SER / ESTAR",ru:"Характеристика и состояние",step:2,cover:"/estar-guide-adult.webp"},
] as const;

type Mode = "cooperation" | "calendar" | "feelings" | "cards" | "writing" | "pairs" | "odd" | "common" | "image" | "search" | "usage" | "routine" | "clock" | "family";
const modeLabels: Record<Mode, string> = {cooperation:"Уроки",calendar:"Уроки",feelings:"Самочувствие",family:"Моя семья", routine:"Распорядок",clock:"Часы",cards: "Карточки", writing: "Напиши слово", pairs: "Пары", odd: "Найди лишнее", common: "Что общего?", image: "Картинка", search: "Поиск слов", usage: "Фразы" };
const modeLabelsPt: Record<Mode, string> = {cooperation:"Aprender",calendar:"Aprender",feelings:"Aprender",family:"Aprender",routine:"O meu dia",clock:"Horas", cards:"Cartões", writing:"Escreve", pairs:"Pares", odd:"Intruso", common:"Em comum", image:"Imagem", search:"Procura", usage:"Frases" };
const modePaths: Record<Mode, string> = {
  cooperation:"M3 4h18v13H9l-6 4V4Z M7 8h10 M7 12h7",
  calendar:"M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16",
  feelings:"M12 3a9 9 0 1 0 0 0 18 9 9 0 0 0 0-18 M8 14q4 4 8 0 M8 9h1 M15 9h1",
  family:"M3 5q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1V5Z M12 6v15",
  routine:"M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h3 M8 17h7",clock:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l4 2",
  cards:"M7 7h13v14H7z M4 17V3h12", writing:"m4 16 12-12 4 4L8 20H4v-4Z M13 7l4 4", pairs:"M3 4h7v7H3z M14 13h7v7h-7z M14 7h5v3 M10 17H5v-3",
  odd:"M4 5h6v6H4z M14 5h6v6h-6z M4 15h6v6H4z m10 0 6 6 m0-6-6 6", common:"M14 6a5 5 0 1 0 0 12 M10 6a5 5 0 1 1 0 12 M10 12h4",
  image:"M3 4h18v16H3z m0 12 6-6 5 5 3-3 4 4 M16 8h.01", search:"M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z m-1 5 6 6", usage:"M3 4h18v13H9l-6 4V4Z M7 8h10 M7 12h7",
};
function ModeIcon({ mode }: {mode:Mode}) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={modePaths[mode]} /></svg>; }
function TopicTitle({title}:{title:string}) { return <><span lang="pt-PT">{vocabularyTitlesPt[title] ?? title}</span>{vocabularyTitlesPt[title] && <span className={styles.translation} lang="ru"> — {title}</span>}</>; }
const images = vocabularyImages;
function FoundationCover({src}:{src:string|NonNullable<VocabularyWord["illustration"]>}) {
  if(typeof src!=="string")return <VocabularyIllustration illustration={src}/>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={publicAssetUrl(src)} alt="" loading="lazy"/>;
}

export function VocabularyStudy({ onOpenCards,initialChildMode=false,initialTopicId }: { onOpenCards?: () => void;initialChildMode?:boolean;initialTopicId?:string|null } = {}) {
  const learner=useProfileLearning();
  const [groupId, setCurrentGroup] = useState<string | null>(initialTopicId??null);
  function setGroupId(id:string|null){if(id)learner?.update(current=>({...current,lastTopicId:id}));setCurrentGroup(id);}
  const [prepUnitId,setPrepUnitId]=useState<string|null>(null);
  const [returnToPrep,setReturnToPrep]=useState(false);
  const [calendarStart,setCalendarStart]=useState("hours");
  const [setId, setSetId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(initialTopicId==="topic:vocabulary-cooperation"?"cooperation":initialTopicId==="topic:vocabulary-calendar"?"calendar":initialTopicId==="topic:people"?"feelings":initialTopicId==="topic:vocabulary-family"?"family":initialTopicId==="topic:vocabulary-my-day"?"routine":"cards");
  const [imageId, setImageId] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);
  const preparationPanel=(groupId==="school:preparation"||returnToPrep)&&<div key="preparation" hidden={groupId!=="school:preparation"}><TestPreparation active={groupId==="school:preparation"} initialChildMode={initialChildMode} initialUnitId={prepUnitId} onUnitChange={setPrepUnitId} onBack={()=>{setGroupId(null);setReturnToPrep(false);}} onOpen={target=>{setReturnToPrep(true);setGroupId(target.topicId);setSetId(target.collectionId??null);setMode(target.mode);setUsageId(null);setCalendarStart(target.calendarLessonId??"hours");}}/></div>;
  if(groupId==="school:preparation")return <>{preparationPanel}</>;
  const foundation=foundationTopics.find(topic=>topic.id===groupId);
  if(foundation)return <FirstSteps key={foundation.id} topicStep={foundation.step} initialChildMode={initialChildMode} onBack={()=>setGroupId(null)}/>;
  const group = studyVocabularyGroups.find(group => group.id === groupId);
  const orderedGroups=[...studyVocabularyGroups.filter(group=>group.id==="topic:vocabulary-family"),...studyVocabularyGroups.filter(group=>group.id==="topic:people"),...studyVocabularyGroups.filter(group=>group.id!=="topic:vocabulary-family"&&group.id!=="topic:people")];
  const renderTopic=(group:(typeof studyVocabularyGroups)[number],index:number)=>{
    const wordCount = new Set(group.subgroups.flatMap(subgroup => subgroup.sets.flatMap(set => set.words))).size;
    return <button type="button" className={styles.topicCard} data-tone={(index+3)%5} key={group.id} onClick={() => { setGroupId(group.id); setMode(group.id==="topic:vocabulary-cooperation"?"cooperation":group.id==="topic:vocabulary-calendar"?"calendar":group.id==="topic:people"?"feelings":group.id==="topic:vocabulary-my-day"?"routine":group.id==="topic:vocabulary-family"?"family":"cards"); }}><TopicCover group={group} words={pairVocabulary} images={images}/><strong lang="pt-PT">{group.id==="topic:people"?"Como me sinto?":vocabularyTitlesPt[group.title] ?? group.title}</strong><small className={styles.catalogTranslation}>{group.id==="topic:people"?"Как я себя чувствую":group.title}</small><span className={styles.topicCount}>{wordCount} слов</span></button>;
  };
  if (!group) return <section className="house-activity vocabulary-study"><span className="tempo-kicker" lang="pt-PT">Temas · Темы</span><h2><span lang="pt-PT">Escolhe uma aula</span><span className={styles.translation}> — Выбери урок</span></h2><p>Слова, объяснения и практика — внутри каждой темы.</p><nav aria-label="Блоки уроков"><button type="button" onClick={()=>{const heading=document.getElementById("grammar-lessons");heading?.focus({preventScroll:true});heading?.scrollIntoView({block:"start",behavior:"instant"});}}>Времена и формы ↓</button></nav><div className={styles.catalogGrid}>{foundationTopics.filter(topic=>topic.step!==2).map((topic,index)=><button type="button" key={topic.id} className={styles.topicCard} data-tone={index} onClick={()=>setGroupId(topic.id)}><span className={styles.topicCover} aria-hidden="true"><FoundationCover src={topic.cover}/></span><strong lang="pt-PT">{topic.pt}</strong><small className={styles.catalogTranslation}>{topic.ru}</small><span className={styles.topicCount}>Объяснение и практика</span></button>)}{orderedGroups.filter(item=>item.id!=="topic:vocabulary-cooperation").map(renderTopic)}</div><section aria-label="Школьные материалы"><h2>Para a escola — Для школы</h2><p>Материалы для текущих школьных тем.</p><div className={styles.catalogGrid}><button type="button" className={styles.topicCard} data-tone="1" onClick={()=>setGroupId("school:preparation")}><strong lang="pt-PT">Preparar o teste</strong><small>Подготовка к проверочной</small><span>20 тем · Português · Matemática · Estudo do Meio</span></button>{orderedGroups.filter(item=>item.id==="topic:vocabulary-cooperation").map(renderTopic)}</div></section><LearningLibrary/>{onOpenCards && <p><button type="button" onClick={onOpenCards}>Мои карточки и повторение</button></p>}</section>;
  const allSets = vocabularySets(group);
  const hasFamilyLesson=group.id==="topic:vocabulary-family"&&(!setId||setId==="collection:expansion-family-close");
  const sets = setId ? allSets.filter(set => set.id === setId) : allSets.filter(set => set.id !== "collection:expansion-body-inside");
  const ids = new Set(sets.flatMap(set => set.words));
  const words = pairVocabulary.filter(word => ids.has(word.id));
  const oddSets = sets.filter(set => set.oddOneOut);
  const availableImages = images.filter(image => group.imageActivityIds?.includes(image.id) && image.wordIds.every(id => ids.has(id)));
  const activeImage = availableImages.find(image => image.id === imageId) ?? availableImages[0];
  const usageModules = learningCatalog.usageModules.filter(module => module.collectionIds.some(id => sets.some(set => set.id === id)));
  const activeUsage = usageModules.find(module => module.id === usageId) ?? usageModules[0];
  const hasSearch = searchWords(words).length > 0;
  const isMyDay=group.id==="topic:vocabulary-my-day";
  const modes: Mode[] = [...(group.id==="topic:vocabulary-cooperation"?["cooperation"] as const:[]),...(group.id==="topic:vocabulary-calendar"?["calendar"] as const:[]),...(group.id==="topic:people"&&(!setId||setId==="collection:feelings-now")?["feelings"] as const:[]),...(hasFamilyLesson?["family"] as const:[]),...(isMyDay?["routine","clock"] as const:[]),"cards", "writing", "pairs", ...(usageModules.length ? ["usage"] as const : []), ...(hasSearch ? ["search"] as const : []), ...(oddSets.length ? ["odd", "common"] as const : []), ...(availableImages.length ? ["image"] as const : [])];
  return <>{preparationPanel}<section className="house-activity vocabulary-study">
    {returnToPrep&&<button type="button" className="pair-back" aria-label="Вернуться к заданию подготовки" onClick={()=>setGroupId("school:preparation")}>← К заданию: {preparationUnits.find(unit=>unit.id===prepUnitId)?.title[1]??"Подготовка"}</button>}
    <div className="vocabulary-topic-heading"><button type="button" className="pair-back" aria-label={returnToPrep?"Назад к заданию подготовки":"Назад ко всем темам"} onClick={() => { if(returnToPrep){setGroupId("school:preparation");return;} setGroupId(null); setSetId(null); setMode(null); setUsageId(null); }}><svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg></button><div><span className="tempo-kicker">Palavras · Слова</span><h1><TopicTitle title={group.title} /></h1></div><span>{words.length} слов</span></div>
    <div className={styles.selector}><div className={styles.label}><b lang="pt-PT">Conjuntos</b><span>· Наборы слов</span></div><div className={styles.tags} role="group" aria-label="Набор слов">
      <button type="button" className={styles.tag} data-tone="all" aria-pressed={!setId} onClick={() => {setSetId(null);setMode("cards");setUsageId(null);}}><strong lang="pt-PT">{group.id==="topic:vocabulary-body"?"O essencial":"Todos"}</strong><small>{group.id==="topic:vocabulary-body"?"Основные слова":"Все слова темы"}</small></button>
      {allSets.map((set,index)=><button type="button" key={set.id} className={styles.tag} data-tone={index%5} aria-pressed={setId===set.id} onClick={()=>{setSetId(set.id);setMode("cards");setUsageId(null);}}><strong lang="pt-PT">{vocabularyTitlesPt[set.title] ?? set.title}</strong><small>{set.title}{set.id==="collection:expansion-body-inside"?" · по желанию":""}</small><em>{set.words.length}</em></button>)}
    </div></div>
    <div className={styles.modeLabel}><b lang="pt-PT">Atividades</b><span> · Режимы</span></div>
    <nav className={styles.modes} aria-label="Способ изучения">{modes.map(value => <button type="button" className={styles.mode} key={value} aria-pressed={mode === value} onClick={() => setMode(value)}><ModeIcon mode={value}/><span><b lang="pt-PT">{modeLabelsPt[value]}</b><small>{modeLabels[value]}</small></span></button>)}</nav>
    {!mode && <p className="vocabulary-mode-prompt">Выбери способ изучения.</p>}
    {/* Keep each visited mechanic mounted while switching modes in this theme. */}
    {group.id==="topic:people"&&<div hidden={mode!=="feelings"}><FeelingsLesson initialChildMode={initialChildMode}/></div>}
    {group.id==="topic:vocabulary-family"&&<div hidden={mode!=="family"}><FamilyLesson initialChildMode={initialChildMode}/></div>}
    {group.id==="topic:vocabulary-cooperation"&&<div hidden={mode!=="cooperation"}><CooperationLesson initialChildMode={initialChildMode} active={mode==="cooperation"} onFeelings={()=>{setGroupId("topic:people");setSetId(null);setUsageId(null);setMode("feelings");}}/></div>}
    {group.id==="topic:vocabulary-calendar"&&<div hidden={mode!=="calendar"}><CalendarLesson initialLessonId={calendarStart} initialChildMode={initialChildMode} active={mode==="calendar"} onRoutine={()=>{setGroupId("topic:vocabulary-my-day");setSetId(null);setUsageId(null);setMode("routine");}}/></div>}
    {isMyDay&&<><div hidden={mode!=="routine"}><MyDayOverview onClock={()=>setMode("clock")} onPhrases={()=>setMode("usage")} onWords={()=>{setSetId("collection:my-day-actions");setMode("cards");}}/></div><div hidden={mode!=="clock"}><ClockLesson embedded/></div></>}
    <div hidden={mode !== "cards"}><VocabularyCards key={`cards-${setId}`} words={words} active={mode === "cards"} /></div>
    <div hidden={mode !== "writing"}><VocabularyWriting key={`writing-${setId}`} words={words} title={setId?sets[0]?.title:group.title} active={mode === "writing"} /></div>
    {hasSearch && <div hidden={mode !== "search"}><WordSearch key={`search-${setId}`} words={words} title={setId?sets[0]?.title:group.title} /></div>}
    <div hidden={mode !== "pairs"}><WordPairs key={`pairs-${setId}`} words={pairVocabulary} blocks={sets} onComplete={() => setMode(null)} completionLabel="Выбрать способ изучения" /></div>
    {activeUsage && <div hidden={mode !== "usage"}>{usageModules.length > 1 && <label className="vocabulary-set-label">Блок фраз<select aria-label="Блок фраз" value={activeUsage.id} onChange={event => setUsageId(event.target.value)}>{usageModules.map(module => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>}<UsagePractice key={activeUsage.id} module={activeUsage} active={mode === "usage"} /></div>}
    {!!oddSets.length && <><div hidden={mode !== "odd"}><OddWordExercise key={`odd-${setId}`} words={pairVocabulary} sets={oddSets} /></div><div hidden={mode !== "common"}><OddWordExercise key={`common-${setId}`} words={pairVocabulary} sets={oddSets} mode="common" /></div></>}
    {activeImage && <div hidden={mode !== "image"}>{availableImages.length > 1 && <label className="vocabulary-set-label">Картинка<select aria-label="Картинка" value={activeImage.id} onChange={event => setImageId(event.target.value)}>{availableImages.map(image => <option key={image.id} value={image.id}>{image.title}</option>)}</select></label>}<ImageMatchingExercise key={activeImage.id} definition={activeImage} words={pairVocabulary} /></div>}
  </section></>;
}
import {preparationUnits} from "../content/test-preparation";
