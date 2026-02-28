const args = Bun.argv.slice(2);

const HELP = `
d1-schema-diff — Compare local D1 schema against remote database

Usage:
  bun run tools/d1-schema-diff.ts <db-name> [options]

Arguments:
  <db-name>  Name of the D1 database as configured in wrangler.toml

Options:
  --env <env>       Wrangler environment (e.g., staging, production)
  --migrations <dir> Path to migrations directory (default: drizzle or migrations)
  --json            Output as JSON instead of plain text
  --help            Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const envIdx = args.indexOf("--env");
const env = envIdx !== -1 && args[envIdx + 1] ? args[envIdx + 1] : "";
const migrIdx = args.indexOf("--migrations");
const migrDir = migrIdx !== -1 && args[migrIdx + 1] ? args[migrIdx + 1] : "";
const filteredArgs = args.filter((a) => !a.startsWith("--") && !(envIdx !== -1 && args[envIdx + 1] === a) && !(migrIdx !== -1 && args[migrIdx + 1] === a));

interface SchemaDiff {
  database: string;
  localTables: string[];
  remoteTables: string[];
  added: string[];
  removed: string[];
  shared: string[];
  migrationsPending: string[];
}

async function run(cmd: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

async function getRemoteTables(dbName: string): Promise<string[]> {
  const wranglerArgs = ["bunx", "wrangler", "d1", "execute", dbName,
    "--command", "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY name"];
  if (env) wranglerArgs.push("--env", env);

  const result = await run(wranglerArgs);
  if (result.exitCode !== 0) {
    console.error(`Error querying remote database: ${result.stderr}`);
    return [];
  }

  // Parse wrangler output — it varies but table names appear in the output
  const tables: string[] = [];
  for (const line of result.stdout.split("\n")) {
    const trimmed = line.trim().replace(/[│|]/g, "").trim();
    if (trimmed && !trimmed.includes("name") && !trimmed.includes("─") && !trimmed.includes("=") && !trimmed.startsWith("Executing")) {
      tables.push(trimmed);
    }
  }
  return tables;
}

async function getLocalTablesFromMigrations(dir: string): Promise<string[]> {
  const tables = new Set<string>();
  const proc = Bun.spawn(["find", dir, "-name", "*.sql"], { stdout: "pipe", stderr: "pipe" });
  const stdout = (await new Response(proc.stdout).text()).trim();
  await proc.exited;

  for (const filePath of stdout.split("\n").filter(Boolean)) {
    const file = Bun.file(filePath);
    if (!(await file.exists())) continue;
    const content = await file.text();

    // Extract CREATE TABLE statements
    const createMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/gi);
    for (const m of createMatches) {
      tables.add(m[1]);
    }

    // Remove DROP TABLE statements
    const dropMatches = content.matchAll(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"']?(\w+)[`"']?/gi);
    for (const m of dropMatches) {
      tables.delete(m[1]);
    }
  }

  return [...tables].sort();
}

async function findMigrationsDir(): Promise<string> {
  if (migrDir) return migrDir;

  for (const dir of ["drizzle", "migrations", "db/migrations", "src/db/migrations"]) {
    const check = Bun.spawn(["test", "-d", dir], { stdout: "pipe", stderr: "pipe" });
    if ((await check.exited) === 0) return dir;
  }

  return "";
}

async function getPendingMigrations(dir: string, dbName: string): Promise<string[]> {
  // List local migration files
  const proc = Bun.spawn(["find", dir, "-name", "*.sql", "-type", "f"], { stdout: "pipe", stderr: "pipe" });
  const stdout = (await new Response(proc.stdout).text()).trim();
  await proc.exited;

  const localMigrations = stdout.split("\n").filter(Boolean).map((f) => f.split("/").pop()!).sort();

  // Get applied migrations from remote
  const wranglerArgs = ["bunx", "wrangler", "d1", "execute", dbName,
    "--command", "SELECT name FROM d1_migrations ORDER BY id"];
  if (env) wranglerArgs.push("--env", env);

  const result = await run(wranglerArgs);
  const appliedSet = new Set<string>();
  if (result.exitCode === 0) {
    for (const line of result.stdout.split("\n")) {
      const trimmed = line.trim().replace(/[│|]/g, "").trim();
      if (trimmed && trimmed.endsWith(".sql")) {
        appliedSet.add(trimmed);
      }
    }
  }

  return localMigrations.filter((m) => !appliedSet.has(m));
}

async function main() {
  const dbName = filteredArgs[0];
  if (!dbName) {
    console.error("Error: missing required <db-name> argument");
    process.exit(1);
  }

  const migDir = await findMigrationsDir();
  if (!migDir) {
    console.error("Error: no migrations directory found. Use --migrations to specify.");
    process.exit(1);
  }

  const [remoteTables, localTables] = await Promise.all([
    getRemoteTables(dbName),
    getLocalTablesFromMigrations(migDir),
  ]);

  const remoteSet = new Set(remoteTables);
  const localSet = new Set(localTables);

  const added = localTables.filter((t) => !remoteSet.has(t));
  const removed = remoteTables.filter((t) => !localSet.has(t));
  const shared = localTables.filter((t) => remoteSet.has(t));

  const pending = await getPendingMigrations(migDir, dbName);

  const result: SchemaDiff = {
    database: dbName,
    localTables,
    remoteTables,
    added,
    removed,
    shared,
    migrationsPending: pending,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`D1 schema diff: ${dbName}${env ? ` (${env})` : ""}\n`);
    console.log(`  Local tables: ${localTables.length}`);
    console.log(`  Remote tables: ${remoteTables.length}`);
    console.log(`  In sync: ${shared.length}\n`);

    if (added.length > 0) {
      console.log("  New (local only, not yet migrated):");
      for (const t of added) console.log(`    + ${t}`);
      console.log();
    }

    if (removed.length > 0) {
      console.log("  Removed (remote only, may need DROP migration):");
      for (const t of removed) console.log(`    - ${t}`);
      console.log();
    }

    if (pending.length > 0) {
      console.log(`  Pending migrations (${pending.length}):`);
      for (const m of pending) console.log(`    ${m}`);
      console.log(`\n  Run: bunx wrangler d1 migrations apply ${dbName}${env ? ` --env ${env}` : ""}`);
    } else {
      console.log("  All migrations applied.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
