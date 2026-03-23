const args = Bun.argv.slice(2);

const HELP = `
config-audit — Audit project configuration for security issues

Usage:
  bun run tools/config-audit.ts [directory] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks project configuration files for security issues:
- Package.json scripts (postinstall attacks, suspicious commands)
- Dockerfile security (root user, latest tags, secrets in build)
- GitHub Actions (script injection, untrusted inputs, excessive permissions)
- Environment files committed to git
- Security headers in framework config
- CORS configuration
- TypeScript strict mode
- Gitignore coverage for sensitive files
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readFile, readdir, access } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface ConfigFinding {
  file: string;
  line?: number;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  rule: string;
  message: string;
  recommendation: string;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readFileIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

async function findFiles(dir: string, pattern: RegExp, maxDepth = 3): Promise<string[]> {
  const results: string[] = [];
  async function walk(d: string, depth: number) {
    if (depth > maxDepth) return;
    try {
      const entries = await readdir(d, { withFileTypes: true });
      for (const entry of entries) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) {
          if (["node_modules", ".git", "dist", "vendor", ".next", ".output"].includes(entry.name)) continue;
          await walk(full, depth + 1);
        } else if (pattern.test(entry.name)) {
          results.push(full);
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }
  await walk(dir, 0);
  return results;
}

// ─── Package.json Audit ───────────────────────────────────────────────────────

async function auditPackageJson(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];
  const content = await readFileIfExists(join(dir, "package.json"));
  if (!content) return findings;

  let pkg: any;
  try {
    pkg = JSON.parse(content);
  } catch {
    return findings;
  }

  const scripts = pkg.scripts ?? {};

  // Check for suspicious lifecycle scripts
  const dangerousScripts = ["preinstall", "postinstall", "preuninstall", "postuninstall"];
  for (const name of dangerousScripts) {
    if (scripts[name]) {
      const cmd = scripts[name];
      if (/curl|wget|fetch|http|eval|base64|\.sh\b/i.test(cmd)) {
        findings.push({
          file: "package.json",
          severity: "critical",
          category: "supply-chain",
          rule: "suspicious-lifecycle-script",
          message: `Suspicious ${name} script: "${cmd.slice(0, 100)}" — common in supply chain attacks`,
          recommendation: "Review this script carefully. Lifecycle scripts that download/execute code are a major attack vector.",
        });
      } else {
        findings.push({
          file: "package.json",
          severity: "low",
          category: "supply-chain",
          rule: "lifecycle-script-present",
          message: `Lifecycle script '${name}' defined — review for intended behavior`,
          recommendation: "Ensure lifecycle scripts are intentional and don't run unexpected commands.",
        });
      }
    }
  }

  // Check for wildcard dependencies
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, version] of Object.entries(allDeps)) {
    if (version === "*" || version === "latest" || version === "") {
      findings.push({
        file: "package.json",
        severity: "high",
        category: "supply-chain",
        rule: "unpinned-dependency",
        message: `Dependency '${name}' uses '${version}' — no version constraint`,
        recommendation: "Pin to a specific semver range (e.g., ^1.2.3). Wildcard versions accept any version including malicious updates.",
      });
    }
  }

  // Check for missing package-lock/bun.lockb
  const hasLockfile = await fileExists(join(dir, "bun.lockb"))
    || await fileExists(join(dir, "package-lock.json"))
    || await fileExists(join(dir, "yarn.lock"))
    || await fileExists(join(dir, "pnpm-lock.yaml"));
  if (!hasLockfile) {
    findings.push({
      file: "package.json",
      severity: "medium",
      category: "supply-chain",
      rule: "missing-lockfile",
      message: "No lockfile found — dependency versions are not reproducible",
      recommendation: "Run `bun install` to generate bun.lockb. Commit the lockfile to ensure reproducible builds.",
    });
  }

  return findings;
}

// ─── Dockerfile Audit ─────────────────────────────────────────────────────────

async function auditDockerfiles(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];
  const dockerfiles = await findFiles(dir, /^Dockerfile(?:\.\w+)?$/);

  for (const file of dockerfiles) {
    const content = await readFile(file, "utf-8");
    const rel = relative(dir, file);
    const lines = content.split("\n");

    // Check for running as root
    const hasUser = lines.some((l) => /^USER\s+/i.test(l.trim()));
    if (!hasUser) {
      findings.push({
        file: rel,
        severity: "high",
        category: "container",
        rule: "docker-root-user",
        message: "Dockerfile does not set a non-root USER — container runs as root by default",
        recommendation: "Add 'USER nonroot' or 'USER 1000' before the CMD/ENTRYPOINT instruction.",
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for latest tag
      if (/^FROM\s+\S+:latest\b/i.test(line) || (/^FROM\s+\S+$/i.test(line) && !line.includes(":"))) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "medium",
          category: "container",
          rule: "docker-latest-tag",
          message: "Base image uses 'latest' tag — builds are not reproducible",
          recommendation: "Pin to a specific version tag or SHA digest (e.g., node:22-slim or node@sha256:...).",
        });
      }

      // Check for secrets in ENV/ARG
      if (/^(?:ENV|ARG)\s+(?:\w*(?:SECRET|PASSWORD|TOKEN|KEY|CREDENTIAL)\w*)/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "critical",
          category: "container",
          rule: "docker-secret-in-env",
          message: "Secret passed via ENV/ARG — persisted in image layers and visible in docker inspect",
          recommendation: "Use Docker secrets, BuildKit secret mounts (--mount=type=secret), or runtime environment variables.",
        });
      }

      // Check for ADD with URL
      if (/^ADD\s+https?:\/\//i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "medium",
          category: "container",
          rule: "docker-add-url",
          message: "ADD with URL downloads content without integrity verification",
          recommendation: "Use RUN curl/wget with checksum verification, or use COPY with pre-downloaded files.",
        });
      }

      // Check for privileged operations
      if (/^RUN\s+.*(?:chmod\s+777|--privileged)/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "high",
          category: "container",
          rule: "docker-excessive-permissions",
          message: "Excessive permissions in Dockerfile (chmod 777 or --privileged)",
          recommendation: "Use minimal permissions. chmod 755 for directories, 644 for files. Never use --privileged in production.",
        });
      }

      // Check for COPY of sensitive files
      if (/^COPY\s+.*(?:\.env|\.ssh|\.aws|\.gnupg|credentials|\.key|\.pem)\b/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "critical",
          category: "container",
          rule: "docker-copy-secrets",
          message: "COPY includes potentially sensitive files — they persist in image layers",
          recommendation: "Use .dockerignore to exclude sensitive files. Use Docker secrets or runtime env vars for credentials.",
        });
      }
    }
  }

  return findings;
}

// ─── GitHub Actions Audit ─────────────────────────────────────────────────────

async function auditGitHubActions(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];
  const workflowDir = join(dir, ".github", "workflows");
  const workflows = await findFiles(workflowDir, /\.ya?ml$/, 1);

  for (const file of workflows) {
    const content = await readFile(file, "utf-8");
    const rel = relative(dir, file);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Script injection via untrusted context
      if (/\$\{\{\s*github\.event\.(?:issue|pull_request|comment|review|discussion)\.(?:title|body|head\.ref|label\.name)/i.test(line)) {
        if (/run\s*[:|\s]|script[:|\s]/i.test(lines.slice(Math.max(0, i - 5), i + 1).join("\n"))) {
          findings.push({
            file: rel,
            line: i + 1,
            severity: "critical",
            category: "ci",
            rule: "gha-script-injection",
            message: "GitHub Actions script injection — untrusted event data used in run block",
            recommendation: "Pass untrusted data via environment variables, not inline in run scripts. Use ${{ env.TITLE }} after setting env: TITLE: ${{ github.event.issue.title }}.",
          });
        }
      }

      // Unpinned action versions
      if (/uses\s*:\s*\S+@(?:main|master|latest|v\d+)\s*$/i.test(line.trim())) {
        if (!/actions\/checkout|actions\/cache|actions\/upload-artifact|oven-sh\/setup-bun/i.test(line)) {
          findings.push({
            file: rel,
            line: i + 1,
            severity: "medium",
            category: "ci",
            rule: "gha-unpinned-action",
            message: "GitHub Action uses mutable tag — vulnerable to tag rewrite attacks",
            recommendation: "Pin actions to a full commit SHA (e.g., uses: owner/action@abc123def) for supply chain security.",
          });
        }
      }

      // Excessive permissions
      if (/permissions\s*:\s*write-all/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "high",
          category: "ci",
          rule: "gha-excessive-permissions",
          message: "Workflow uses write-all permissions — violates principle of least privilege",
          recommendation: "Specify only the permissions needed (e.g., contents: read, pull-requests: write).",
        });
      }

      // Pull request target trigger
      if (/pull_request_target/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "high",
          category: "ci",
          rule: "gha-pull-request-target",
          message: "pull_request_target runs with write permissions on fork PRs — common attack vector",
          recommendation: "Ensure the workflow does not checkout/run code from the PR head. Use pull_request event when possible.",
        });
      }

      // Secrets in logs
      if (/echo.*\$\{\{\s*secrets\./i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "critical",
          category: "ci",
          rule: "gha-secret-in-log",
          message: "Secret echoed to logs — GitHub masks known secrets but this is still dangerous",
          recommendation: "Never echo secrets. Use them only in environment variables or masked step outputs.",
        });
      }
    }

    // Check for missing permissions block
    if (!content.includes("permissions:")) {
      findings.push({
        file: rel,
        severity: "medium",
        category: "ci",
        rule: "gha-no-permissions",
        message: "Workflow does not declare explicit permissions — defaults to broad token access",
        recommendation: "Add a top-level `permissions:` block with minimal required permissions.",
      });
    }
  }

  return findings;
}

// ─── Environment File Audit ───────────────────────────────────────────────────

async function auditEnvFiles(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];

  // Check if .env files exist (they shouldn't be in the repo)
  const envFiles = await findFiles(dir, /^\.env(?:\.\w+)?$/, 2);
  const gitignore = await readFileIfExists(join(dir, ".gitignore"));

  for (const file of envFiles) {
    const rel = relative(dir, file);
    const name = rel.split("/").pop() ?? "";

    // Skip examples
    if (/\.example|\.sample|\.template/i.test(name)) continue;

    // Check if it's gitignored
    const isIgnored = gitignore?.includes(".env") ?? false;

    if (!isIgnored) {
      findings.push({
        file: rel,
        severity: "critical",
        category: "secrets",
        rule: "env-not-gitignored",
        message: `${rel} exists and .gitignore does not appear to exclude .env files`,
        recommendation: "Add '.env*' to .gitignore and remove .env files from git history with `git rm --cached .env`.",
      });
    }

    // Check content for actual secrets
    const content = await readFileIfExists(file);
    if (content) {
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#")) continue;
        const [key, ...rest] = line.split("=");
        const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");

        if (/(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL|AUTH)/i.test(key ?? "") && value && value.length > 3) {
          if (!/placeholder|changeme|your[_-]|xxx|example|todo/i.test(value)) {
            findings.push({
              file: rel,
              line: i + 1,
              severity: "critical",
              category: "secrets",
              rule: "env-real-secret",
              message: `${key} appears to contain a real secret value`,
              recommendation: "Remove this file from version control. Rotate the exposed credential immediately.",
            });
          }
        }
      }
    }
  }

  // Check gitignore coverage
  if (gitignore) {
    const shouldIgnore = [".env", ".env.local", ".env.production", "*.pem", "*.key", ".DS_Store"];
    for (const pattern of shouldIgnore) {
      if (!gitignore.includes(pattern.replace("*", ""))) {
        findings.push({
          file: ".gitignore",
          severity: "medium",
          category: "secrets",
          rule: "gitignore-missing-pattern",
          message: `.gitignore does not include '${pattern}'`,
          recommendation: `Add '${pattern}' to .gitignore to prevent accidental commits of sensitive files.`,
        });
      }
    }
  } else {
    findings.push({
      file: ".gitignore",
      severity: "high",
      category: "secrets",
      rule: "missing-gitignore",
      message: "No .gitignore file found — sensitive files may be committed accidentally",
      recommendation: "Create a .gitignore file with entries for .env*, *.pem, *.key, node_modules, and other sensitive paths.",
    });
  }

  return findings;
}

// ─── TypeScript Config Audit ──────────────────────────────────────────────────

async function auditTsConfig(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];
  const tsconfigs = await findFiles(dir, /^tsconfig(?:\.\w+)?\.json$/, 2);

  for (const file of tsconfigs) {
    const content = await readFileIfExists(file);
    if (!content) continue;

    const rel = relative(dir, file);
    let config: any;
    try {
      // Strip comments for JSON parsing
      const stripped = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      config = JSON.parse(stripped);
    } catch {
      continue;
    }

    const compiler = config.compilerOptions ?? {};

    if (compiler.strict !== true && compiler.strictNullChecks !== true) {
      findings.push({
        file: rel,
        severity: "medium",
        category: "type-safety",
        rule: "ts-not-strict",
        message: "TypeScript strict mode not enabled — null/undefined bugs can cause security issues",
        recommendation: "Enable `strict: true` in tsconfig.json. At minimum, enable `strictNullChecks`.",
      });
    }

    if (compiler.noUncheckedIndexedAccess !== true) {
      findings.push({
        file: rel,
        severity: "low",
        category: "type-safety",
        rule: "ts-no-unchecked-indexed",
        message: "noUncheckedIndexedAccess not enabled — index access assumes values always exist",
        recommendation: "Enable `noUncheckedIndexedAccess: true` to catch potential undefined access bugs.",
      });
    }
  }

  return findings;
}

// ─── CORS/Security Headers Audit ──────────────────────────────────────────────

async function auditSecurityConfig(dir: string): Promise<ConfigFinding[]> {
  const findings: ConfigFinding[] = [];

  // Look for common config/server files
  const configFiles = await findFiles(dir, /(?:server|app|index|main|config)\.(?:ts|js|mts|mjs)$/, 3);

  for (const file of configFiles) {
    const content = await readFileIfExists(file);
    if (!content) continue;
    const rel = relative(dir, file);
    const lines = content.split("\n");

    // Check for CORS wildcard
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/cors\s*\(\s*\{?\s*\)?\s*$/i.test(line) || /cors\s*\(\s*\)/i.test(line)) {
        findings.push({
          file: rel,
          line: i + 1,
          severity: "medium",
          category: "headers",
          rule: "cors-default-permissive",
          message: "CORS middleware with default options — may allow all origins",
          recommendation: "Configure cors() with an explicit origin allowlist: cors({ origin: ['https://example.com'] }).",
        });
      }
    }

    // Check for missing security headers
    if (content.includes("Hono") || content.includes("express") || content.includes("fastify")) {
      if (!content.includes("secureHeaders") && !content.includes("helmet") && !content.includes("Content-Security-Policy")) {
        findings.push({
          file: rel,
          severity: "medium",
          category: "headers",
          rule: "missing-security-headers",
          message: "Server file does not set security headers (CSP, HSTS, X-Content-Type-Options)",
          recommendation: "Add security headers middleware: secureHeaders() for Hono, helmet() for Express.",
        });
      }

      if (!content.includes("rateLimit") && !content.includes("rate-limit") && !content.includes("rateLimiter")) {
        findings.push({
          file: rel,
          severity: "medium",
          category: "headers",
          rule: "missing-rate-limiting",
          message: "No rate limiting detected in server configuration",
          recommendation: "Add rate limiting middleware to prevent brute force and DoS attacks.",
        });
      }
    }
  }

  return findings;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dir = resolve(filteredArgs[0] ?? ".");
  const allFindings: ConfigFinding[] = [];

  // Run all audits
  const results = await Promise.all([
    auditPackageJson(dir),
    auditDockerfiles(dir),
    auditGitHubActions(dir),
    auditEnvFiles(dir),
    auditTsConfig(dir),
    auditSecurityConfig(dir),
  ]);

  for (const result of results) {
    allFindings.push(...result);
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const summary = {
    critical: allFindings.filter((f) => f.severity === "critical").length,
    high: allFindings.filter((f) => f.severity === "high").length,
    medium: allFindings.filter((f) => f.severity === "medium").length,
    low: allFindings.filter((f) => f.severity === "low").length,
  };

  const categorySummary: Record<string, number> = {};
  for (const f of allFindings) {
    categorySummary[f.category] = (categorySummary[f.category] ?? 0) + 1;
  }

  const result = {
    root: dir,
    totalFindings: allFindings.length,
    summary,
    categorySummary,
    findings: allFindings,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log("# Configuration Audit Report\n");
  console.log(`Root: ${dir}`);
  console.log(`Total findings: ${allFindings.length}\n`);

  if (allFindings.length === 0) {
    console.log("No configuration security issues detected.");
    return;
  }

  console.log("## Severity Summary\n");
  if (summary.critical) console.log(`  CRITICAL: ${summary.critical}`);
  if (summary.high) console.log(`  HIGH:     ${summary.high}`);
  if (summary.medium) console.log(`  MEDIUM:   ${summary.medium}`);
  if (summary.low) console.log(`  LOW:      ${summary.low}`);
  console.log();

  console.log("## Category Summary\n");
  for (const [cat, count] of Object.entries(categorySummary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log();

  console.log("## Findings\n");
  let currentSeverity = "";
  for (const f of allFindings) {
    if (f.severity !== currentSeverity) {
      currentSeverity = f.severity;
      console.log(`### ${f.severity.toUpperCase()}\n`);
    }
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    console.log(`  ${loc} — ${f.rule}`);
    console.log(`    ${f.message}`);
    console.log(`    Fix: ${f.recommendation}`);
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
