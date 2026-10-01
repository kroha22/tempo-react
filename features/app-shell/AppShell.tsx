import Link from "next/link";

type AppShellProps = {
  current: "learning" | "cards";
  children: React.ReactNode;
};

const areas = [
  { id: "learning", href: "/learning", label: "Обучение" },
  { id: "cards", href: "/cards", label: "Карточки" },
] as const;

export function AppShell({ current, children }: AppShellProps) {
  return (
    <div className="tempo-shell">
      <a className="skip-link" href="#main-content">Перейти к содержимому</a>
      <header className="tempo-shell__header">
        <Link className="tempo-shell__brand" href="/learning" aria-label="Tempo — на главную обучения">
          <span aria-hidden="true">T</span>
          <b>TEMPO</b>
        </Link>
        <nav className="tempo-shell__nav" aria-label="Основные разделы">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={area.href}
              aria-current={current === area.id ? "page" : undefined}
            >
              {area.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="tempo-shell__main" id="main-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
