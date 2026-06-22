"use client";
import { useState } from "react";
import {
  Search, Download, Globe, PhoneCall, MapPin, Star,
  TrendingUp, Users, AlertCircle, CheckCircle2, Loader2,
  ChevronDown, Filter, ExternalLink, Copy, RefreshCw
} from "lucide-react";
import type { PlaceLead } from "../api/places/route";

const GHL_NICHES = [
  "Plumber", "HVAC contractor", "Electrician", "Roofer", "Landscaper",
  "General contractor", "Painter", "Pressure washing", "Pool service",
  "Pest control", "Flooring contractor", "Fence company", "Deck builder",
  "Handyman", "Tree service", "Cleaning service", "Carpet cleaning",
  "Auto mechanic", "Auto body shop", "Towing service", "Locksmith",
  "Dentist", "Chiropractor", "Physical therapist", "Med spa",
  "Hair salon", "Barbershop", "Nail salon", "Tattoo shop",
  "Gym", "Martial arts school", "Dance studio",
  "Pizza restaurant", "Mexican restaurant", "Chinese restaurant",
  "Real estate agent", "Mortgage broker", "Insurance agent",
  "Daycare", "Tutoring center", "Pet groomer", "Veterinarian",
];

const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
  "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
  "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "Indianapolis, IN",
  "San Francisco, CA", "Seattle, WA", "Denver, CO", "Nashville, TN",
  "Oklahoma City, OK", "El Paso, TX", "Washington, DC", "Las Vegas, NV",
  "Louisville, KY", "Memphis, TN", "Portland, OR", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA",
  "Sacramento, CA", "Mesa, AZ", "Kansas City, MO", "Atlanta, GA",
  "Omaha, NE", "Colorado Springs, CO", "Raleigh, NC", "Long Beach, CA",
  "Virginia Beach, VA", "Minneapolis, MN", "Tampa, FL", "New Orleans, LA",
  "Arlington, TX", "Bakersfield, CA", "Honolulu, HI", "Anaheim, CA",
  "Aurora, CO", "Santa Ana, CA", "Corpus Christi, TX", "Riverside, CA",
  "St. Louis, MO", "Lexington, KY", "Pittsburgh, PA", "Anchorage, AK",
  "Stockton, CA", "Cincinnati, OH", "St. Paul, MN", "Greensboro, NC",
  "Toledo, OH", "Newark, NJ", "Plano, TX", "Henderson, NV",
  "Orlando, FL", "Lincoln, NE", "Jersey City, NJ", "Chandler, AZ",
  "Fort Wayne, IN", "Madison, WI", "Lubbock, TX", "Scottsdale, AZ",
  "Reno, NV", "Buffalo, NY", "St. Petersburg, FL", "Laredo, TX",
  "Gilbert, AZ", "Glendale, AZ", "Norfolk, VA", "Winston-Salem, NC",
  "Garland, TX", "Hialeah, FL", "Baton Rouge, LA", "Irvine, CA",
  "Chesapeake, VA", "Fremont, CA", "Richmond, VA", "Boise, ID",
  "Birmingham, AL", "Rochester, NY", "Des Moines, IA",
];

interface SearchResult {
  total: number;
  no_website_count: number;
  with_website_count: number;
  leads: PlaceLead[];
  all_leads: PlaceLead[];
}

