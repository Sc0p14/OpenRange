import { AimSessionWidget } from "../../components/aim-session-widget";
import { PracticeConfigCard } from "../../components/practice-config-card";
import { AppShell } from "../../components/app-shell";

export default function TrainingPage() {
  return (
    <AppShell title="Тренировка">
      <p>
        Запустите приёмник (<code>pnpm --filter @openrange/gsi-receiver dev</code>) и зайдите в
        локальный матч в CS2 — сессия появится сама.
      </p>
      <AimSessionWidget />
      <PracticeConfigCard />
    </AppShell>
  );
}
