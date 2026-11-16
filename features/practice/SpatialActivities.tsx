"use client";
import {useRef,useState} from "react";
import {placementTasks,dictationTasks,directionWords,commandText,type SpatialObject,type SpatialPlace,type GridPoint} from "../content/spatial-practice";
import {catalogWords} from "../content/learning-catalog-view";
import type {VocabularyWord} from "../content/vocabulary-model";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import {ActivityCompletion} from "./ActivityCompletion";
import {appendTrace,checkTrace,placementCorrect,placeObject,type Placements} from "./spatial-model";
import styles from "./SpatialActivities.module.css";

const atlas="/images/vocabulary/space-drawn-v1.webp";
const crop=(x:number,y:number,width:number,height:number)=>({src:atlas,column:0,row:0,crop:{x,y,width,height,sourceWidth:1254,sourceHeight:1254}});
const catArt=crop(404,7,146,171),boxArt=crop(946,129,192,164);
const objects:readonly {id:SpatialObject;label:string;art:NonNullable<VocabularyWord["illustration"]>}[]=[
  {id:"cat",label:"o gato",art:catArt},
  ...(["book","bag"] as const).map((id)=>{const label=id==="book"?"o livro":"a mochila";const word=catalogWords.find(word=>word.label===label&&word.illustration)!;return {id,label,art:word.illustration!};}),
];
const places:readonly {id:SpatialPlace;label:string}[]=[{id:"inside",label:"Внутри коробки"},{id:"above",label:"На коробке"},{id:"below",label:"Под коробкой"},{id:"left",label:"Слева рядом с коробкой"},{id:"right",label:"Справа рядом с коробкой"}];
type Props={child:boolean;onComplete:()=>void;onMistake?:(wordId:string)=>void};
export function SpatialPlacement({child,onComplete,onMistake}:Props){
  const [index,setIndex]=useState(0),[chosen,setChosen]=useState<SpatialObject|null>(null),[history,setHistory]=useState<Placements[]>([{}]);
  const [result,setResult]=useState<"correct"|"wrong"|null>(null),[score,setScore]=useState(0),[missed,setMissed]=useState(false),[finished,setFinished]=useState(false),[ru,setRu]=useState(false);
  const task=placementTasks[index],state=history.at(-1)!;
  function move(place:SpatialPlace,object=chosen){if(!object||result==="correct")return;setHistory(old=>[...old,placeObject(old.at(-1)!,object,place)]);setResult(null);}
  function check(){const correct=placementCorrect(task,state);setResult(correct?"correct":"wrong");if(correct&&!missed)setScore(value=>value+1);if(!correct){if(!missed)onMistake?.(task.wordId);setMissed(true);}}
  function next(){if(index===placementTasks.length-1){setFinished(true);return;}setIndex(value=>value+1);setChosen(null);setHistory([{}]);setResult(null);setMissed(false);setRu(false);}
  if(finished)return <ActivityCompletion id="spatial:placement:v1" title="Где находится? · Расстановка" group="Слова и игры" correct={score} total={placementTasks.length} child={child}><button type="button" onClick={onComplete}>К активностям</button></ActivityCompletion>;
  return <section className={styles.activity} aria-label="Расставь по инструкции">
    <div className={styles.top}><span>{index+1} / {placementTasks.length}</span><button type="button" aria-pressed={ru} onClick={()=>setRu(value=>!value)}>⇄ Перевод</button></div>
    <h2 lang={ru?"ru":"pt-PT"}>{ru?task.ru:task.pt}</h2><CardSpeechButton text={task.pt}/>
    <div className={styles.tray} role="group" aria-label="Выбери предмет">{objects.map(object=><button type="button" key={object.id} aria-pressed={chosen===object.id} disabled={result==="correct"} draggable onDragStart={event=>{setChosen(object.id);event.dataTransfer.setData("text/plain",object.id);}} onClick={()=>setChosen(object.id)}><VocabularyIllustration illustration={object.art}/><span lang="pt-PT">{object.label}</span></button>)}</div>
    <div className={styles.scene} role="group" aria-label="Коробка и места для предметов"><div className={styles.table}/><div className={styles.box}><VocabularyIllustration illustration={boxArt}/></div>{places.map(place=>{const placed=objects.find(object=>state[object.id]===place.id);return <button type="button" key={place.id} className={styles.zone} data-place={place.id} aria-label={placed?`${place.label}: ${placed.label}`:place.label} disabled={!chosen||result==="correct"} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();const id=event.dataTransfer.getData("text/plain");if(objects.some(object=>object.id===id))move(place.id,id as SpatialObject);}} onClick={()=>move(place.id)}>{placed?<VocabularyIllustration illustration={placed.art}/>:<span aria-hidden="true">＋</span>}</button>;})}{Object.values(state).includes("inside")&&<div className={`${styles.box} ${styles.front}`}><VocabularyIllustration illustration={boxArt}/></div>}</div>
    <div className={styles.status} role="status">{result==="correct"?"✓ Certo! Верно.":result==="wrong"?"Tenta outra vez. Проверь предмет и его место.":chosen?"Нажми на место для предмета. Можно перенести его ещё раз.":"Выбери предмет, затем его место."}</div>
    <div className={styles.actions}><button type="button" disabled={history.length===1||result==="correct"} onClick={()=>{setHistory(old=>old.slice(0,-1));setResult(null);}}>↶ Отменить</button>{result==="correct"?<button type="button" onClick={next}>{index===placementTasks.length-1?"Завершить":"Дальше"}</button>:<button type="button" disabled={!Object.keys(state).length} onClick={check}>Проверить</button>}</div>
  </section>;
}

