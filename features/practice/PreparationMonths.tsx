"use client";
import {useState} from "react";
import {calendarMonths} from "../content/calendar";
import {ActivityCompletion} from "./ActivityCompletion";
import {LessonText,useLessonText} from "./LessonText";
import styles from "./TestPreparation.module.css";

const mixedMonths=[8,1,6,3,11,0,9,4,2,10,7,5];
const longMonths=new Set([0,2,4,6,7,9,11]);

export function KnuckleHint(){
  const translated=useLessonText()?.translated;
  return <figure className={styles.knuckleHint}>
    <svg viewBox="0 0 360 170" role="img" aria-label={translated?"Два кулачка: костяшки — 31 день; впадинки — 30, февраль — 28 или 29":"Dois punhos: nós — 31 dias; espaços — 30, fevereiro — 28 ou 29"}>
      {[0,180].map((x,i)=><g key={x} transform={`translate(${x} 0)`}>
        <path d="M12 119V76Q12 48 32 48Q50 48 50 70Q50 37 69 37Q88 37 88 65Q88 34 107 34Q126 34 126 65Q126 42 145 42Q165 42 165 72V121Q163 153 133 155H48Q18 151 12 119Z" fill="#ffe4be" stroke="#a67447" strokeWidth="2"/>
        <path d="M50 74V105M88 68V103M126 68V105M35 125Q90 139 145 121" fill="none" stroke="#d3a571" strokeWidth="2"/>
        {(i===0?["Jan","Mar","Mai","Jul"]:["Ago","Out","Dez",""]).map((label,j)=><g key={j}><circle cx={32+j*38} cy={i===0?[48,37,34,42][j]:[48,37,34,42][j]} r="10" fill="#9bc9a5" stroke="#3e7151"/><text x={32+j*38} y="17" textAnchor="middle" fontSize="13" fontWeight="700" fill="#294b39">{label}</text>{label&&<text x={32+j*38} y="88" textAnchor="middle" fontSize="12" fill="#294b39">31</text>}</g>)}
        {(i===0?["Fev","Abr","Jun"]:["Set","Nov",""]).map((label,j)=><text key={j} x={51+j*38} y="116" textAnchor="middle" fontSize="12" fill="#704f32">{label}</text>)}
      </g>)}
    </svg>
    <figcaption><LessonText text="Nós: 31 dias. Espaços: 30; fevereiro: 28 ou 29. Para agosto, recomeça no primeiro nó." translation="Костяшки: 31 день. Впадинки: 30; февраль: 28 или 29. Для августа вернись к первой костяшке."/></figcaption>
  </figure>;
}

export function PreparationMonths(){
  const help=useLessonText();const ru=help?.translated;
  const [ordered,setOrdered]=useState<number[]>([]),[orderChecked,setOrderChecked]=useState(false);
  const [marked,setMarked]=useState<number[]>([]),[daysChecked,setDaysChecked]=useState(false);
  const orderCorrect=ordered.filter((month,i)=>month===i).length;
  const daysCorrect=calendarMonths.filter((_,i)=>marked.includes(i)===longMonths.has(i)).length;
  const name=(index:number)=>calendarMonths[index][ru?1:0];
  return <section className={styles.monthPractice} aria-label="Практика месяцев">
    <KnuckleHint/>
    <h3><LessonText text="1. Põe os meses por ordem" translation="1. Расставь месяцы по порядку" audio/></h3>
    <p><LessonText text="Toca nos meses, começando em janeiro. Para retirar um mês, toca nele na tua sequência." translation="Нажимай на месяцы, начиная с января. Чтобы убрать месяц, нажми на него в своей последовательности." audio/></p>
    <ol className={styles.monthOrder} aria-label="Твой порядок месяцев">{Array.from({length:12},(_,i)=><li key={i}>{ordered[i]===undefined?<span>{i+1}. …</span>:<button type="button" aria-label={`Убрать: ${calendarMonths[ordered[i]][0]}`} onClick={()=>{setOrdered(ordered.filter((_,j)=>i!==j));setOrderChecked(false);}}>{i+1}. {name(ordered[i])} ×</button>}</li>)}</ol>
    <div className={styles.monthPool} role="group" aria-label="Перепутанные месяцы">{mixedMonths.map(index=><button type="button" key={index} disabled={ordered.includes(index)} onClick={()=>{setOrdered([...ordered,index]);setOrderChecked(false);}}>{name(index)}</button>)}</div>
    <div className="house-tools"><button type="button" disabled={ordered.length!==12} onClick={()=>setOrderChecked(true)}>{ru?"Проверить порядок":"Verificar a ordem"}</button><button type="button" onClick={()=>{setOrdered([]);setOrderChecked(false);}}>{ru?"Начать заново":"Recomeçar"}</button></div>
    {orderChecked&&<div role="status">{orderCorrect===12?<ActivityCompletion child={false} id="prep:months:order" title="Месяцы по порядку" group="Время и планы" correct={12} total={12}><p className={styles.success}>✓ {ru?"Все 12 месяцев на своих местах!":"Os 12 meses estão no lugar certo!"}</p></ActivityCompletion>:<p>{ru?`На своём месте: ${orderCorrect} из 12. Убери перепутанные месяцы и добавь их снова.`:`No lugar certo: ${orderCorrect} de 12. Retira os meses trocados e volta a colocá-los.`}</p>}</div>}
    <h3><LessonText text="2. Quais têm 31 dias?" translation="2. В каких месяцах 31 день?" audio/></h3>
    <p><LessonText text="Marca todos os meses com 31 dias. Usa os punhos como ajuda." translation="Отметь все месяцы с 31 днём. Используй кулачки как подсказку." audio/></p>
    <div className={styles.monthChecks}>{calendarMonths.map((_,i)=><label key={i}><input type="checkbox" aria-label={`31 dias: ${calendarMonths[i][0]}`} checked={marked.includes(i)} onChange={()=>{setMarked(marked.includes(i)?marked.filter(m=>m!==i):[...marked,i]);setDaysChecked(false);}}/>{name(i)}</label>)}</div>
    <button type="button" onClick={()=>setDaysChecked(true)}>{ru?"Проверить месяцы с 31 днём":"Verificar os meses com 31 dias"}</button>
    {daysChecked&&<div role="status">{daysCorrect===12?<ActivityCompletion child={false} id="prep:months:days" title="Месяцы с 31 днём" group="Время и планы" correct={12} total={12}><p className={styles.success}>✓ {ru?"Верно! Все месяцы отмечены правильно.":"Correto! Todos os meses estão bem assinalados."}</p></ActivityCompletion>:<p>{ru?"Проверь отметки по костяшкам. В июле и августе по 31 дню; февраль — особый месяц.":"Confere as marcas nos nós dos dedos. Julho e agosto têm 31 dias; fevereiro é especial."}</p>}</div>}
  </section>;
}
