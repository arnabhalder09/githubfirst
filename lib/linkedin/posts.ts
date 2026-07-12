// AI post generation: turns an AudienceProfile into LinkedIn post drafts.
//
// Only the aggregate AudienceProfile (counts, no names/emails) is sent to the
// model. The API key is read from ANTHROPIC_API_KEY — never hardcoded.

import Anthropic from "@anthropic-ai/sdk";
import { summarizeProfile } from "./segment";
import type { AudienceProfile } from "./types";

const DEFAULT_COUNT = 3;
const MODEL = "claude-opus-4-8";

/** Build the prompt sent to the model. Exported for testing. */
export function buildPostsPrompt(
  profile: AudienceProfile,
  topic: string,
  count: number,
): string {
  const audienceSummary = summarizeProfile(profile);

  return `You are a LinkedIn content strategist helping a creator write posts that resonate with their actual audience.

AUDIENCE DATA (aggregate only — no individual names):
${audienceSummary}

TOPIC the creator wants to post about:
${topic.trim()}

Write exactly ${count} LinkedIn post draft${count !== 1 ? "s" : ""}. For each post:
- Open with a hook that stops the scroll (first 1–2 lines must be compelling before the "…see more" cut-off)
- Keep it 150–300 words
- Sound like a real person, not a press release
- Tailor the angle, vocabulary, and examples to the audience data above
- Use 1–3 emojis maximum, placed naturally
- End with a question or call-to-action that would genuinely resonate with this audience

Separate each post with a line containing only three dashes (---). Do not include post numbers, labels, or any other metadata.`;
}

/**
 * Stream LinkedIn post drafts from Claude, yielding text chunks as they arrive.
 * The caller is responsible for converting this into an HTTP stream.
 */
export async function* streamPostDrafts(
  profile: AudienceProfile,
  topic: string,
  count = DEFAULT_COUNT,
): AsyncGenerator<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!topic.trim()) {
    throw new Error("topic is required");
  }

  const client = new Anthropic();
  const prompt = buildPostsPrompt(profile, topic, count);

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
