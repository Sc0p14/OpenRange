const secretKeys = new Set(["authorization", "token", "gsi_auth_token", "steam_web_api_key"]);

/** Redacts common credential fields before a structured payload is logged. */
export function redactLogFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      secretKeys.has(key.toLowerCase()) ? "[REDACTED]" : value
    ])
  );
}