export default function ScraperPage() {
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const activeNiche = niche === "__custom__" ? customNiche : niche;
  const activeLocation = location === "__custom__" ? customLocation : location;

  async function handleSearch() {
    if (!activeNiche || !activeLocation) {
      setError("Please select a niche and location.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({
        niche: activeNiche,
        location: activeLocation,
        max: String(maxResults),
      });
      const res = await fetch(`/api/places?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!result) return;
    const rows = showAll ? result.all_leads : result.leads;
    const headers = ["Name", "Address", "Phone", "Rating", "Reviews", "Has Website", "Website", "Google Maps", "Niche"];
    const csv = [
      headers.join(","),
      ...rows.map((l) =>
        [
          `"${l.name}"`,
          `"${l.address}"`,
          `"${l.phone}"`,
          l.rating,
          l.user_ratings_total,
          l.has_website ? "Yes" : "No",
          `"${l.website || ""}"`,
          `"${l.google_maps_url}"`,
          `"${l.niche}"`,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghl-leads-${activeNiche}-${activeLocation}-${Date.now()}.csv`.replace(/\s+/g, "-");
    a.click();
  }

  function copyPhone(phone: string, id: string) {
    navigator.clipboard.writeText(phone);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const displayLeads = result ? (showAll ? result.all_leads : result.leads) : [];

  return (
    <div className="min-h-screen" style={{ background: "#050507", color: "#e2e2e8" }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(8,8,12,0.95)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
            <TrendingUp size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">GHL Lead Scraper</h1>
            <p className="text-[10px]" style={{ color: "#666677" }}>Find USA businesses without websites</p>
          </div>
        </div>
        <a href="/" className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
          ← Back
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Search panel */}
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: "rgba(12,12,18,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Search Parameters</h2>
            <p className="text-xs" style={{ color: "#888899" }}>
              Select a niche and US city to find local businesses that are missing a website — your best Go High Level prospects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Niche */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>Business Niche</label>
              <div className="relative">
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none"
                  style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="">— Select niche —</option>
                  {GHL_NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                  <option value="__custom__">Custom…</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
              </div>
              {niche === "__custom__" && (
                <input
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="e.g. solar panel installer"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(124,58,237,0.4)" }}
                />
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>US City / Location</label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none"
                  style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <option value="">— Select city —</option>
                  {US_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">Custom…</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
              </div>
              {location === "__custom__" && (
                <input
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Miami, FL"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(124,58,237,0.4)" }}
                />
              )}
            </div>

            {/* Max results */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>
                Max Results <span style={{ color: "#666677" }}>(up to 60)</span>
              </label>
              <div className="relative">
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none"
                  style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {[10, 20, 30, 40, 60].map((n) => <option key={n} value={n}>{n} businesses</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Scraping…" : "Find Leads"}
          </button>
        </div>

        {/* Stats bar */}
        {result && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Found", value: result.total, icon: <Users size={16} />, color: "#a78bfa" },
              { label: "No Website", value: result.no_website_count, icon: <Globe size={16} />, color: "#f87171", highlight: true },
              { label: "Has Website", value: result.with_website_count, icon: <CheckCircle2 size={16} />, color: "#34d399" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: s.highlight ? "rgba(248,113,113,0.07)" : "rgba(12,12,18,0.9)",
                  border: `1px solid ${s.highlight ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px]" style={{ color: "#888899" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results table */}
        {result && (
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Table header */}
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ background: "rgba(12,12,18,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3">
                <Filter size={13} style={{ color: "#888899" }} />
                <span className="text-xs font-medium text-white">
                  {showAll ? `All ${result.total} businesses` : `${result.no_website_count} without websites`}
                </span>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-[10px] px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {showAll ? "Show no-website only" : "Show all"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSearch}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <RefreshCw size={11} /> Refresh
                </button>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-colors text-white"
                  style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
                  <Download size={11} /> Export CSV
                </button>
              </div>
            </div>

            {displayLeads.length === 0 ? (
              <div className="py-16 text-center" style={{ background: "rgba(8,8,12,0.9)" }}>
                <Globe size={32} className="mx-auto mb-3" style={{ color: "#333344" }} />
                <p className="text-sm" style={{ color: "#666677" }}>No businesses found without websites.</p>
                <p className="text-xs mt-1" style={{ color: "#444455" }}>Try a different niche or location.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ background: "rgba(8,8,12,0.9)" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {["Business", "Address", "Phone", "Rating", "Website", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#666677" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeads.map((lead, i) => (
                      <tr key={lead.place_id}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white text-xs leading-tight">{lead.name}</p>
                          {lead.types.slice(0, 2).map((t) => (
                            <span key={t} className="inline-block mt-1 mr-1 text-[9px] px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#666677" }}>
                              {t.replace(/_/g, " ")}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-1" style={{ color: "#aaaacc" }}>
                            <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                            <span className="leading-tight max-w-[160px]">{lead.address}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.phone ? (
                            <div className="flex items-center gap-1.5">
                              <PhoneCall size={10} style={{ color: "#34d399" }} />
                              <span style={{ color: "#e2e2e8" }}>{lead.phone}</span>
                              <button onClick={() => copyPhone(lead.phone, lead.place_id)}
                                className="opacity-50 hover:opacity-100 transition-opacity">
                                {copied === lead.place_id
                                  ? <CheckCircle2 size={10} style={{ color: "#34d399" }} />
                                  : <Copy size={10} style={{ color: "#888899" }} />}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "#444455" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {lead.rating ? (
                            <div className="flex items-center gap-1">
                              <Star size={10} style={{ color: "#fbbf24" }} />
                              <span style={{ color: "#e2e2e8" }}>{lead.rating}</span>
                              <span style={{ color: "#666677" }}>({lead.user_ratings_total})</span>
                            </div>
                          ) : <span style={{ color: "#444455" }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {lead.has_website ? (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: "#34d399" }}>
                              <CheckCircle2 size={11} /> Has website
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#f87171" }}>
                              <Globe size={11} /> No website
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
                            style={{ color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.05)" }}>
                            <ExternalLink size={9} /> Maps
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Setup notice */}
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: "rgba(12,12,18,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[11px] font-semibold" style={{ color: "#888899" }}>SETUP REQUIRED</p>
          <p className="text-xs leading-relaxed" style={{ color: "#666677" }}>
            This tool uses the <strong style={{ color: "#aaaacc" }}>Google Places API</strong>. Add your key to{" "}
            <code className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.07)", color: "#a78bfa" }}>.env.local</code>:
          </p>
          <code className="block px-4 py-2.5 rounded-xl text-[11px]"
            style={{ background: "rgba(0,0,0,0.4)", color: "#34d399", border: "1px solid rgba(255,255,255,0.06)" }}>
            GOOGLE_PLACES_API_KEY=your_api_key_here
          </code>
          <p className="text-[10px]" style={{ color: "#555566" }}>
            Enable <strong>Places API</strong> and <strong>Places API (New)</strong> in your Google Cloud Console. Pricing: ~$17 per 1,000 detail lookups.
          </p>
        </div>
      </div>
    </div>
  );
}
