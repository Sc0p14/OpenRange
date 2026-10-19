import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import { storeGsiEvent } from "../src/gsi-events.js";

describe("GSI event store", () => {
  it("deduplicates identical payloads", () => {
    const database = new Database(":memory:");
    database.exec(
      "CREATE TABLE gsi_events (id TEXT PRIMARY KEY, fingerprint TEXT UNIQUE NOT NULL, received_at INTEGER NOT NULL, payload_json TEXT NOT NULL)"
    );
    const payload = { provider: { appid: 730 }, map: { name: "de_test" } };
    const first = storeGsiEvent(database, payload);
    const second = storeGsiEvent(database, payload);
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(second.event.id).toBe(first.event.id);
    database.close();
  });
});
