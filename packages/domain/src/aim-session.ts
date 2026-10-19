/**
 * Kill aggregation over local-player GSI payloads.
 *
 * CS2 reports per-round absolute counters `round_kills` / `round_killhs` which reset on
 * each new round (verified live, docs/research/gsi.md). We therefore keep the running
 * maximum observed per round number; session totals are the sum across rounds. This is
 * robust against payload retries and heartbeat repeats because the max never decreases.
 */

export interface SessionAggregationState {
  roundMax: Record<string, { kills: number; hsKills: number }>;
}

export interface SessionTotals {
  kills: number;
  hsKills: number;
  rounds: number;
}

export function emptyAggregationState(): SessionAggregationState {
  return { roundMax: {} };
}

export interface PayloadSnapshot {
  round: number | null;
  roundKills: number | null;
  roundKillHs: number | null;
}

/** Extracts only the fields the aggregation must trust. Unknown/missing data is ignored. */
export function readSnapshot(payload: unknown): PayloadSnapshot {
  const snapshot: PayloadSnapshot = { round: null, roundKills: null, roundKillHs: null };
  if (typeof payload !== "object" || payload === null) return snapshot;
  const root = payload as Record<string, unknown>;
  const map = root.map;
  if (map !== null && typeof map === "object") {
    const round = (map as Record<string, unknown>).round;
    if (typeof round === "number" && Number.isInteger(round) && round >= 0) snapshot.round = round;
  }
  const player = root.player;
  if (player !== null && typeof player === "object") {
    const state = (player as Record<string, unknown>).state;
    if (state !== null && typeof state === "object") {
      const kills = (state as Record<string, unknown>).round_kills;
      const hs = (state as Record<string, unknown>).round_killhs;
      if (typeof kills === "number" && kills >= 0) snapshot.roundKills = kills;
      if (typeof hs === "number" && hs >= 0) snapshot.roundKillHs = hs;
    }
  }
  return snapshot;
}

export function applySnapshot(
  state: SessionAggregationState,
  snapshot: PayloadSnapshot
): SessionAggregationState {
  const { round, roundKills, roundKillHs } = snapshot;
  if (round === null || roundKills === null) return state;
  const key = String(round);
  const existing = state.roundMax[key] ?? { kills: 0, hsKills: 0 };
  const nextHs = roundKillHs === null ? existing.hsKills : Math.max(existing.hsKills, roundKillHs);
  // Guard against a corrupt counter exceeding kills.
  const nextKills = Math.max(existing.kills, roundKills);
  return {
    roundMax: {
      ...state.roundMax,
      [key]: { kills: nextKills, hsKills: Math.min(nextHs, nextKills) }
    }
  };
}

export function totals(state: SessionAggregationState): SessionTotals {
  let kills = 0;
  let hsKills = 0;
  for (const round of Object.values(state.roundMax)) {
    kills += round.kills;
    hsKills += round.hsKills;
  }
  return { kills, hsKills, rounds: Object.keys(state.roundMax).length };
}

export interface SessionOpening {
  shouldOpen: boolean;
  mapName: string | null;
  mode: string | null;
}

/** A session is playable when the local player is active on a loaded map. */
export function readSessionOpening(payload: unknown): SessionOpening {
  if (typeof payload !== "object" || payload === null)
    return { shouldOpen: false, mapName: null, mode: null };
  const root = payload as Record<string, unknown>;
  const player = root.player;
  const map = root.map;
  const activity =
    player !== null && typeof player === "object"
      ? (player as Record<string, unknown>).activity
      : null;
  const mapName =
    map !== null && typeof map === "object"
      ? ((map as Record<string, unknown>).name ?? null)
      : null;
  const mode =
    map !== null && typeof map === "object"
      ? ((map as Record<string, unknown>).mode ?? null)
      : null;
  const phase =
    map !== null && typeof map === "object"
      ? ((map as Record<string, unknown>).phase ?? null)
      : null;
  return {
    shouldOpen: activity === "playing" && typeof mapName === "string" && Boolean(phase),
    mapName: typeof mapName === "string" ? mapName : null,
    mode: typeof mode === "string" ? mode : null
  };
}

/** A session ends when the client returns to the menu, idles, or finishes the match. */
export function readSessionClosure(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) return false;
  const activity = (
    (payload as Record<string, unknown>).player as Record<string, unknown> | undefined
  )?.activity;
  const phase = ((payload as Record<string, unknown>).map as Record<string, unknown> | undefined)
    ?.phase;
  return activity === "menu" || activity === "inactive" || phase === "gameover";
}
