const BASE_URL = "https://api.higgsfield.ai/v1";

function headers() {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) throw new Error("HIGGSFIELD_API_KEY is not set");
  return { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
}

export async function startGeneration(body: object) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Higgsfield API error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { headers: headers() });
  if (!res.ok) throw new Error(`Higgsfield API error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function uploadMedia(formData: FormData) {
  const key = process.env.HIGGSFIELD_API_KEY;
  if (!key) throw new Error("HIGGSFIELD_API_KEY is not set");
  const res = await fetch(`${BASE_URL}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`Higgsfield upload error: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Static data from API (fetched once, baked in for fast load) ──────────────

export const MARKETING_PRESETS = [
  { mode: "UGC",               slug: "ugc",                description: "Realistic social media videos",     emoji: "📱" },
  { mode: "Product Review",    slug: "product_review",     description: "Authentic product reviews",          emoji: "⭐" },
  { mode: "Unboxing",          slug: "ugc_unboxing",       description: "High-quality unboxing",              emoji: "📦" },
  { mode: "Tutorial",          slug: "tutorial",           description: "Step-by-step tutorials",             emoji: "🎓" },
  { mode: "UGC Virtual Try On", slug: "ugc_virtual_try_on", description: "Try before you buy",               emoji: "👗" },
  { mode: "TV Spot",           slug: "tv_spot",            description: "Authentic stories, amplified",       emoji: "📺" },
  { mode: "Hyper Motion",      slug: "hyper_motion",       description: "Highlight your product",             emoji: "⚡" },
  { mode: "Wild Card",         slug: "wild_card",          description: "Creative custom ideas",              emoji: "🃏" },
] as const;

export const VIRAL_HOOKS = [
  { id: "3d45fb46-254f-4c83-9685-8e3d28945a67", name: "Product Hit",      type: "stunt",  prompt: "Object flies into frame, hits subject. Brief reaction → pivot to product.", thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/672b7bc8-fd7e-48ef-954f-f194b83eb1ba.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/0376d63f-7fcb-4622-bdd0-4dc700d44cc6.mp4" },
  { id: "ec9fdf99-314d-480d-a656-10d9861341e7", name: "Epic Fail",        type: "subtle", prompt: "Unsuccessful backflip, lands badly, immediately reviews product unfazed.",   thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/e0df1fee-1988-456e-87af-56aa4cf2866a.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/6b1698c1-5f82-4854-8a32-de3807618082.mp4" },
  { id: "31976cc7-e597-4be2-9753-4a80153b0cc7", name: "Blizzard",         type: "stunt",  prompt: "Impossible indoor blizzard. Chaos. Product survives, still working.",        thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/677036e5-bd7f-4258-8429-5a98a93569c4.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/b46b6584-a4c7-4228-8b51-927e1aebcfed.mp4" },
  { id: "5443eff1-d940-4ad3-9413-957bb048a6b0", name: "Product Dodge",    type: "stunt",  prompt: "Product flies at face, person dodges, catches it, starts review.",           thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/af91a3e3-6667-404d-ab20-ba653178661b.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/81a3aed0-6db5-4c8f-9f56-8aab62e81b22.mp4" },
  { id: "26cac2dd-99cb-4818-a678-509b0dab2c32", name: "Interview",        type: "subtle", prompt: "Stranger interview confusion builds until natural product pivot.",            thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/08a663fb-690b-4f57-8b3a-2bf8ab1f4480.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/913b0ed2-bbbb-4626-a491-e9335d250eaf.mp4" },
  { id: "d50eb41c-fcfa-4f4d-93aa-473cdc6bc3b2", name: "Object Mic",       type: "stunt",  prompt: "Random absurd object falls into hand, used as mic for serious product review.", thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/e30feee4-f9b5-4e9e-8967-d9d6ff34acd4.webp", video: "https://cdn.higgsfield.ai/marketing_studio_setup/381965b9-5d4b-4e6a-a9a1-be94a6cbb66d.mp4" },
  { id: "75b6d501-be0e-4416-a7ed-52f04f180574", name: "Spicy",            type: "subtle", prompt: "Collarbone close-up slowly tilts up, pulls back to selfie frame, then pitch.", thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/f7d72731-0188-4897-ab2b-642465dbe028.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/310818fe-e1af-4e3c-a8c2-3d4a3579365f.mp4" },
  { id: "2db84ed8-7082-4981-9c9c-9d61b3c28668", name: "Camera Bump",      type: "subtle", prompt: "Camera bumps person, brief forehead reaction, then reveals product.",         thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/88b9bcda-4ac3-4170-bbc4-4f827c8193b7.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/868ca5a9-cf6f-460a-959b-76706deee95b.mp4" },
  { id: "8101cd3e-3cc9-4607-a171-3582daa2f6ee", name: "Product Crash",    type: "subtle", prompt: "Product falls and self-destructs, creates chaos, then perfectly clean scene.", thumbnail: "https://cdn.higgsfield.ai/marketing_studio_setup/7f0ec32b-3a26-45fc-8e5c-9d2fea8fde87.webp",  video: "https://cdn.higgsfield.ai/marketing_studio_setup/e106fdf3-b64d-4d85-867c-47fe5b9dc381.mp4" },
] as const;

export type MarketingPreset = typeof MARKETING_PRESETS[number];
export type ViralHook = typeof VIRAL_HOOKS[number];
