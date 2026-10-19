import { LineupForm } from "../../../components/lineup-form";
import { AppShell } from "../../../components/app-shell";

export default async function EditLineupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell title="Редактор раскида">
      <LineupForm id={id} />
    </AppShell>
  );
}
