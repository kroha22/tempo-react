"use client";
import {useEffect,useRef,useState} from "react";
import {preparationUnits,type PrepUnit,type PrepTarget} from "../content/test-preparation";
import {calendarGlossary} from "../content/calendar-translations";
import {calendarTranslations} from "../content/calendar-translations";
import {preparationGuides} from "../content/test-preparation-guides";
import {catalogWords} from "../content/learning-catalog-view";
import {VocabularyIllustration} from "./VocabularyIllustration";
import {ClockLesson} from "./ClockLesson";
import {PreparationMonths} from "./PreparationMonths";
import {PreparationBody} from "./PreparationBody";
import {PreparationWords} from "./PreparationWords";
import {preparationKeywords,preparationSheets} from "../content/preparation-support";
import {LessonText,LessonTextContext,useLessonText} from "./LessonText";
import {useTextHelp} from "./LessonHelp";
import {ActivityCompletion,ChildPresentation} from "./ActivityCompletion";
import {useProfileLearning} from "./profile-learning";
import styles from "./TestPreparation.module.css";

const subjects={portuguese:["Português","Португальский"],math:["Matemática","Математика"],world:["Estudo do Meio","Окружающий мир"]} as const;
const translations:Record<string,string>={...calendarTranslations,"Preparar o teste":"Подготовка к проверочной","Rever":"Повторить","Praticar":"Практика","Agora no papel":"Теперь на бумаге",...Object.fromEntries(Object.values(subjects))};
for(const unit of preparationUnits){for(const pair of [unit.title,unit.rule,unit.paper,...unit.examples,...(unit.notice?[unit.notice]:[]),...unit.questions.flatMap(q=>[q.prompt,q.feedback,...q.options])])translations[pair[0]]=pair[1];}
for(const guide of Object.values(preparationGuides))for(const [pt,ru] of [guide.goal,guide.worked,guide.tryIt])translations[pt]=ru;
const glossary={...calendarGlossary,"alfabeto":"алфавит","letras":"буквы","maiúscula":"заглавная","minúscula":"строчная","ossos":"кости","músculos":"мышцы","órgãos":"органы","coração":"сердце","pulmões":"лёгкие","rins":"почки","estômago":"желудок","sangue":"кровь","digestão":"пищеварение","vacinas":"вакцины","antibióticos":"антибиотики","vírus":"вирусы","bactérias":"бактерии","primeiro":"первый","segundo":"второй","terceiro":"третий","quinto":"пятый","sexto":"шестой","sétimo":"седьмой","oitavo":"восьмой","nono":"девятый","décimo":"десятый","vigésimo":"двадцатый","anterior":"предыдущий","sucessor":"следующий","carro":"машина","caro":"дорогой","casa":"дом","massa":"макароны","peixe":"рыба","táxi":"такси","folha":"лист","ninho":"гнездо","chuva":"дождь","campo":"поле","dente":"зуб","braço":"рука","prato":"тарелка","flor":"цветок"};

const preparationGlossary={...glossary,
  "vogais":"гласные", "consoantes":"согласные", "dígrafo":"две буквы, обозначающие один звук",
  "sílabas":"слоги", "nasais":"носовые", "esqueleto":"скелет", "tendões":"сухожилия",
  "oxigénio":"кислород", "dióxido de carbono":"углекислый газ", "urina":"моча",
  "postura":"осанка", "mochila":"рюкзак", "alças":"лямки", "higiene":"гигиена",
  "vacinação":"вакцинация", "prevenir":"предупреждать", "tratar":"лечить", "defesas":"защитные силы",
  "assinala":"отметь", "liga":"соедини", "completa":"заполни", "pinta":"раскрась", "amarelo":"жёлтый",
  "anterior":"предыдущий", "sucessor":"следующий", "meta":"финиш", "acontecimentos":"события",
  "vestido":"платье", "lápis":"карандаш", "luz":"свет", "mês":"месяц", "gelo":"лёд", "girafa":"жираф",
  "guitarra":"гитара", "foguete":"ракета", "guia":"гид", "exame":"экзамен", "próximo":"следующий",
};

