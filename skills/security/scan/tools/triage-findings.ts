const args = Bun.argv.slice(2);

const HELP = `
triage-findings — Parse scan results, deduplicate, prioritize by severity

Usage:
  bun run tools/triage-findings.ts [findings-files...] [options]

Options:
  --min-severity <level>   Filter below threshold (critical,high,medium,low,info)
  --group-by <field>       Group by: severity, file, rule, category, tool (default: severity)
  --no-dedupe              Disable deduplication
  --json                   Output as JSON instead of plain text
  --help                   Show this help message

Reads JSON findings from files (output of sast-scan.ts or dast-scan.ts with --json).
If no files given, reads from stdin.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

import { readFile } from "node:fs/promises";

const jsonOutput = args.includes("--json");
const noDedupe = args.includes("--no-dedupe");
const minSeverityFlag = args.find((_, i) => args[i - 1] === "--min-severity") ?? "";
const groupByFlag = args.find((_, i) => args[i - 1] === "--group-by") ?? "severity";
const fileArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    args[i - 1] !== "--min-severity" &&
    args[i - 1] !== "--group-by",
);

interface Finding {
  tool: string;
  ruleId: string;
  severity: string;
  confidence?: string;
  file?: string;
  line?: number;
  url?: string;
  method?: string;
  message: string;
  cwe?: string;
  category?: string;
  snippet?: string;
  vulnerabilityType?: string;
}

interface TriagedResult {
  inputFindings: number;
  afterDedup: number;
  groups: Record<string, Finding[]>;
  actionItems: Record<string, number>;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Map<string, Finding>();

  for (const f of findings) {
    // Key by location + rule for SAST, or URL + type for DAST
    const key = f.file
      ? `${f.file}:${f.line ?? 0}:${f.ruleId}`
      : `${f.url}:${f.method}:${f.vulnerabilityType ?? f.ruleId}`;

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, f);
    } else {
      // Keep the higher-severity finding, note the other tool
      const existingSev = SEVERITY_ORDER[existing.severity] ?? 4;
      const newSev = SEVERITY_ORDER[f.severity] ?? 4;
      if (newSev < existingSev) {
        seen.set(key, { ...f, message: `${f.message} (also reported by ${existing.tool})` });
      } else {
        seen.set(key, { ...existing, message: `${existing.message} (also reported by ${f.tool})` });
      }
    }
  }

  return [...seen.values()];
}

function groupFindings(findings: Finding[], field: string): Record<string, Finding[]> {
  const groups: Record<string, Finding[]> = {};

  for (const f of findings) {
    let key: string;
    switch (field) {
      case "file":
        key = f.file ?? f.url ?? "unknown";
        break;
      case "rule":
        key = f.ruleId;
        break;
      case "category":
        key = f.category ?? "uncategorized";
        break;
      case "tool":
        key = f.tool;
        break;
      case "severity":
      default:
        key = f.severity;
        break;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }

  return groups;
}

async function readFindings(): Promise<Finding[]> {
  let allFindings: Finding[] = [];

  if (fileArgs.length > 0) {
    for (const filePath of fileArgs) {
      try {
        const content = await readFile(filePath, "utf-8");
        const data = JSON.parse(content);
        // Support both raw findings array and wrapped result objects
        const findings = data.findings ?? (Array.isArray(data) ? data : []);
        allFindings.push(...findings);
      } catch (err: any) {
        console.error(`Warning: could not read ${filePath}: ${err.message}`);
      }
    }
  } else {
    // Read from stdin
    const chunks: string[] = [];
    const reader = Bun.stdin.stream().getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
      }
    } catch {
      // stdin closed
    }
    const content = chunks.join("");
    if (content.trim()) {
      try {
        const data = JSON.parse(content);
        const findings = data.findings ?? (Array.isArray(data) ? data : []);
        allFindings.push(...findings);
      } catch (err: any) {
        console.error(`Warning: could not parse stdin: ${err.message}`);
      }
    }
  }

  return allFindings;
}

async function main() {
  let findings = await readFindings();
  const inputCount = findings.length;

  if (inputCount === 0) {
    console.log(jsonOutput ? JSON.stringify({ inputFindings: 0, afterDedup: 0, groups: {}, actionItems: {} }) : "No findings to triage.");
    return;
  }

  // Apply severity filter
  if (minSeverityFlag) {
    const minLevel = SEVERITY_ORDER[minSeverityFlag.toLowerCase()] ?? 4;
    findings = findings.filter((f) => (SEVERITY_ORDER[f.severity] ?? 4) <= minLevel);
  }

  // Deduplicate
  if (!noDedupe) {
    findings = deduplicateFindings(findings);
  }

  // Sort by severity
  findings.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4));

  // Group
  const groups = groupFindings(findings, groupByFlag);

  // Action items summary
  const actionItems: Record<string, number> = {};
  for (const f of findings) {
    actionItems[f.severity] = (actionItems[f.severity] ?? 0) + 1;
  }

  const result: TriagedResult = {
    inputFindings: inputCount,
    afterDedup: findings.length,
    groups,
    actionItems,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Triage Report\n");
  console.log(`Input findings: ${inputCount}`);
  console.log(`After dedup: ${findings.length}`);
  if (inputCount !== findings.length) {
    console.log(`Duplicates removed: ${inputCount - findings.length}`);
  }
  console.log();

  console.log("## Action Items\n");
  for (const sev of ["critical", "high", "medium", "low", "info"]) {
    if (actionItems[sev]) console.log(`  ${sev}: ${actionItems[sev]}`);
  }
  console.log();

  console.log(`## Findings (grouped by ${groupByFlag})\n`);
  for (const [group, groupFindings] of Object.entries(groups)) {
    console.log(`### ${group} (${groupFindings.length})\n`);
    for (const f of groupFindings) {
      const location = f.file ? `${f.file}:${f.line ?? "?"}` : f.url ?? "unknown";
      console.log(`  ${location} — [${f.tool}] ${f.ruleId}`);
      console.log(`    ${f.message}`);
      if (f.cwe) console.log(`    CWE: ${f.cwe}`);
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
