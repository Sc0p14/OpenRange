import { AppShell } from "./app-shell";

export function ScreenPlaceholder({
  title,
  description,
  phase
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <AppShell title={title}>
      <section className="panel">
        <p>{description}</p>
        <p className="muted">Будет реализовано: {phase}</p>
      </section>
    </AppShell>
  );
}
