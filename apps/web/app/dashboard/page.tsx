import { AppShell } from "../../components/app-shell";

export default function DashboardPage() {
  return (
    <AppShell title="Главная">
      <section className="grid">
        <article className="panel stat">
          Локальный профиль<strong>Готов</strong>
        </article>
        <article className="panel stat">
          Подключение к игре<strong>Не настроено</strong>
        </article>
        <article className="panel stat">
          Тренировок<strong>0</strong>
        </article>
      </section>
    </AppShell>
  );
}
