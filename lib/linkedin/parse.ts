// Parser for LinkedIn `Connections.csv` exports.
//
// The export is not a plain CSV: LinkedIn prepends a "Notes:" preamble (a few
// lines of prose plus a blank line) before the real header row. We locate the
// header dynamically rather than assuming a fixed number of skip lines, because
// the preamble length has changed across export versions.

import type { Connection } from "./types";

export interface ParseResult {
  connections: Connection[];
  /** Non-fatal issues encountered while parsing. */
  warnings: string[];
}

/** Columns we expect on the header row, normalized to lowercase. */
const EXPECTED_HEADERS = [
  "first name",
  "last name",
  "url",
  "email address",
  "company",
  "position",
  "connected on",
];

/**
 * Split a single CSV line into fields, honoring double-quoted values and
 * escaped quotes (`""`). LinkedIn quotes any field containing a comma — common
 * in titles like "Founder, CEO".
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++; // skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields.map((f) => f.trim());
}

/** True if a split row looks like the LinkedIn connections header. */
function isHeaderRow(fields: string[]): boolean {
  const lower = fields.map((f) => f.toLowerCase());
  // Require the load-bearing columns; tolerate extra/missing optional ones.
  return (
    lower.includes("first name") &&
    lower.includes("company") &&
    lower.includes("position")
  );
}

/**
 * Parse a LinkedIn `Connected On` value (e.g. "18 Jun 2024") into a Date.
 * Returns null for blank or unrecognized values rather than throwing.
 */
export function parseConnectedOn(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  // Format: "DD Mon YYYY" — Date.parse handles this reliably across runtimes.
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return null;
}

/**
 * Parse the raw text of a `Connections.csv` file into structured connections.
 * Skips the LinkedIn preamble, tolerates blank lines, and records warnings for
 * anything it has to drop instead of failing the whole import.
 */
export function parseConnectionsCsv(raw: string): ParseResult {
  const warnings: string[] = [];
  // Normalize newlines (LinkedIn exports vary between \n and \r\n).
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  // Find the header row, skipping the notes preamble.
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const fields = splitCsvLine(lines[i]);
    if (isHeaderRow(fields)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    warnings.push(
      "Could not find the expected header row (First Name, Company, Position). " +
        "Is this a LinkedIn Connections.csv export?",
    );
    return { connections: [], warnings };
  }

  const header = splitCsvLine(lines[headerIndex]).map((h) => h.toLowerCase());
  const col = (name: string): number => header.indexOf(name);

  const idx = {
    firstName: col("first name"),
    lastName: col("last name"),
    url: col("url"),
    email: col("email address"),
    company: col("company"),
    position: col("position"),
    connectedOn: col("connected on"),
  };

  // Warn about any expected header that's missing, so the UI can surface it.
  for (const expected of EXPECTED_HEADERS) {
    if (!header.includes(expected)) {
      warnings.push(`Expected column "${expected}" was not found in the export.`);
    }
  }

  const connections: Connection[] = [];
  let skipped = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const fields = splitCsvLine(line);
    const get = (column: number): string =>
      column >= 0 && column < fields.length ? fields[column] : "";

    const company = get(idx.company);
    const position = get(idx.position);

    // A row with no company and no position carries no signal for audience
    // analysis — count it as skipped rather than polluting the tallies.
    if (!company && !position) {
      skipped++;
      continue;
    }

    connections.push({
      firstName: get(idx.firstName),
      lastName: get(idx.lastName),
      url: get(idx.url),
      email: get(idx.email),
      company,
      position,
      connectedOn: parseConnectedOn(get(idx.connectedOn)),
    });
  }

  if (skipped > 0) {
    warnings.push(`Skipped ${skipped} row(s) with no company or position.`);
  }

  return { connections, warnings };
}
