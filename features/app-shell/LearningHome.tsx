import Link from "next/link";
import { presentationModeParam, routeModeHref, type PresentationMode } from "@/features/learning/presentation-mode";

const actions = [
  { href: "/learning/route", icon: "→", title: "Продолжить учиться", copy: "Вернуться к разделу «Я и пространство»", primary: true },
  { href: "/learning/topics/ser-estar", icon: "◎", title: "Разобраться в теме", copy: "Понятные объяснения и примеры", primary: false },
  { href: "/learning/errors", icon: "↺", title: "Повторить сложное", copy: "Ещё раз пройти то, что пока не получается", primary: false },
  { href: "/learning/conjugation", icon: "◇", title: "Формы глаголов", copy: "Повторить глаголы, которые встретились в уроках", primary: false },
  { href: "/learning/practice", icon: "＋", title: "Свободная практика", copy: "Выбрать глагол и потренироваться", primary: false },
] as const;

export function LearningHome({ mode = "adult" }: { mode?: PresentationMode }) {
  const isKingdoms = mode === "kingdoms";
  return (
    <section className={isKingdoms ? "learning-home learning-home--kingdoms" : "learning-home"}>
      <div className="learning-home__intro">
        <span className="tempo-kicker">{isKingdoms ? "Для детей · A1.1" : "Европейский португальский · A1.1"}</span>
        <h1>{isKingdoms ? "Учимся по-детски" : "Продолжим с того места, где остановились"}</h1>
        <p>{isKingdoms ? "Те же уроки и ответы, но с мягким сказочным оформлением." : "Короткие уроки, живые примеры и практика без лишней теории."}</p>
      </div>
      <nav className="presentation-mode" aria-label="Оформление обучения">
        <Link href="/learning" aria-current={mode === "adult" ? "page" : undefined}>Взрослый</Link>
        <Link href="/learning?mode=kingdoms" aria-current={mode === "kingdoms" ? "page" : undefined}>Для детей</Link>
      </nav>
      {isKingdoms && <div className="kingdom-banner" aria-hidden="true">
        <span>AR</span><span>ER</span><span>IR</span><span>★</span>
      </div>}
      <div className="learning-home__grid">
        {actions.map((action) => (
          <Link className={`learning-action${action.primary ? " learning-action--primary" : ""}`} href={`${action.href}${action.href.startsWith("/learning") ? presentationModeParam(mode) : ""}`} key={action.href}>
            <span className="learning-action__icon" aria-hidden="true">{action.icon}</span>
            <span><b>{action.title}</b><small>{action.copy}</small></span>
          </Link>
        ))}
      </div>
      <aside className="unit-preview" aria-label="Текущий раздел">
        <div><span>{isKingdoms ? "Детский маршрут" : "Сейчас изучаем"}</span><h2>Я и пространство</h2></div>
        <p>{isKingdoms ? "6 коротких уроков · в конце — детское задание «Новая комната»" : "6 коротких уроков · в конце — задание «Новая комната»"}</p>
        <Link href={routeModeHref("/learning/route", mode)}>Посмотреть все уроки</Link>
      </aside>
    </section>
  );
}
