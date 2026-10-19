import { describe, expect, it } from "vitest";

import { parseEnvironment } from "../src/env.js";

describe("parseEnvironment", () => {
  it("uses safe local defaults", () => {
    const environment = parseEnvironment({ DATABASE_URL: "file:./data/openrange.db" });

    expect(environment.OPENRANGE_MODE).toBe("local");
    expect(environment.GSI_HOST).toBe("127.0.0.1");
    expect(environment.GSI_PORT).toBe(3000);
  });

  it("rejects non-loopback GSI binding", () => {
    expect(() =>
      parseEnvironment({
        DATABASE_URL: "file:./data/openrange.db",
        GSI_HOST: "0.0.0.0"
      })
    ).toThrow();
  });
});
