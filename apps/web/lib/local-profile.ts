import { getOrCreateLocalProfile, openLocalDatabase, updateLocalProfile } from "@openrange/db";
import { z } from "zod";

const loopbackHosts = ["127.0.0.1", "localhost", "::1"] as const;

export const localProfileInputSchema = z
  .object({
    nickname: z.string().trim().min(1).max(40).optional(),
    locale: z.enum(["ru", "en"]).optional(),
    theme: z.enum(["dark", "light"]).optional(),
    steamPath: z.string().trim().max(1024).nullable().optional(),
    cs2Path: z.string().trim().max(1024).nullable().optional(),
    gsiHost: z.enum(loopbackHosts).optional(),
    gsiPort: z.number().int().min(1).max(65_535).optional()
  })
  .strict();

function database() {
  return openLocalDatabase(process.env.DATABASE_URL ?? "file:./data/openrange.db");
}

export function readLocalProfile() {
  const connection = database();
  try {
    return getOrCreateLocalProfile(connection);
  } finally {
    connection.close();
  }
}

export function saveLocalProfile(input: unknown) {
  const safeInput = localProfileInputSchema.parse(input);
  const connection = database();
  try {
    return updateLocalProfile(connection, safeInput);
  } finally {
    connection.close();
  }
}
