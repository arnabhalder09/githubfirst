"use client";
import { useState, useRef } from "react";
import {
  Search, Download, Globe, PhoneCall, MapPin, Star,
  TrendingUp, Users, AlertCircle, CheckCircle2, Loader2,
  ChevronDown, Filter, ExternalLink, Copy, RefreshCw,
  Layers, X, Plus, BarChart2, Zap,
} from "lucide-react";

// ── Niches (Home Services first) ────────────────────────────────────────────
const HOME_SERVICES = [
  "Plumber", "HVAC contractor", "Electrician", "Roofer", "Landscaper",
  "General contractor", "Painter", "Pressure washing", "Pool service",
  "Pest control", "Flooring contractor", "Fence company", "Deck builder",
  "Handyman", "Tree service", "Cleaning service", "Carpet cleaning",
  "Gutter cleaning", "Window cleaning", "Junk removal", "Moving company",
];

const OTHER_NICHES = [
  "Auto mechanic", "Auto body shop", "Towing service", "Locksmith",
  "Dentist", "Chiropractor", "Physical therapist", "Med spa",
  "Hair salon", "Barbershop", "Nail salon", "Tattoo shop",
  "Gym", "Martial arts school", "Dance studio",
  "Pizza restaurant", "Mexican restaurant", "Chinese restaurant",
  "Real estate agent", "Mortgage broker", "Insurance agent",
  "Daycare", "Tutoring center", "Pet groomer", "Veterinarian",
];

const ALL_NICHES = [...HOME_SERVICES, ...OTHER_NICHES];

// ── US Cities ────────────────────────────────────────────────────────────────
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

// ── Types ────────────────────────────────────────────────────────────────────
interface PlaceLead {
  place_id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  user_ratings_total: number;
  has_website: boolean;
  website?: string;
  google_maps_url: string;
  niche: string;
  city?: string;
}

interface SingleResult {
  total: number;
  no_website_count: number;
  with_website_count: number;
  leads: PlaceLead[];
  all_leads: PlaceLead[];
}

