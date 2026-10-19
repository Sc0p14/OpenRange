import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createGsiReceiver } from "./server.js";

const token = "a-very-long-local-test-token-which-is-not-a-real-secret";
const directories: string[] = [];
function receiver() {
  const directory = mkdtempSync(join(tmpdir(), "openrange-gsi-"));
  directories.push(directory);
  return createGsiReceiver({
    host: "127.0.0.1",
    port: 3000,
    authToken: token,
    databaseUrl: `file:${join(directory, "events.db")}`
  });
}
afterEach(() =>
  directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true }))
);

describe("GSI receiver", () => {
  it("rejects missing authentication", async () => {
    const app = receiver();
    const response = await app.inject({ method: "POST", url: "/gsi", payload: { provider: {} } });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
  it("stores a valid payload once", async () => {
    const app = receiver();
    const payload = { auth: { token }, provider: { appid: 730 }, map: { name: "de_test" } };
    const first = await app.inject({ method: "POST", url: "/gsi", payload });
    const second = await app.inject({ method: "POST", url: "/gsi", payload });
    expect(first.statusCode).toBe(202);
    expect(second.statusCode).toBe(200);
    expect(second.json().duplicate).toBe(true);
    await app.close();
  });
});
