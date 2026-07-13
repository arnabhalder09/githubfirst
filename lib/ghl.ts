const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export interface HvacLead {
  fullName: string;
  phone: string;
  email: string;
  zip: string;
  state: string;
  service: string;
  utmSource: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? fullName;
  const lastName = parts.slice(1).join(" ") || undefined;
  return { firstName, lastName };
}

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return phone;
}

/**
 * Upserts the lead as a GHL contact so it lands in the sub-account and can
 * trigger a workflow (e.g. a call automation) there. Never throws — a GHL
 * outage shouldn't fail the lead submission itself, so failures are logged
 * and swallowed by the caller.
 */
export async function pushLeadToGhl(lead: HvacLead): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    return { ok: false, error: "GHL_API_KEY or GHL_LOCATION_ID not configured" };
  }

  const { firstName, lastName } = splitName(lead.fullName);

  // Custom fields are deliberately omitted: GHL's upsert rejects the whole
  // contact if a customFields key/id doesn't exist in this sub-account, and
  // field keys differ per account. Tags carry the essential context instead;
  // add customFields here once you confirm the exact field keys in Settings
  // → Custom Fields for this location.
  const body = {
    locationId,
    firstName,
    lastName,
    email: lead.email,
    phone: toE164(lead.phone),
    source: "Meta Ads - HVAC Landing Page",
    tags: [
      "hvac-lead",
      lead.service,
      lead.state.toLowerCase(),
      lead.utmCampaign ? `utm:${lead.utmCampaign}` : null,
    ].filter((tag): tag is string => Boolean(tag)),
  };

  try {
    const res = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `GHL API ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
