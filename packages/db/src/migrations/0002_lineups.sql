PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS lineups (
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

CREATE INDEX IF NOT EXISTS lineups_map_idx ON lineups(map, side, kind);
