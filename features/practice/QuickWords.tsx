"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {wordLibraryFor,type WordLearningSet} from "../content/word-learning-library";
import {wordBrowseSets} from "../content/word-browse-sets";
import {wordCollections} from "../content/word-collections";
import {navigationTopic,topicForWordSet} from "../content/topic-navigation";
import {WordTopicSections} from "./WordTopicSections";
import {SpeechHelpButton} from "../cards/components/SpeechHelpButton";
import {WordMemory} from "./WordMemory";
import {canPlayWordMemory} from "./word-memory";
import {FoodSorting} from "./FoodSorting";
import {canSortFood,foodSortingWords} from "../content/food-sorting";
import {WordBuilder,orderedCalendarWords} from "./WordBuilder";
import {WordMiniGame,letterGameWords,listeningGameWords} from "./WordMiniGame";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {LearningCoverArt,learningCoverSource} from "./LearningCoverArt";
import {learningCoverArt} from "../content/learning-cover-art";
import { VocabularyCards } from "./VocabularyCards";
import { WordPairs } from "./WordPairs";
import { VocabularyWriting } from "./VocabularyWriting";
import { WordSearch } from "./WordSearch";
import { useProfileLearning } from "./profile-learning";
import styles from "./QuickWords.module.css";
import type {QuickSetKind} from "../content/quick-word-expansion";
import {QuickVerbDetails} from "./QuickVerbDetails";
import {searchWords} from "./word-search";
import {WordReviewEntry} from "./UnifiedWordReview";
import {PersonalWordReview,TopicWordRating,usePersonalWords} from "./PersonalWordReview";
import {wordRoundRanges,wordSessionTimestamp,type WordLearningSession} from "./word-learning-session";
import {spatialCapability} from "../content/spatial-capabilities";
import {SpatialPlacement,GraphicDictation} from "./SpatialActivities";

