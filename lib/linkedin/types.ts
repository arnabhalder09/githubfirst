// Core domain types for the LinkedIn Audience Analyzer.
//
// These are intentionally framework-agnostic (no Next.js / React imports) so the
// analysis engine can be lifted into the standalone product repo unchanged.

/** A single connection row from a LinkedIn `Connections.csv` export. */
export interface Connection {
  firstName: string;
  lastName: string;
  /** Profile URL, if present in the export. */
  url: string;
  /** Email address, if the connection chose to share it. Often blank. */
  email: string;
  company: string;
  /** Free-text job title, e.g. "Senior Software Engineer". */
  position: string;
  /** Parsed connection date, or null if it couldn't be parsed. */
  connectedOn: Date | null;
}

/** A counted bucket, e.g. { label: "Software Engineer", count: 42 }. */
export interface Tally {
  label: string;
  count: number;
}

/** Connections added in a given calendar month. */
export interface MonthlyGrowth {
  /** ISO year-month, e.g. "2024-06". */
  month: string;
  count: number;
}

/**
 * Aggregate, PII-free portrait of an audience. This is the object that gets
 * sent to the model for post generation — it contains counts only, never
 * individual names or emails.
 */
export interface AudienceProfile {
  /** Total number of usable connection rows. */
  totalConnections: number;
  /** Most common employers among the connections. */
  topCompanies: Tally[];
  /** Most common raw job titles. */
  topTitles: Tally[];
  /** Connections grouped into seniority bands. */
  seniority: Tally[];
  /** Connections grouped into job-function buckets (Engineering, Sales, ...). */
  functions: Tally[];
  /** Connection growth over time, oldest month first. */
  growth: MonthlyGrowth[];
  /** Non-fatal notes about the parse/aggregation (e.g. rows skipped). */
  warnings: string[];
}
