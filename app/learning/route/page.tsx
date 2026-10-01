import Link from "next/link";
import { AppShell } from "@/features/app-shell/AppShell";
import { RouteMap } from "@/features/learning/components/RouteMap";
import { parsePresentationMode, routeModeHref } from "@/features/learning/presentation-mode";

export default async function RoutePage({ searchParams }: { searchParams?: Promise<{ mode?: string | string[] }> }) {
  const mode = parsePresentationMode((await searchParams)?.mode);
  const isKingdoms = mode === "kingdoms";
  return (
    <AppShell current="learning">
      <section className={isKingdoms ? "route-map route-map--kingdoms" : "route-map"}>
        <Link className="tempo-back" href={routeModeHref("/learning", mode)}>← Обучение</Link>
        <span className="tempo-kicker">{isKingdoms ? "Для детей · Раздел 1" : "A1.1 · Раздел 1"}</span>
        <h1>{isKingdoms ? "Детский маршрут" : "Я и пространство"}</h1>
        <p className="route-map__lead">{isKingdoms ? "Проходим те же уроки: знакомимся, называем предметы и открываем новые игровые комнаты." : "Научимся знакомиться, называть предметы и говорить, где они находятся."}</p>
        <nav className="presentation-mode" aria-label="Оформление маршрута">
          <Link href="/learning/route" aria-current={mode === "adult" ? "page" : undefined}>Взрослый</Link>
          <Link href="/learning/route?mode=kingdoms" aria-current={mode === "kingdoms" ? "page" : undefined}>Для детей</Link>
        </nav>
        {isKingdoms && <div className="route-kingdom-banner" aria-hidden="true">
          <span>AR</span><span>ER</span><span>IR</span><span>★</span>
        </div>}
        <RouteMap mode={mode} />
      </section>
    </AppShell>
  );
}
