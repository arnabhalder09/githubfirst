import { NextRequest, NextResponse } from "next/server";
import { startGeneration } from "@/lib/higgsfield";

export async function POST(req: NextRequest) {
  try {
    const { script, characterId, duration, aspectRatio } = await req.json();

    if (!script?.trim()) {
      return NextResponse.json({ error: "script is required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      model: "marketing_studio_video",
      mode: "ugc",
      prompt: script.trim(),
      aspect_ratio: aspectRatio ?? "9:16",
      duration: typeof duration === "number" && duration > 0 ? duration : 15,
      resolution: "720p",
    };

    if (characterId) payload.character_id = characterId;

    const result = await startGeneration(payload);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("HIGGSFIELD_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
