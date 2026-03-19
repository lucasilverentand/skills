const args = Bun.argv.slice(2);

const HELP = `
sast-scan — Detect available SAST tools and run them, normalize output

Usage:
  bun run tools/sast-scan.ts [directory] [options]

Options:
  --tools <list>      Comma-separated tools to run (semgrep,bandit,eslint)
  --severity <list>   Filter by severity (critical,high,medium,low,info)
  --json              Output as JSON instead of plain text
  --help              Show this help message

Auto-detects project languages and available scanners.
Runs each scanner, parses output into a normalized finding format.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const toolsFlag = args.find((_, i) => args[i - 1] === "--tools") ?? "";
const severityFlag = args.find((_, i) => args[i - 1] === "--severity") ?? "";
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--tools" && args[i - 1] !== "--severity",
);

import { readdir } from "node:fs/promises";
import { join, resolve, extname } from "node:path";

interface SastFinding {
  tool: string;
  ruleId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  confidence: "high" | "medium" | "low";
  file: string;
  line: number;
  column?: number;
  endLine?: number;
  message: string;
  cwe?: string;
  category: string;
  snippet?: string;
}

interface SastResult {
  root: string;
  toolsRun: string[];
  toolsMissing: string[];
  totalFindings: number;
  summary: Record<string, number>;
  findings: SastFinding[];
  installHints: string[];
}

interface ToolInfo {
  name: string;
  command: string;
  languages: string[];
  installHint: string;
  detect: () => Promise<boolean>;
  run: (dir: string) => Promise<SastFinding[]>;
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["which", cmd], { stdout: "pipe", stderr: "pipe" });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

async function detectLanguages(dir: string): Promise<Set<string>> {
  const langs = new Set<string>();
  const extMap: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mts": "typescript",
    ".mjs": "javascript",
    ".py": "python",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".php": "php",
  };

  async function walk(d: string, depth: number): Promise<void> {
    if (depth > 4) return;
    try {
      const entries = await readdir(d, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (["node_modules", ".git", "dist", ".next", "vendor", "__pycache__", "venv", ".venv"].includes(entry.name)) continue;
          await walk(join(d, entry.name), depth + 1);
        } else {
          const ext = extname(entry.name);
          if (extMap[ext]) langs.add(extMap[ext]);
        }
        if (langs.size >= 5) return;
      }
    } catch {
      // skip unreadable dirs
    }
  }

  await walk(dir, 0);
  return langs;
}

function normalizeSeverity(sev: string): SastFinding["severity"] {
  const s = sev.toLowerCase();
  if (s === "error" || s === "critical" || s === "high_severity") return "critical";
  if (s === "warning" || s === "high" || s === "medium_severity") return "high";
  if (s === "medium") return "medium";
  if (s === "low" || s === "low_severity" || s === "note") return "low";
  return "info";
}

function normalizeConfidence(conf: string): SastFinding["confidence"] {
  const c = conf.toLowerCase();
  if (c === "high" || c === "definite") return "high";
  if (c === "medium" || c === "possible") return "medium";
  return "low";
}

// --- Semgrep parser ---

async function runSemgrep(dir: string): Promise<SastFinding[]> {
  const proc = Bun.spawn(["semgrep", "scan", "--json", "--config", "auto", dir], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  try {
    const data = JSON.parse(stdout);
    const results = data.results ?? [];
    return results.map((r: any) => ({
      tool: "semgrep",
      ruleId: r.check_id ?? "unknown",
      severity: normalizeSeverity(r.extra?.severity ?? "info"),
      confidence: normalizeConfidence(r.extra?.metadata?.confidence ?? "medium"),
      file: r.path ?? "",
      line: r.start?.line ?? 0,
      column: r.start?.col,
      endLine: r.end?.line,
      message: r.extra?.message ?? "",
      cwe: extractCwe(r.extra?.metadata?.cwe),
      category: r.extra?.metadata?.category ?? categorizeRule(r.check_id ?? ""),
      snippet: r.extra?.lines ?? "",
    }));
  } catch {
    return [];
  }
}

// --- Bandit parser ---

async function runBandit(dir: string): Promise<SastFinding[]> {
  const proc = Bun.spawn(["bandit", "-r", dir, "-f", "json", "-q"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  try {
    const data = JSON.parse(stdout);
    const results = data.results ?? [];
    return results.map((r: any) => ({
      tool: "bandit",
      ruleId: r.test_id ?? "unknown",
      severity: normalizeSeverity(r.issue_severity ?? "info"),
      confidence: normalizeConfidence(r.issue_confidence ?? "medium"),
      file: r.filename ?? "",
      line: r.line_number ?? 0,
      column: undefined,
      endLine: r.end_col_offset ? r.line_number : undefined,
      message: r.issue_text ?? "",
      cwe: r.issue_cwe?.id ? `CWE-${r.issue_cwe.id}` : undefined,
      category: categorizeRule(r.test_id ?? ""),
      snippet: r.code ?? "",
    }));
  } catch {
    return [];
  }
}

// --- ESLint security plugin parser ---

async function runEslintSecurity(dir: string): Promise<SastFinding[]> {
  // Try npx eslint with JSON output
  const proc = Bun.spawn(
    ["npx", "eslint", "--format", "json", "--no-error-on-unmatched-pattern", dir],
    { stdout: "pipe", stderr: "pipe" },
  );

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  try {
    const data = JSON.parse(stdout);
    const findings: SastFinding[] = [];

    for (const file of data) {
      for (const msg of file.messages ?? []) {
        // Only include security plugin rules
        if (!msg.ruleId?.startsWith("security/")) continue;
        findings.push({
          tool: "eslint-plugin-security",
          ruleId: msg.ruleId,
          severity: msg.severity === 2 ? "high" : "medium",
          confidence: "medium",
          file: file.filePath ?? "",
          line: msg.line ?? 0,
          column: msg.column,
          endLine: msg.endLine,
          message: msg.message ?? "",
          cwe: undefined,
          category: categorizeRule(msg.ruleId ?? ""),
          snippet: undefined,
        });
      }
    }
    return findings;
  } catch {
    return [];
  }
}

// --- Helpers ---

function extractCwe(cwe: any): string | undefined {
  if (!cwe) return undefined;
  if (typeof cwe === "string") return cwe;
  if (Array.isArray(cwe) && cwe.length > 0) return String(cwe[0]);
  return undefined;
}

function categorizeRule(ruleId: string): string {
  const id = ruleId.toLowerCase();
  if (id.includes("inject") || id.includes("sqli") || id.includes("xss") || id.includes("command")) return "injection";
  if (id.includes("crypto") || id.includes("hash") || id.includes("random") || id.includes("cipher")) return "crypto";
  if (id.includes("auth") || id.includes("session") || id.includes("password") || id.includes("credential")) return "auth";
  if (id.includes("path") || id.includes("traversal") || id.includes("file")) return "file-access";
  if (id.includes("deserial") || id.includes("pickle") || id.includes("yaml.load")) return "deserialization";
  if (id.includes("eval") || id.includes("exec") || id.includes("spawn") || id.includes("child_process")) return "code-execution";
  if (id.includes("cors") || id.includes("csrf") || id.includes("origin")) return "web-security";
  return "general";
}

// --- Tool registry ---

function buildTools(languages: Set<string>): ToolInfo[] {
  const tools: ToolInfo[] = [
    {
      name: "semgrep",
      command: "semgrep",
      languages: ["typescript", "javascript", "python", "go", "java", "ruby", "rust", "php"],
      installHint: "pip install semgrep  # or: brew install semgrep",
      detect: () => commandExists("semgrep"),
      run: runSemgrep,
    },
    {
      name: "bandit",
      command: "bandit",
      languages: ["python"],
      installHint: "pip install bandit",
      detect: () => commandExists("bandit"),
      run: runBandit,
    },
    {
      name: "eslint",
      command: "npx",
      languages: ["typescript", "javascript"],
      installHint: "npm install --save-dev eslint-plugin-security",
      detect: async () => {
        if (!languages.has("typescript") && !languages.has("javascript")) return false;
        return commandExists("npx");
      },
      run: runEslintSecurity,
    },
  ];

  return tools;
}

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");
  const languages = await detectLanguages(dir);
  const requestedTools = toolsFlag ? toolsFlag.split(",").map((t) => t.trim()) : [];
  const severityFilter = severityFlag
    ? new Set(severityFlag.split(",").map((s) => s.trim().toLowerCase()))
    : null;

  const allTools = buildTools(languages);

  // Filter to requested tools or all relevant ones
  const candidates = requestedTools.length
    ? allTools.filter((t) => requestedTools.includes(t.name))
    : allTools.filter((t) => t.languages.some((l) => languages.has(l)));

  const toolsRun: string[] = [];
  const toolsMissing: string[] = [];
  const installHints: string[] = [];
  let allFindings: SastFinding[] = [];

  for (const tool of candidates) {
    const available = await tool.detect();
    if (!available) {
      toolsMissing.push(tool.name);
      installHints.push(`${tool.name}: ${tool.installHint}`);
      continue;
    }

    try {
      const findings = await tool.run(dir);
      allFindings.push(...findings);
      toolsRun.push(tool.name);
    } catch (err: any) {
      console.error(`Warning: ${tool.name} failed: ${err.message}`);
      toolsMissing.push(tool.name);
    }
  }

  // Apply severity filter
  if (severityFilter) {
    allFindings = allFindings.filter((f) => severityFilter.has(f.severity));
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const summary: Record<string, number> = {};
  for (const f of allFindings) {
    summary[f.severity] = (summary[f.severity] ?? 0) + 1;
  }

  const result: SastResult = {
    root: dir,
    toolsRun,
    toolsMissing,
    totalFindings: allFindings.length,
    summary,
    findings: allFindings,
    installHints,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable output
  console.log("# SAST Scan Report\n");
  console.log(`Directory: ${dir}`);
  console.log(`Languages: ${[...languages].join(", ") || "none detected"}`);
  console.log(`Tools run: ${toolsRun.join(", ") || "none"}`);
  if (toolsMissing.length) {
    console.log(`Tools missing: ${toolsMissing.join(", ")}`);
  }
  console.log(`Total findings: ${allFindings.length}\n`);

  if (installHints.length) {
    console.log("## Install missing tools\n");
    for (const hint of installHints) {
      console.log(`  ${hint}`);
    }
    console.log();
  }

  if (allFindings.length === 0) {
    console.log("No findings detected.");
    return;
  }

  console.log("## Summary\n");
  for (const sev of ["critical", "high", "medium", "low", "info"]) {
    if (summary[sev]) console.log(`  ${sev}: ${summary[sev]}`);
  }
  console.log();

  console.log("## Findings\n");
  let currentSeverity = "";
  for (const f of allFindings) {
    if (f.severity !== currentSeverity) {
      currentSeverity = f.severity;
      console.log(`### ${f.severity.toUpperCase()}\n`);
    }
    console.log(`  ${f.file}:${f.line} — [${f.tool}] ${f.ruleId}`);
    console.log(`    ${f.message}`);
    if (f.cwe) console.log(`    CWE: ${f.cwe}`);
    if (f.snippet) console.log(`    Code: ${String(f.snippet).trim().slice(0, 120)}`);
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
