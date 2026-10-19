import { AppShell } from "../../components/app-shell";
import { SettingsForm } from "../../components/settings-form";

export default function SettingsPage() {
  return (
    <AppShell title="Настройки">
      <SettingsForm />
    </AppShell>
  );
}
