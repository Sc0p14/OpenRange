import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { readLocalProfile, saveLocalProfile } from "../../../lib/local-profile";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(readLocalProfile());
}

export async function PUT(request: Request) {
  try {
    return NextResponse.json(saveLocalProfile(await request.json()));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid local profile settings" }, { status: 400 });
    }
    console.error("Unable to save local profile settings", error);
    return NextResponse.json({ error: "Unable to save local profile settings" }, { status: 500 });
  }
}
