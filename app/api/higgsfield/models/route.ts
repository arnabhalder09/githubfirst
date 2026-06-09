import { NextResponse } from "next/server";
import { listModels } from "@/lib/higgsfield";

export async function GET() {
  try {
    const models = await listModels();
    return NextResponse.json(models);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("HIGGSFIELD_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
