// Aggregation engine: turns parsed connections into a PII-free AudienceProfile,
// plus a plain-text summary suitable for prompting a model.
//
// Note on "industry": a LinkedIn Connections.csv export does not include an
// industry field. Rather than fabricate one, we derive a coarse job *function*
// from the title text (Engineering, Sales, ...). This is honest about what the
// data actually supports.

import type {
  AudienceProfile,
  Connection,
  MonthlyGrowth,
  Tally,
} from "./types";

/** How many entries to keep in each "top N" list. */
const TOP_N = 10;

/** Count occurrences of a string-valued field and return the top N tallies. */
function topTally(
  values: Iterable<string>,
  limit = TOP_N,
): Tally[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = raw.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/**
 * Map a free-text title to a seniority band. Order matters: more senior
 * keywords are checked first so "VP of Engineering" lands in Executive, not
 * Engineering-flavored mid-level.
 */
export function seniorityOf(title: string): string {
  const t = title.toLowerCase();

  if (/\b(founder|co-?founder|owner|president|partner)\b/.test(t)) return "Founder/Owner";
  if (/\b(ceo|cto|cfo|coo|cmo|ciso|cio|chief)\b/.test(t)) return "C-Level";
  if (/\b(vp|vice president|svp|evp|head of)\b/.test(t)) return "VP/Head";
  if (/\b(director|dir\.)\b/.test(t)) return "Director";
  if (/\b(manager|lead|principal|staff)\b/.test(t)) return "Manager/Lead";
  if (/\b(senior|sr\.?)\b/.test(t)) return "Senior IC";
  if (/\b(intern|trainee|junior|jr\.?|associate|assistant)\b/.test(t)) return "Junior/Entry";
  if (t.trim()) return "Individual Contributor";
  return "Unknown";
}

/**
 * Map a free-text title to a coarse job function. First match wins.
 *
 * Stems are matched as prefixes (no trailing `\b`) so common suffixes are
 * caught: "engineer" matches "engineering", "market" matches "marketing".
 */
export function functionOf(title: string): string {
  const t = title.toLowerCase();

  if (/\b(engineer|developer|software|devops|sre|programmer|architect)/.test(t)) return "Engineering";
  if (/\b(data|machine learning|\bml\b|\bai\b|analyst|scientist|analytics)/.test(t)) return "Data/AI";
  if (/\bproduct/.test(t)) return "Product";
  if (/\b(design|\bux\b|\bui\b|creative)/.test(t)) return "Design";
  if (/\b(market|growth|brand|content|seo|social media)/.test(t)) return "Marketing";
  if (/\b(sales|account executive|\bae\b|business develop|\bbiz dev\b|revenue)/.test(t)) return "Sales";
  if (/\b(recruit|talent|people|\bhr\b|human resources)/.test(t)) return "People/HR";
  if (/\b(finance|financial|account(ant|ing)|controller|investor|venture|\bvc\b)/.test(t)) return "Finance/Investing";
  if (/\b(operations|\bops\b|program manager|project manager|\bpmp\b)/.test(t)) return "Operations";
  if (/\b(founder|ceo|owner|president|chief)/.test(t)) return "Leadership";
  if (t.trim()) return "Other";
  return "Unknown";
}

/** Aggregate connections into monthly growth buckets, oldest first. */
function monthlyGrowth(connections: Connection[]): MonthlyGrowth[] {
  const counts = new Map<string, number>();
  for (const c of connections) {
    if (!c.connectedOn) continue;
    const month = `${c.connectedOn.getFullYear()}-${String(
      c.connectedOn.getMonth() + 1,
    ).padStart(2, "0")}`;
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Build the aggregate, PII-free audience profile from parsed connections. */
export function buildAudienceProfile(
  connections: Connection[],
  parseWarnings: string[] = [],
): AudienceProfile {
  const warnings = [...parseWarnings];

  if (connections.length === 0) {
    warnings.push("No usable connections were found to analyze.");
  }

  return {
    totalConnections: connections.length,
    topCompanies: topTally(connections.map((c) => c.company)),
    topTitles: topTally(connections.map((c) => c.position)),
    seniority: topTally(
      connections.map((c) => seniorityOf(c.position)),
      // Seniority is a small fixed set — show them all.
      99,
    ),
    functions: topTally(
      connections.map((c) => functionOf(c.position)),
      99,
    ),
    growth: monthlyGrowth(connections),
    warnings,
  };
}

/** Render a tally list as "Label (count), Label (count)". */
function tallyLine(tallies: Tally[]): string {
  return tallies.map((t) => `${t.label} (${t.count})`).join(", ");
}

/**
 * Produce a compact plain-text summary of the audience profile, suitable for
 * dropping into a prompt. Aggregate only — no names, no emails.
 */
export function summarizeProfile(profile: AudienceProfile): string {
  const lines: string[] = [];
  lines.push(`Total connections analyzed: ${profile.totalConnections}`);

  if (profile.functions.length) {
    lines.push(`Job functions: ${tallyLine(profile.functions)}`);
  }
  if (profile.seniority.length) {
    lines.push(`Seniority: ${tallyLine(profile.seniority)}`);
  }
  if (profile.topTitles.length) {
    lines.push(`Top job titles: ${tallyLine(profile.topTitles)}`);
  }
  if (profile.topCompanies.length) {
    lines.push(`Top companies: ${tallyLine(profile.topCompanies)}`);
  }

  if (profile.growth.length >= 2) {
    const first = profile.growth[0];
    const last = profile.growth[profile.growth.length - 1];
    lines.push(
      `Connection activity spans ${first.month} to ${last.month}.`,
    );
  }

  return lines.join("\n");
}
