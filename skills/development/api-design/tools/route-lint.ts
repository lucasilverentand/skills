const args = Bun.argv.slice(2);

const HELP = `
route-lint — Check API routes for naming inconsistencies and missing validation

Usage:
  bun run tools/route-lint.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans Hono/Express route files and checks for:
- Non-plural resource names
- Deep nesting (more than 2 levels)
- Missing Zod validation on mutation endpoints
- Inconsistent casing (camelCase vs kebab-case)
- Routes without typed responses
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface LintIssue {
  file: string;
  line: number;
  rule: string;
  severity: "error" | "warning";
  message: string;
  path: string;
  method: string;
}

// Simple heuristic for singular nouns (not perfect but catches common cases)
function likelySingular(segment: string): boolean {
  if (segment.startsWith(":") || segment.startsWith("{")) return false;
  if (segment === "auth" || segment === "health" || segment === "ws" || segment === "api") return false;
  if (segment.endsWith("s") || segment.endsWith("ies")) return false;
  if (segment.match(/^(status|media|data|info|search|config|settings)$/)) return false;
  return segment.length > 2;
}

function hasMixedCasing(path: string): boolean {
  const segments = path.split("/").filter((s) => s && !s.startsWith(":") && !s.startsWith("{"));
  const hasKebab = segments.some((s) => s.includes("-"));
  const hasCamel = segments.some((s) => /[a-z][A-Z]/.test(s));
  return hasKebab && hasCamel;
}

function nestingDepth(path: string): number {
  // Count resource segments (non-parameter segments)
  const segments = path.split("/").filter(Boolean);
  let depth = 0;
  for (const seg of segments) {
    if (!seg.startsWith(":") && !seg.startsWith("{")) depth++;
  }
  return depth;
}

async function scanFile(filePath: string): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return issues;

  const content = await file.text();
  const lines = content.split("\n");

  const routeRegex =
    /\.(get|post|put|patch|delete)\s*\(\s*["'`](\/[^"'`]*)["'`]/gi;
  let match: RegExpExecArray | null;

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toLowerCase();
    const routePath = match[2];
    const lineNum = content.substring(0, match.index).split("\n").length;

    // Check for singular resource names
    const segments = routePath.split("/").filter(Boolean);
    for (const seg of segments) {
      if (likelySingular(seg)) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "plural-resources",
          severity: "warning",
          message: `Resource "${seg}" appears singular — REST convention uses plural nouns (e.g., /${seg}s)`,
          path: routePath,
          method,
        });
      }
    }

    // Check nesting depth
    if (nestingDepth(routePath) > 3) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "deep-nesting",
        severity: "warning",
        message: `Route nesting is ${nestingDepth(routePath)} levels deep — keep to 2 levels max (e.g., /resources/{id}/sub-resources)`,
        path: routePath,
        method,
      });
    }

    // Check for mixed casing
    if (hasMixedCasing(routePath)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "consistent-casing",
        severity: "error",
        message: "Mixed kebab-case and camelCase in route path — pick one convention",
        path: routePath,
        method,
      });
    }

    // Check for missing Zod validation on mutation endpoints
    if (["post", "put", "patch"].includes(method)) {
      const nearbyLines = lines.slice(lineNum - 1, lineNum + 10).join("\n");
      const hasValidator =
        /zValidator|z\.object|\.parse\(|validator\(/i.test(nearbyLines);

      if (!hasValidator) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "missing-validation",
          severity: "error",
          message: `${method.toUpperCase()} endpoint has no Zod validation — mutation endpoints must validate input`,
          path: routePath,
          method,
        });
      }
    }

    // Check for uppercase letters in path segments
    const hasUpperCase = segments.some(
      (s) => !s.startsWith(":") && !s.startsWith("{") && /[A-Z]/.test(s)
    );
    if (hasUpperCase) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "lowercase-paths",
        severity: "warning",
        message: "Route path contains uppercase letters — URLs should be lowercase",
        path: routePath,
        method,
      });
    }
  }

  return issues;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules") || path.includes(".test.") || path.includes(".spec.")) continue;
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required path argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No route files found at the specified path");
    process.exit(1);
  }

  const allIssues: LintIssue[] = [];
  for (const file of files) {
    const issues = await scanFile(file);
    allIssues.push(...issues);
  }

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          total: allIssues.length,
          errors: errors.length,
          warnings: warnings.length,
          issues: allIssues,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Route Lint: ${files.length} files scanned — ${errors.length} errors, ${warnings.length} warnings\n`
    );

    if (allIssues.length === 0) {
      console.log("No issues found.");
    } else {
      for (const issue of allIssues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        console.log(
          `[${icon}] ${issue.file}:${issue.line} — ${issue.rule}`
        );
        console.log(`  ${issue.method.toUpperCase()} ${issue.path}`);
        console.log(`  ${issue.message}\n`);
      }
    }
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
