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
