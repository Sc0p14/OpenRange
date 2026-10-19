import { z } from "zod";

/** Versioned base for JSON documents imported from a user or another process. */
export const versionedDocumentSchema = z.object({
  schema_version: z.number().int().positive()
});

export type VersionedDocument = z.infer<typeof versionedDocumentSchema>;

const recordSchema = z.record(z.string(), z.unknown());

/**
 * Deliberately permissive envelope for a real GSI POST. Field availability
 * depends on the CS2 mode and configured data blocks, so absent sections are
 * valid and must not be invented by the receiver.
 */
export const gsiPayloadSchema = z
  .object({
    auth: z.object({ token: z.string() }).passthrough().optional(),
    provider: recordSchema.optional(),
    map: recordSchema.optional(),
    round: recordSchema.optional(),
    player: recordSchema.optional(),
    previously: recordSchema.optional(),
    added: recordSchema.optional()
  })
  .passthrough();

export type GsiPayload = z.infer<typeof gsiPayloadSchema>;

/** Grenade/utility types a lineup entry can describe. */
export const lineupKindSchema = z.enum(["smoke", "flash", "molotov", "he", "decoy"]);
export type LineupKind = z.infer<typeof lineupKindSchema>;

export const lineupSideSchema = z.enum(["T", "CT", "both"]);
export type LineupSide = z.infer<typeof lineupSideSchema>;

const idSchema = z.string().uuid();

/** Payload accepted when creating or editing a lineup through the local API. */
export const lineupInputSchema = z
  .object({
    map: z
      .string()
      .trim()
      .regex(/^[a-z0-9_-]{2,64}$/, "Map must be a lowercase CS2 map id like de_dust2"),
    side: lineupSideSchema,
    kind: lineupKindSchema,
    title: z.string().trim().min(1).max(120),
    stance: z.string().trim().max(2000).default(""),
    notes: z.string().trim().max(4000).default(""),
    tags: z.array(z.string().trim().min(1).max(32)).max(12).default([])
  })
  .strict();
export type LineupInput = z.infer<typeof lineupInputSchema>;

/** Stored lineup as returned by the API and persisted in SQLite. */
export const lineupDocumentSchema = z
  .object({
    id: idSchema,
    map: z.string(),
    side: lineupSideSchema,
    kind: lineupKindSchema,
    title: z.string(),
    stance: z.string(),
    notes: z.string(),
    tags: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string()
  })
  .strict();
export type LineupDocument = z.infer<typeof lineupDocumentSchema>;

/** JSON import/export document for the lineup library (versioned, CC BY-SA content). */
export const lineupImportSchema = z
  .object({
    schema_version: versionedDocumentSchema.shape.schema_version,
    lineups: z.array(lineupInputSchema).max(5000)
  })
  .strict();
export type LineupImport = z.infer<typeof lineupImportSchema>;
