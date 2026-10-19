import { randomBytes } from "node:crypto";

import { renderGsiConfig } from "@openrange/domain";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ZodError } from "zod";

const requestSchema = z
  .object({
    host: z.enum(["127.0.0.1", "localhost", "::1"]),
    port: z.number().int().min(1).max(65_535),
    token: z.string().min(32).optional()
  })
  .strict();

export function POST(request: Request) {
  return request
    .json()
    .then((body: unknown) => {
      const input = requestSchema.parse(body);
      const token = input.token ?? randomBytes(32).toString("base64url");
      const config = renderGsiConfig({ host: input.host, port: input.port, token });
      return new NextResponse(config, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "content-disposition": "attachment; filename=gamestate_integration_openrange.cfg",
          "x-openrange-gsi-token": token
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: "Invalid GSI configuration request" }, { status: 400 });
      }
      console.error("Unable to render GSI configuration", error);
      return NextResponse.json({ error: "Unable to render GSI configuration" }, { status: 500 });
    });
}
