import { randomUUID } from "node:crypto";

import {
  applySnapshot,
  emptyAggregationState,
  readSessionClosure,
  readSessionOpening,
  readSnapshot,
  totals
} from "@openrange/domain";

import type Database from "better-sqlite3";

export interface AimSession {
  id: string;
  status: "open" | "closed";
  mapName: string | null;
  mode: string | null;
  startedAt: Date;
  endedAt: Date | null;
  kills: number;
  hsKills: number;
}

interface SessionRow {
  id: string;
  status: "open" | "closed";
  map_name: string | null;
  mode: string | null;
  started_at: number;
  ended_at: number | null;
  kills: number;
  hs_kills: number;
  summary_json: string;
  updated_at: number;
}

const IDLE_SESSION_TIMEOUT_MS = 10 * 60 * 1000;

function toSession(row: SessionRow): AimSession {
  return {
    id: row.id,
    status: row.status,
    mapName: row.map_name,
    mode: row.mode,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at === null ? null : new Date(row.ended_at),
    kills: row.kills,
    hsKills: row.hs_kills
  };
}

let schemaReady = false;
function ensureSchema(database: Database.Database): void {
  if (schemaReady) return;
  database.exec(`CREATE TABLE IF NOT EXISTS aim_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
    map_name TEXT,
    mode TEXT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    kills INTEGER NOT NULL DEFAULT 0,
    hs_kills INTEGER NOT NULL DEFAULT 0,
    summary_json TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS aim_sessions_started_at_idx ON aim_sessions(started_at DESC);`);
  schemaReady = true;
}

export function getOpenAimSession(database: Database.Database): AimSession | null {
  ensureSchema(database);
  const row = database
    .prepare<[], SessionRow>(
      "SELECT * FROM aim_sessions WHERE status = 'open' ORDER BY started_at DESC LIMIT 1"
    )
    .get();
  if (!row) return null;
  if (Date.now() - row.updated_at > IDLE_SESSION_TIMEOUT_MS) {
    database
      .prepare(
        "UPDATE aim_sessions SET status = 'closed', ended_at = ? WHERE id = ? AND status = 'open'"
      )
      .run(row.updated_at, row.id);
    return null;
  }
  return toSession(row);
}

export function ingestPayloadIntoSession(
  database: Database.Database,
  payload: unknown
): { session: AimSession; changed: boolean } | null {
  ensureSchema(database);
  const opening = readSessionOpening(payload);
  if (readSessionClosure(payload) || !opening.shouldOpen) {
    closeOpenSessions(database);
    return null;
  }

  const session = getOpenAimSession(database);
  if (!session) {
    const id = randomUUID();
    const now = Date.now();
    database
      .prepare(
        "INSERT INTO aim_sessions (id, status, map_name, mode, started_at, summary_json, updated_at) VALUES (?, 'open', ?, ?, ?, ?, ?)"
      )
      .run(id, opening.mapName, opening.mode, now, JSON.stringify(emptyAggregationState()), now);
    return ingestPayloadIntoSession(database, payload);
  }

  if (opening.mapName && session.mapName && opening.mapName !== session.mapName) {
    database
      .prepare(
        "UPDATE aim_sessions SET status = 'closed', ended_at = ?, updated_at = ? WHERE id = ?"
      )
      .run(Date.now(), Date.now(), session.id);
    return ingestPayloadIntoSession(database, payload);
  }

  const currentRow = database
    .prepare<[string], SessionRow>("SELECT * FROM aim_sessions WHERE id = ?")
    .get(session.id);
  if (!currentRow) return null;
  const state = safeState(currentRow.summary_json);
  const updatedState = applySnapshot(state, readSnapshot(payload));
  const next = totals(updatedState);
  if (
    next.kills === currentRow.kills &&
    next.hsKills === currentRow.hs_kills &&
    Math.abs(Date.now() - currentRow.updated_at) < 1000
  ) {
    return { session, changed: false };
  }
  database
    .prepare(
      "UPDATE aim_sessions SET kills = ?, hs_kills = ?, summary_json = ?, updated_at = ? WHERE id = ?"
    )
    .run(next.kills, next.hsKills, JSON.stringify(updatedState), Date.now(), session.id);
  return { session: getOpenAimSession(database) ?? session, changed: true };
}

function safeState(json: string) {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed !== null && typeof parsed === "object" && "roundMax" in parsed) {
      return parsed as { roundMax: Record<string, { kills: number; hsKills: number }> };
    }
  } catch {
    // fall through to a fresh state on corrupt data
  }
  return emptyAggregationState();
}

export function closeOpenSessions(database: Database.Database): boolean {
  ensureSchema(database);
  const result = database
    .prepare(
      "UPDATE aim_sessions SET status = 'closed', ended_at = ?, updated_at = ? WHERE status = 'open'"
    )
    .run(Date.now(), Date.now());
  return result.changes > 0;
}

export function listAimSessions(database: Database.Database, limit = 20): AimSession[] {
  ensureSchema(database);
  return database
    .prepare<[number], SessionRow>("SELECT * FROM aim_sessions ORDER BY started_at DESC LIMIT ?")
    .all(limit)
    .map(toSession);
}
