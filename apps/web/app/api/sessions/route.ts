import { NextResponse } from "next/server";

import { readSessionSnapshot } from "../../../lib/aim-sessions";

export const runtime = "nodejs";

export function GET() {
  try {
    return NextResponse.json(readSessionSnapshot());
  } catch (error) {
    console.error("Unable to read aim sessions", error);
    return NextResponse.json({ error: "Unable to read aim sessions" }, { status: 500 });
  }
}
