const args = Bun.argv.slice(2);

const HELP = `
convention-lint — Check new code against project-specific naming and structure conventions

Usage:
  bun run tools/convention-lint.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Analyzes TypeScript/JavaScript files for common convention issues:
naming style mismatches, inconsistent export patterns, file naming conventions.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, basename, extname } from "node:path";

interface ConventionIssue {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: "warning" | "error";
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

async function lintFile(filePath: string): Promise<ConventionIssue[]> {
  const issues: ConventionIssue[] = [];
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");
  const fileName = basename(filePath, extname(filePath));

  // Check file naming: should be kebab-case or camelCase, not PascalCase (unless React component)
  const isComponent = /\.(tsx|jsx)$/.test(filePath);
  if (!isComponent && /^[A-Z]/.test(fileName) && !fileName.includes(".test") && !fileName.includes(".spec")) {
    issues.push({
      file: filePath,
      line: 0,
      rule: "file-naming",
      message: `File '${basename(filePath)}' uses PascalCase but is not a component file. Use kebab-case or camelCase.`,
      severity: "warning",
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for console.log left in (not console.error/warn)
    if (/console\.log\(/.test(line) && !filePath.includes("tool") && !filePath.includes("script") && !filePath.includes("cli")) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "no-console-log",
        message: "console.log() found — use a proper logger or remove before committing",
        severity: "warning",
      });
    }

    // Check for throw new Error in non-boundary code
    if (/throw\s+new\s+Error/.test(line)) {
      // Check if this looks like it's inside a function that's not a boundary
      const context = lines.slice(Math.max(0, i - 10), i).join("\n");
      if (!/router\.|app\.|handler|middleware|endpoint|boundary/i.test(context)) {
        issues.push({
          file: filePath,
          line: lineNum,
          rule: "prefer-result-type",
          message: "throw found outside a system boundary — consider returning { ok, error } instead",
          severity: "warning",
        });
      }
    }

    // Check for 'any' type usage
    if (/:\s*any\b/.test(line) || /as\s+any\b/.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "no-any",
        message: "Explicit 'any' type found — use a proper type or 'unknown'",
        severity: "warning",
      });
    }

    // Check for default exports (prefer named exports)
    if (/^export\s+default\s/.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "prefer-named-export",
        message: "Default export found — prefer named exports for better refactoring support",
        severity: "warning",
      });
    }

    // Check for TODO/FIXME/HACK comments
    if (/\/\/\s*(TODO|FIXME|HACK|XXX)\b/.test(line)) {
      issues.push({
        file: filePath,
        line: lineNum,
        rule: "todo-comment",
        message: `${line.match(/(TODO|FIXME|HACK|XXX)/)?.[1]} comment found — address or create a ticket`,
        severity: "warning",
      });
    }
  }

  return issues;
}

async function main() {
  const target = resolve(filteredArgs[0]);

  let targetStat;
  try {
    targetStat = await stat(target);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  const files = targetStat.isDirectory()
    ? await collectFiles(target)
    : [target];

  const allIssues: ConventionIssue[] = [];
  for (const file of files) {
    allIssues.push(...(await lintFile(file)));
  }

  const warnings = allIssues.filter((i) => i.severity === "warning").length;
  const errors = allIssues.filter((i) => i.severity === "error").length;

  const result = {
    scanned: files.length,
    warnings,
    errors,
    issues: allIssues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Scanned ${files.length} files — ${warnings} warnings, ${errors} errors\n`);
    if (allIssues.length === 0) {
      console.log("No convention issues found.");
    } else {
      const byRule = new Map<string, ConventionIssue[]>();
      for (const issue of allIssues) {
        const list = byRule.get(issue.rule) || [];
        list.push(issue);
        byRule.set(issue.rule, list);
      }

      for (const [rule, issues] of byRule) {
        console.log(`[${rule}] (${issues.length})`);
        for (const issue of issues) {
          const loc = issue.line > 0 ? `:${issue.line}` : "";
          console.log(`  ${issue.file}${loc}`);
          console.log(`    ${issue.message}`);
        }
        console.log();
      }
    }
  }

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
