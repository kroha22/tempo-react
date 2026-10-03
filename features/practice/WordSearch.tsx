"use client";
import { useState } from "react";
import type { VocabularyWord } from "../content/vocabulary-model";
import { searchWords, makeSearchBoard, searchPath, findSearchWord } from "./word-search";

export function WordSearch({words}:{words:readonly VocabularyWord[]}){
  const eligible=searchWords(words);const [batch,setBatch]=useState(0);
  const [board,setBoard]=useState(()=>makeSearchBoard(eligible.slice(0,10),731));
  const [start,setStart]=useState<number|null>(null);const [found,setFound]=useState<Record<string,readonly number[]>>({});
  const [focus,setFocus]=useState(0);
  const [hint,setHint]=useState<string|null>(null);const [message,setMessage]=useState("");const [confirm,setConfirm]=useState(false);
  const completed=Object.keys(found).length===board.words.length;const painted=new Set(Object.values(found).flat());
  function select(index:number){
    if(start===null){setStart(index);setMessage("Теперь нажми на последнюю букву.");return;}
    const path=searchPath(board.size,start,index),word=findSearchWord(board,path);setStart(null);
    if(!word){setMessage("Не получилось найти слово. Выбери первую и последнюю буквы ещё раз.");return;}
    if(found[word.id]){setMessage("Это слово уже найдено.");return;}
    setFound(previous=>({...previous,[word.id]:path}));setMessage(`✓ ${word.label} — ${word.translation.toLowerCase()}`);
  }
  function next(nextBatch:number,seed:number){setBatch(nextBatch);setBoard(makeSearchBoard(eligible.slice(nextBatch*10,nextBatch*10+10),seed));setFound({});setStart(null);setHint(null);setMessage("");setConfirm(false);setFocus(0);}
  return <section className="house-activity word-search" onKeyDown={event=>{if(event.key==="Escape"){setHint(null);setStart(null);}}} onClick={event=>{if(!(event.target as HTMLElement).closest(".house-word-entry"))setHint(null);}}><div className="house-heading"><h1>Поиск слов</h1><span>{Object.keys(found).length} / {board.words.length}</span></div><p>Нажми на первую и последнюю буквы. Слова идут вправо, вниз или по диагонали. Артикли и дефисы в сетку не входят; ç и ударения сохранены.</p>
    <div className="word-search-grid" role="group" aria-label="Поле букв" style={{gridTemplateColumns:`repeat(${board.size},1fr)`}}>{board.cells.map((letter,index)=><button type="button" key={index} className={`${painted.has(index)?"is-found":""} ${start===index?"is-start":""}`} aria-pressed={start===index} tabIndex={focus===index?0:-1} onFocus={()=>setFocus(index)} onKeyDown={event=>{const offset=({ArrowRight:1,ArrowLeft:-1,ArrowDown:board.size,ArrowUp:-board.size} as Record<string,number>)[event.key];if(offset){event.preventDefault();const next=Math.max(0,Math.min(board.cells.length-1,index+offset));(event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();}}} aria-label={`Строка ${Math.floor(index/board.size)+1}, столбец ${index%board.size+1}: ${letter}${painted.has(index)?", найдено":""}`} onClick={()=>select(index)} lang="pt-PT">{letter}</button>)}</div>
    <p className="word-search-status" role="status">{message||"Найди на поле одно из слов из списка."}</p>{start!==null&&<button type="button" onClick={()=>{setStart(null);setMessage("");}}>Отменить выделение</button>}
    <div className="word-search-list">{board.words.map(word=><div className={`house-word-entry has-info ${found[word.id]?"is-placed":""}`} key={word.id}><span className="word-search-label" lang="pt-PT">{found[word.id]?"✓ ":""}{word.label}</span><button type="button" className="house-info" aria-label={`Перевод: ${word.label}`} aria-expanded={hint===word.id} onClick={()=>setHint(hint===word.id?null:word.id)}>ⓘ</button>{hint===word.id&&<div className="house-hint" role="status">{word.translation}</div>}</div>)}</div>
    {completed&&<div className="house-feedback"><h2>Все слова найдены!</h2>{(batch+1)*10<eligible.length?<button type="button" className="house-primary" onClick={()=>next(batch+1,Math.floor(Math.random()*2**32))}>Следующие слова →</button>:<p>Тема пройдена. Можно попробовать другой способ изучения.</p>}</div>}
    <div className="house-tools"><span>Набор {batch+1} из {Math.ceil(eligible.length/10)}</span><button type="button" onClick={()=>setConfirm(true)}>Новое поле</button></div>{confirm&&<div className="house-reset"><p>Начать этот набор заново с новым расположением букв?</p><button type="button" onClick={()=>next(batch,Math.floor(Math.random()*2**32))}>Да, начать</button><button type="button" onClick={()=>setConfirm(false)}>Отмена</button></div>}
  </section>;
}
