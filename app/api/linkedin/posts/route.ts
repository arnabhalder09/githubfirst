import type { NextRequest } from "next/server";
import { streamPostDrafts } from "@/lib/linkedin/posts";
import type { AudienceProfile } from "@/lib/linkedin/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let profile: AudienceProfile;
  let topic: string;
  let count: number | undefined;

  try {
    const body = await req.json();
    profile = body.profile;
    topic = body.topic;
    count = typeof body.count === "number" ? body.count : undefined;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!profile || typeof topic !== "string" || !topic.trim()) {
    return new Response(
      JSON.stringify({ error: "profile and topic are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamPostDrafts(profile, topic, count)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`\n\n[Error: ${message}]`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
