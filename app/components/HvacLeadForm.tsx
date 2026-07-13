"use client";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const SERVICE_OPTIONS = [
  { value: "emergency", label: "Emergency Repair (No Cool/No Heat)" },
  { value: "ac_repair", label: "AC Repair" },
  { value: "furnace_repair", label: "Furnace / Heating Repair" },
  { value: "new_installation", label: "New System Installation" },
  { value: "maintenance_tuneup", label: "Maintenance / Tune-Up" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

type Status = "idle" | "submitting" | "success" | "error";

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
  };
}

export default function HvacLeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      fullName: String(data.get("fullName") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      zip: String(data.get("zip") || ""),
      state: String(data.get("state") || ""),
      service: String(data.get("service") || ""),
      consent: data.get("consent") === "on",
      ...getUtmParams(),
    };

    try {
      const res = await fetch("/api/hvac-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <h3 className="text-xl font-bold text-slate-900">Request received!</h3>
        <p className="mt-2 text-sm text-slate-600">
          A local HVAC pro will call you shortly to schedule your free quote. Keep an eye on your phone.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <h3 className="text-xl font-bold text-slate-900">Get Your Free HVAC Quote</h3>
      <p className="mt-1 text-sm text-slate-500">Takes 30 seconds. No obligation.</p>

      <div className="mt-5 space-y-4">
        <Field label="Full Name" htmlFor="fullName">
          <input
            id="fullName" name="fullName" type="text" required autoComplete="name"
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="phone">
            <input
              id="phone" name="phone" type="tel" required autoComplete="tel"
              placeholder="(555) 123-4567"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="jane@email.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Zip Code" htmlFor="zip">
            <input
              id="zip" name="zip" type="text" required inputMode="numeric" autoComplete="postal-code"
              placeholder="90210"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </Field>
          <Field label="State" htmlFor="state">
            <select
              id="state" name="state" required defaultValue="" autoComplete="address-level1"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              <option value="" disabled>Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="What do you need?" htmlFor="service">
          <select
            id="service" name="service" required defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="" disabled>Select a service</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <label htmlFor="consent" className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500">
          <input id="consent" name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
          <span>
            I agree to be contacted by phone, text, and email about my HVAC service request, including by
            automated means. Consent is not a condition of purchase. Message/data rates may apply.
          </span>
        </label>

        {status === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "submitting" ? "Submitting..." : "Get My Free Quote"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
