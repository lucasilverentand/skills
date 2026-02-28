const args = Bun.argv.slice(2);

const HELP = `
cache-audit — Analyze GitHub Actions workflow caching and suggest improvements

Usage:
  bun run tools/cache-audit.ts <workflow-path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Analyzes GitHub Actions workflow files for caching configuration:
- Missing cache for dependency installs
- Cache keys that are too specific or not specific enough
- Wrong cache paths
- Missing restore-keys fallback
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CacheIssue {
  file: string;
  line: number;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  suggestion: string;
}

interface CacheEntry {
  file: string;
  line: number;
  path: string;
  key: string;
  restoreKeys: string[];
}

async function auditWorkflow(filePath: string): Promise<{
  caches: CacheEntry[];
  issues: CacheIssue[];
}> {
  const caches: CacheEntry[] = [];
  const issues: CacheIssue[] = [];

  const file = Bun.file(filePath);
  if (!(await file.exists())) return { caches, issues };

  const content = await file.text();
  const lines = content.split("\n");

  // Detect package manager used
  const usesBun = /bun\s+install|setup-bun|oven-sh/i.test(content);
  const usesNpm = /npm\s+(?:ci|install)|setup-node/i.test(content);
  const usesYarn = /yarn\s+install/i.test(content);
  const usesPnpm = /pnpm\s+install/i.test(content);

  // Find existing cache configurations
  let inCacheStep = false;
  let cacheStepStart = 0;
  let currentCache: Partial<CacheEntry> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (/actions\/cache@/.test(line)) {
      inCacheStep = true;
      cacheStepStart = lineNum;
      currentCache = { file: filePath, line: lineNum };
    }

    if (inCacheStep) {
      const pathMatch = line.match(/^\s+path:\s*(.+)/);
      if (pathMatch) currentCache.path = pathMatch[1].trim();

      const keyMatch = line.match(/^\s+key:\s*(.+)/);
      if (keyMatch) currentCache.key = keyMatch[1].trim();

      const restoreMatch = line.match(/^\s+restore-keys:\s*\|?\s*/);
      if (restoreMatch) {
        currentCache.restoreKeys = [];
        // Read subsequent indented lines
        for (let j = i + 1; j < lines.length; j++) {
          const restoreLine = lines[j].trim();
          if (restoreLine && !restoreLine.includes(":") && !restoreLine.startsWith("-")) {
            currentCache.restoreKeys.push(restoreLine);
          } else if (restoreLine.startsWith("$")) {
            currentCache.restoreKeys.push(restoreLine);
          } else {
            break;
          }
        }
      }

      // End of cache step (next step or end of with: block)
      if (
        (line.match(/^\s+-\s/) && i > cacheStepStart) ||
        (line.match(/^\s+\w+:/) && !line.match(/^\s+(path|key|restore-keys):/))
      ) {
        if (currentCache.path && currentCache.key) {
          caches.push(currentCache as CacheEntry);
        }
        inCacheStep = false;
      }
    }
  }

  // Close last cache entry
  if (inCacheStep && currentCache.path && currentCache.key) {
    caches.push(currentCache as CacheEntry);
  }

  // Check for missing caches
  const hasAnyCaching = caches.length > 0 || /actions\/cache|actions\/setup-node.*cache/i.test(content);

  if (usesBun && !hasAnyCaching) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "warning",
      rule: "missing-cache",
      message: "Bun install detected but no dependency caching configured",
      suggestion:
        "Add actions/cache with path ~/.bun/install/cache and key ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}",
    });
  }

  if (usesNpm && !hasAnyCaching) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "warning",
      rule: "missing-cache",
      message: "npm install detected but no dependency caching configured",
      suggestion: "Add actions/setup-node with cache: npm, or use actions/cache with ~/.npm path",
    });
  }

  // Analyze existing cache configurations
  for (const cache of caches) {
    // Check if key includes branch name (too volatile)
    if (cache.key.includes("github.ref") || cache.key.includes("GITHUB_REF")) {
      issues.push({
        file: filePath,
        line: cache.line,
        severity: "warning",
        rule: "volatile-key",
        message: "Cache key includes branch reference — cache won't be shared across branches",
        suggestion: "Remove branch from cache key; use only OS + tool + lockfile hash",
      });
    }

    // Check if key has no hash component
    if (!cache.key.includes("hashFiles") && !cache.key.includes("hash")) {
      issues.push({
        file: filePath,
        line: cache.line,
        severity: "error",
        rule: "no-hash-key",
        message: "Cache key has no file hash — stale cache will be served after dependency changes",
        suggestion: "Add ${{ hashFiles('**/lockfile') }} to the cache key",
      });
    }

    // Check for missing restore-keys
    if (!cache.restoreKeys || cache.restoreKeys.length === 0) {
      issues.push({
        file: filePath,
        line: cache.line,
        severity: "info",
        rule: "missing-restore-keys",
        message: "No restore-keys fallback — cache miss means no fallback to partial cache",
        suggestion: "Add restore-keys with a prefix pattern (e.g., ${{ runner.os }}-bun-)",
      });
    }

    // Check for wrong cache path (caching node_modules directly)
    if (cache.path.includes("node_modules")) {
      issues.push({
        file: filePath,
        line: cache.line,
        severity: "warning",
        rule: "cache-node-modules",
        message: "Caching node_modules directly is unreliable — cache the package manager's global store instead",
        suggestion: usesBun
          ? "Cache ~/.bun/install/cache instead"
          : "Cache ~/.npm or ~/.cache/yarn instead",
      });
    }
  }

  return { caches, issues };
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{yml,yaml}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required workflow path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No workflow files found at the specified path");
    process.exit(1);
  }

  let allCaches: CacheEntry[] = [];
  let allIssues: CacheIssue[] = [];

  for (const file of files) {
    const { caches, issues } = await auditWorkflow(file);
    allCaches.push(...caches);
    allIssues.push(...issues);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify({ caches: allCaches, issues: allIssues }, null, 2)
    );
  } else {
    console.log(`Cache Audit: ${files.length} workflows, ${allCaches.length} cache entries, ${allIssues.length} issues\n`);

    if (allCaches.length > 0) {
      console.log("Cache entries found:\n");
      for (const cache of allCaches) {
        console.log(`  ${cache.file}:${cache.line}`);
        console.log(`    path: ${cache.path}`);
        console.log(`    key:  ${cache.key}`);
        if (cache.restoreKeys?.length) {
          console.log(`    restore-keys: ${cache.restoreKeys.join(", ")}`);
        }
        console.log();
      }
    }

    if (allIssues.length > 0) {
      console.log("Issues:\n");
      for (const issue of allIssues) {
        const icon = issue.severity === "error" ? "ERROR" : issue.severity === "warning" ? "WARN" : "INFO";
        console.log(`  [${icon}] ${issue.file}:${issue.line} — ${issue.rule}`);
        console.log(`    ${issue.message}`);
        console.log(`    Fix: ${issue.suggestion}\n`);
      }
    }

    if (allIssues.length === 0) {
      console.log("No caching issues found.");
    }
  }

  const errors = allIssues.filter((i) => i.severity === "error");
  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
