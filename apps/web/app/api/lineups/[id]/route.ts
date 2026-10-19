import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { editLineup, readLineup, removeLineup } from "../../../../lib/lineups";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const document = readLineup(id);
  if (!document) {
    return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
  }
  return NextResponse.json(document);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const document = editLineup(id, await request.json());
    if (!document) {
      return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
    }
    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid lineup payload" }, { status: 400 });
    }
    console.error("Unable to update lineup", error);
    return NextResponse.json({ error: "Unable to update lineup" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const removed = removeLineup(id);
  if (!removed) {
    return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
  }
  return NextResponse.json({ removed: true });
}
