import { randomUUID } from "node:crypto";

import type { LineupDocument, LineupInput, LineupKind, LineupSide } from "@openrange/contracts";

import type Database from "better-sqlite3";

export interface LineupFilter {
  map?: string;
  side?: LineupSide;
  kind?: LineupKind;
  search?: string;
}

interface LineupRow {
  id: string;
  map: string;
  side: LineupSide;
  kind: LineupKind;
  title: string;
  stance: string;
  notes: string;
  tags_json: string;
  created_at: number;
  updated_at: number;
}

let schemaReady = false;
function ensureSchema(database: Database.Database): void {
  if (schemaReady) return;
  database.exec(`CREATE TABLE IF NOT EXISTS lineups (
    id TEXT PRIMARY KEY NOT NULL,
    map TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('T', 'CT', 'both')),
    kind TEXT NOT NULL CHECK (kind IN ('smoke', 'flash', 'molotov', 'he', 'decoy')),
    title TEXT NOT NULL,
    stance TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS lineups_map_idx ON lineups(map, side, kind);`);
  schemaReady = true;
}

function toDocument(row: LineupRow): LineupDocument {
  let tags: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.tags_json);
    if (Array.isArray(parsed))
      tags = parsed.filter((tag): tag is string => typeof tag === "string");
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    map: row.map,
    side: row.side,
    kind: row.kind,
    title: row.title,
    stance: row.stance,
    notes: row.notes,
    tags,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

export function createLineup(database: Database.Database, input: LineupInput): LineupDocument {
  ensureSchema(database);
  const id = randomUUID();
  const now = Date.now();
  database
    .prepare(
      `INSERT INTO lineups (id, map, side, kind, title, stance, notes, tags_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.map,
      input.side,
      input.kind,
      input.title,
      input.stance,
      input.notes,
      JSON.stringify(input.tags),
      now,
      now
    );
  return getLineup(database, id) as LineupDocument;
}

export function getLineup(database: Database.Database, id: string): LineupDocument | null {
  ensureSchema(database);
  const row = database.prepare<[string], LineupRow>("SELECT * FROM lineups WHERE id = ?").get(id);
  return row ? toDocument(row) : null;
}

export function listLineups(
  database: Database.Database,
  filter: LineupFilter = {}
): LineupDocument[] {
  ensureSchema(database);
  const clauses: string[] = [];
  const parameters: unknown[] = [];
  if (filter.map) {
    clauses.push("map = ?");
    parameters.push(filter.map);
  }
  if (filter.side) {
    clauses.push("side IN (?, 'both')");
    parameters.push(filter.side);
  }
  if (filter.kind) {
    clauses.push("kind = ?");
    parameters.push(filter.kind);
  }
  if (filter.search) {
    const pattern = `%${filter.search}%`;
    clauses.push(
      "(title LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\' OR stance LIKE ? ESCAPE '\\')"
    );
    parameters.push(pattern, pattern, pattern);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return database
    .prepare<unknown[], LineupRow>(`SELECT * FROM lineups ${where} ORDER BY map, kind, title`)
    .all(...parameters)
    .map(toDocument);
}

export function updateLineup(
  database: Database.Database,
  id: string,
  input: LineupInput
): LineupDocument | null {
  ensureSchema(database);
  const result = database
    .prepare(
      `UPDATE lineups
       SET map = ?, side = ?, kind = ?, title = ?, stance = ?, notes = ?, tags_json = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(
      input.map,
      input.side,
      input.kind,
      input.title,
      input.stance,
      input.notes,
      JSON.stringify(input.tags),
      Date.now(),
      id
    );
  return result.changes > 0 ? getLineup(database, id) : null;
}

export function deleteLineup(database: Database.Database, id: string): boolean {
  ensureSchema(database);
  return database.prepare("DELETE FROM lineups WHERE id = ?").run(id).changes > 0;
}

export function countLineups(database: Database.Database): number {
  ensureSchema(database);
  return (
    database.prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM lineups").get()?.count ??
    0
  );
}
