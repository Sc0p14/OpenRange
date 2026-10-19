PRAGMA foreign_keys = ON;

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

CREATE INDEX IF NOT EXISTS aim_sessions_started_at_idx ON aim_sessions(started_at DESC);
