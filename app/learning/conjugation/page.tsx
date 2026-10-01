import Link from "next/link";
import { AppShell } from "@/features/app-shell/AppShell";
import { allVerbKeys, verbs, type VerbGroup } from "@/features/conjugation/data";

const groups: { id: VerbGroup; title: string; copy: string }[] = [
  { id: "irregular", title: "Частые неправильные глаголы", copy: "SER, ESTAR, TER и другие" },
  { id: "ar", title: "Глаголы -AR", copy: "falar, estudar, trabalhar и другие" },
  { id: "er", title: "Глаголы -ER", copy: "comer, beber, aprender и другие" },
  { id: "ir", title: "Глаголы -IR", copy: "partir, abrir, decidir и другие" },
];

export default function ConjugationPage() {
  return <AppShell current="learning"><section className="conjugation-hub">
    <Link className="tempo-back" href="/learning">← Обучение</Link>
    <span className="tempo-kicker">Глаголы и формы</span>
    <h1>Формы глаголов из ваших уроков</h1>
    <p className="conjugation-hub__lead">Выберите глагол: сначала разберёмся, когда он нужен, а затем потренируем формы. Можно начать с SER и ESTAR или сразу открыть знакомый глагол.</p>
    <div className="conjugation-featured">
      <article><span>SER</span><h2>Кто? Что это? Какой?</h2><p>Когда называем, определяем или описываем.</p><div><Link href="/learning/topics/ser-estar">Разобраться в SER и ESTAR</Link><Link href="/learning/practice?verb=ser">Тренировать SER →</Link></div></article>
      <article><span>ESTAR</span><h2>Как сейчас? Где?</h2><p>Когда говорим о состоянии сейчас или о месте.</p><div><Link href="/learning/topics/ser-estar">Сравнить SER и ESTAR</Link><Link href="/learning/practice?verb=estar">Тренировать ESTAR →</Link></div></article>
    </div>
    <div className="verb-group-list">{groups.map((group) => <section key={group.id}><header><div><h2>{group.title}</h2><p>{group.copy}</p></div><span>{allVerbKeys.filter((key) => verbs[key].group === group.id).length}</span></header><div>{allVerbKeys.filter((key) => verbs[key].group === group.id).map((key) => <Link href={`/learning/practice?verb=${key}&tense=present`} key={key}><b>{verbs[key].infinitive}</b><small>{verbs[key].translation}</small><i aria-hidden="true">→</i></Link>)}</div></section>)}</div>
  </section></AppShell>;
}
