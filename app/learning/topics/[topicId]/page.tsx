import Link from "next/link";
import { AppShell } from "@/features/app-shell/AppShell";
import { people, verbs } from "@/features/conjugation/data";

export default async function TopicPage({ params, searchParams }: { params: Promise<{ topicId: string }>; searchParams: Promise<{ returnLesson?: string; phase?: string }> }) {
  const { topicId } = await params;
  const context = await searchParams;
  const returnHref = context.returnLesson ? `/learning/lessons/${encodeURIComponent(context.returnLesson)}?resumePhase=${encodeURIComponent(context.phase ?? "learn")}` : "/learning";
  const isFicar = topicId === "ficar-location";
  return <AppShell current="learning">
    <section className="topic-page">
      <Link className="tempo-back" href={returnHref}>← {context.returnLesson ? "Вернуться в урок" : "Обучение"}</Link>
      <span className="tempo-kicker">Разбираемся в теме</span>
      <h1>{isFicar ? "FICAR: где находится место" : "SER и ESTAR"}</h1>
      {!isFicar && (
        <figure className="topic-hero" aria-label="Визуальное сравнение SER и ESTAR">
          <figcaption><span>SER</span><b>кто это и какой он</b><i>ESTAR — как сейчас и где</i></figcaption>
        </figure>
      )}
      <div className="topic-tabs" role="tablist" aria-label="Режим темы">
        <button role="tab" aria-selected="true">Объяснение</button>
        <Link role="tab" aria-selected="false" href={isFicar ? "/learning/practice?verb=ficar" : "/learning/lessons/lesson:a1-1:ser-estar-description-state"}>Практика</Link>
      </div>
      {isFicar ? <>
        <p className="topic-explanation"><b>FICAR</b> помогает сказать, где находится место или ориентир. Остальные значения этого глагола разберём позже.</p>
        <div className="contrast-cards">
          <article><span>Где находится место</span><strong>A farmácia fica no centro.</strong><small>Аптека находится в центре.</small></article>
          <article><span>Где человек сейчас</span><strong>O Rui está na farmácia.</strong><small>Сейчас Руй в аптеке.</small></article>
        </div>
        <Link className="topic-practice-link" href="/learning/practice?verb=ficar">Потренировать FICAR →</Link>
      </> : <>
        <p className="topic-explanation"><b>SER</b> используем, когда называем человека или предмет и говорим, какой он. <b>ESTAR</b> — когда описываем состояние сейчас или говорим, где кто-то находится.</p>
        <div className="contrast-cards">
          <article><span>Какой он вообще</span><strong>O Rui é calmo.</strong><small>Руй спокойный по характеру.</small></article>
          <article><span>Как он чувствует себя сейчас</span><strong>O Rui está calmo.</strong><small>Сейчас Руй спокоен.</small></article>
        </div>
        <div className="conjugation-compare"><header><div><span>SER</span><h2>Кто это и какой он</h2></div><Link href="/learning/practice?verb=ser">Потренировать SER →</Link></header><div>{people.map((person) => <p key={person.key}><span>{person.label}</span><strong>{verbs.ser.forms.present[person.key]}</strong></p>)}</div></div>
        <div className="conjugation-compare conjugation-compare--estar"><header><div><span>ESTAR</span><h2>Как сейчас и где</h2></div><Link href="/learning/practice?verb=estar">Потренировать ESTAR →</Link></header><div>{people.map((person) => <p key={person.key}><span>{person.label}</span><strong>{verbs.estar.forms.present[person.key]}</strong></p>)}</div></div>
      </>}
    </section>
  </AppShell>;
}
