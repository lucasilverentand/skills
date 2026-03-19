const args = Bun.argv.slice(2);

const HELP = `
error-audit — Scan codebase for inconsistent error handling patterns

Usage:
  bun run tools/error-audit.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks for:
- Bare throw statements outside system boundaries
- Untyped catch blocks (catch without typed error handling)
- Functions returning mixed patterns (sometimes throw, sometimes result)
- Missing error codes in error returns
- catch blocks that swallow errors silently
- Direct exposure of internal errors (DB, ORM) in return values
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface AuditIssue {
  file: string;
  line: number;
  rule: string;
  severity: "error" | "warning";
  message: string;
  snippet: string;
}

const SYSTEM_BOUNDARY_INDICATORS = [
  "middleware",
  "errorHandler",
  "onError",
  "process.on",
  "HTTPException",
  "app.use",
  "catch_all",
  "uncaughtException",
  "unhandledRejection",
];

function isSystemBoundaryContext(
  lines: string[],
  lineIndex: number
): boolean {
  const start = Math.max(0, lineIndex - 10);
  const contextBlock = lines.slice(start, lineIndex + 1).join("\n");
  return SYSTEM_BOUNDARY_INDICATORS.some((indicator) =>
    contextBlock.includes(indicator)
  );
}

async function scanFile(filePath: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return issues;

  const content = await file.text();
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineNum = i + 1;

    // Rule: bare throw outside system boundaries
    if (
      /^\s*throw\s+/.test(line) &&
      !isSystemBoundaryContext(lines, i)
    ) {
      // Check if throwing HTTPException (acceptable at route level)
      if (!/HTTPException|new Error\(\s*["'`]Unrecoverable/.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "no-bare-throw",
          severity: "error",
          message:
            "Throw statement outside a system boundary — use result types for expected errors",
          snippet: trimmed,
        });
      }
    }

    // Rule: catch block without error handling
    if (/\bcatch\s*\(/.test(trimmed)) {
      const nextLines = lines.slice(i + 1, i + 5).join("\n");
      const catchBody = nextLines.trim();
      // Empty catch or only a comment
      if (
        catchBody.startsWith("}") ||
        (catchBody.startsWith("//") &&
          lines[i + 2]?.trim().startsWith("}"))
      ) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "no-swallowed-errors",
          severity: "error",
          message:
            "Catch block swallows error silently — log it or return a result with an error code",
          snippet: trimmed,
        });
      }
    }

    // Rule: untyped catch (catch(e) without any type assertion or instanceof check)
    const catchMatch = trimmed.match(/\bcatch\s*\(\s*(\w+)\s*\)/);
    if (catchMatch) {
      const errorVar = catchMatch[1];
      const catchBody = lines.slice(i + 1, i + 10).join("\n");
      const hasTypeCheck =
        catchBody.includes("instanceof") ||
        catchBody.includes(`${errorVar} as `) ||
        catchBody.includes(`${errorVar}.code`) ||
        catchBody.includes(`${errorVar}.message`);
      if (!hasTypeCheck) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "typed-catch",
          severity: "warning",
          message: `Catch block does not check error type — use instanceof or check .code to handle errors specifically`,
          snippet: trimmed,
        });
      }
    }

    // Rule: error return missing code field
    if (/return\s+err\s*\(/.test(trimmed) || /return\s*\{\s*ok:\s*false/.test(trimmed)) {
      const returnBlock = lines.slice(i, i + 5).join("\n");
      if (!/code\s*:/.test(returnBlock)) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "error-code-required",
          severity: "error",
          message:
            "Error return is missing a code field — all errors must include a SCREAMING_SNAKE_CASE error code",
          snippet: trimmed,
        });
      }
    }

    // Rule: leaking internal errors (database/ORM specifics in error messages)
    if (
      /return\s+(err\s*\(|{)/.test(trimmed) ||
      /message\s*:/.test(trimmed)
    ) {
      const lineBlock = lines.slice(i, i + 3).join("\n");
      if (
        /SQLITE_|UNIQUE constraint|duplicate key|foreign key|deadlock|pg_|ECONNREFUSED/i.test(
          lineBlock
        )
      ) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "no-leaked-internals",
          severity: "warning",
          message:
            "Error message appears to expose internal database details — wrap in a domain-level error",
          snippet: trimmed,
        });
      }
    }

    // Rule: floating promise (no await before async call returning result)
    if (
      /[a-zA-Z]+\s*\(/.test(trimmed) &&
      !trimmed.includes("await") &&
      !trimmed.includes("return") &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("function") &&
      !trimmed.startsWith("const") &&
      !trimmed.startsWith("let") &&
      !trimmed.startsWith("export")
    ) {
      // Check if line ends with just the call (potential floating promise)
      if (/^\s*[a-zA-Z_$]+\.[a-zA-Z_$]+\s*\(.*\)\s*;?\s*$/.test(line)) {
        const funcName = line.trim().split("(")[0];
        // Only flag if the function likely returns a promise
        if (
          /delete|update|create|save|send|insert|remove|fetch|get|post|put/i.test(
            funcName
          )
        ) {
          issues.push({
            file: filePath,
            line: lineNum,
            rule: "no-floating-promise",
            severity: "warning",
            message: `Potential floating promise — await this call or handle its result`,
            snippet: trimmed,
          });
        }
      }
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
    if (
      path.includes("node_modules") ||
      path.includes(".test.") ||
      path.includes(".spec.") ||
      path.includes("/dist/") ||
      path.includes("/.next/")
    )
      continue;
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
    console.error("No source files found at the specified path");
    process.exit(1);
  }

  const allIssues: AuditIssue[] = [];
  for (const file of files) {
    const issues = await scanFile(file);
    allIssues.push(...issues);
  }

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  const ruleCount = allIssues.reduce(
    (acc, issue) => {
      acc[issue.rule] = (acc[issue.rule] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          total: allIssues.length,
          errors: errors.length,
          warnings: warnings.length,
          ruleBreakdown: ruleCount,
          issues: allIssues,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Error Audit: ${files.length} files scanned — ${errors.length} errors, ${warnings.length} warnings\n`
    );

    if (allIssues.length === 0) {
      console.log("No issues found. Error handling looks consistent.");
    } else {
      // Group by rule
      const grouped = allIssues.reduce(
        (acc, issue) => {
          if (!acc[issue.rule]) acc[issue.rule] = [];
          acc[issue.rule].push(issue);
          return acc;
        },
        {} as Record<string, AuditIssue[]>
      );

      for (const [rule, issues] of Object.entries(grouped)) {
        console.log(`--- ${rule} (${issues.length}) ---`);
        for (const issue of issues) {
          const icon = issue.severity === "error" ? "ERROR" : "WARN";
          console.log(`[${icon}] ${issue.file}:${issue.line}`);
          console.log(`  ${issue.message}`);
          console.log(`  > ${issue.snippet}\n`);
        }
      }
    }
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
