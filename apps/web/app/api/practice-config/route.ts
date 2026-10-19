import {
  practiceCommandRegistry,
  renderPracticeConfig,
  type PracticeCommandKey
} from "@openrange/domain";
import { z } from "zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  preset: z.enum(["warmup", "utility", "custom"]).default("warmup"),
  commands: z.array(z.string()).max(64).default([])
});

const knownKeys = new Set(Object.keys(practiceCommandRegistry));

export async function POST(request: Request) {
  try {
    const { preset, commands } = requestSchema.parse(await request.json());
    const config = renderPracticeConfig(
      preset,
      commands.filter((command): command is PracticeCommandKey => knownKeys.has(command))
    );
    return new NextResponse(config, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": 'attachment; filename="openrange_practice.cfg"'
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid practice config request" }, { status: 400 });
    }
    console.error("Unable to render practice config", error);
    return NextResponse.json({ error: "Unable to render practice config" }, { status: 500 });
  }
}