type Mode = "memory" | "sorting" | "builder" | "sequence" | "pairs" | "writing" | "search" | "letters" | "listening" | "placement" | "dictation";
const modeTitles:Record<Mode,string>={memory:"Мемори",sorting:"Сортировка еды",builder:"Собери слово",sequence:"По порядку",pairs:"Пары",letters:"Вставь букву",listening:"Послушай и выбери",writing:"Написать",search:"Поиск слов",placement:"Расставить",dictation:"Рисовать"};
const modeIcons:Record<Mode,string>={memory:"▦",sorting:"▤",builder:"▧",sequence:"①",pairs:"↔",letters:"А_",listening:"♫",writing:"✎",search:"⌕",placement:"▦",dictation:"⌁"};
const packSymbols:Record<string,string>={hello:"👋",polite:"🤝","adult-everyday":"🏡","adult-small-talk":"💬","adult-shopping":"🛍️","adult-plans":"🗓️",backpack:"🎒",instructions:"📖",requests:"🙋","child-classroom":"🙋","child-friends":"🤝","child-games":"🎲","browse:essentials":"⭐"};
export function QuickWords({ child = false, onBack,sourceIds,initialSetId,topicId }: { child?: boolean; onBack: () => void;sourceIds?:readonly string[];initialSetId?:string;topicId?:string }) {
  const screen = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = screen.current;
    if (dialog && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    return () => { if(dialog?.open && dialog.close) dialog.close(); };
  }, []);
  const learner = useProfileLearning();
  const personal=usePersonalWords();
  function mistake(id:string){const word=pack?.words.find(word=>word.id===id);if(word&&pack)personal.add(word,pack,true);}
  const isChild = learner?.profile.child ?? child;
  const library=useMemo(()=>wordLibraryFor(isChild),[isChild]);
  const selectedTopic=isChild?undefined:navigationTopic(topicId);
  const sets=useMemo(()=>{const available=sourceIds?library.filter(set=>sourceIds.some(id=>set.id===id||set.aliases.includes(id))):wordBrowseSets(isChild);return selectedTopic?available.filter(set=>topicForWordSet(set)?.id===selectedTopic.id):available;},[library,sourceIds,isChild,selectedTopic]);
  const [selected, setSelected] = useState<string | null>(initialSetId??(sourceIds&&sets.length===1?sets[0].id:null));
  const [filter,setFilter]=useState<"all"|QuickSetKind>("all");
  const [search,setSearch]=useState("");
  const [collection,setCollection]=useState<{id:string;title:string}|null>(null);
  const catalogPositions=useRef<Record<string,number>>({});
  const restoreCatalog=useRef<{top:number;setId?:string;groupId?:string}|null>(null);
  function saveCatalogPosition(){catalogPositions.current[collection?.id??"root"]=screen.current?.scrollTop??0;}
  function openCollection(group:{id:string;title:string}){saveCatalogPosition();setCollection(group);}
  const [review,setReview]=useState(false);
  const [cardSession,setCardSession]=useState({index:0,viewed:[] as string[]});
  const [run,setRun]=useState(0);
  const [round,setRound]=useState(0);
  const [stage,setStage]=useState<"cards"|"choice"|"training">("choice");
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const saved=!selected&&!review?restoreCatalog.current:null;
    const target=saved?.setId?[...screen.current?.querySelectorAll<HTMLButtonElement>("[data-word-set-id]")??[]].find(button=>button.dataset.wordSetId===saved.setId):saved?.groupId?[...screen.current?.querySelectorAll<HTMLButtonElement>("[data-collection-id]")??[]].find(button=>button.dataset.collectionId===saved.groupId):null;
    (target??heading.current)?.focus({preventScroll:true});
    screen.current?.scrollTo?.(0,saved?.top??0);
    restoreCatalog.current=null;
  }, [selected,stage,review,collection?.id]);
  const [mode, setMode] = useState<Mode>("pairs");
  const [moreGames,setMoreGames]=useState(false);
  const pack = sets.find(item => item.id === selected)??library.find(item=>item.id===selected);
  const range=wordRoundRanges(pack?.words.length??0)[round]??{start:0,end:0};
  const roundStart=range.start,roundEnd=range.end;
  const roundWords=pack?.words.slice(roundStart,roundEnd)??[];
  const hasNextRound=!!pack&&roundEnd<pack.words.length;
  const canSearch=!!pack&&pack.kind!=="phrases"&&searchWords(roundWords).length>=4;
  const visibleMode = !isChild&&(mode==="writing"||mode==="search")?"pairs":mode;
  const canLetters=letterGameWords(roundWords).length>=2;
  const canListen=listeningGameWords(roundWords).length>=2;
  const spatial=spatialCapability(pack);
  const modes=[...(spatial?[spatial]:[]),"pairs",...(pack&&canPlayWordMemory(pack,roundWords)?["memory" as const]:[]),...(pack&&canSortFood(pack.words)&&foodSortingWords(roundWords).length?["sorting" as const]:[]),...(canLetters?["builder" as const]:[]),...(orderedCalendarWords(roundWords).length>=2?["sequence" as const]:[]),...(canLetters?["letters" as const]:[]),...(canListen?["listening" as const]:[]),...(isChild?["writing" as const]:[]),...(isChild&&canSearch?["search" as const]:[])] as Mode[];
  function remember(next:Partial<WordLearningSession>,setId=pack?.id){
    if(!setId)return;
    const value={setId,stage,index:cardSession.index,viewed:cardSession.viewed,mode,updatedAt:wordSessionTimestamp(),...next};
    learner?.update(current=>({...current,wordSession:value}));
  }
  function choose(item:WordLearningSet,resume?:WordLearningSession){
    saveCatalogPosition();
    if(!collection&&!search&&filter==="all"&&!sourceIds&&!selectedTopic){
      const group=wordCollections(sets,isChild).find(group=>group.sets.some(set=>set.id===item.id));
      if(group&&group.sets.length>1)setCollection({id:group.id,title:group.title});
    }
    const restored=resume&&(resume.setId===item.id||item.aliases.includes(resume.setId))?resume:undefined;
    setMoreGames(!!restored&&["letters","listening","builder","sequence","sorting","memory"].includes(restored.mode));setSelected(item.id);setStage(restored?.stage??"choice");setMode(restored?.mode??"pairs");
    const previous=restored&&library.find(set=>set.id===restored.setId);
    const previousWord=previous?.words[restored?.index??0];
    const mappedIndex=restored&&restored.setId!==item.id&&previousWord?item.words.findIndex(word=>word.id===previousWord.id||word.label===previousWord.label&&word.translation===previousWord.translation):-1;
    const viewed=(restored?.viewed??[]).flatMap(id=>{const old=previous?.words.find(word=>word.id===id);const word=item.words.find(word=>word.id===id||old&&word.label===old.label&&word.translation===old.translation);return word?[word.id]:[];});
    const next={index:Math.min(mappedIndex>=0?mappedIndex:restored?.index??0,item.words.length-1),viewed:[...new Set(viewed)]};
    setCardSession(next);setRun(current=>current+1);remember({...next,stage:restored?.stage??"choice",mode:restored?.mode??"pairs"},item.id);
    setRound(Math.max(0,wordRoundRanges(item.words.length).findIndex(range=>next.index<range.end)));
  }
  function phase(next:typeof stage){setStage(next);remember({stage:next});}
  function back() {
    if(review){restoreCatalog.current={top:catalogPositions.current[collection?.id??"root"]??0};setReview(false);}
    else if(pack&&stage!=="choice")phase("choice");
    else if(pack&&sourceIds&&sets.length===1)onBack();
    else if(pack){restoreCatalog.current={top:catalogPositions.current[collection?.id??"root"]??0,setId:pack.id};setSelected(null);}
    else if(collection){saveCatalogPosition();restoreCatalog.current={top:catalogPositions.current.root??0,groupId:collection.id};setCollection(null);}
    else onBack();
  }
  const resume=learner?.learning.wordSession;
  const resumeCandidate=resume?(sets.find(set=>set.id===resume.setId||set.aliases.includes(resume.setId))??library.find(set=>set.id===resume.setId)):undefined;
  const resumeSet=selectedTopic&&resumeCandidate&&topicForWordSet(resumeCandidate)?.id!==selectedTopic.id?undefined:resumeCandidate;
  const visibleSets=sets.filter(item=>(filter==="all"||item.kind===filter)&&`${item.title} ${item.pt} ${item.cue}`.toLowerCase().includes(search.toLowerCase()));
  const renderPack=(item:WordLearningSet,index:number)=><button type="button" className={styles.pack} data-tone={index % 5} data-word-set-id={item.id} aria-label={`${item.pt} ${item.title} ${item.words.length} карточек`} key={item.id} onClick={() => choose(item)}><strong lang="pt-PT">{item.pt}</strong>{item.title!==item.pt&&<span>{item.title}</span>}<small>{item.words.length} карточек</small><span className={styles.packArt} aria-hidden="true">{learningCoverArt[item.id]?<LearningCoverArt id={item.id}/>:item.words.find(word=>word.illustration)?.illustration?<VocabularyIllustration illustration={item.words.find(word=>word.illustration)!.illustration!}/>:learningCoverSource(item.id,item.aliases)?<LearningCoverArt id={item.id} aliases={item.aliases}/>:<span>{packSymbols[item.id]??(item.kind==="verbs"?"⚡":item.kind==="phrases"?"💬":"📚")}</span>}</span></button>;
  return <dialog ref={screen} className={styles.screen} data-child={isChild} aria-label="Учить слова" onCancel={event => {event.preventDefault();back();}}><section className={styles.root}>
    <header className={styles.header}><button type="button" className={styles.back} aria-label={review?"Назад":pack ? stage==="training"?"Назад":stage==="cards"?"К активностям":"Все наборы" : collection?"Все сборники":"К урокам"} onClick={back}>←</button><h1 ref={heading} tabIndex={-1}>{review?"Повторение":pack ? pack.title : collection?.title??selectedTopic?.title??"Учить слова"}</h1><SpeechHelpButton/></header>
    {learner?.savingError&&<p role="alert">Продолжение не сохранено. <button type="button" onClick={()=>remember({})}>Повторить сохранение</button></p>}
    {review?<PersonalWordReview/>:!pack ? <>{learner&&!collection&&<div className={styles.homeActions}>{resumeSet&&<button type="button" onClick={()=>choose(resumeSet,resume)}>Продолжить · {resumeSet.title}</button>}<WordReviewEntry onOpen={()=>{saveCatalogPosition();setReview(true);}}/></div>}{!sourceIds&&<div className={styles.libraryTools}><div className={styles.searchRow}><input type="search" aria-label="Найти подборку" placeholder="Найти…" value={search} onChange={event=>setSearch(event.target.value)}/>{search&&<button type="button" className={styles.clearSearch} aria-label="Очистить поиск" onClick={()=>setSearch("")}>×</button>}</div></div>}<div className={styles.modes} role="group" aria-label="Вид подборок">{(["all","words","verbs","phrases"] as const).map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{({all:"Все",words:"Слова",verbs:"Глаголы",phrases:"Фразы"})[value]}</button>)}</div>{sourceIds?<div className={styles.grid}>{visibleSets.map(renderPack)}</div>:<WordTopicSections key={search} child={isChild} sets={visibleSets} expanded={!!search||filter!=="all"} activeGroup={collection?.id} onOpenGroup={openCollection} scoped={!!selectedTopic} renderItem={renderPack}/>}</> : <>
      {stage==="training"&&<>{!isChild&&<button type="button" className={styles.moreGames} aria-expanded={moreGames} onClick={()=>setMoreGames(value=>!value)}>Другие игры</button>}{(isChild||moreGames)&&<div className={styles.gameModes} role="group" aria-label="Тренировка">{modes.map(value=><button type="button" key={value} aria-pressed={visibleMode===value} onClick={()=>{if(value==="memory"&&visibleMode!==value)setRun(current=>current+1);setMode(value);remember({mode:value});}}>{`${modeIcons[value]} ${value==="letters"?"Буква":value==="listening"?"На слух":value==="search"?"Поиск":modeTitles[value]}`}</button>)}</div>}</>}
      {pack.words.length>6&&!(stage==="training"&&(visibleMode==="placement"||visibleMode==="dictation"))&&<p className={styles.cue}>{roundStart+1}–{roundEnd} / {pack.words.length}</p>}
      {stage==="choice"&&<><div className={styles.activityCards} role="group" aria-label="Выбери активность"><button type="button" data-tone="repeat" onClick={()=>{setCardSession({index:roundStart,viewed:[]});setRun(value=>value+1);setStage("cards");remember({stage:"cards",index:roundStart,viewed:[]});}}><span aria-hidden="true">▱</span><strong>Карточки слов</strong>{cardSession.viewed.length>0&&<small>Повторить</small>}</button>{modes.map((value,index)=><button type="button" data-tone={index%5} key={value} onClick={()=>{if(value==="memory")setRun(current=>current+1);setMode(value);setMoreGames(true);setStage("training");remember({stage:"training",mode:value});}}><span aria-hidden="true">{modeIcons[value]}</span><strong>{modeTitles[value]}</strong></button>)}</div>{hasNextRound&&<button type="button" className={styles.nextWords} onClick={()=>{const index=roundEnd;setRound(value=>value+1);setCardSession({index,viewed:[]});setRun(value=>value+1);phase("choice");remember({stage:"choice",index,viewed:[]});}}>Следующие слова →</button>}</>}
      {stage==="cards"&&(pack.id==="requests"||pack.id==="child-classroom"||pack.id==="child-friends"||pack.id==="adult-everyday"||pack.id==="adult-small-talk")&&<p className={styles.cue}>{pack.cue}</p>}
      <div key={`${pack.id}:${round}`} className={styles.exercise}>
        {stage==="cards"&&<VocabularyCards key={`${pack.id}:${run}`} words={roundWords} initialSession={{...cardSession,index:cardSession.index-roundStart}} onSessionChange={(localIndex,viewed)=>{const index=localIndex+roundStart;setCardSession({index,viewed});remember({index,viewed});}} onComplete={()=>phase("choice")} textOnly={!roundWords.some(word=>word.illustration)} renderRating={word=><TopicWordRating word={word} set={pack}/>} renderDetails={pack.kind==="verbs"?word=><QuickVerbDetails key={word.id} wordId={word.id} active/>:undefined}/> }
        {stage==="training"&&visibleMode === "pairs" && <WordPairs key={`${pack.id}:${round}`} words={roundWords} blocks={[{ id: pack.words.length>6?`${pack.pairId??`quick:${pack.id}`}:round:${round}`:pack.pairId??`quick:${pack.id}`, title: pack.title, words: roundWords.map(word => word.id) }]} onMistake={mistake} embedded minimal maxVisible={4} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&isChild && visibleMode === "writing" && <VocabularyWriting onMistake={mistake} words={roundWords} title={pack.title} phrases={pack.kind==="phrases"}/>}
        {stage==="training"&&isChild && visibleMode === "search" && canSearch && <WordSearch words={roundWords} title={pack.title} embedded/>}
        {stage==="training"&&visibleMode==="memory"&&<WordMemory key={`${pack.id}:${round}:memory:${run}`} words={roundWords} attempt={run} child={isChild} onMistake={mistake} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&visibleMode==="sorting"&&<FoodSorting key={`${pack.id}:${round}:sorting`} words={roundWords} child={isChild} onMistake={mistake} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&(visibleMode==="builder"||visibleMode==="sequence")&&<WordBuilder key={`${pack.id}:${round}:${visibleMode}`} words={roundWords} mode={visibleMode} child={isChild} onMistake={mistake} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&((visibleMode==="letters"&&canLetters)||(visibleMode==="listening"&&canListen))&&<WordMiniGame onMistake={mistake} key={`${pack.id}:${round}:${visibleMode}`} words={roundWords} mode={visibleMode as "letters"|"listening"} child={isChild} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&visibleMode==="placement"&&spatial==="placement"&&<SpatialPlacement onMistake={mistake} child={isChild} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&visibleMode==="dictation"&&spatial==="dictation"&&<GraphicDictation onMistake={mistake} child={isChild} onComplete={()=>phase("choice")}/>}
        {learner&&<button type="button" className={styles.nextWords} onClick={()=>personal.addSet(pack)}>В мою колоду · {pack.words.filter(word=>personal.rows.some(row=>row.wordId===word.id)).length} / {pack.words.length}</button>}
      </div>
    </>}
  </section></dialog>;
}