interface CityProgress {
  city: string;
  status: "pending" | "scanning" | "done" | "error";
  found: number;
  no_website: number;
  error?: string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function selectStyle() {
  return {
    background: "rgba(20,20,30,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
  };
}

function LeadsTable({
  leads,
  showAll,
  allLeads,
  onToggle,
  onExport,
  onRefresh,
}: {
  leads: PlaceLead[];
  showAll: boolean;
  allLeads?: PlaceLead[];
  onToggle?: () => void;
  onExport: () => void;
  onRefresh?: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyPhone(phone: string, id: string) {
    navigator.clipboard.writeText(phone);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ background: "rgba(12,12,18,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <Filter size={13} style={{ color: "#888899" }} />
          <span className="text-xs font-medium text-white">
            {leads.length} {showAll ? "total" : "no-website"} leads
          </span>
          {onToggle && (
            <button onClick={onToggle}
              className="text-[10px] px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
              {showAll ? "No-website only" : `Show all (${allLeads?.length ?? 0})`}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button onClick={onRefresh}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg"
              style={{ color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RefreshCw size={11} /> Refresh
            </button>
          )}
          <button onClick={onExport}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg text-white"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <Download size={11} /> Export CSV
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="py-16 text-center" style={{ background: "rgba(8,8,12,0.9)" }}>
          <Globe size={32} className="mx-auto mb-3" style={{ color: "#333344" }} />
          <p className="text-sm" style={{ color: "#666677" }}>No businesses without websites found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ background: "rgba(8,8,12,0.9)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Business", "City", "Address", "Phone", "Rating", "Website", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: "#666677" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={`${lead.place_id}-${i}`}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white text-xs">{lead.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>
                      {lead.city || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1 max-w-[160px]" style={{ color: "#aaaacc" }}>
                      <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">{lead.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.phone ? (
                      <div className="flex items-center gap-1.5">
                        <PhoneCall size={10} style={{ color: "#34d399" }} />
                        <span style={{ color: "#e2e2e8" }}>{lead.phone}</span>
                        <button onClick={() => copyPhone(lead.phone, lead.place_id + i)}>
                          {copied === lead.place_id + i
                            ? <CheckCircle2 size={10} style={{ color: "#34d399" }} />
                            : <Copy size={10} style={{ color: "#555566" }} />}
                        </button>
                      </div>
                    ) : <span style={{ color: "#444455" }}>—</span>}
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
                        <CheckCircle2 size={11} /> Has site
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#f87171" }}>
                        <Globe size={11} /> No site
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg"
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
  );
}

// ── Single scan ───────────────────────────────────────────────────────────────
function SingleScan() {
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SingleResult | null>(null);
  const [error, setError] = useState("");

  const activeNiche = niche === "__custom__" ? customNiche : niche;
  const activeLocation = location === "__custom__" ? customLocation : location;

  async function handleSearch() {
    if (!activeNiche || !activeLocation) { setError("Select a niche and location."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const params = new URLSearchParams({ niche: activeNiche, location: activeLocation, max: String(maxResults) });
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
    exportLeadsCSV(rows, `single-${activeNiche}-${activeLocation}`);
  }

  const displayLeads = result ? (showAll ? result.all_leads : result.leads) : [];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="rounded-2xl p-6 space-y-5"
        style={{ background: "rgba(12,12,18,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Single City Scan</h2>
          <p className="text-xs" style={{ color: "#888899" }}>Search one city for a niche and surface every business without a website.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>Business Niche</label>
            <div className="relative">
              <select value={niche} onChange={(e) => setNiche(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none" style={selectStyle()}>
                <option value="">— Select niche —</option>
                <optgroup label="── Home Services ──">
                  {HOME_SERVICES.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
                <optgroup label="── Other Niches ──">
                  {OTHER_NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
                <option value="__custom__">Custom…</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
            </div>
            {niche === "__custom__" && (
              <input value={customNiche} onChange={(e) => setCustomNiche(e.target.value)}
                placeholder="e.g. solar panel installer"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(124,58,237,0.4)" }} />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>US City</label>
            <div className="relative">
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none" style={selectStyle()}>
                <option value="">— Select city —</option>
                {US_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Custom…</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
            </div>
            {location === "__custom__" && (
              <input value={customLocation} onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Miami, FL"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(124,58,237,0.4)" }} />
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>Max Results</label>
            <div className="relative">
              <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none" style={selectStyle()}>
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
        <button onClick={handleSearch} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "Scanning…" : "Find Leads"}
        </button>
      </div>

      {/* Stats */}
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
                style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[11px]" style={{ color: "#888899" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <LeadsTable
          leads={displayLeads}
          showAll={showAll}
          allLeads={result.all_leads}
          onToggle={() => setShowAll(!showAll)}
          onExport={exportCSV}
          onRefresh={handleSearch}
        />
      )}
    </div>
  );
}

// ── Bulk scan ─────────────────────────────────────────────────────────────────
function BulkScan() {
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [perCity, setPerCity] = useState(10);
  const [cityInput, setCityInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<CityProgress[]>([]);
  const [allLeads, setAllLeads] = useState<PlaceLead[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const activeNiche = niche === "__custom__" ? customNiche : niche;

  function addCity(city: string) {
    const c = city.trim();
    if (c && !selectedCities.includes(c)) setSelectedCities((prev) => [...prev, c]);
    setCityInput("");
  }

  function removeCity(city: string) {
    setSelectedCities((prev) => prev.filter((c) => c !== city));
  }

  function addPreset(preset: string[]) {
    setSelectedCities((prev) => {
      const next = [...prev];
      for (const c of preset) if (!next.includes(c)) next.push(c);
      return next;
    });
  }

  async function startBulk() {
    if (!activeNiche) { setError("Select a niche."); return; }
    if (selectedCities.length === 0) { setError("Add at least one city."); return; }
    setError(""); setScanning(true); setDone(false); setAllLeads([]);
    setProgress(selectedCities.map((city) => ({ city, status: "pending", found: 0, no_website: 0 })));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/places/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: activeNiche, cities: selectedCities, perCity }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));
          handleEvent(event);
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message || "Stream error");
    } finally {
      setScanning(false);
    }
  }

  function handleEvent(event: Record<string, unknown>) {
    if (event.type === "city_start") {
      setProgress((prev) =>
        prev.map((p) => p.city === event.city ? { ...p, status: "scanning" } : p)
      );
    } else if (event.type === "city_done") {
      const leads = (event.leads as PlaceLead[]) || [];
      setProgress((prev) =>
        prev.map((p) =>
          p.city === event.city
            ? { ...p, status: "done", found: event.found as number, no_website: event.no_website as number }
            : p
        )
      );
      setAllLeads((prev) => [...prev, ...leads]);
    } else if (event.type === "city_error") {
      setProgress((prev) =>
        prev.map((p) => p.city === event.city ? { ...p, status: "error", error: event.error as string } : p)
      );
    } else if (event.type === "complete") {
      setDone(true);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setScanning(false);
  }

  function exportCSV() {
    exportLeadsCSV(allLeads, `bulk-${activeNiche}`);
  }

  const scannedCount = progress.filter((p) => p.status === "done" || p.status === "error").length;
  const pct = progress.length > 0 ? Math.round((scannedCount / progress.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Config */}
      <div className="rounded-2xl p-6 space-y-5"
        style={{ background: "rgba(12,12,18,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Bulk City Scanner</h2>
          <p className="text-xs" style={{ color: "#888899" }}>
            Scan multiple US cities for one niche simultaneously. All no-website leads are aggregated into a single export.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Niche */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>Business Niche</label>
            <div className="relative">
              <select value={niche} onChange={(e) => setNiche(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none" style={selectStyle()}>
                <option value="">— Select niche —</option>
                <optgroup label="── Home Services ──">
                  {HOME_SERVICES.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
                <optgroup label="── Other Niches ──">
                  {OTHER_NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
                <option value="__custom__">Custom…</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
            </div>
            {niche === "__custom__" && (
              <input value={customNiche} onChange={(e) => setCustomNiche(e.target.value)}
                placeholder="e.g. solar panel installer"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(124,58,237,0.4)" }} />
            )}
          </div>

          {/* Per city */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>Results per city</label>
            <div className="relative">
              <select value={perCity} onChange={(e) => setPerCity(Number(e.target.value))}
                className="w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white outline-none" style={selectStyle()}>
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} businesses / city</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
            </div>
          </div>
        </div>

        {/* City builder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium" style={{ color: "#aaaacc" }}>
              Cities to scan <span style={{ color: "#666677" }}>({selectedCities.length} selected)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "#555566" }}>Quick add:</span>
              {[
                { label: "Top 10", cities: US_CITIES.slice(0, 10) },
                { label: "Top 25", cities: US_CITIES.slice(0, 25) },
                { label: "Top 50", cities: US_CITIES.slice(0, 50) },
                { label: "All 90", cities: US_CITIES },
              ].map((p) => (
                <button key={p.label} onClick={() => addPreset(p.cities)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                  {p.label}
                </button>
              ))}
              {selectedCities.length > 0 && (
                <button onClick={() => setSelectedCities([])}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* City chips */}
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 rounded-xl"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {selectedCities.map((city) => (
                <span key={city} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.25)" }}>
                  {city}
                  <button onClick={() => removeCity(city)} className="opacity-60 hover:opacity-100">
                    <X size={9} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Custom city add */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-2 pr-9 text-sm text-white outline-none" style={selectStyle()}>
                <option value="">Add a city…</option>
                {US_CITIES.filter((c) => !selectedCities.includes(c)).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666677" }} />
            </div>
            <button onClick={() => addCity(cityInput)} disabled={!cityInput}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white disabled:opacity-40"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={startBulk} disabled={scanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            {scanning ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {scanning ? `Scanning ${scannedCount}/${selectedCities.length} cities…` : "Start Bulk Scan"}
          </button>
          {scanning && (
            <button onClick={stop}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
              style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
              <X size={13} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {progress.length > 0 && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(12,12,18,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} style={{ color: "#a78bfa" }} />
              <span className="text-xs font-medium text-white">Scan Progress</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: "#888899" }}>
              <span>{scannedCount}/{progress.length} cities</span>
              <span className="font-semibold" style={{ color: "#f87171" }}>{allLeads.length} leads found</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#4f46e5)" }} />
          </div>

          {/* City grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {progress.map((p) => (
              <div key={p.city} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]"
                style={{
                  background: p.status === "scanning" ? "rgba(124,58,237,0.1)"
                    : p.status === "done" ? "rgba(52,211,153,0.07)"
                    : p.status === "error" ? "rgba(239,68,68,0.07)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.status === "scanning" ? "rgba(124,58,237,0.3)"
                    : p.status === "done" ? "rgba(52,211,153,0.2)"
                    : p.status === "error" ? "rgba(239,68,68,0.2)"
                    : "rgba(255,255,255,0.05)"}`,
                }}>
                {p.status === "scanning" && <Loader2 size={9} className="animate-spin flex-shrink-0" style={{ color: "#a78bfa" }} />}
                {p.status === "done" && <CheckCircle2 size={9} className="flex-shrink-0" style={{ color: "#34d399" }} />}
                {p.status === "error" && <AlertCircle size={9} className="flex-shrink-0" style={{ color: "#f87171" }} />}
                {p.status === "pending" && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />}
                <span className="truncate" style={{ color: p.status === "pending" ? "#555566" : "#e2e2e8" }}>{p.city}</span>
                {p.status === "done" && p.no_website > 0 && (
                  <span className="ml-auto font-bold flex-shrink-0" style={{ color: "#f87171" }}>{p.no_website}</span>
                )}
              </div>
            ))}
          </div>

          {done && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              <CheckCircle2 size={15} />
              Scan complete — {allLeads.length} businesses without websites across {progress.length} cities
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {allLeads.length > 0 && (
        <LeadsTable leads={allLeads} showAll={false} onExport={exportCSV} />
      )}
    </div>
  );
}

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportLeadsCSV(rows: PlaceLead[], label: string) {
  const headers = ["Name", "City", "Address", "Phone", "Rating", "Reviews", "Has Website", "Website", "Google Maps", "Niche"];
  const csv = [
    headers.join(","),
    ...rows.map((l) =>
      [
        `"${l.name}"`, `"${l.city || ""}"`, `"${l.address}"`, `"${l.phone}"`,
        l.rating, l.user_ratings_total,
        l.has_website ? "Yes" : "No",
        `"${l.website || ""}"`, `"${l.google_maps_url}"`, `"${l.niche}"`,
      ].join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ghl-leads-${label}-${Date.now()}.csv`.replace(/\s+/g, "-");
  a.click();
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Tab = "single" | "bulk";

export default function ScraperPage() {
  const [tab, setTab] = useState<Tab>("bulk");

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
        <a href="/" className="text-[11px] px-3 py-1.5 rounded-lg"
          style={{ color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}>
          ← Studio
        </a>
      </header>

      {/* Tabs */}
      <div className="border-b px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(8,8,12,0.9)" }}>
        <div className="flex gap-0">
          {([
            { id: "bulk" as Tab, icon: <Layers size={13} />, label: "Bulk City Scan" },
            { id: "single" as Tab, icon: <Search size={13} />, label: "Single City" },
          ] as { id: Tab; icon: React.ReactNode; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                tab === t.id
                  ? "border-purple-500 text-white"
                  : "border-transparent hover:text-white"
              }`}
              style={{ color: tab === t.id ? "#fff" : "#888899" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {tab === "single" ? <SingleScan /> : <BulkScan />}

        {/* Setup notice */}
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: "rgba(12,12,18,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[11px] font-semibold" style={{ color: "#888899" }}>SETUP REQUIRED</p>
          <p className="text-xs" style={{ color: "#666677" }}>
            Add your Google Places API key to <code className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "rgba(255,255,255,0.07)", color: "#a78bfa" }}>.env.local</code>:
          </p>
          <code className="block px-4 py-2.5 rounded-xl text-[11px]"
            style={{ background: "rgba(0,0,0,0.4)", color: "#34d399", border: "1px solid rgba(255,255,255,0.06)" }}>
            GOOGLE_PLACES_API_KEY=your_api_key_here
          </code>
          <p className="text-[10px]" style={{ color: "#555566" }}>
            Enable <strong>Places API</strong> in Google Cloud Console. ~$17/1,000 detail lookups.
          </p>
        </div>
      </div>
    </div>
  );
}