function PrepQuiz({unit,onPaper}:{unit:PrepUnit;onPaper:()=>void}){
  const help=useLessonText()!;
  const [index,setIndex]=useState(0),[selected,setSelected]=useState<number|null>(null),[checked,setChecked]=useState(false),[score,setScore]=useState(0);
  const question=unit.questions[index];
  if(!question)return <ActivityCompletion id={`prep:${unit.id}`} title={unit.title[1]} group="Слова в жизни" correct={score} total={unit.questions.length}><h3>{help.translated?"Короткая проверка завершена":"Revisão concluída"}</h3><p>{help.translated?"Это результат тренировки, а не оценка бумажного листа.":"Este resultado é da prática, não da ficha em papel."}</p><button type="button" onClick={()=>{setIndex(0);setScore(0);setSelected(null);setChecked(false);help.reset();}}>{help.translated?"Повторить проверку":"Repetir a prática"}</button><button type="button" onClick={onPaper}>{help.translated?"Теперь на бумаге →":"Agora no papel →"}</button></ActivityCompletion>;
  return <section aria-label="Короткая проверка"><p>{index+1} / {unit.questions.length}</p><h3><LessonText text={question.prompt[0]} translation={question.prompt[1]} audio/></h3>
    <div className={styles.options}>{question.options.map(([pt,ru],i)=><div key={pt} className={styles.option}><span><LessonText text={pt} translation={ru}/></span><button type="button" disabled={checked} aria-pressed={selected===i} aria-label={`Выбрать вариант ${i+1}`} onClick={()=>setSelected(i)}>{selected===i?"✓":"○"}</button></div>)}</div>
    {!checked?<button type="button" className="house-primary" disabled={selected===null} onClick={()=>setChecked(true)}>{help.translated?"Проверить":"Verificar"}</button>:<div role="status" className="house-feedback"><b>{selected===question.answer?(help.translated?"Верно":"Correto!"):(help.translated?"Посмотри на объяснение":"Vê a explicação")}</b><p><LessonText text={question.feedback[0]} translation={question.feedback[1]} audio/></p><button type="button" onClick={()=>{setScore(score+Number(selected===question.answer));setIndex(index+1);setSelected(null);setChecked(false);help.reset();}}>{index===unit.questions.length-1?(help.translated?"Завершить":"Concluir"):(help.translated?"Следующий вопрос →":"Seguinte →")}</button></div>}
  </section>;
}

function PreparationVisuals({id}:{id:string}){
  if(id==="letters")return <div className={styles.alphabet} aria-label="Печатный алфавит">{Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter=><span key={letter}>{letter} <small>{letter.toLowerCase()}</small></span>)}</div>;
  const labels:Record<string,string[]>={"r-rr":["o carro"],"s-ss":["a casa","a massa"],"c-cedilla":["a cabeça"],"s-z":["o lápis","o vestido"],"g-gu":["a girafa","a guitarra"],nasal:["o dente"],digraphs:["a folha","a galinha"],"x-sounds":["o peixe","o táxi"],clusters:["a flor","o prato"]};
  const words=catalogWords.filter(word=>labels[id]?.includes(word.label)&&word.illustration);
  return !!words.length&&<div className={styles.visualWords}>{words.map(word=><article key={word.id}><VocabularyIllustration illustration={word.illustration!}/><b><LessonText text={word.label} translation={word.translation} audio/></b></article>)}</div>;
}

