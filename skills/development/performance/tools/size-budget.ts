const args = Bun.argv.slice(2);

const HELP = `
size-budget — Check bundle sizes against configured budgets

Usage:
  bun run tools/size-budget.ts [output-dir] [options]

Options:
  --config <path>   Path to budget config file (default: .size-budget.json)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Checks each file in the build output against size budgets defined in
.size-budget.json. Exits non-zero if any budget is exceeded.

Budget config format (.size-budget.json):
  {
    "budgets": [
      { "pattern": "**/*.js", "maxSize": "200KB" },
      { "pattern": "**/*.css", "maxSize": "50KB" },
      { "pattern": "total", "maxSize": "500KB" }
    ]
  }
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--config")
);

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) throw new Error(`Invalid size format: ${sizeStr}`);
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };
  return value * (multipliers[unit] || 1);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesGlob(filePath: string, pattern: string): boolean {
  // Simple glob matching for common patterns
  if (pattern === "total") return true;
  const regexStr = pattern
    .replace(/\*\*/g, "GLOBSTAR")
    .replace(/\*/g, "[^/]*")
    .replace(/GLOBSTAR/g, ".*")
    .replace(/\./g, "\\.");
  return new RegExp(`^${regexStr}$`).test(filePath);
}

async function collectFiles(dir: string): Promise<{ path: string; size: number }[]> {
  const files: { path: string; size: number }[] = [];

  async function walk(d: string) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const s = await stat(full);
        files.push({ path: relative(dir, full), size: s.size });
      }
    }
  }

  await walk(dir);
  return files;
}

async function findOutputDir(): Promise<string | null> {
  const candidates = ["dist", "build", ".output", "out"];
  for (const dir of candidates) {
    try {
      const s = await stat(dir);
      if (s.isDirectory()) return dir;
    } catch {
      // continue
    }
  }
  return null;
}

interface Budget {
  pattern: string;
  maxSize: string;
  maxBytes: number;
}

interface BudgetResult {
  pattern: string;
  maxSize: string;
  actualSize: number;
  actualFormatted: string;
  exceeded: boolean;
  files: string[];
}

async function main() {
  const configPath = getFlag("--config") || ".size-budget.json";
  const outputDir = filteredArgs[0] || (await findOutputDir());

  if (!outputDir) {
    console.error(
      "Error: No build output directory found. Run the build first or specify the output directory."
    );
    process.exit(1);
  }

  // Load or create default budget config
  let budgets: Budget[];
  const configFile = Bun.file(configPath);
  if (await configFile.exists()) {
    const config = await configFile.json();
    budgets = config.budgets.map((b: { pattern: string; maxSize: string }) => ({
      ...b,
      maxBytes: parseSize(b.maxSize),
    }));
  } else {
    // Default budgets
    budgets = [
      { pattern: "**/*.js", maxSize: "300KB", maxBytes: parseSize("300KB") },
      { pattern: "**/*.css", maxSize: "100KB", maxBytes: parseSize("100KB") },
      { pattern: "total", maxSize: "1MB", maxBytes: parseSize("1MB") },
    ];
    console.error(
      `No ${configPath} found — using default budgets. Create one for project-specific limits.`
    );
  }

  const files = await collectFiles(resolve(outputDir));
  const totalSize = files.reduce((s, f) => s + f.size, 0);

  const results: BudgetResult[] = [];
  for (const budget of budgets) {
    const matchingFiles =
      budget.pattern === "total"
        ? files
        : files.filter((f) => matchesGlob(f.path, budget.pattern));
    const actualSize = matchingFiles.reduce((s, f) => s + f.size, 0);

    results.push({
      pattern: budget.pattern,
      maxSize: budget.maxSize,
      actualSize,
      actualFormatted: formatSize(actualSize),
      exceeded: actualSize > budget.maxBytes,
      files: matchingFiles.map((f) => f.path),
    });
  }

  const anyExceeded = results.some((r) => r.exceeded);

  const result = {
    outputDir,
    configPath,
    totalSize,
    totalFormatted: formatSize(totalSize),
    fileCount: files.length,
    budgets: results,
    passed: !anyExceeded,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Size Budget Check: ${outputDir}`);
    console.log(`  Total: ${formatSize(totalSize)} (${files.length} files)\n`);

    for (const r of results) {
      const status = r.exceeded ? "OVER" : "OK";
      const icon = r.exceeded ? "x" : "v";
      console.log(
        `  [${icon}] ${r.pattern}: ${r.actualFormatted} / ${r.maxSize} (${status})`
      );
      if (r.exceeded) {
        const overBy = r.actualSize - parseSize(r.maxSize);
        console.log(`      Over by ${formatSize(overBy)}`);
      }
    }

    console.log(
      `\n${anyExceeded ? "FAILED: budget exceeded" : "PASSED: all budgets within limits"}`
    );
  }

  if (anyExceeded) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
