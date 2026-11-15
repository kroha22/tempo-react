"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {wordLibraryFor,type WordLearningSet} from "../content/word-learning-library";
import {wordBrowseSets} from "../content/word-browse-sets";
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
import {UnifiedWordReview,WordReviewEntry} from "./UnifiedWordReview";
import {SaveWordSet} from "./SaveWordSet";
import {wordRoundRanges,wordSessionTimestamp,type WordLearningSession} from "./word-learning-session";

type Mode = "pairs" | "writing" | "search" | "letters" | "listening";
const packSymbols:Record<string,string>={hello:"👋",polite:"🤝","adult-everyday":"🏡","adult-small-talk":"💬","adult-shopping":"🛍️","adult-plans":"🗓️",backpack:"🎒",instructions:"📖",requests:"🙋","child-classroom":"🙋","child-friends":"🤝","child-games":"🎲","browse:essentials":"⭐"};
export function QuickWords({ child = false, onBack,sourceIds,initialSetId }: { child?: boolean; onBack: () => void;sourceIds?:readonly string[];initialSetId?:string }) {
  const screen = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = screen.current;
    if (dialog && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    return () => { if(dialog?.open && dialog.close) dialog.close(); };
  }, []);
  const learner = useProfileLearning();
  const isChild = learner?.profile.child ?? child;
  const library=useMemo(()=>wordLibraryFor(isChild),[isChild]);
  const sets=useMemo(()=>sourceIds?library.filter(set=>sourceIds.some(id=>set.id===id||set.aliases.includes(id))):wordBrowseSets(isChild),[library,sourceIds,isChild]);
  const [selected, setSelected] = useState<string | null>(initialSetId??(sourceIds&&sets.length===1?sets[0].id:null));
  const [filter,setFilter]=useState<"all"|QuickSetKind>("all");
  const [search,setSearch]=useState("");
  const [review,setReview]=useState(false);
  const [cardSession,setCardSession]=useState({index:0,viewed:[] as string[]});
  const [run,setRun]=useState(0);
  const [round,setRound]=useState(0);
  const [stage,setStage]=useState<"cards"|"choice"|"training">("choice");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({preventScroll:true});
    screen.current?.scrollTo?.(0,0);
  }, [selected,stage,review]);
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
  function remember(next:Partial<WordLearningSession>,setId=pack?.id){
    if(!setId)return;
    const value={setId,stage,index:cardSession.index,viewed:cardSession.viewed,mode,updatedAt:wordSessionTimestamp(),...next};
    learner?.update(current=>({...current,wordSession:value}));
  }
  function choose(item:WordLearningSet,resume?:WordLearningSession){
    const restored=resume&&(resume.setId===item.id||item.aliases.includes(resume.setId))?resume:undefined;
    setMoreGames(!!restored&&["letters","listening"].includes(restored.mode));setSelected(item.id);setStage(restored?.stage??"choice");setMode(restored?.mode??"pairs");
    const previous=restored&&library.find(set=>set.id===restored.setId);
    const previousWord=previous?.words[restored?.index??0];
    const mappedIndex=restored&&restored.setId!==item.id&&previousWord?item.words.findIndex(word=>word.id===previousWord.id):-1;
    const next={index:Math.min(mappedIndex>=0?mappedIndex:restored?.index??0,item.words.length-1),viewed:(restored?.viewed??[]).filter(id=>item.words.some(word=>word.id===id))};
    setCardSession(next);setRun(current=>current+1);remember({...next,stage:restored?.stage??"choice",mode:restored?.mode??"pairs"},item.id);
    setRound(Math.max(0,wordRoundRanges(item.words.length).findIndex(range=>next.index<range.end)));
  }
  function phase(next:typeof stage){setStage(next);remember({stage:next});}
  function back() { if(review)setReview(false);else if(pack&&stage!=="choice")phase("choice");else if(pack&&sourceIds&&sets.length===1)onBack();else if(pack){setSelected(null);setSearch("");}else onBack(); }
  const resume=learner?.learning.wordSession;
  const resumeSet=resume?(sets.find(set=>set.id===resume.setId||set.aliases.includes(resume.setId))??library.find(set=>set.id===resume.setId)):undefined;
  return <dialog ref={screen} className={styles.screen} data-child={isChild} aria-label="Учить слова" onCancel={event => {event.preventDefault();back();}}><section className={styles.root}>
    <header className={styles.header}><button type="button" className={styles.back} aria-label={review?"Назад":pack ? stage==="training"?"Назад":stage==="cards"?"К активностям":"Все наборы" : "К урокам"} onClick={back}>←</button><h1 ref={heading} tabIndex={-1}>{review?"Повторение":pack ? pack.title : "Учить слова"}</h1></header>
    {learner?.savingError&&<p role="alert">Продолжение не сохранено. <button type="button" onClick={()=>remember({})}>Повторить сохранение</button></p>}
    {review?<UnifiedWordReview/>:!pack ? <>{learner&&<div className={styles.homeActions}>{resumeSet&&<button type="button" onClick={()=>choose(resumeSet,resume)}>Продолжить · {resumeSet.title}</button>}<WordReviewEntry onOpen={()=>setReview(true)}/></div>}{!sourceIds&&<div className={styles.libraryTools}><div className={styles.searchRow}><input type="search" aria-label="Найти подборку" placeholder="Найти…" value={search} onChange={event=>setSearch(event.target.value)}/>{search&&<button type="button" className={styles.clearSearch} aria-label="Очистить поиск" onClick={()=>setSearch("")}>×</button>}</div></div>}<div className={styles.modes} role="group" aria-label="Вид подборок">{(["all","words","verbs","phrases"] as const).map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{({all:"Все",words:"Слова",verbs:"Глаголы",phrases:"Фразы"})[value]}</button>)}</div><div className={styles.grid}>{sets.filter(item=>(filter==="all"||item.kind===filter)&&`${item.title} ${item.pt} ${item.cue}`.toLowerCase().includes(search.toLowerCase())).map((item, index) => <button type="button" className={styles.pack} data-tone={index % 5} aria-label={`${item.pt} ${item.title} ${item.words.length} карточек`} key={item.id} onClick={() => choose(item)}><strong lang="pt-PT">{item.pt}</strong>{item.title!==item.pt&&<span>{item.title}</span>}<small>{item.words.length} карточек</small><span className={styles.packArt} aria-hidden="true">{learningCoverArt[item.id]?<LearningCoverArt id={item.id}/>:item.words.find(word=>word.illustration)?.illustration?<VocabularyIllustration illustration={item.words.find(word=>word.illustration)!.illustration!}/>:learningCoverSource(item.id,item.aliases)?<LearningCoverArt id={item.id} aliases={item.aliases}/>:<span>{packSymbols[item.id]??(item.kind==="verbs"?"⚡":item.kind==="phrases"?"💬":"📚")}</span>}</span></button>)}</div></> : <>
      {stage==="training"&&<>{!isChild&&<button type="button" className={styles.moreGames} aria-expanded={moreGames} onClick={()=>setMoreGames(value=>!value)}>Другие игры</button>}{(isChild||moreGames)&&<div className={styles.gameModes} role="group" aria-label="Тренировка">{(["pairs",...(canLetters?["letters"] as const:[]),...(canListen?["listening"] as const:[]),...(isChild?["writing"] as const:[]),...(isChild&&canSearch?["search"] as const:[])] as const).map(value=><button type="button" key={value} aria-pressed={visibleMode===value} onClick={()=>{setMode(value);remember({mode:value});}}>{({pairs:"↔ Пары",letters:"А_ Буква",listening:"♫ На слух",writing:"✎ Написать",search:"⌕ Поиск"})[value]}</button>)}</div>}</>}
      {pack.words.length>6&&<p className={styles.cue}>{roundStart+1}–{roundEnd} / {pack.words.length}</p>}
      {stage==="choice"&&<><div className={styles.activityCards} role="group" aria-label="Выбери активность"><button type="button" data-tone="repeat" onClick={()=>{setCardSession({index:roundStart,viewed:[]});setRun(value=>value+1);setStage("cards");remember({stage:"cards",index:roundStart,viewed:[]});}}><span aria-hidden="true">▱</span><strong>Карточки слов</strong>{cardSession.viewed.length>0&&<small>Повторить</small>}</button>{(["pairs",...(canLetters?["letters"] as const:[]),...(canListen?["listening"] as const:[]),...(isChild?["writing"] as const:[]),...(isChild&&canSearch?["search"] as const:[])] as const).map((value,index)=><button type="button" data-tone={index%5} key={value} onClick={()=>{setMode(value);setMoreGames(true);setStage("training");remember({stage:"training",mode:value});}}><span aria-hidden="true">{({pairs:"↔",letters:"А_",listening:"♫",writing:"✎",search:"⌕"})[value]}</span><strong>{({pairs:"Пары",letters:"Вставь букву",listening:"Послушай и выбери",writing:"Написать",search:"Поиск слов"})[value]}</strong></button>)}</div>{hasNextRound&&<button type="button" className={styles.nextWords} onClick={()=>{const index=roundEnd;setRound(value=>value+1);setCardSession({index,viewed:[]});setRun(value=>value+1);phase("choice");remember({stage:"choice",index,viewed:[]});}}>Следующие слова →</button>}</>}
      {stage==="cards"&&(pack.id==="child-classroom"||pack.id==="child-friends"||pack.id==="adult-everyday"||pack.id==="adult-small-talk")&&<p className={styles.cue}>{pack.cue}</p>}
      <div key={`${pack.id}:${round}`} className={styles.exercise}>
        {stage==="cards"&&<VocabularyCards key={`${pack.id}:${run}`} words={roundWords} initialSession={{...cardSession,index:cardSession.index-roundStart}} onSessionChange={(localIndex,viewed)=>{const index=localIndex+roundStart;setCardSession({index,viewed});remember({index,viewed});}} onComplete={()=>phase("choice")} textOnly={!roundWords.some(word=>word.illustration)} renderDetails={pack.kind==="verbs"?word=><QuickVerbDetails key={word.id} wordId={word.id} active/>:undefined}/> }
        {stage==="training"&&visibleMode === "pairs" && <WordPairs key={`${pack.id}:${round}`} words={roundWords} blocks={[{ id: pack.words.length>6?`${pack.pairId??`quick:${pack.id}`}:round:${round}`:pack.pairId??`quick:${pack.id}`, title: pack.title, words: roundWords.map(word => word.id) }]} embedded minimal maxVisible={4} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&isChild && visibleMode === "writing" && <VocabularyWriting words={roundWords} title={pack.title} phrases={pack.kind==="phrases"}/>}
        {stage==="training"&&isChild && visibleMode === "search" && canSearch && <WordSearch words={roundWords} title={pack.title} embedded/>}
        {stage==="training"&&((visibleMode==="letters"&&canLetters)||(visibleMode==="listening"&&canListen))&&<WordMiniGame key={`${pack.id}:${round}:${visibleMode}`} words={roundWords} mode={visibleMode as "letters"|"listening"} child={isChild} onComplete={()=>phase("choice")}/>}
        {stage==="training"&&learner&&<SaveWordSet set={pack}/>}
      </div>
    </>}
  </section></dialog>;
}
