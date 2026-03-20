const args = Bun.argv.slice(2);

const HELP = `
secret-scan — Scan the repo for high-entropy strings and known secret patterns

Usage:
  bun run tools/secret-scan.ts [path] [options]

Arguments:
  [path]  Directory to scan (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const scanPath = filteredArgs[0] || ".";

interface SecretMatch {
  file: string;
  line: number;
  pattern: string;
  severity: "critical" | "high" | "medium";
  snippet: string;
}

const PATTERNS: { name: string; regex: RegExp; severity: "critical" | "high" | "medium" }[] = [
  // API keys and tokens
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*[A-Za-z0-9/+=]{40}/g, severity: "critical" },
  { name: "GitHub Token", regex: /gh[pousr]_[A-Za-z0-9_]{36,}/g, severity: "critical" },
  { name: "GitHub Classic Token", regex: /ghp_[A-Za-z0-9]{36}/g, severity: "critical" },
  { name: "Slack Token", regex: /xox[baprs]-[0-9]+-[0-9A-Za-z-]+/g, severity: "critical" },
  { name: "Stripe Secret Key", regex: /sk_live_[0-9a-zA-Z]{24,}/g, severity: "critical" },
  { name: "Stripe Publishable Key", regex: /pk_live_[0-9a-zA-Z]{24,}/g, severity: "high" },

  // Private keys
  { name: "Private Key", regex: /-----BEGIN\s+(RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: "critical" },

  // Generic secrets in assignments
  { name: "Hardcoded Password", regex: /(?:password|passwd|pwd)\s*[=:]\s*["'][^"']{8,}["']/gi, severity: "high" },
  { name: "Hardcoded Secret", regex: /(?:secret|api_key|apikey|api_secret|access_token)\s*[=:]\s*["'][^"']{8,}["']/gi, severity: "high" },
  { name: "Bearer Token", regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, severity: "high" },

  // Database URLs with credentials
  { name: "Database URL with credentials", regex: /(?:postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^\s"']+/gi, severity: "high" },

  // JWT
  { name: "JWT Token", regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, severity: "medium" },

  // Generic high-entropy hex strings that look like secrets
  { name: "Hex Secret (32+ chars)", regex: /(?:secret|key|token|password|credential)\s*[=:]\s*["']?[0-9a-f]{32,}["']?/gi, severity: "medium" },
];

// Files to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /\.lockb$/,
  /\.lock$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /dist\//,
  /build\//,
  /\.wasm$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.ico$/,
  /\.svg$/,
  /\.woff/,
  /\.ttf$/,
];

async function run(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
}

function redact(s: string): string {
  if (s.length <= 8) return "***";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

async function main() {
  // Get tracked files
  const filesRaw = await run(["git", "ls-files", scanPath]);
  if (!filesRaw) {
    console.error(`Error: no tracked files in ${scanPath}`);
    process.exit(1);
  }

  const files = filesRaw.split("\n").filter(Boolean);
  const matches: SecretMatch[] = [];

  for (const filePath of files) {
    // Skip binary and irrelevant files
    if (SKIP_PATTERNS.some((p) => p.test(filePath))) continue;

    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;

    // Skip large files (>1MB)
    if (file.size > 1024 * 1024) continue;

    let content: string;
    try {
      content = await file.text();
    } catch {
      continue;
    }

    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines
      if (line.trim().startsWith("//") || line.trim().startsWith("#") || line.trim().startsWith("*")) continue;

      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          // Skip if it looks like an example/placeholder
          const value = match[0];
          if (/example|placeholder|your[_-]?key|xxx|000|test|fake|dummy|sample/i.test(value)) continue;
          if (value === "YOUR_API_KEY" || value === "YOUR_SECRET") continue;

          matches.push({
            file: filePath,
            line: i + 1,
            pattern: pattern.name,
            severity: pattern.severity,
            snippet: redact(value),
          });
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = matches.filter((m) => {
    const key = `${m.file}:${m.line}:${m.pattern}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.severity] - order[b.severity];
  });

  if (jsonOutput) {
    console.log(JSON.stringify({
      path: scanPath,
      filesScanned: files.length,
      findings: unique.length,
      matches: unique,
    }, null, 2));
  } else {
    if (unique.length === 0) {
      console.log(`Scanned ${files.length} files — no secrets detected.`);
    } else {
      console.log(`Secret scan: ${unique.length} finding(s) in ${files.length} files\n`);

      const bySeverity: Record<string, SecretMatch[]> = {};
      for (const m of unique) {
        if (!bySeverity[m.severity]) bySeverity[m.severity] = [];
        bySeverity[m.severity].push(m);
      }

      for (const sev of ["critical", "high", "medium"] as const) {
        const items = bySeverity[sev];
        if (!items) continue;

        console.log(`${sev.toUpperCase()} (${items.length}):`);
        for (const m of items) {
          console.log(`  ${m.file}:${m.line} — ${m.pattern}`);
          console.log(`    ${m.snippet}`);
        }
        console.log();
      }

      console.log("ACTION: Rotate any detected secrets immediately, then remove from codebase.");
    }
  }

  const hasCritical = unique.some((m) => m.severity === "critical");
  if (hasCritical) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
