import {
  countLineups,
  createLineup,
  deleteLineup,
  getLineup,
  listLineups,
  openLocalDatabase,
  updateLineup,
  type LineupFilter
} from "@openrange/db";
import { lineupInputSchema } from "@openrange/contracts";
import { z } from "zod";

const filterSchema = z.object({
  map: z
    .string()
    .trim()
    .regex(/^[a-z0-9_-]{2,64}$/)
    .optional(),
  side: z.enum(["T", "CT", "both"]).optional(),
  kind: z.enum(["smoke", "flash", "molotov", "he", "decoy"]).optional(),
  search: z.string().trim().max(200).optional()
});

function database() {
  return openLocalDatabase(process.env.DATABASE_URL ?? "file:./data/openrange.db");
}

export function readLineups(query: unknown) {
  const filter = filterSchema.parse(query ?? {}) as LineupFilter;
  const connection = database();
  try {
    return { items: listLineups(connection, filter), total: countLineups(connection) };
  } finally {
    connection.close();
  }
}

export function readLineup(id: string) {
  const connection = database();
  try {
    return getLineup(connection, id);
  } finally {
    connection.close();
  }
}

export function saveLineup(input: unknown) {
  const safeInput = lineupInputSchema.parse(input);
  const connection = database();
  try {
    return createLineup(connection, safeInput);
  } finally {
    connection.close();
  }
}

export function editLineup(id: string, input: unknown) {
  const safeInput = lineupInputSchema.parse(input);
  const connection = database();
  try {
    return updateLineup(connection, id, safeInput);
  } finally {
    connection.close();
  }
}

export function removeLineup(id: string) {
  const connection = database();
  try {
    return deleteLineup(connection, id);
  } finally {
    connection.close();
  }
}
