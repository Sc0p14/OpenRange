import { LineupForm } from "../../../components/lineup-form";
import { AppShell } from "../../../components/app-shell";

export default function NewLineupPage() {
  return (
    <AppShell title="Новый раскид">
      <LineupForm />
    </AppShell>
  );
}
