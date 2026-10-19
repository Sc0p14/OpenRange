import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  ["/dashboard", "Главная"],
  ["/training", "Тренировка"],
  ["/lineups", "Раскиды"],
  ["/lineups/new", "Редактор"],
  ["/prefire", "Prefire"],
  ["/profile", "Профиль"],
  ["/settings", "Настройки"]
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Основная навигация">
        <Link className="brand" href="/dashboard">
          OPENRANGE <span>LOCAL</span>
        </Link>
        <nav>
          {navigation.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <p className="local-badge">● Локальный режим</p>
      </aside>
      <section className="content">
        <header>
          <p className="eyebrow">OpenRange / local-only</p>
          <h1>{title}</h1>
        </header>
        {children}
      </section>
    </main>
  );
}
