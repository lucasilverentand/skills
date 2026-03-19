const args = Bun.argv.slice(2);

const HELP = `
env-leak-audit — Verify .env files are gitignored and not committed in history

Usage:
  bun run tools/env-leak-audit.ts [path] [options]

Arguments:
  [path]  Directory to audit (default: current directory)

Options:
  --deep    Also scan git history for previously committed .env files
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const deepScan = args.includes("--deep");
const filteredArgs = args.filter((a) => !a.startsWith("--"));
const scanPath = filteredArgs[0] || ".";

interface AuditFinding {
  file: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  detail: string;
}

async function run(cmd: string[]): Promise<{ stdout: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const stdout = (await new Response(proc.stdout).text()).trim();
  const exitCode = await proc.exited;
  return { stdout, exitCode };
}

async function main() {
  const findings: AuditFinding[] = [];

  // 1. Check if .gitignore exists and has .env patterns
  const gitignoreFile = Bun.file(`${scanPath}/.gitignore`);
  if (await gitignoreFile.exists()) {
    const content = await gitignoreFile.text();
    const lines = content.split("\n").map((l) => l.trim());

    const hasEnvIgnore = lines.some((l) => l === ".env" || l === ".env*" || l === ".env.*");
    if (!hasEnvIgnore) {
      findings.push({
        file: ".gitignore",
        issue: "Missing .env pattern",
        severity: "critical",
        detail: 'Add ".env" or ".env*" to .gitignore to prevent committing secrets',
      });
    }

    const hasEnvLocalIgnore = lines.some((l) => l.includes(".env.local") || l === ".env*" || l === ".env.*");
    if (!hasEnvLocalIgnore && !hasEnvIgnore) {
      findings.push({
        file: ".gitignore",
        issue: "Missing .env.local pattern",
        severity: "warning",
        detail: "Consider ignoring .env.local and other .env variants",
      });
    }
  } else {
    findings.push({
      file: ".gitignore",
      issue: "No .gitignore file",
      severity: "critical",
      detail: "Create a .gitignore with .env patterns",
    });
  }

  // 2. Check if any .env files are currently tracked
  const { stdout: trackedEnv } = await run(["git", "ls-files", `${scanPath}/.env*`]);
  if (trackedEnv) {
    for (const file of trackedEnv.split("\n").filter(Boolean)) {
      // .env.example is expected
      if (file.endsWith(".env.example") || file.endsWith(".env.template")) continue;

      findings.push({
        file,
        issue: "Tracked .env file",
        severity: "critical",
        detail: `This file is tracked by git. Remove with: git rm --cached ${file}`,
      });
    }
  }

  // 3. Check if .env.example exists (good practice)
  const envExampleFile = Bun.file(`${scanPath}/.env.example`);
  if (!(await envExampleFile.exists())) {
    findings.push({
      file: ".env.example",
      issue: "Missing .env.example",
      severity: "info",
      detail: "Create .env.example with placeholder values so collaborators know which variables are needed",
    });
  } else {
    // Check .env.example doesn't contain real values
    const content = await envExampleFile.text();
    for (const line of content.split("\n")) {
      if (!line.trim() || line.startsWith("#")) continue;
      const [, value] = line.split("=");
      if (!value) continue;
      const trimmed = value.trim().replace(/["']/g, "");
      // Check if it looks like a real secret (high entropy, long enough)
      if (trimmed.length > 20 && !/example|placeholder|your|xxx|changeme|todo|fixme/i.test(trimmed)) {
        findings.push({
          file: ".env.example",
          issue: "Possible real secret in example file",
          severity: "warning",
          detail: `The value for ${line.split("=")[0].trim()} looks like a real secret, not a placeholder`,
        });
      }
    }
  }

  // 4. Deep scan: check git history for previously committed .env files
  if (deepScan) {
    const { stdout: historyEnv } = await run([
      "git", "log", "--all", "--pretty=format:", "--name-only", "--diff-filter=A",
    ]);

    const envInHistory = new Set<string>();
    if (historyEnv) {
      for (const file of historyEnv.split("\n")) {
        if (file.match(/\.env(?:\.[^.]+)?$/) && !file.endsWith(".example") && !file.endsWith(".template")) {
          envInHistory.add(file.trim());
        }
      }
    }

    for (const file of envInHistory) {
      // Check if it's still in the current tree
      const { exitCode } = await run(["git", "cat-file", "-e", `HEAD:${file}`]);
      const stillExists = exitCode === 0;

      findings.push({
        file,
        issue: stillExists ? "Secret file in current tree AND history" : "Secret file in git history",
        severity: stillExists ? "critical" : "warning",
        detail: stillExists
          ? `Remove from tracking: git rm --cached ${file}, then purge history`
          : `File was previously committed. Purge with: git filter-repo --path ${file} --invert-paths`,
      });
    }
  }

  findings.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  if (jsonOutput) {
    console.log(JSON.stringify({
      path: scanPath,
      deepScan,
      findings,
      critical: findings.filter((f) => f.severity === "critical").length,
      warnings: findings.filter((f) => f.severity === "warning").length,
    }, null, 2));
  } else {
    if (findings.length === 0) {
      console.log("Environment audit passed — no issues found.");
    } else {
      const critCount = findings.filter((f) => f.severity === "critical").length;
      console.log(`Environment audit: ${findings.length} finding(s) (${critCount} critical)\n`);

      for (const f of findings) {
        const label = f.severity.toUpperCase().padEnd(8);
        console.log(`  [${label}] ${f.file}: ${f.issue}`);
        console.log(`  ${"".padEnd(12)} ${f.detail}`);
        console.log();
      }
    }
  }

  const hasCritical = findings.some((f) => f.severity === "critical");
  if (hasCritical) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
