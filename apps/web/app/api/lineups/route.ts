import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { readLineups, saveLineup } from "../../../lib/lineups";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return NextResponse.json(readLineups(query));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid lineup filters" }, { status: 400 });
    }
    console.error("Unable to read lineups", error);
    return NextResponse.json({ error: "Unable to read lineups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(saveLineup(await request.json()), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid lineup payload" }, { status: 400 });
    }
    console.error("Unable to create lineup", error);
    return NextResponse.json({ error: "Unable to create lineup" }, { status: 500 });
  }
}
