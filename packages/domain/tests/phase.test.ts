import { describe, expect, it } from "vitest";

import { phase } from "../src/index.js";

describe("domain package", () => {
  it("exposes the current implementation phase", () => {
    expect(phase).toBe(0);
  });
});
