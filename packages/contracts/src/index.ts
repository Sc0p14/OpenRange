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
