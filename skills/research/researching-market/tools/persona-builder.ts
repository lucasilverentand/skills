const args = Bun.argv.slice(2);

const HELP = `
persona-builder — Generate user personas from research data files

Usage:
  bun run tools/persona-builder.ts <data-file> [options]

Options:
  --format csv|json|text  Input format (default: auto-detect)
  --json                  Output as JSON instead of plain text
  --help                  Show this help message

Reads a data file containing survey responses, interview notes, or
user research data. Extracts common patterns in roles, goals, pain
points, and behaviors to generate persona summaries.

Supported input formats:
  - JSON: array of objects with fields like role, goal, pain_point, etc.
  - CSV: header row with columns like role, goal, pain_point
  - Text: freeform interview notes (extracted via keyword matching)
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

let inputFormat = "auto";
const fmtIdx = args.indexOf("--format");
if (fmtIdx !== -1 && args[fmtIdx + 1]) {
  inputFormat = args[fmtIdx + 1];
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (fmtIdx === -1 || (i !== fmtIdx && i !== fmtIdx + 1))
);

import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

interface RawEntry {
  role?: string;
  title?: string;
  job_title?: string;
  goal?: string;
  goals?: string;
  pain_point?: string;
  pain_points?: string;
  frustration?: string;
  company_size?: string;
  company?: string;
  quote?: string;
  notes?: string;
  [key: string]: string | undefined;
}

interface Persona {
  name: string;
  role: string;
  companyType: string;
  goals: string[];
  painPoints: string[];
  quotes: string[];
  count: number;
}

function parseCSV(content: string): RawEntry[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/"/g, ""));
  const entries: RawEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (doesn't handle quoted commas)
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const entry: RawEntry = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j] ?? "";
    }
    entries.push(entry);
  }
  return entries;
}

function parseText(content: string): RawEntry[] {
  // Split by double newlines (paragraphs) or numbered sections
  const sections = content.split(/\n\s*\n|\n(?=\d+\.\s)/).filter((s) => s.trim());
  return sections.map((section) => {
    const entry: RawEntry = { notes: section.trim() };

    // Try to extract structured info
    const roleMatch = section.match(/(?:role|title|position)[:\s]+(.+)/i);
    if (roleMatch) entry.role = roleMatch[1].trim();

    const goalMatch = section.match(/(?:goal|want|need|looking for)[:\s]+(.+)/i);
    if (goalMatch) entry.goal = goalMatch[1].trim();

    const painMatch = section.match(/(?:pain|frustrat|struggle|problem|challenge)[:\s]+(.+)/i);
    if (painMatch) entry.pain_point = painMatch[1].trim();

    const quoteMatch = section.match(/"([^"]+)"/);
    if (quoteMatch) entry.quote = quoteMatch[1];

    return entry;
  });
}

function clusterByRole(entries: RawEntry[]): Map<string, RawEntry[]> {
  const clusters = new Map<string, RawEntry[]>();

  for (const entry of entries) {
    const role = (
      entry.role ||
      entry.title ||
      entry.job_title ||
      "Unknown"
    )
      .trim()
      .toLowerCase();

    // Normalize common role variations
    let normalized = role;
    if (role.includes("develop") || role.includes("engineer") || role.includes("programmer")) {
      normalized = "developer";
    } else if (role.includes("design")) {
      normalized = "designer";
    } else if (role.includes("product") && role.includes("manag")) {
      normalized = "product manager";
    } else if (role.includes("found") || role.includes("ceo") || role.includes("cto")) {
      normalized = "founder/executive";
    } else if (role.includes("market")) {
      normalized = "marketer";
    }

    if (!clusters.has(normalized)) clusters.set(normalized, []);
    clusters.get(normalized)!.push(entry);
  }

  return clusters;
}

function buildPersona(role: string, entries: RawEntry[]): Persona {
  const goals = new Set<string>();
  const painPoints = new Set<string>();
  const quotes: string[] = [];
  const companies = new Set<string>();

  for (const entry of entries) {
    const goal = entry.goal || entry.goals;
    if (goal) goals.add(goal);

    const pain = entry.pain_point || entry.pain_points || entry.frustration;
    if (pain) painPoints.add(pain);

    if (entry.quote) quotes.push(entry.quote);
    if (entry.company_size || entry.company) {
      companies.add(entry.company_size || entry.company || "");
    }
  }

  // Generate a persona name
  const names: Record<string, string> = {
    developer: "Dev Dana",
    designer: "Designer Drew",
    "product manager": "PM Pat",
    "founder/executive": "Founder Fran",
    marketer: "Marketing Morgan",
    unknown: "User Alex",
  };

  return {
    name: names[role] ?? `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
    role: role.charAt(0).toUpperCase() + role.slice(1),
    companyType: [...companies].join(", ") || "Various",
    goals: [...goals].slice(0, 5),
    painPoints: [...painPoints].slice(0, 5),
    quotes: quotes.slice(0, 3),
    count: entries.length,
  };
}

async function main() {
  const filePath = resolve(filteredArgs[0]);
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    console.error(`Error: cannot read file "${filteredArgs[0]}"`);
    process.exit(1);
  }

  // Detect format
  let format = inputFormat;
  if (format === "auto") {
    const ext = extname(filePath).toLowerCase();
    if (ext === ".json") format = "json";
    else if (ext === ".csv") format = "csv";
    else format = "text";
  }

  // Parse entries
  let entries: RawEntry[];
  switch (format) {
    case "json":
      try {
        const parsed = JSON.parse(content);
        entries = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        console.error("Error: invalid JSON in input file");
        process.exit(1);
      }
      break;
    case "csv":
      entries = parseCSV(content);
      break;
    default:
      entries = parseText(content);
  }

  if (entries.length === 0) {
    console.error("Error: no entries found in input file");
    process.exit(1);
  }

  // Cluster and build personas
  const clusters = clusterByRole(entries);
  const personas = [...clusters.entries()]
    .map(([role, entries]) => buildPersona(role, entries))
    .sort((a, b) => b.count - a.count);

  if (jsonOutput) {
    console.log(JSON.stringify({ totalEntries: entries.length, personas }, null, 2));
    return;
  }

  // Human-readable
  console.log("# User Personas\n");
  console.log(`Data entries analyzed: ${entries.length}`);
  console.log(`Personas identified: ${personas.length}\n`);

  const primary = personas[0];
  if (primary) {
    console.log(`Primary persona (most data): ${primary.name} (${primary.role})\n`);
  }

  for (const persona of personas) {
    console.log(`## ${persona.name} — ${persona.role}\n`);
    console.log(`  Data points: ${persona.count}`);
    console.log(`  Company type: ${persona.companyType}\n`);

    if (persona.goals.length > 0) {
      console.log("  ### Goals\n");
      for (const g of persona.goals) console.log(`    - ${g}`);
    }

    if (persona.painPoints.length > 0) {
      console.log("\n  ### Pain Points\n");
      for (const p of persona.painPoints) console.log(`    - ${p}`);
    }

    if (persona.quotes.length > 0) {
      console.log("\n  ### Representative Quotes\n");
      for (const q of persona.quotes) console.log(`    > "${q}"`);
    }
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
