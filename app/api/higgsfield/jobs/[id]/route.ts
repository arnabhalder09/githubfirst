import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/higgsfield";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await getJob(id);
    return NextResponse.json(job);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
