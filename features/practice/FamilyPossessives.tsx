import {familyPossessives} from "../content/family-lesson";
import styles from "./FirstSteps.module.css";

export function FamilyPossessives({child}:{child:boolean}) {
  return <section aria-label="Мой и твой: meu, minha, teu, tua">
    <h3>Чей? Чья? — Meu / minha, teu / tua</h3>
    <p>{child?"Рассказываешь о своей семье — meu или minha. Говоришь другу о его семье — teu или tua. Теперь посмотри на слово: папа или брат — мужской род, мама или сестра — женский.":"Meu/minha означают «мой/моя», teu/tua — «твой/твоя» при обращении на tu. Сначала определяем, о чьих близких говорим, затем согласуем форму с существительным."}</p>
    <div className={styles.examples}>{familyPossessives.map(item=><article key={item.form}><strong lang="pt-PT">{item.example}</strong><span>{item.translation}</span><small><b lang="pt-PT">{item.form}</b> — {item.meaning} · {item.gender}</small></article>)}</div>
    <p>{child?"Рита говорит o meu pai, и Мигел тоже говорит o meu pai. Выбираем meu по слову pai, а не по тому, кто говорит.":"Род говорящего не меняет притяжательное слово: и Рита, и Мигел говорят o meu pai и a minha mãe. Meu согласуется с pai, minha — с mãe."}</p>
    <p><b lang="pt-PT">A minha mãe → a tua mãe.</b> Моя мама → твоя мама. Род слова не изменился, изменилось, о чьей маме говорим.</p>
    <details><summary>{child?"А зачем o и a?":"Артикль перед притяжательным словом"}</summary><p>В европейском португальском в таких обычных сочетаниях обычно ставим артикль: <b lang="pt-PT">o meu pai, a tua irmã</b>. Сейчас тренируем эти сочетания в единственном числе. Teu/tua используем в разговоре на «ты».</p></details>
  </section>;
}
