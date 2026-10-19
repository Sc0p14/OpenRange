import { AimSessionWidget } from "../../components/aim-session-widget";
import { AppShell } from "../../components/app-shell";

export default function TrainingPage() {
  return (
    <AppShell title="Тренировка">
      <p>
        Запустите приёмник (<code>pnpm --filter @openrange/gsi-receiver dev</code>) и зайдите в
        локальный матч в CS2 — сессия появится сама.
      </p>
      <AimSessionWidget />
    </AppShell>
  );
}
