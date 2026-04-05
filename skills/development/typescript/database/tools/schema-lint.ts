const args = Bun.argv.slice(2);

const HELP = `
schema-lint — Check Drizzle schema files for convention violations

Usage:
  bun run tools/schema-lint.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks schema files for:
- Missing id column
- Missing createdAt / updatedAt timestamps
- Non-camelCase column names in TypeScript
- Missing $defaultFn on id or timestamp columns
- Tables without indexes on foreign key columns
- Singular table names (should be plural)
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
}

function isCamelCase(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

function isLikelySingular(name: string): boolean {
  if (name.endsWith("s") || name.endsWith("ies") || name.endsWith("ses")) return false;
  if (["auth", "media", "data", "info", "config", "metadata", "status"].includes(name)) return false;
  return name.length > 2;
}

async function scanFile(filePath: string): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];
  const file = Bun.file(filePath);
  if (!(await file.exists())) return issues;

  const content = await file.text();
  const lines = content.split("\n");

  // Detect table definitions
  const tableRegex = /(?:sqliteTable|pgTable|mysqlTable)\s*\(\s*["'`](\w+)["'`]/g;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(content)) !== null) {
    const tableName = tableMatch[1];
    const tableLine = content.substring(0, tableMatch.index).split("\n").length;

    // Find the table block — from match to the next export or end of file
    const blockStart = tableMatch.index;
    let braceDepth = 0;
    let blockEnd = content.length;
    let foundOpen = false;
    for (let i = blockStart; i < content.length; i++) {
      if (content[i] === "(") {
        braceDepth++;
        foundOpen = true;
      }
      if (content[i] === ")") {
        braceDepth--;
        if (foundOpen && braceDepth === 0) {
          blockEnd = i;
          break;
        }
      }
    }
    const tableBlock = content.substring(blockStart, blockEnd);

    // Check singular table name
    if (isLikelySingular(tableName)) {
      issues.push({
        file: filePath,
        line: tableLine,
        rule: "plural-table-name",
        severity: "warning",
        message: `Table "${tableName}" appears singular — convention is plural (e.g., "${tableName}s")`,
      });
    }

    // Check for missing id column
    if (!/\bid\s*:/.test(tableBlock) && !/\bid\s*=/.test(tableBlock)) {
      issues.push({
        file: filePath,
        line: tableLine,
        rule: "missing-id",
        severity: "error",
        message: `Table "${tableName}" is missing an "id" column`,
      });
    }

    // Check for missing createdAt
    if (!/createdAt\s*:/.test(tableBlock) && !/created_at/.test(tableBlock)) {
      issues.push({
        file: filePath,
        line: tableLine,
        rule: "missing-created-at",
        severity: "error",
        message: `Table "${tableName}" is missing a "createdAt" column`,
      });
    }

    // Check for missing updatedAt
    if (!/updatedAt\s*:/.test(tableBlock) && !/updated_at/.test(tableBlock)) {
      issues.push({
        file: filePath,
        line: tableLine,
        rule: "missing-updated-at",
        severity: "error",
        message: `Table "${tableName}" is missing an "updatedAt" column`,
      });
    }

    // Check for $defaultFn on id
    const idMatch = tableBlock.match(/\bid\s*:\s*[^,\n]+/);
    if (idMatch && !idMatch[0].includes("$defaultFn") && !idMatch[0].includes("default(")) {
      issues.push({
        file: filePath,
        line: tableLine,
        rule: "id-needs-default",
        severity: "warning",
        message: `Table "${tableName}" id column should use $defaultFn for auto-generation`,
      });
    }

    // Check for foreign key columns missing indexes
    const fkRegex = /(\w+):\s*text\([^)]*\)[^,\n]*\.references\(/g;
    let fkMatch: RegExpExecArray | null;
    while ((fkMatch = fkRegex.exec(tableBlock)) !== null) {
      const fkCol = fkMatch[1];
      // Check if there is an index on this column in the table block or nearby
      const hasIndex = new RegExp(`index\\([^)]*\\)\\.on\\([^)]*${fkCol}`).test(tableBlock) ||
        new RegExp(`index\\([^)]*${fkCol}`).test(tableBlock);
      if (!hasIndex) {
        issues.push({
          file: filePath,
          line: tableLine,
          rule: "fk-missing-index",
          severity: "warning",
          message: `Foreign key column "${fkCol}" in "${tableName}" should have an index`,
        });
      }
    }

    // Check column naming — look for snake_case TypeScript property names
    const colDefRegex = /^\s+(\w+)\s*:/gm;
    let colMatch: RegExpExecArray | null;
    const skipNames = new Set(["id", "createdAt", "updatedAt", "deletedAt"]);
    while ((colMatch = colDefRegex.exec(tableBlock)) !== null) {
      const colName = colMatch[1];
      if (skipNames.has(colName)) continue;
      if (colName.includes("_") && !colName.startsWith("$")) {
        const colLine = content.substring(0, blockStart + colMatch.index).split("\n").length;
        issues.push({
          file: filePath,
          line: colLine,
          rule: "camel-case-columns",
          severity: "warning",
          message: `Column property "${colName}" uses snake_case — TypeScript properties should be camelCase`,
        });
      }
    }
  }

  return issues;
}

async function collectFiles(target: string): Promise<string[]> {
  const { statSync } = await import("node:fs");
  const stat = statSync(target);
  if (!stat.isDirectory()) return [target];

  const glob = new Bun.Glob("**/*schema*.{ts,tsx}");
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
    console.error("No schema files found at the specified path");
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
      `Schema Lint: ${files.length} files scanned — ${errors.length} errors, ${warnings.length} warnings\n`
    );

    if (allIssues.length === 0) {
      console.log("No issues found.");
    } else {
      for (const issue of allIssues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        console.log(`[${icon}] ${issue.file}:${issue.line} — ${issue.rule}`);
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
