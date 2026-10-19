import { timingSafeEqual } from "node:crypto";

import { gsiPayloadSchema } from "@openrange/contracts";
import { ingestPayloadIntoSession, openLocalDatabase, storeGsiEvent } from "@openrange/db";
import Fastify from "fastify";
import { ZodError } from "zod";

export interface GsiReceiverOptions {
  host: "127.0.0.1" | "localhost" | "::1";
  port: number;
  authToken: string;
  databaseUrl: string;
}

function tokensMatch(received: string | undefined, expected: string): boolean {
  if (!received) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function createGsiReceiver(options: GsiReceiverOptions) {
  if (options.authToken.length < 32) {
    throw new Error("GSI_AUTH_TOKEN must contain at least 32 characters");
  }
  const database = openLocalDatabase(options.databaseUrl);
  const app = Fastify({
    bodyLimit: 256 * 1024,
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      redact: ["req.body.auth.token", "auth.token"]
    }
  });

  app.addHook("onClose", () => database.close());

  app.post("/gsi", async (request, reply) => {
    try {
      const payload = gsiPayloadSchema.parse(request.body);
      if (!tokensMatch(payload.auth?.token, options.authToken)) {
        request.log.warn("Rejected unauthenticated GSI payload");
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const result = storeGsiEvent(database, payload);
      if (!result.duplicate) {
        // Feed the local-player session tracker; failures must not drop the event.
        try {
          const sessionUpdate = ingestPayloadIntoSession(database, payload);
          if (sessionUpdate?.changed) {
            request.log.debug(
              { sessionId: sessionUpdate.session.id, kills: sessionUpdate.session.kills },
              "Updated aim session"
            );
          }
        } catch (sessionError) {
          request.log.warn(sessionError, "Aim session aggregation failed");
        }
      }
      request.log.info(
        { eventId: result.event.id, duplicate: result.duplicate },
        "Stored GSI payload"
      );
      return reply
        .code(result.duplicate ? 200 : 202)
        .send({ id: result.event.id, duplicate: result.duplicate });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({ error: "Invalid GSI payload" });
      }
      request.log.error(error, "Unable to store GSI payload");
      return reply.code(500).send({ error: "Unable to process GSI payload" });
    }
  });

  return app;
}
