import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import {
  createLineup,
  deleteLineup,
  getLineup,
  listLineups,
  updateLineup
} from "../src/lineups.js";
import type { LineupInput } from "@openrange/contracts";

const input: LineupInput = {
  map: "de_dust2",
  side: "T",
  kind: "smoke",
  title: "CT-мид через верх",
  stance: "Стать вплотную к стене у ямы, прицел к краю крыши",
  notes: "Стандартный заградительный смок",
  tags: ["стандарт", "мид"]
};

function prepare() {
  const database = new Database(":memory:");
  database.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, kind TEXT NOT NULL, nickname TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE user_settings (user_id TEXT PRIMARY KEY, locale TEXT NOT NULL DEFAULT 'ru', theme TEXT NOT NULL DEFAULT 'dark', steam_path TEXT, cs2_path TEXT, gsi_host TEXT NOT NULL DEFAULT '127.0.0.1', gsi_port INTEGER NOT NULL DEFAULT 3000, updated_at INTEGER NOT NULL);
  `);
  return database;
}

const ctInput: LineupInput = {
  map: "de_dust2",
  side: "CT",
  kind: "molotov",
  title: "Задержка выхода с T-спавна",
  stance: "С лестницы в CT-спавн, прицел на угол беты",
  notes: "Держит быстрый выход",
  tags: ["антиэко"]
};

describe("lineups repository", () => {
  it("creates, lists with filters, updates, and deletes", () => {
    const database = prepare();
    const created = createLineup(database, input);
    const ct = createLineup(database, ctInput);
    expect(created.id).toBeTruthy();
    expect(created.tags).toEqual(["стандарт", "мид"]);

    expect(listLineups(database, { map: "de_dust2" })).toHaveLength(2);
    expect(listLineups(database, { map: "de_inferno" })).toHaveLength(0);
    expect(listLineups(database, { side: "CT" })).toHaveLength(1);
    expect(listLineups(database, { kind: "molotov" })).toHaveLength(1);
    expect(listLineups(database, { kind: "smoke", side: "T" })).toHaveLength(1);
    expect(listLineups(database, { search: "%заградительн" })).toHaveLength(1);

    const updated = updateLineup(database, created.id, {
      ...input,
      title: "Другой смок",
      side: "CT"
    });
    expect(updated?.title).toBe("Другой смок");
    expect(updated?.side).toBe("CT");
    expect(getLineup(database, created.id)?.updatedAt).not.toBe(created.updatedAt);

    expect(deleteLineup(database, created.id)).toBe(true);
    expect(getLineup(database, created.id)).toBeNull();
    expect(deleteLineup(database, created.id)).toBe(false);
    expect(listLineups(database)).toHaveLength(1);
    expect(ct.id).toBeTruthy();
    database.close();
  });

  it("rejects an invalid side at the database level", () => {
    const database = prepare();
    expect(() =>
      database
        .prepare(
          "INSERT INTO lineups (id, map, side, kind, title, stance, notes, tags_json, created_at, updated_at) VALUES ('x', 'de_dust2', 'B', 'smoke', 't', '', '', '[]', 1, 1)"
        )
        .run()
    ).toThrow();
    database.close();
  });
});
