const args = Bun.argv.slice(2);

const HELP = `
schema-diff — Compare Drizzle schema definitions against latest migration snapshot

Usage:
  bun run tools/schema-diff.ts [path] [options]

Arguments:
  path    Path to the schema package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Parses table definitions from source and migration SQL to detect drift.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface DiffResult {
  tablesInSchema: string[];
  tablesInMigrations: string[];
  onlyInSchema: string[];
  onlyInMigrations: string[];
  inBoth: string[];
  hasDrift: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Extract table names from Drizzle schema source files
  const schemaTables = new Set<string>();
  const srcGlob = new Bun.Glob("src/**/*.{ts,js}");

  for await (const file of srcGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Match pgTable/sqliteTable/mysqlTable definitions
    const tableMatches = content.matchAll(
      /(?:pgTable|sqliteTable|mysqlTable)\s*\(\s*['"](\w+)['"]/g
    );
    for (const m of tableMatches) {
      schemaTables.add(m[1]);
    }
  }

  // Extract table names from migration SQL files
  const migrationTables = new Set<string>();
  const migrationDirs = [
    `${root}/drizzle`,
    `${root}/migrations`,
    `${root}/src/migrations`,
  ];

  for (const dir of migrationDirs) {
    const sqlGlob = new Bun.Glob("**/*.sql");
    try {
      for await (const file of sqlGlob.scan({ cwd: dir })) {
        const content = await Bun.file(`${dir}/${file}`).text();

        // Match CREATE TABLE statements
        const createMatches = content.matchAll(
          /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/gi
        );
        for (const m of createMatches) {
          migrationTables.add(m[1]);
        }

        // Match ALTER TABLE (table exists in migrations)
        const alterMatches = content.matchAll(
          /ALTER\s+TABLE\s+[`"]?(\w+)[`"]?/gi
        );
        for (const m of alterMatches) {
          migrationTables.add(m[1]);
        }

        // Match DROP TABLE (removed tables)
        const dropMatches = content.matchAll(
          /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"]?(\w+)[`"]?/gi
        );
        for (const m of dropMatches) {
          migrationTables.delete(m[1]);
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  // Also check drizzle snapshot
  const snapshotGlob = new Bun.Glob("drizzle/meta/*.json");
  try {
    for await (const file of snapshotGlob.scan({ cwd: root })) {
      if (file.includes("_journal")) continue;
      const content = await Bun.file(`${root}/${file}`).json();
      if (content.tables) {
        for (const tableName of Object.keys(content.tables)) {
          migrationTables.add(tableName);
        }
      }
    }
  } catch {
    // No snapshot directory
  }

  const onlyInSchema = [...schemaTables].filter((t) => !migrationTables.has(t));
  const onlyInMigrations = [...migrationTables].filter((t) => !schemaTables.has(t));
  const inBoth = [...schemaTables].filter((t) => migrationTables.has(t));

  const result: DiffResult = {
    tablesInSchema: [...schemaTables].sort(),
    tablesInMigrations: [...migrationTables].sort(),
    onlyInSchema: onlyInSchema.sort(),
    onlyInMigrations: onlyInMigrations.sort(),
    inBoth: inBoth.sort(),
    hasDrift: onlyInSchema.length > 0 || onlyInMigrations.length > 0,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Schema tables: ${schemaTables.size}`);
    console.log(`Migration tables: ${migrationTables.size}\n`);

    if (!result.hasDrift) {
      if (schemaTables.size === 0 && migrationTables.size === 0) {
        console.log("No tables found in either schema or migrations.");
      } else {
        console.log("Schema and migrations are in sync.");
        console.log(`Tables: ${inBoth.join(", ")}`);
      }
      return;
    }

    if (onlyInSchema.length > 0) {
      console.log("Tables in schema but NOT in migrations (need migration):");
      for (const t of onlyInSchema) {
        console.log(`  + ${t}`);
      }
    }

    if (onlyInMigrations.length > 0) {
      console.log("Tables in migrations but NOT in schema (removed or renamed):");
      for (const t of onlyInMigrations) {
        console.log(`  - ${t}`);
      }
    }

    if (inBoth.length > 0) {
      console.log(`\nSynced tables: ${inBoth.join(", ")}`);
    }

    console.log("\nRun `bunx drizzle-kit generate` to create a migration for pending changes.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
