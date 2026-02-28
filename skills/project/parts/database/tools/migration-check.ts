const args = Bun.argv.slice(2);

const HELP = `
migration-check — Check for pending migrations and schema drift

Usage:
  bun run tools/migration-check.ts [path] [options]

Arguments:
  path    Path to the schema package (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface MigrationInfo {
  name: string;
  timestamp: string;
  applied: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Find drizzle migration directory
  const migrationDirs = ["drizzle", "migrations", "drizzle/migrations"];
  let migrationDir = "";
  let migrationFiles: string[] = [];

  for (const dir of migrationDirs) {
    const fullPath = `${root}/${dir}`;
    const dirFile = Bun.file(`${fullPath}/meta/_journal.json`);
    if (await dirFile.exists()) {
      migrationDir = fullPath;
      break;
    }
  }

  // Check for drizzle.config.ts
  const configCandidates = [
    `${root}/drizzle.config.ts`,
    `${root}/drizzle.config.js`,
  ];
  let hasConfig = false;
  let configDialect = "unknown";

  for (const candidate of configCandidates) {
    const file = Bun.file(candidate);
    if (await file.exists()) {
      hasConfig = true;
      const content = await file.text();
      if (content.includes('"postgresql"') || content.includes("'postgresql'")) {
        configDialect = "postgresql";
      } else if (content.includes('"sqlite"') || content.includes("'sqlite'")) {
        configDialect = "sqlite";
      }
      break;
    }
  }

  // Read journal if migration dir exists
  const migrations: MigrationInfo[] = [];

  if (migrationDir) {
    const journalFile = Bun.file(`${migrationDir}/meta/_journal.json`);
    if (await journalFile.exists()) {
      const journal = await journalFile.json();
      for (const entry of journal.entries || []) {
        migrations.push({
          name: entry.tag,
          timestamp: new Date(entry.when || 0).toISOString(),
          applied: true, // From journal = generated, not necessarily applied
        });
      }
    }
  }

  // Count schema files
  let schemaFileCount = 0;
  const schemaGlob = new Bun.Glob("src/schema/*.{ts,tsx}");
  for await (const _ of schemaGlob.scan({ cwd: root })) {
    schemaFileCount++;
  }

  // Check for pending generate by looking at schema modification times
  let schemaModified = 0;
  let lastMigrationModified = 0;

  for await (const file of schemaGlob.scan({ cwd: root })) {
    const stat = await Bun.file(`${root}/${file}`).stat();
    if (stat && stat.mtime) {
      const mtime = new Date(stat.mtime).getTime();
      if (mtime > schemaModified) schemaModified = mtime;
    }
  }

  if (migrationDir) {
    const sqlGlob = new Bun.Glob("*.sql");
    for await (const file of sqlGlob.scan({ cwd: migrationDir })) {
      const stat = await Bun.file(`${migrationDir}/${file}`).stat();
      if (stat && stat.mtime) {
        const mtime = new Date(stat.mtime).getTime();
        if (mtime > lastMigrationModified) lastMigrationModified = mtime;
      }
    }
  }

  const possibleDrift = schemaModified > lastMigrationModified && lastMigrationModified > 0;

  const result = {
    hasConfig,
    configDialect,
    migrationDir: migrationDir || null,
    migrations,
    schemaFileCount,
    possibleDrift,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Database migration status:\n");
    console.log(`  Config: ${hasConfig ? "found" : "missing"} (dialect: ${configDialect})`);
    console.log(`  Schema files: ${schemaFileCount}`);
    console.log(`  Migration dir: ${migrationDir || "not found"}`);
    console.log(`  Migrations: ${migrations.length}`);

    if (migrations.length > 0) {
      console.log("\n  Recent migrations:");
      for (const m of migrations.slice(-5)) {
        console.log(`    ${m.name} (${m.timestamp})`);
      }
    }

    if (possibleDrift) {
      console.log("\n  ! Schema files modified after last migration.");
      console.log("    Run `bun run db:generate` to create a new migration.");
    }

    if (!hasConfig) {
      console.log("\n  ! No drizzle.config.ts found. Run initial setup first.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
