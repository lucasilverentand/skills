const args = Bun.argv.slice(2);

const HELP = `
adr-index — Generate a summary index of all ADRs with status and links

Usage:
  bun run tools/adr-index.ts [options]

Options:
  --dir <path>      ADR directory (default: docs/decisions)
  --output <file>   Write index to file instead of stdout
  --json            Output as JSON instead of plain text
  --help            Show this help message

Reads all ADR files, extracts titles and statuses, and generates a markdown
summary table linking to each ADR.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dirIdx = args.indexOf("--dir");
const adrDir = dirIdx !== -1 ? args[dirIdx + 1] : "docs/decisions";
const outputIdx = args.indexOf("--output");
const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;

interface AdrEntry {
  id: string;
  title: string;
  status: string;
  date: string;
  file: string;
  filename: string;
}

async function parseAdr(filePath: string, filename: string): Promise<AdrEntry | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  const content = await file.text();

  const titleMatch = content.match(/^#\s+ADR-(\d+):\s*(.+)/m);
  const id = titleMatch ? titleMatch[1] : "???";
  const title = titleMatch ? titleMatch[2].trim() : filename;

  const statusMatch = content.match(/^##\s+Status\s*\n+\s*(\w+)/m);
  const status = statusMatch ? statusMatch[1] : "Unknown";

  const dateMatch = content.match(/^##\s+Date\s*\n+\s*(\d{4}-\d{2}-\d{2})/m);
  const date = dateMatch ? dateMatch[1] : "Unknown";

  return { id, title, status, date, file: filePath, filename };
}

async function main() {
  const { resolve, join, relative } = await import("node:path");
  const { existsSync, readdirSync } = await import("node:fs");

  const resolvedDir = resolve(adrDir);

  if (!existsSync(resolvedDir)) {
    console.error(`ADR directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  const filenames = readdirSync(resolvedDir)
    .filter((f) => f.endsWith(".md") && f !== "index.md" && f !== "INDEX.md")
    .sort();

  if (filenames.length === 0) {
    console.log("No ADR files found.");
    process.exit(0);
  }

  const entries: AdrEntry[] = [];
  for (const filename of filenames) {
    const entry = await parseAdr(join(resolvedDir, filename), filename);
    if (entry) entries.push(entry);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ total: entries.length, entries }, null, 2));
    return;
  }

  // Generate markdown index
  const lines: string[] = [];
  lines.push("# Architecture Decision Records\n");
  lines.push(`${entries.length} decisions recorded.\n`);
  lines.push("| ID | Title | Status | Date |");
  lines.push("|---|---|---|---|");

  for (const entry of entries) {
    const link = `[ADR-${entry.id}](./${entry.filename})`;
    const statusBadge =
      entry.status === "Accepted"
        ? entry.status
        : entry.status === "Deprecated" || entry.status === "Superseded"
          ? `~~${entry.status}~~`
          : entry.status;
    lines.push(`| ${link} | ${entry.title} | ${statusBadge} | ${entry.date} |`);
  }

  // Group by status
  const statusGroups = new Map<string, AdrEntry[]>();
  for (const entry of entries) {
    const group = statusGroups.get(entry.status) || [];
    group.push(entry);
    statusGroups.set(entry.status, group);
  }

  lines.push("\n## Summary\n");
  for (const [status, group] of statusGroups) {
    lines.push(`- **${status}**: ${group.length}`);
  }

  const output = lines.join("\n");

  if (outputFile) {
    await Bun.write(resolve(outputFile), output);
    console.log(`Index written to ${outputFile}`);
  } else {
    console.log(output);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
