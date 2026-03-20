const args = Bun.argv.slice(2);

const HELP = `
dast-scan — Run DAST tools against a target URL, normalize output

Usage:
  bun run tools/dast-scan.ts <url> [options]

Options:
  --tools <list>       Comma-separated tools to run (nuclei,zap) — default: auto-detect
  --severity <list>    Filter by severity (critical,high,medium,low,info)
  --templates <path>   Custom nuclei templates directory
  --json               Output as JSON instead of plain text
  --help               Show this help message

IMPORTANT: Only scan targets you are authorized to test.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const toolsFlag = args.find((_, i) => args[i - 1] === "--tools") ?? "";
const severityFlag = args.find((_, i) => args[i - 1] === "--severity") ?? "";
const templatesFlag = args.find((_, i) => args[i - 1] === "--templates") ?? "";
const positionalArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    args[i - 1] !== "--tools" &&
    args[i - 1] !== "--severity" &&
    args[i - 1] !== "--templates",
);

interface DastFinding {
  tool: string;
  templateId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  url: string;
  method: string;
  vulnerabilityType: string;
  description: string;
  evidence?: string;
  cwe?: string;
  reference?: string[];
}

interface DastResult {
  target: string;
  toolsRun: string[];
  toolsMissing: string[];
  totalFindings: number;
  summary: Record<string, number>;
  findings: DastFinding[];
  installHints: string[];
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

function normalizeSeverity(sev: string): DastFinding["severity"] {
  const s = sev.toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "medium" || s === "warning") return "medium";
  if (s === "low") return "low";
  return "info";
}

function isProductionUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return (
      !host.includes("localhost") &&
      !host.includes("127.0.0.1") &&
      !host.includes("0.0.0.0") &&
      !host.includes("staging") &&
      !host.includes("dev") &&
      !host.includes("test") &&
      !host.includes("local") &&
      !host.endsWith(".local") &&
      !host.endsWith(".test") &&
      !host.endsWith(".internal")
    );
  } catch {
    return false;
  }
}

// --- Nuclei ---

async function runNuclei(url: string): Promise<DastFinding[]> {
  const nucleiArgs = ["nuclei", "-u", url, "-jsonl", "-silent"];

  if (severityFlag) {
    nucleiArgs.push("-severity", severityFlag);
  }
  if (templatesFlag) {
    nucleiArgs.push("-t", templatesFlag);
  }

  const proc = Bun.spawn(nucleiArgs, { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  const findings: DastFinding[] = [];
  for (const line of stdout.trim().split("\n")) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      findings.push({
        tool: "nuclei",
        templateId: r["template-id"] ?? r.templateID ?? "unknown",
        severity: normalizeSeverity(r.info?.severity ?? r.severity ?? "info"),
        url: r.matched ?? r["matched-at"] ?? url,
        method: r.type ?? "http",
        vulnerabilityType: r.info?.name ?? r.name ?? "unknown",
        description: r.info?.description ?? r.description ?? "",
        evidence: r.matcher_name ?? r["matcher-name"] ?? r.extracted_results?.join(", "),
        cwe: r.info?.classification?.["cwe-id"]?.[0]
          ? `CWE-${r.info.classification["cwe-id"][0]}`
          : undefined,
        reference: r.info?.reference ?? [],
      });
    } catch {
      // skip malformed lines
    }
  }

  return findings;
}

// --- ZAP ---

async function runZap(url: string): Promise<DastFinding[]> {
  // Try zap-cli first, then docker-based ZAP
  const zapAvailable = await commandExists("zap-cli");
  if (!zapAvailable) return [];

  const proc = Bun.spawn(
    ["zap-cli", "quick-scan", url, "--spider", "-f", "json"],
    { stdout: "pipe", stderr: "pipe" },
  );

  const stdout = await new Response(proc.stdout).text();
  await proc.exited;

  if (!stdout.trim()) return [];

  try {
    const data = JSON.parse(stdout);
    const alerts = data.alerts ?? data.site?.[0]?.alerts ?? [];
    return alerts.map((a: any) => ({
      tool: "zap",
      templateId: `zap-${a.pluginid ?? a.alertRef ?? "unknown"}`,
      severity: normalizeSeverity(riskToSeverity(a.riskcode ?? a.risk ?? 0)),
      url: a.url ?? url,
      method: a.method ?? "GET",
      vulnerabilityType: a.alert ?? a.name ?? "unknown",
      description: a.description ?? "",
      evidence: a.evidence ?? undefined,
      cwe: a.cweid ? `CWE-${a.cweid}` : undefined,
      reference: a.reference ? [a.reference] : [],
    }));
  } catch {
    return [];
  }
}

function riskToSeverity(risk: number | string): string {
  const r = typeof risk === "string" ? parseInt(risk, 10) : risk;
  if (r >= 3) return "high";
  if (r === 2) return "medium";
  if (r === 1) return "low";
  return "info";
}

// --- Main ---

async function main() {
  const targetUrl = positionalArgs[0];

  if (!targetUrl) {
    console.error("Error: target URL is required.");
    console.error("Usage: bun run tools/dast-scan.ts <url> [options]");
    process.exit(1);
  }

  // Validate URL
  try {
    new URL(targetUrl);
  } catch {
    console.error(`Error: invalid URL: ${targetUrl}`);
    process.exit(1);
  }

  // Production URL warning
  if (isProductionUrl(targetUrl)) {
    console.error(`WARNING: ${targetUrl} looks like a production URL.`);
    console.error("Ensure you have explicit authorization to scan this target.");
    console.error("Use --tools and --severity flags to limit scan scope.\n");
  }

  const requestedTools = toolsFlag ? toolsFlag.split(",").map((t) => t.trim()) : [];
  const severityFilter = severityFlag
    ? new Set(severityFlag.split(",").map((s) => s.trim().toLowerCase()))
    : null;

  const toolRegistry = [
    {
      name: "nuclei",
      detect: () => commandExists("nuclei"),
      run: runNuclei,
      installHint: "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest  # or: brew install nuclei",
    },
    {
      name: "zap",
      detect: () => commandExists("zap-cli"),
      run: runZap,
      installHint: "pip install zaproxy  # or: docker pull zaproxy/zap-stable",
    },
  ];

  const candidates = requestedTools.length
    ? toolRegistry.filter((t) => requestedTools.includes(t.name))
    : toolRegistry;

  const toolsRun: string[] = [];
  const toolsMissing: string[] = [];
  const installHints: string[] = [];
  let allFindings: DastFinding[] = [];

  for (const tool of candidates) {
    const available = await tool.detect();
    if (!available) {
      toolsMissing.push(tool.name);
      installHints.push(`${tool.name}: ${tool.installHint}`);
      continue;
    }

    try {
      const findings = await tool.run(targetUrl);
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

  const result: DastResult = {
    target: targetUrl,
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

  // Human-readable
  console.log("# DAST Scan Report\n");
  console.log(`Target: ${targetUrl}`);
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
    console.log(`  ${f.url} — [${f.tool}] ${f.templateId}`);
    console.log(`    Type: ${f.vulnerabilityType}`);
    console.log(`    ${f.description.slice(0, 200)}`);
    if (f.evidence) console.log(`    Evidence: ${f.evidence}`);
    if (f.cwe) console.log(`    CWE: ${f.cwe}`);
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
