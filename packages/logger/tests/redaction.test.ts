import { describe, expect, it } from "vitest";

import { redactLogFields } from "../src/index.js";

describe("redactLogFields", () => {
  it("does not expose credential fields", () => {
    expect(
      redactLogFields({ event: "request", token: "secret", STEAM_WEB_API_KEY: "key" })
    ).toEqual({
      event: "request",
      token: "[REDACTED]",
      STEAM_WEB_API_KEY: "[REDACTED]"
    });
  });
});
