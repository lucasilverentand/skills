const args = Bun.argv.slice(2);

const HELP = `
secret-scan — Detect hardcoded secrets, API keys, and credentials in source

Usage:
  bun run tools/secret-scan.ts [directory] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans source files for patterns that look like hardcoded secrets:
API keys, tokens, passwords, private keys, connection strings, etc.
Skips node_modules, .git, and binary files.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const SCAN_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs",
  ".json", ".yaml", ".yml", ".toml", ".env",
  ".env.local", ".env.development", ".env.production",
  ".py", ".rb", ".go", ".rs", ".sh", ".bash",
  ".cfg", ".conf", ".ini", ".xml", ".properties",
]);

const SKIP_FILES = new Set([
  "package-lock.json", "bun.lockb", "yarn.lock", "pnpm-lock.yaml",
]);

interface SecretFinding {
  file: string;
  line: number;
  rule: string;
  severity: "critical" | "high" | "medium" | "low";
  match: string;
  context: string;
}

const SECRET_PATTERNS: {
  name: string;
  pattern: RegExp;
  severity: SecretFinding["severity"];
}[] = [
  // AWS
  { name: "AWS Access Key", pattern: /(?:AKIA|ASIA)[A-Z0-9]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", pattern: /(?:aws_secret_access_key|secret_key)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi, severity: "critical" },

  // GitHub
  { name: "GitHub Token", pattern: /gh[ps]_[A-Za-z0-9_]{36,}/g, severity: "critical" },
  { name: "GitHub OAuth", pattern: /gho_[A-Za-z0-9_]{36,}/g, severity: "critical" },

  // Generic API keys
  { name: "Generic API Key", pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*['"]([A-Za-z0-9_\-]{20,})['"]?/gi, severity: "high" },
  { name: "Generic Secret", pattern: /(?:secret|token|password|passwd|pwd)\s*[=:]\s*['"]([^'"]{8,})['"]?/gi, severity: "high" },

  // Private keys
  { name: "Private Key", pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: "critical" },

  // Stripe
  { name: "Stripe Key", pattern: /(?:sk|pk)_(?:test|live)_[A-Za-z0-9]{24,}/g, severity: "critical" },

  // Slack
  { name: "Slack Token", pattern: /xox[bpras]-[A-Za-z0-9-]{10,}/g, severity: "critical" },
  { name: "Slack Webhook", pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]{8,}\/B[A-Z0-9]{8,}\/[A-Za-z0-9]{24}/g, severity: "high" },

  // Discord
  { name: "Discord Token", pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/g, severity: "critical" },
  { name: "Discord Webhook", pattern: /discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/g, severity: "high" },

  // Database connection strings
  { name: "Database URL", pattern: /(?:postgres|mysql|mongodb|redis):\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/g, severity: "critical" },

  // JWT
  { name: "JWT Token", pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: "medium" },

  // SendGrid
  { name: "SendGrid Key", pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, severity: "critical" },

  // Twilio
  { name: "Twilio Key", pattern: /SK[a-f0-9]{32}/g, severity: "high" },

  // Hardcoded password assignments
  { name: "Hardcoded Password", pattern: /(?:password|passwd|pwd)\s*=\s*['"][^'"]{4,}['"]/gi, severity: "high" },
];

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next", ".output", "coverage"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else {
      if (SKIP_FILES.has(entry.name)) continue;
      const ext = extname(entry.name);
      // Include .env files regardless of extension
      if (SCAN_EXTENSIONS.has(ext) || entry.name.startsWith(".env")) {
        files.push(full);
      }
    }
  }
  return files;
}

function isLikelyFalsePositive(match: string, line: string): boolean {
  const lower = line.toLowerCase();
  // Skip example values, placeholders
  if (/(?:example|placeholder|your[_-]|xxx|changeme|todo|fixme|process\.env)/i.test(match)) return true;
  if (/(?:example|placeholder|your[_-]|xxx|changeme)/i.test(line)) return true;
  // Skip env var references
  if (/process\.env\b|Bun\.env\b|import\.meta\.env\b/i.test(line)) return true;
  // Skip comments
  if (lower.trim().startsWith("//") || lower.trim().startsWith("#") || lower.trim().startsWith("*")) return true;
  return false;
}

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");
  const files = await collectFiles(dir);
  const findings: SecretFinding[] = [];

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, "utf-8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    const rel = relative(dir, file);

    for (const rule of SECRET_PATTERNS) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        const lineNum = content.slice(0, match.index).split("\n").length;
        const lineText = lines[lineNum - 1] ?? "";

        if (isLikelyFalsePositive(match[0], lineText)) continue;

        // Redact the match for display
        const redacted =
          match[0].length > 10
            ? match[0].slice(0, 6) + "..." + match[0].slice(-4)
            : match[0].slice(0, 3) + "***";

        findings.push({
          file: rel,
          line: lineNum,
          rule: rule.name,
          severity: rule.severity,
          match: redacted,
          context: lineText.trim().slice(0, 120),
        });
      }
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const result = {
    root: dir,
    filesScanned: files.length,
    totalFindings: findings.length,
    summary: {
      critical: findings.filter((f) => f.severity === "critical").length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length,
    },
    findings,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Secret Scan Report\n");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total findings: ${findings.length}\n`);

  if (findings.length === 0) {
    console.log("No hardcoded secrets detected.");
    return;
  }

  console.log("## Summary\n");
  console.log(`  Critical: ${result.summary.critical}`);
  console.log(`  High: ${result.summary.high}`);
  console.log(`  Medium: ${result.summary.medium}`);
  console.log(`  Low: ${result.summary.low}\n`);

  console.log("## Findings\n");

  let currentSeverity = "";
  for (const f of findings) {
    if (f.severity !== currentSeverity) {
      currentSeverity = f.severity;
      console.log(`### ${f.severity.toUpperCase()}\n`);
    }
    console.log(`  ${f.file}:${f.line} — ${f.rule}`);
    console.log(`    Match: ${f.match}`);
    console.log(`    Context: ${f.context}`);
    console.log();
  }

  console.log("## Remediation\n");
  console.log("  1. Remove hardcoded secrets from source code");
  console.log("  2. Rotate any exposed credentials immediately");
  console.log("  3. Move secrets to environment variables");
  console.log("  4. Add .env files to .gitignore");
  console.log("  5. Check git history — use `git filter-branch` or BFG if secrets were committed");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
