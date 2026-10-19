import { describe, expect, it } from "vitest";

import { versionedDocumentSchema } from "../src/index.js";

describe("versionedDocumentSchema", () => {
  it("accepts a positive integer version", () => {
    expect(versionedDocumentSchema.parse({ schema_version: 1 })).toEqual({ schema_version: 1 });
  });

  it("rejects missing and invalid versions", () => {
    expect(versionedDocumentSchema.safeParse({}).success).toBe(false);
    expect(versionedDocumentSchema.safeParse({ schema_version: 0 }).success).toBe(false);
    expect(versionedDocumentSchema.safeParse({ schema_version: 1.5 }).success).toBe(false);
  });
});
