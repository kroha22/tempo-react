import {beingContent} from "../content/first-steps";
import {people,verbs} from "../conjugation/data";
import styles from "./FirstSteps.module.css";
import {publicAssetUrl} from "../../shared/public-asset";

export function SerEstarExplanation({childMode=false,focus="both",showForms=true,illustrations=true}:{childMode?:boolean;focus?:"ser"|"estar"|"both";showForms?:boolean;illustrations?:boolean}) {
  const keys=focus==="both"?["ser","estar"] as const:[focus];
  return <section className={styles.explanation} aria-label="Общее объяснение SER и ESTAR" data-presentation={childMode?"child":"adult"}>
    {focus==="both"&&<p>{childMode?"Посмотри на Руя. Можно рассказать, какой он, а можно — как он чувствует себя сейчас.":beingContent.contrast.rule}</p>}
    <div className={styles.contrast}>{keys.map(key=><article key={key} data-verb={key}>
      {illustrations&&(
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.scene} src={publicAssetUrl(`/${key}-guide-${childMode?"kingdoms":"adult"}.webp`)} alt={key==="ser"?"Люди, роли и происхождение":"Состояние, положение и изменения"}/>
      )}
      <span className={styles.symbol} aria-hidden="true">{beingContent[key].icon}</span><h3>{key.toUpperCase()}</h3><b>{childMode?beingContent[key].question:beingContent[key].title}</b>
      <strong lang="pt-PT">{beingContent[key].example.pt}</strong><span>{beingContent[key].example.ru}</span>
      {!childMode&&<p>{beingContent[key].rule}</p>}
    </article>)}</div>
    <details><summary>{childMode?"Почему здесь разные слова?":"Подробное объяснение"}</summary>{childMode&&keys.map(key=><p key={key}>{beingContent[key].rule}</p>)}<p>{beingContent.contrast.rule}</p><p>Для места: <b lang="pt-PT">O Rui está em casa.</b> — Руй дома. Для происхождения: <b lang="pt-PT">O Rui é de Lisboa.</b> — Руй из Лиссабона.</p></details>
    {showForms&&<details><summary>Формы настоящего времени</summary><div className={styles.contrast}>{keys.map(key=><div key={key}><h3>{key.toUpperCase()}</h3>{people.map(person=><p key={person.key}><span>{person.label}</span> — <b lang="pt-PT">{verbs[key].forms.present[person.key]}</b></p>)}</div>)}</div></details>}
  </section>;
}
