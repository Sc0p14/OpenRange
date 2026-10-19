import { mkdirSync, existsSync } from "node:fs";
import { isAbsolute, dirname, join, resolve } from "node:path";

import Database from "better-sqlite3";

// Keep this in sync with the versioned migration file. It is embedded so a compiled local app
// does not depend on a source-tree path at runtime.
const initialMigration = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind = 'local'),
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'ru' CHECK (locale IN ('en', 'ru')),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  steam_path TEXT,
  cs2_path TEXT,
  gsi_host TEXT NOT NULL DEFAULT '127.0.0.1' CHECK (gsi_host IN ('127.0.0.1', 'localhost', '::1')),
  gsi_port INTEGER NOT NULL DEFAULT 3000 CHECK (gsi_port BETWEEN 1 AND 65535),
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS gsi_events (
  id TEXT PRIMARY KEY NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  received_at INTEGER NOT NULL,
  payload_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS gsi_events_received_at_idx ON gsi_events(received_at DESC);
CREATE TABLE IF NOT EXISTS aim_sessions (
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
CREATE INDEX IF NOT EXISTS aim_sessions_started_at_idx ON aim_sessions(started_at DESC);`;

function findWorkspaceRoot(): string | null {
  let directory = resolve(process.cwd());
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(join(directory, "pnpm-workspace.yaml"))) return directory;
    const parent = resolve(directory, "..");
    if (parent === directory) return null;
    directory = parent;
  }
  return null;
}

/**
 * Relative DATABASE_URL paths are anchored to the workspace root (the directory holding
 * pnpm-workspace.yaml) instead of each process working directory, so every process of the
 * local app uses one database file. Absolute paths are used as given.
 */
function resolveDatabasePath(raw: string): string {
  if (isAbsolute(raw)) return raw;
  const root = findWorkspaceRoot();
  return root ? join(root, raw) : resolve(raw);
}

export function openLocalDatabase(databaseUrl: string): Database.Database {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Local mode requires a SQLite DATABASE_URL beginning with file:");
  }

  const databasePath = resolveDatabasePath(databaseUrl.slice("file:".length));
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.exec(initialMigration);
  return database;
}