export function TestPreparation({initialUnitId,onUnitChange,onBack,onOpen,initialChildMode=false,active=true}:{initialUnitId:string|null;onUnitChange:(id:string|null)=>void;onBack:()=>void;onOpen:(target:PrepTarget)=>void;initialChildMode?:boolean;active?:boolean}){
  const [subject,setSubject]=useState<keyof typeof subjects>(preparationUnits.find(u=>u.id===initialUnitId)?.subject??"world");
  const [unitId,setUnitId]=useState(initialUnitId);
  const keywords=preparationKeywords[unitId??""]??[];
  const {help,controls,popup,close}=useTextHelp(translations,{...preparationGlossary,...Object.fromEntries(keywords.flatMap(([pt,ru])=>[[pt,ru],[pt.replace(/^(o|a|os|as) /u,""),ru]]))});
  const learner=useProfileLearning();const heading=useRef<HTMLHeadingElement>(null),first=useRef(true),paper=useRef<HTMLDivElement>(null),returnFocus=useRef<HTMLElement|null>(null);
  const unit=preparationUnits.find(item=>item.id===unitId);
  const guide=unit&&preparationGuides[unit.id];
  useEffect(()=>{if(!active)return;if(returnFocus.current?.isConnected){returnFocus.current.focus({preventScroll:true});returnFocus.current.scrollIntoView?.({block:"center"});returnFocus.current=null;return;}if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[unitId,active]);
  function open(id:string|null){setUnitId(id);onUnitChange(id);help.reset();}
  function goToPaper(){paper.current?.focus({preventScroll:true});paper.current?.scrollIntoView?.({block:"start",behavior:"smooth"});}
  return <ChildPresentation value={learner?.profile.child??initialChildMode}><LessonTextContext value={help}><section className="house-activity" aria-label="Набор подготовки к проверочной" onKeyDown={e=>{if(e.key==="Escape")close();}}>
    <button type="button" className="pair-back" onClick={unit?()=>open(null):onBack}>{unit?"← К списку подготовки":"← Ко всем темам"}</button>
    <h1 ref={heading} tabIndex={-1}><LessonText text="Preparar o teste" audio/></h1>{controls}
    {!unit?<><p>Выбери тему: объяснение, задания и инструкция для бумаги теперь на одной странице.</p><details className={styles.sheetIndex}><summary>Как найти бумажный лист</summary><p>Пронумеруй пять листов с заданиями в таком порядке. Памятки с правилами остаются отдельно.</p><ol>{preparationSheets.map(sheet=><li key={sheet.number}><b>Лист {sheet.number} · {sheet.title[1]}</b><span>{sheet.color} лист. Заголовок: <span lang="pt-PT">{sheet.printed}</span></span></li>)}</ol></details><nav className={styles.subjects} aria-label="Предмет подготовки">{Object.entries(subjects).map(([id,[pt,ru]])=><button type="button" key={id} aria-pressed={subject===id} onClick={()=>setSubject(id as keyof typeof subjects)}>{help.translated?ru:pt}</button>)}</nav><p>{preparationUnits.filter(item=>item.subject===subject).length} тем · {preparationUnits.length} всего</p><div className={styles.grid}>{preparationUnits.filter(item=>item.subject===subject).map(item=>{const result=learner?.learning.activities?.[`prep:${item.id}`];return <button type="button" className={styles.unit} key={item.id} onClick={()=>open(item.id)}><b>{help.translated?item.title[1]:item.title[0]}</b>{!help.translated&&<small>{item.title[1]}</small>}{result&&<small>Лучший результат: {result.correct}/{result.total}</small>}</button>;})}</div></>:<div key={unit.id} className={styles.topicPage}>
      <h2><LessonText text={unit.title[0]} translation={unit.title[1]} audio/></h2>
      {guide&&<p className={styles.goal}><LessonText text={guide.goal[0]} translation={guide.goal[1]} audio/></p>}
      <section className={styles.explanation} aria-label="Объяснение темы"><h3><LessonText text="Rever" audio/></h3><p><LessonText text={unit.rule[0]} translation={unit.rule[1]} audio/></p><PreparationVisuals id={unit.id}/>{guide?.compare&&<div className={styles.compare}>{guide.compare.map(text=><b key={text} lang="pt-PT">{text}</b>)}</div>}{guide&&<div className={styles.worked}><h4><LessonText text="Vamos ver um exemplo" translation="Разберём пример" audio/></h4><p><LessonText text={guide.worked[0]} translation={guide.worked[1]} audio/></p></div>}{unit.examples.map(([pt,ru])=><p key={pt}><LessonText text={pt} translation={ru} audio/></p>)}{guide&&<p className={styles.tryIt}><LessonText text={guide.tryIt[0]} translation={guide.tryIt[1]} audio/></p>}</section>
      {unit.id==="hours"&&<div className={styles.embedded}><ClockLesson embedded/></div>}
      {unit.id==="months"&&<PreparationMonths/>}
      {(unit.id==="organs"||unit.id==="bones")&&<PreparationBody organs={unit.id==="organs"}/>}
      {unit.target&&!["hours","months","organs","bones"].includes(unit.id)&&<p><button type="button" onClick={event=>{returnFocus.current=event.currentTarget;close();onOpen(unit.target!);}}>{unit.targetLabel} →</button></p>}
      <section className={styles.practice} aria-label="Практика темы"><h3><LessonText text="Praticar" audio/></h3><PrepQuiz unit={unit} onPaper={goToPaper}/></section>
      <PreparationWords unitId={unit.id}/>
      <div className={styles.paper} ref={paper} tabIndex={-1} aria-label="Задание на бумаге"><h3><span aria-hidden="true">✎ </span><LessonText text="Agora no papel" audio/></h3>{unit.notice&&<aside className={styles.notice}><LessonText text={unit.notice[0]} translation={unit.notice[1]} audio/></aside>}<p><LessonText text={unit.paper[0]} translation={unit.paper[1]} audio/></p><p><LessonText text="Pede a um adulto para verificar o trabalho quando terminares." translation="Когда закончишь, попроси взрослого проверить работу." audio/></p><button type="button" onClick={()=>open(null)}>К списку подготовки →</button></div>
    </div>}{popup}
  </section></LessonTextContext></ChildPresentation>;
}
