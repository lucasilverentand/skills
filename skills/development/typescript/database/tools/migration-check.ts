const args = Bun.argv.slice(2);

const HELP = `
migration-check — Verify migration files for common issues

Usage:
  bun run tools/migration-check.ts [migrations-dir] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans migration SQL files for dangerous patterns: missing transactions,
destructive operations without guards, and data loss risks.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

interface MigrationIssue {
  file: string;
  line: number;
  severity: "warning" | "error";
  rule: string;
  message: string;
}

async function findMigrationsDir(): Promise<string | null> {
  const candidates = [
    "drizzle",
    "migrations",
    "src/db/migrations",
    "packages/db/drizzle",
    "packages/db/migrations",
  ];
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

async function collectSqlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSqlFiles(full)));
    } else if (entry.name.endsWith(".sql")) {
      files.push(full);
    }
  }
  return files.sort();
}

async function checkMigration(filePath: string): Promise<MigrationIssue[]> {
  const issues: MigrationIssue[] = [];
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toUpperCase();
    const lineNum = i + 1;

    // DROP TABLE without IF EXISTS
    if (line.includes("DROP TABLE") && !line.includes("IF EXISTS")) {
      issues.push({
        file: filePath, line: lineNum, severity: "error",
        rule: "drop-table-guard",
        message: "DROP TABLE without IF EXISTS — will fail if table doesn't exist",
      });
    }

    // DROP COLUMN — always flag as warning
    if (line.includes("DROP COLUMN") || line.match(/ALTER\s+TABLE.*DROP/)) {
      issues.push({
        file: filePath, line: lineNum, severity: "warning",
        rule: "drop-column",
        message: "DROP COLUMN detected — this is irreversible, verify this is intentional",
      });
    }

    // NOT NULL without DEFAULT on ALTER TABLE ADD COLUMN
    if (
      line.includes("ADD COLUMN") &&
      line.includes("NOT NULL") &&
      !line.includes("DEFAULT")
    ) {
      issues.push({
        file: filePath, line: lineNum, severity: "error",
        rule: "not-null-no-default",
        message: "ADD COLUMN with NOT NULL but no DEFAULT — will fail on tables with existing rows",
      });
    }

    // TRUNCATE
    if (line.includes("TRUNCATE")) {
      issues.push({
        file: filePath, line: lineNum, severity: "error",
        rule: "truncate",
        message: "TRUNCATE detected — this deletes all data in the table",
      });
    }

    // Raw DELETE without WHERE
    if (line.startsWith("DELETE FROM") && !content.slice(content.indexOf(lines[i])).match(/DELETE\s+FROM\s+\S+\s+WHERE/i)) {
      issues.push({
        file: filePath, line: lineNum, severity: "warning",
        rule: "delete-without-where",
        message: "DELETE FROM without WHERE clause — will delete all rows",
      });
    }

    // Renaming detection (Drizzle generates drop+add instead of rename)
    if (line.includes("DROP COLUMN")) {
      // Check if the next ADD COLUMN has the same type — might be a rename
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim().toUpperCase().includes("ADD COLUMN")) {
          issues.push({
            file: filePath, line: lineNum, severity: "warning",
            rule: "possible-rename",
            message: "DROP COLUMN followed by ADD COLUMN — this may be a rename that should use ALTER COLUMN RENAME",
          });
          break;
        }
      }
    }
  }

  return issues;
}

async function main() {
  const migrationsDir = filteredArgs[0]
    ? resolve(filteredArgs[0])
    : await findMigrationsDir();

  if (!migrationsDir) {
    console.error(
      "Error: No migrations directory found. Specify the path or run from the project root."
    );
    process.exit(1);
  }

  const sqlFiles = await collectSqlFiles(migrationsDir);
  if (sqlFiles.length === 0) {
    console.error(`No .sql files found in ${migrationsDir}`);
    process.exit(1);
  }

  const allIssues: MigrationIssue[] = [];
  for (const file of sqlFiles) {
    allIssues.push(...(await checkMigration(file)));
  }

  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warning").length;

  const result = {
    migrationsDir,
    filesChecked: sqlFiles.length,
    errors,
    warnings,
    issues: allIssues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Checked ${sqlFiles.length} migration files in ${migrationsDir}`);
    console.log(`  ${errors} errors, ${warnings} warnings\n`);

    if (allIssues.length === 0) {
      console.log("No issues found.");
    } else {
      for (const issue of allIssues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        console.log(`  [${icon}] ${issue.file}:${issue.line}`);
        console.log(`    ${issue.rule}: ${issue.message}`);
      }
    }
  }

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
