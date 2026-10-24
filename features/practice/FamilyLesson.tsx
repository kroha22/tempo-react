"use client";
import {ChildPresentation} from "./ActivityCompletion";
import {useState} from "react";
import {closeFamilyKeys,familyExamples,familyPossessiveExamples} from "../content/family-lesson";
import {topicExpansion} from "../content/vocabulary-catalog";
import {learningCatalog} from "../content/learning-catalog";
import {FamilyPossessives} from "./FamilyPossessives";
import {IdentityVocabulary} from "./IdentityLesson";
import {VocabularyCards} from "./VocabularyCards";
import {UsagePractice} from "./UsagePractice";
import {LegacyLessonLink} from "./LegacyLessonLink";
import styles from "./FirstSteps.module.css";
import {useProfileLearning} from "./profile-learning";
import {publicAssetUrl} from "../../shared/public-asset";

const familyWords=closeFamilyKeys.map(key=>topicExpansion.byKey.get(key)!);
const usage=learningCatalog.usageModules.find(item=>item.id==="usage:family")!;
export function FamilyLesson({initialChildMode=false,onBack,onNext}:{initialChildMode?:boolean;onBack?:()=>void;onNext?:()=>void}) {
  const learner=useProfileLearning();
  const [localChild,setChild]=useState(initialChildMode),[phase,setPhase]=useState<"words"|"possessives"|"professions"|"examples"|"practice">("words");
  const child=learner?.profile.child??localChild;
  const contextualUsage={...usage,relatedLinks:usage.relatedLinks.map(link=>link.kind==="practice"&&child?{...link,href:`${link.href}&mode=kingdoms`}:link)};
  return <ChildPresentation value={child}><section className={styles.pilot} aria-label="Моя семья: слова и SER" data-presentation={child?"child":"adult"}>
    {onBack&&<button type="button" className="pair-back" onClick={onBack}>‹ К первым шагам</button>}
    <span className="tempo-kicker">A minha família · Моя семья</span>{onBack?<h1>Рассказываем о близких</h1>:<h2>Рассказываем о близких</h2>}
    {!learner&&<div className={styles.switch} role="group" aria-label="Подача семейного урока"><button type="button" aria-pressed={!child} onClick={()=>setChild(false)}>Для взрослых</button><button type="button" aria-pressed={child} onClick={()=>setChild(true)}>Для детей</button></div>}
    <p>{child?"Познакомься с семьёй на картинке. Повтори названия близких, а потом расскажи, кто кем работает или учится.":"Повторим шесть слов о близких и применим знакомый SER, чтобы назвать профессию или роль."} Картинка — повод для рассказа: профессии людей на ней не заданы. Можно придумать свою семью персонажей.</p>
    <nav className={styles.steps} aria-label="Шаги семейного урока">{([ ["words","Palavras — Слова"],["possessives","Meu / teu — Чей? Чья?"],["professions","Profissões — Профессии"],["examples","Frases — Примеры"],["practice","Pratica — Попробуй"] ] as const).map(([id,title])=><button type="button" key={id} aria-current={phase===id?"step":undefined} onClick={()=>setPhase(id)}>{title}</button>)}</nav>
    <div hidden={phase!=="words"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.familyScene} src={publicAssetUrl("/images/covers/family-parents-v1.webp")} alt="Мальчик в очках читает книгу вместе с мамой и папой"/>
      <VocabularyCards words={familyWords} active={phase==="words"}/><button type="button" onClick={()=>setPhase("possessives")}>Разобраться с meu и teu →</button><button type="button" onClick={()=>setPhase("examples")}>К фразам с SER →</button>
      <details className={styles.distantFamily}>
        <summary>Родственники в другом городе</summary>
        <p>У мамы мальчика есть сестра. Для мальчика она — тётя, а её старшая и младшая дочки — его двоюродные сёстры. Они живут далеко, в другом городе.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={publicAssetUrl("/images/covers/aunt-reading-v1.webp")} alt="Тётя мальчика читает книгу со старшей и младшей дочками" loading="lazy"/>
        <p>У каждой семьи свои повседневные истории: можно рассказать о чтении, занятиях и жизни в своём городе.</p>
      </details>
    </div>
    <div hidden={phase!=="possessives"}><FamilyPossessives child={child}/><button type="button" onClick={()=>setPhase("examples")}>К примерам о близких →</button></div>
    {phase==="professions"&&<><p>Общий набор из темы «Кто я». Выбери профессию для близкого или персонажа.</p><IdentityVocabulary/><button type="button" onClick={()=>setPhase("examples")}>К семейным фразам →</button></>}
    <div hidden={phase!=="examples"}><p>Сравни рассказ о своей семье и о семье собеседника. Можно придумать близких персонажа.</p><div className={styles.examples}>{[...familyExamples,...familyPossessiveExamples].map(example=><article key={example.pt}><strong lang="pt-PT">{example.pt}</strong><span>{example.ru}</span></article>)}</div>
      <p>Профессии можно повторить во вкладке «Profissões». Это тот же набор, что и в «Кто я».</p><LegacyLessonLink href="/learning/practice?lesson=ser-estar">SER / ESTAR: общее объяснение и формы →</LegacyLessonLink>
      <button type="button" onClick={()=>setPhase("practice")}>Попробовать составить фразы →</button>
    </div>
    <div hidden={phase!=="practice"}><UsagePractice module={contextualUsage} active={phase==="practice"} onComplete={onNext} completionLabel="Дальше: Как я себя чувствую →"/></div>
    <aside className={styles.links}><LegacyLessonLink href={`/learning/practice?verb=ser&tense=present${child?"&mode=kingdoms":""}`}>Потренировать SER →</LegacyLessonLink></aside>
  </section></ChildPresentation>;
}
