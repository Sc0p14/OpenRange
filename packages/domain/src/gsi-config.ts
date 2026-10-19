const gsiDataBlocks = [
  "provider",
  "map",
  "round",
  "player_id",
  "player_state",
  "player_weapons",
  "player_match_stats"
] as const;

export interface GsiConfigOptions {
  host: "127.0.0.1" | "localhost" | "::1";
  port: number;
  token: string;
}

function quote(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

/**
 * Renders a BOM-free KeyValues config in the shape of the official Valve GSI sample.
 * Only local-player data sections are enabled: observer-only blocks ("allplayers_*",
 * "allgrenades", "phase_countdowns") are intentionally omitted until their live CS2
 * behavior is verified. See docs/research/gsi.md.
 */
export function renderGsiConfig(options: GsiConfigOptions): string {
  if (options.token.length < 32) {
    throw new Error("GSI token must contain at least 32 characters");
  }
  const uriHost = options.host === "::1" ? "[::1]" : options.host;
  const data = gsiDataBlocks.map((block) => `    "${block}" "1"`).join("\n");
  return `"OpenRange GSI v1"
{
  "uri"       "http://${uriHost}:${options.port}/gsi"
  "timeout"   "5.0"
  "buffer"    "0.1"
  "throttle"  "0.5"
  "heartbeat" "30.0"
  "auth"
  {
    "token" "${quote(options.token)}"
  }
  "data"
  {
${data}
  }
}
`;
}
