import { randomUUID } from "node:crypto";

import type Database from "better-sqlite3";

export type Locale = "en" | "ru";
export type Theme = "dark" | "light";

export interface LocalProfile {
  id: string;
  nickname: string;
  createdAt: Date;
  settings: {
    locale: Locale;
    theme: Theme;
    steamPath: string | null;
    cs2Path: string | null;
    gsiHost: "127.0.0.1" | "localhost" | "::1";
    gsiPort: number;
  };
}

export interface LocalProfileSettingsInput {
  nickname?: string;
  locale?: Locale;
  theme?: Theme;
  steamPath?: string | null;
  cs2Path?: string | null;
  gsiHost?: "127.0.0.1" | "localhost" | "::1";
  gsiPort?: number;
}

interface ProfileRow {
  id: string;
  nickname: string;
  created_at: number;
  locale: Locale;
  theme: Theme;
  steam_path: string | null;
  cs2_path: string | null;
  gsi_host: "127.0.0.1" | "localhost" | "::1";
  gsi_port: number;
}

function toProfile(row: ProfileRow): LocalProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    createdAt: new Date(row.created_at),
    settings: {
      locale: row.locale,
      theme: row.theme,
      steamPath: row.steam_path,
      cs2Path: row.cs2_path,
      gsiHost: row.gsi_host,
      gsiPort: row.gsi_port
    }
  };
}

export function getOrCreateLocalProfile(database: Database.Database): LocalProfile {
  const existing = database
    .prepare<[], ProfileRow>(
      `SELECT u.id, u.nickname, u.created_at, s.locale, s.theme, s.steam_path, s.cs2_path,
              s.gsi_host, s.gsi_port
       FROM users AS u JOIN user_settings AS s ON s.user_id = u.id
       WHERE u.kind = 'local' LIMIT 1`
    )
    .get();

  if (existing) return toProfile(existing);

  const id = randomUUID();
  const now = Date.now();
  database.transaction(() => {
    database
      .prepare(
        "INSERT INTO users (id, kind, nickname, created_at, updated_at) VALUES (?, 'local', ?, ?, ?)"
      )
      .run(id, "Local player", now, now);
    database.prepare("INSERT INTO user_settings (user_id, updated_at) VALUES (?, ?)").run(id, now);
  })();

  return getOrCreateLocalProfile(database);
}

export function updateLocalProfile(
  database: Database.Database,
  input: LocalProfileSettingsInput
): LocalProfile {
  const profile = getOrCreateLocalProfile(database);
  const now = Date.now();
  const next = { ...profile.settings, ...input };
  database.transaction(() => {
    if (input.nickname !== undefined) {
      database
        .prepare("UPDATE users SET nickname = ?, updated_at = ? WHERE id = ?")
        .run(input.nickname, now, profile.id);
    }
    database
      .prepare(
        `UPDATE user_settings SET locale = ?, theme = ?, steam_path = ?, cs2_path = ?,
         gsi_host = ?, gsi_port = ?, updated_at = ? WHERE user_id = ?`
      )
      .run(
        next.locale,
        next.theme,
        next.steamPath,
        next.cs2Path,
        next.gsiHost,
        next.gsiPort,
        now,
        profile.id
      );
  })();
  return getOrCreateLocalProfile(database);
}
