import { LineupsBrowser } from "../../components/lineups-browser";
import { AppShell } from "../../components/app-shell";

export default function LineupsPage() {
  return (
    <AppShell title="Раскиды">
      <LineupsBrowser />
    </AppShell>
  );
}
