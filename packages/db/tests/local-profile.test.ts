import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import { openLocalDatabase } from "../src/database.js";
import { getOrCreateLocalProfile, updateLocalProfile } from "../src/local-profile.js";

describe("local profile", () => {
  it("creates exactly one reusable local profile", () => {
    const database = new Database(":memory:");
    database.exec(`
      CREATE TABLE users (id TEXT PRIMARY KEY, kind TEXT NOT NULL, nickname TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE user_settings (user_id TEXT PRIMARY KEY, locale TEXT NOT NULL DEFAULT 'ru', theme TEXT NOT NULL DEFAULT 'dark', steam_path TEXT, cs2_path TEXT, gsi_host TEXT NOT NULL DEFAULT '127.0.0.1', gsi_port INTEGER NOT NULL DEFAULT 3000, updated_at INTEGER NOT NULL);
    `);
    const first = getOrCreateLocalProfile(database);
    const second = getOrCreateLocalProfile(database);

    expect(second.id).toBe(first.id);
    expect(database.prepare("SELECT COUNT(*) AS count FROM users").get()).toEqual({ count: 1 });
    database.close();
  });

  it("rejects a non-SQLite local database URL", () => {
    expect(() => openLocalDatabase("postgres://localhost/openrange")).toThrow("SQLite");
  });

  it("persists valid local settings on the existing profile", () => {
    const database = new Database(":memory:");
    database.exec(
      `CREATE TABLE users (id TEXT PRIMARY KEY, kind TEXT NOT NULL, nickname TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); CREATE TABLE user_settings (user_id TEXT PRIMARY KEY, locale TEXT NOT NULL DEFAULT 'ru', theme TEXT NOT NULL DEFAULT 'dark', steam_path TEXT, cs2_path TEXT, gsi_host TEXT NOT NULL DEFAULT '127.0.0.1', gsi_port INTEGER NOT NULL DEFAULT 3000, updated_at INTEGER NOT NULL);`
    );
    getOrCreateLocalProfile(database);
    const updated = updateLocalProfile(database, {
      nickname: "Practice",
      locale: "en",
      theme: "light",
      gsiPort: 3002
    });

    expect(updated.nickname).toBe("Practice");
    expect(updated.settings).toMatchObject({ locale: "en", theme: "light", gsiPort: 3002 });
    database.close();
  });
});
