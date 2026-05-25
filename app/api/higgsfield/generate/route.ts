import { NextRequest, NextResponse } from "next/server";
import { startGeneration } from "@/lib/higgsfield";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, preset, hookId, prompt, aspectRatio, duration, avatarUrl, productImageUrl, resolution } = body;

    // Build the Higgsfield Marketing Studio payload
    const payload: Record<string, unknown> = {
      model: "marketing_studio_video",
      mode: preset ?? "UGC",
      aspect_ratio: aspectRatio ?? "9:16",
      duration: duration ?? 15,
      resolution: resolution ?? "720p",
    };

    if (prompt) payload.prompt = prompt;
    if (hookId) payload.hook_id = hookId;

    // Reference media
    const medias: { role: string; value: string }[] = [];
    if (avatarUrl)      medias.push({ role: "image", value: avatarUrl });
    if (productImageUrl) medias.push({ role: "image", value: productImageUrl });
    if (medias.length)  payload.medias = medias;

    const result = await startGeneration(payload);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("HIGGSFIELD_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
