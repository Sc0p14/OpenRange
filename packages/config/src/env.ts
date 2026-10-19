import { z } from "zod";

const loopbackHosts = ["127.0.0.1", "::1", "localhost"] as const;

const portSchema = z.coerce.number().int().min(1).max(65_535);

export const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  OPENRANGE_MODE: z.enum(["local", "cloud"]).default("local"),
  WEB_HOST: z.string().default("127.0.0.1"),
  WEB_PORT: portSchema.default(3001),
  GSI_HOST: z.enum(loopbackHosts).default("127.0.0.1"),
  GSI_PORT: portSchema.default(3000),
  GSI_AUTH_TOKEN: z.string().min(32).optional(),
  DATABASE_URL: z.string().min(1),
  STEAM_WEB_API_KEY: z.string().min(1).optional(),
  STEAM_OPENID_RETURN_URL: z.string().url().optional()
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(values: Record<string, string | undefined>): Environment {
  return environmentSchema.parse(values);
}
