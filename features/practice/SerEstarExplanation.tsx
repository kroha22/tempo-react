import {beingContent} from "../content/first-steps";
import {people,verbs} from "../conjugation/data";
import styles from "./FirstSteps.module.css";
import {publicAssetUrl} from "../../shared/public-asset";
import {DescriptionReading,DescriptionParagraph,DescriptionExamples} from "./DescriptionReading";
import {shortGrammarReading} from "../content/grammar-reading";
import {LessonText} from "./LessonText";
import {readingSource} from "../content/reading-sources";

export function SerEstarExplanation({childMode=false,focus="both",showForms=true,illustrations=true}:{childMode?:boolean;focus?:"ser"|"estar"|"both";showForms?:boolean;illustrations?:boolean}) {
  const keys=focus==="both"?["ser","estar"] as const:[focus];
  const content=<section className={styles.explanation} aria-label="Общее объяснение SER и ESTAR" data-presentation={childMode?"child":"adult"}>
    {focus==="both"&&(childMode?<p>Посмотри на Руя. Можно рассказать, какой он, а можно — как он чувствует себя сейчас.</p>:<DescriptionParagraph pt={shortGrammarReading["ser-estar"]} ru={beingContent.contrast.rule}/>)}
    <div className={styles.contrast}>{keys.map(key=><article key={key} data-verb={key}>
      {illustrations&&(
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.scene} src={publicAssetUrl(`/${key}-guide-${childMode?"kingdoms":"adult"}.webp`)} alt={key==="ser"?"Люди, роли и происхождение":"Состояние, положение и изменения"}/>
      )}
      <span className={styles.symbol} aria-hidden="true">{beingContent[key].icon}</span><h3>{key.toUpperCase()}</h3><b>{childMode?beingContent[key].question:beingContent[key].title}</b>
      {childMode?<><strong lang="pt-PT">{beingContent[key].example.pt}</strong><span>{beingContent[key].example.ru}</span></>:<DescriptionExamples examples={[beingContent[key].example]}/>}
      {!childMode&&<DescriptionParagraph pt={shortGrammarReading[key]} ru={beingContent[key].rule}/>}
    </article>)}</div>
    <details><summary>{childMode?"Почему здесь разные слова?":"Подробное объяснение"}</summary>{childMode?<>{keys.map(key=><p key={key}>{beingContent[key].rule}</p>)}<p>{beingContent.contrast.rule}</p></>:<DescriptionParagraph pt={shortGrammarReading["ser-estar"]} ru={beingContent.contrast.rule}/>}<p>{childMode?<>Для места: <b lang="pt-PT">O Rui está em casa.</b> — Руй дома. Для происхождения: <b lang="pt-PT">O Rui é de Lisboa.</b> — Руй из Лиссабона.</>:<LessonText text="Para indicar a localização: O Rui está em casa. Para indicar a origem: O Rui é de Lisboa." translation="Для места: O Rui está em casa. — Руй дома. Для происхождения: O Rui é de Lisboa. — Руй из Лиссабона."/>}</p></details>
    {showForms&&<details><summary>Формы настоящего времени</summary><div className={styles.contrast}>{keys.map(key=><div key={key}><h3>{key.toUpperCase()}</h3>{people.map(person=><p key={person.key}><span>{person.label}</span> — <b lang="pt-PT">{verbs[key].forms.present[person.key]}</b></p>)}</div>)}</div></details>}
  </section>;
  return childMode?content:<DescriptionReading key={focus} source={readingSource(`lesson:short:${focus==="both"?"ser-estar":focus}`)}>{content}</DescriptionReading>;
}
