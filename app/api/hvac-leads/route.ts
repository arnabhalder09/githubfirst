import { NextRequest, NextResponse } from "next/server";

const SERVICES = new Set([
  "ac_repair",
  "furnace_repair",
  "new_installation",
  "maintenance_tuneup",
  "emergency",
]);

const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

interface HvacLeadPayload {
  fullName: string;
  phone: string;
  email: string;
  zip: string;
  state: string;
  service: string;
  consent: boolean;
  utmSource?: string;
  utmCampaign?: string;
  utmContent?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidZip(zip: string) {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export async function POST(request: NextRequest) {
  let body: Partial<HvacLeadPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, phone, email, zip, state, service, consent } = body;

  if (!fullName || fullName.trim().length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!phone || !isValidUsPhone(phone)) {
    return NextResponse.json({ error: "Please enter a valid US phone number." }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!zip || !isValidZip(zip)) {
    return NextResponse.json({ error: "Please enter a valid US zip code." }, { status: 400 });
  }
  if (!state || !US_STATES.has(state)) {
    return NextResponse.json({ error: "Please select a valid US state." }, { status: 400 });
  }
  if (!service || !SERVICES.has(service)) {
    return NextResponse.json({ error: "Please select the service you need." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "Please agree to be contacted about your request." }, { status: 400 });
  }

  const lead = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    zip: zip.trim(),
    state,
    service,
    utmSource: body.utmSource ?? null,
    utmCampaign: body.utmCampaign ?? null,
    utmContent: body.utmContent ?? null,
    receivedAt: new Date().toISOString(),
  };

  // In production, this would forward to a CRM/webhook (e.g. GoHighLevel, HubSpot)
  // and fire the Meta Conversions API "Lead" event server-side.
  console.log("[hvac-leads] new lead:", lead);

  return NextResponse.json({ ok: true }, { status: 201 });
}