export function GraphicDictation({child,onComplete,onMistake}:Props){
  const [index,setIndex]=useState(0),[trace,setTrace]=useState<GridPoint[]>([dictationTasks[0].start]),[feedback,setFeedback]=useState<ReturnType<typeof checkTrace>|null>(null);
  const [score,setScore]=useState(0),[missed,setMissed]=useState(false),[finished,setFinished]=useState(false),[ru,setRu]=useState(false);
  const drawing=useRef(false),board=useRef<HTMLDivElement>(null),task=dictationTasks[index];
  const resolved=feedback?.correct===true;
  function visit(point:GridPoint){if(resolved)return;setTrace(old=>old.at(-1)?.x===point.x&&old.at(-1)?.y===point.y?old:appendTrace(old,point,task.size));setFeedback(null);}
  function check(){const result=checkTrace(task,trace);setFeedback(result);if(result.correct&&!missed)setScore(value=>value+1);if(!result.correct){if(!missed){let end=0;const command=task.commands.find(command=>{end+=command.count;return result.mismatch<=end;})??task.commands.at(-1)!;onMistake?.(directionWords[command.direction].id);}setMissed(true);}}
  function next(){if(index===dictationTasks.length-1){setFinished(true);return;}const next=index+1;setIndex(next);setTrace([dictationTasks[next].start]);setFeedback(null);setMissed(false);}
  if(finished)return <ActivityCompletion id="spatial:dictation:v1" title="Направления · Графический диктант" group="Слова и игры" correct={score} total={dictationTasks.length} child={child}><button type="button" onClick={onComplete}>К активностям</button></ActivityCompletion>;
  return <section className={styles.activity} aria-label="Графический диктант">
    <div className={styles.top}><span>{index+1} / {dictationTasks.length}</span><button type="button" aria-pressed={ru} onClick={()=>setRu(value=>!value)}>⇄ Перевод</button></div>
    <h2>{ru?"Нарисуй по командам":"Desenha pelas instruções"}</h2>
    <ol className={styles.commands}>{task.commands.map((command,i)=><li key={i} lang={ru?"ru":"pt-PT"}><b>{command.count}</b><span aria-hidden="true">{({right:"→",left:"←",up:"↑",down:"↓"})[command.direction]}</span><span>{ru?directionWords[command.direction].translation:directionWords[command.direction].label}</span></li>)}</ol>
    <CardSpeechButton text={task.commands.map(command=>commandText(command)).join(" ")} label="Послушать команды"/>
    <div ref={board} className={styles.board} style={{touchAction:"none"}} onPointerUp={()=>{drawing.current=false;}} onPointerCancel={()=>{drawing.current=false;}} onPointerLeave={()=>{drawing.current=false;}} onPointerMove={event=>{if(!drawing.current)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>("[data-grid-point]");if(target&&board.current?.contains(target))visit({x:Number(target.dataset.x),y:Number(target.dataset.y)});}}>
      <svg className={styles.lines} viewBox="0 0 5 5" aria-hidden="true">{Array.from({length:5},(_,i)=><g key={i} stroke="#c8d8e5" strokeWidth=".015"><path d={`M .5 ${i+.5} H 4.5 M ${i+.5} .5 V 4.5`}/></g>)}<polyline fill="none" stroke={feedback&&!resolved?"#bd4766":"#397db3"} strokeWidth=".065" strokeLinejoin="round" strokeLinecap="round" points={trace.map(point=>`${point.x+.5},${point.y+.5}`).join(" ")}/></svg>
      <div className={styles.nodes} role="group" aria-label="Поле 5 на 5">{Array.from({length:25},(_,i)=>{const point={x:i%5,y:Math.floor(i/5)},current=trace.at(-1)!,start=point.x===task.start.x&&point.y===task.start.y;return <button type="button" key={i} data-grid-point data-x={point.x} data-y={point.y} disabled={resolved} aria-current={current.x===point.x&&current.y===point.y} aria-label={`Строка ${point.y+1}, столбец ${point.x+1}${start?", старт":""}`} onPointerDown={()=>{drawing.current=true;visit(point);}} onClick={()=>visit(point)}><span aria-hidden="true">{start?"●":"·"}</span></button>;})}</div>
    </div>
    <div className={styles.status} role="status">{resolved?"✓ Certo! Рисунок получился.":feedback?feedback.reason==="short"?"Путь ещё не закончен.":feedback.reason==="long"?"Есть лишние шаги. Их можно отменить.":`Проверь шаг ${feedback.mismatch}. Можно отменить последние шаги.`:"Начни с большой точки. Нажимай соседние точки или веди линию."}</div>
    <div className={styles.actions}><button type="button" disabled={trace.length===1||resolved} onClick={()=>{setTrace(old=>old.slice(0,-1));setFeedback(null);}}>↶ Шаг назад</button>{resolved?<button type="button" onClick={next}>{index===dictationTasks.length-1?"Завершить":"Дальше"}</button>:<button type="button" disabled={trace.length===1} onClick={check}>Проверить</button>}</div>
  </section>;
}
