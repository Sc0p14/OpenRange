import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { parseEnvironment } from "@openrange/config";
import { createGsiReceiver } from "./server.js";

/**
 * Loads the nearest .env walking up from the working directory so the receiver can be
 * started from the workspace root or its own package directory. Secrets stay out of code.
 */
function loadLocalEnvFile(): void {
  let directory = resolve(process.cwd());
  for (let depth = 0; depth < 5; depth += 1) {
    const candidate = join(directory, ".env");
    if (existsSync(candidate)) {
      try {
        process.loadEnvFile(candidate);
      } catch (error) {
        console.error(`Unable to parse ${candidate}`, error);
      }
      return;
    }
    const parent = resolve(directory, "..");
    if (parent === directory) return;
    directory = parent;
  }
}

loadLocalEnvFile();
// Restart trigger: aim-session aggregation added (receiver feeds aim_sessions now).
const environment = parseEnvironment(process.env);

if (!environment.GSI_AUTH_TOKEN) {
  throw new Error(
    "Set GSI_AUTH_TOKEN (at least 32 characters) in .env before starting the receiver"
  );
}

const receiver = createGsiReceiver({
  host: environment.GSI_HOST,
  port: environment.GSI_PORT,
  authToken: environment.GSI_AUTH_TOKEN,
  databaseUrl: environment.DATABASE_URL
});

receiver.listen({ host: environment.GSI_HOST, port: environment.GSI_PORT }).catch((error) => {
  receiver.log.error(error);
  process.exit(1);
});
