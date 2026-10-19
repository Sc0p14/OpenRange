import { describe, expect, it } from "vitest";

import { renderGsiConfig } from "../src/gsi-config.js";

describe("renderGsiConfig", () => {
  it("renders only verified local-player data sections and the loopback endpoint", () => {
    const config = renderGsiConfig({ host: "127.0.0.1", port: 3000, token: "a".repeat(32) });

    expect(config).toContain('"uri"       "http://127.0.0.1:3000/gsi"');
    expect(config).toContain('"player_match_stats" "1"');
    expect(config).not.toContain("allplayers");
    expect(config.charCodeAt(0)).not.toBe(0xfeff);
  });

  it("escapes quotes in the token", () => {
    const config = renderGsiConfig({ host: "localhost", port: 3001, token: `${'"'.repeat(31)}x` });

    expect(config).toContain('\\"');
  });

  it("rejects short tokens", () => {
    expect(() => renderGsiConfig({ host: "127.0.0.1", port: 3000, token: "short" })).toThrow();
  });
});
