"use client";
import {useEffect,useRef,useState} from "react";
import {preparationUnits,type PrepUnit,type PrepTarget} from "../content/test-preparation";
import {calendarGlossary} from "../content/calendar-translations";
import {LessonText,LessonTextContext,useLessonText} from "./LessonText";
import {useTextHelp} from "./LessonHelp";
import {ActivityCompletion,ChildPresentation} from "./ActivityCompletion";
import {useProfileLearning} from "./profile-learning";
import styles from "./TestPreparation.module.css";

const subjects={portuguese:["Português","Португальский"],math:["Matemática","Математика"],world:["Estudo do Meio","Окружающий мир"]} as const;
const translations:Record<string,string>={"Preparar o teste":"Подготовка к проверочной","Rever":"Повторить","Praticar":"Практика","Agora no papel":"Теперь на бумаге",...Object.fromEntries(Object.values(subjects))};
for(const unit of preparationUnits){for(const pair of [unit.title,unit.rule,unit.paper,...unit.examples,...(unit.notice?[unit.notice]:[]),...unit.questions.flatMap(q=>[q.prompt,q.feedback,...q.options])])translations[pair[0]]=pair[1];}
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

export function TestPreparation({initialUnitId,onUnitChange,onBack,onOpen,initialChildMode=false}:{initialUnitId:string|null;onUnitChange:(id:string|null)=>void;onBack:()=>void;onOpen:(target:PrepTarget)=>void;initialChildMode?:boolean}){
  const [subject,setSubject]=useState<keyof typeof subjects>(preparationUnits.find(u=>u.id===initialUnitId)?.subject??"world");
  const [unitId,setUnitId]=useState(initialUnitId),[phase,setPhase]=useState("learn");
  const {help,controls,popup,close}=useTextHelp(translations,preparationGlossary);
  const learner=useProfileLearning();const heading=useRef<HTMLHeadingElement>(null),first=useRef(true);
  const unit=preparationUnits.find(item=>item.id===unitId);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView?.({block:"start"});},[unitId,phase]);
  function open(id:string|null){setUnitId(id);onUnitChange(id);setPhase("learn");help.reset();}
  function changePhase(id:string){setPhase(id);help.reset();}
  return <ChildPresentation value={learner?.profile.child??initialChildMode}><LessonTextContext value={help}><section className="house-activity" aria-label="Набор подготовки к проверочной" onKeyDown={e=>{if(e.key==="Escape")close();}}>
    <button type="button" className="pair-back" onClick={unit?()=>open(null):onBack}>{unit?"← К списку подготовки":"← Ко всем темам"}</button>
    <h1 ref={heading} tabIndex={-1}><LessonText text="Preparar o teste" audio/></h1>{controls}
    {!unit?<><p>Все темы из присланных памяток и пяти рабочих листов. Можно повторять в любом порядке. У готовых уроков есть переход; рядом — короткая проверка и инструкция для бумаги.</p><nav className={styles.subjects} aria-label="Предмет подготовки">{Object.entries(subjects).map(([id,[pt,ru]])=><button type="button" key={id} aria-pressed={subject===id} onClick={()=>setSubject(id as keyof typeof subjects)}>{help.translated?ru:pt}</button>)}</nav><p>{preparationUnits.filter(item=>item.subject===subject).length} тем · {preparationUnits.length} всего</p><div className={styles.grid}>{preparationUnits.filter(item=>item.subject===subject).map(item=>{const result=learner?.learning.activities?.[`prep:${item.id}`];return <button type="button" className={styles.unit} key={item.id} onClick={()=>open(item.id)}><b>{help.translated?item.title[1]:item.title[0]}</b><small>{item.title[1]}</small><span>{item.target?"Есть готовый урок · ":""}2 вопроса + бумага</span>{result&&<small>Лучший результат: {result.correct}/{result.total}</small>}</button>;})}</div><p>«Тренировка пройдена» не означает, что лист выполнен правильно. Бумажную работу проверяет взрослый.</p></>:<div key={unit.id}>
      <h2><LessonText text={unit.title[0]} translation={unit.title[1]} audio/></h2><nav className={styles.subjects} aria-label="Блок подготовки">{[["learn","Rever"],["practice","Praticar"],["paper","Agora no papel"]].map(([id,title])=><button type="button" key={id} aria-pressed={phase===id} onClick={()=>changePhase(id)}>{help.translated?translations[title]:title}</button>)}</nav>
      <div hidden={phase!=="learn"}><div className="house-feedback"><p><LessonText text={unit.rule[0]} translation={unit.rule[1]} audio/></p></div>{unit.examples.map(([pt,ru])=><p key={pt}><LessonText text={pt} translation={ru} audio/></p>)}{unit.target&&<p><button type="button" onClick={()=>onOpen(unit.target!)}>{unit.targetLabel} →</button></p>}<button type="button" className="house-primary" onClick={()=>changePhase("practice")}>{help.translated?"Короткая проверка →":"Praticar →"}</button></div>
      <div hidden={phase!=="practice"}><PrepQuiz unit={unit} onPaper={()=>changePhase("paper")}/></div>
      <div hidden={phase!=="paper"}><h3><LessonText text="Agora no papel"/></h3>{unit.notice&&<aside className={styles.notice}><LessonText text={unit.notice[0]} translation={unit.notice[1]} audio/></aside>}<p><LessonText text={unit.paper[0]} translation={unit.paper[1]} audio/></p><p>Листы остаются на бумаге. После выполнения попроси взрослого проверить ответы; при трудностях вернись к объяснению или готовому уроку.</p><button type="button" onClick={()=>open(null)}>К списку подготовки →</button></div>
    </div>}{popup}
  </section></LessonTextContext></ChildPresentation>;
}
