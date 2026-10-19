import { createHash, randomUUID } from "node:crypto";

import type Database from "better-sqlite3";

export interface StoredGsiEvent {
  id: string;
  receivedAt: Date;
  payload: Record<string, unknown>;
}

export function storeGsiEvent(
  database: Database.Database,
  payload: Record<string, unknown>
): { event: StoredGsiEvent; duplicate: boolean } {
  const payloadJson = JSON.stringify(payload);
  const fingerprint = createHash("sha256").update(payloadJson).digest("hex");
  const existing = database
    .prepare<[string], { id: string; received_at: number; payload_json: string }>(
      "SELECT id, received_at, payload_json FROM gsi_events WHERE fingerprint = ?"
    )
    .get(fingerprint);
  if (existing)
    return {
      event: {
        id: existing.id,
        receivedAt: new Date(existing.received_at),
        payload: JSON.parse(existing.payload_json) as Record<string, unknown>
      },
      duplicate: true
    };

  const event = { id: randomUUID(), receivedAt: new Date(), payload };
  database
    .prepare(
      "INSERT INTO gsi_events (id, fingerprint, received_at, payload_json) VALUES (?, ?, ?, ?)"
    )
    .run(event.id, fingerprint, event.receivedAt.getTime(), payloadJson);
  return { event, duplicate: false };
}
