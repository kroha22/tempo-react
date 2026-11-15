import {quickVerbSupport} from "../content/quick-word-expansion";
import {CardSpeechButton} from "../cards/components/CardSpeechButton";
import styles from "./QuickWords.module.css";

export function QuickVerbDetails({wordId,active}:{wordId:string;active:boolean}){
  const support=quickVerbSupport[wordId];
  if(!support)return null;
  return <aside className={styles.verbDetails} aria-label="Формы и пример глагола">
    <div className={styles.spoken}><strong lang="pt-PT">Eu {support.firstPerson}.</strong><CardSpeechButton text={`Eu ${support.firstPerson}.`} disabled={!active}/></div>
    <div className={styles.spoken}><span lang="pt-PT">{support.example.pt}</span><CardSpeechButton text={support.example.pt} disabled={!active}/></div>
    <small lang="ru">{support.example.ru}</small>
    <details><summary>Формы · Presente</summary><dl>{support.forms.map(row=><div key={row.label}><dt lang="pt-PT">{row.label}</dt><dd lang="pt-PT">{row.value}</dd></div>)}</dl></details>
  </aside>;
}
