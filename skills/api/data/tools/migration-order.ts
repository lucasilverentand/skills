const args = Bun.argv.slice(2);

const HELP = `
migration-order — Validate migration file ordering and detect dependency conflicts

Usage:
  bun run tools/migration-order.ts [migrations-dir] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Checks that migration files are correctly ordered by timestamp,
detects references to tables/columns before they're created,
and flags potential ordering conflicts.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, basename } from "node:path";

interface OrderIssue {
  file: string;
  severity: "warning" | "error";
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

function extractTimestamp(fileName: string): string | null {
  // Common patterns: 0000_name.sql, 20240101_name.sql, 2024-01-01T00-00-00_name.sql
  const match = basename(fileName).match(/^(\d{4,14})/);
  return match ? match[1] : null;
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

  const issues: OrderIssue[] = [];

  // Check timestamp ordering
  let lastTimestamp = "";
  for (const file of sqlFiles) {
    const ts = extractTimestamp(basename(file));
    if (!ts) {
      issues.push({
        file,
        severity: "warning",
        message: `No timestamp prefix found in filename — cannot verify ordering`,
      });
      continue;
    }
    if (ts < lastTimestamp) {
      issues.push({
        file,
        severity: "error",
        message: `Out of order: timestamp ${ts} comes after ${lastTimestamp}`,
      });
    } else if (ts === lastTimestamp) {
      issues.push({
        file,
        severity: "warning",
        message: `Duplicate timestamp ${ts} — may cause ordering ambiguity`,
      });
    }
    lastTimestamp = ts;
  }

  // Track table creation/reference order
  const createdTables = new Set<string>();
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?(\w+)["'`]?/gi;
  const refTableRegex = /REFERENCES\s+["'`]?(\w+)["'`]?/gi;
  const alterTableRegex = /ALTER\s+TABLE\s+["'`]?(\w+)["'`]?/gi;

  for (const file of sqlFiles) {
    const content = await Bun.file(file).text();

    // Find all tables created in this migration
    let match;
    createTableRegex.lastIndex = 0;
    while ((match = createTableRegex.exec(content)) !== null) {
      createdTables.add(match[1].toLowerCase());
    }

    // Check that referenced tables exist
    refTableRegex.lastIndex = 0;
    while ((match = refTableRegex.exec(content)) !== null) {
      const refTable = match[1].toLowerCase();
      if (!createdTables.has(refTable)) {
        issues.push({
          file,
          severity: "warning",
          message: `References table '${match[1]}' which hasn't been created in any prior migration`,
        });
      }
    }

    // Check that altered tables exist
    alterTableRegex.lastIndex = 0;
    while ((match = alterTableRegex.exec(content)) !== null) {
      const altTable = match[1].toLowerCase();
      if (!createdTables.has(altTable)) {
        issues.push({
          file,
          severity: "warning",
          message: `Alters table '${match[1]}' which hasn't been created in any prior migration`,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  const result = {
    migrationsDir,
    filesChecked: sqlFiles.length,
    errors,
    warnings,
    tablesTracked: [...createdTables],
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Checked ${sqlFiles.length} migration files in ${migrationsDir}`);
    console.log(`  ${errors} errors, ${warnings} warnings`);
    console.log(`  ${createdTables.size} tables tracked\n`);

    if (issues.length === 0) {
      console.log("Migration ordering is correct.");
    } else {
      for (const issue of issues) {
        const icon = issue.severity === "error" ? "ERROR" : "WARN";
        console.log(`  [${icon}] ${basename(issue.file)}`);
        console.log(`    ${issue.message}`);
      }
    }
  }

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
