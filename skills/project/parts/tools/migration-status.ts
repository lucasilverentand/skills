const args = Bun.argv.slice(2);

const HELP = `
migration-status — Show pending and applied migrations with timestamps

Usage:
  bun run tools/migration-status.ts [path] [options]

Arguments:
  path    Path to the schema package or project root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Reads the drizzle/ migration directory and reports status.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface MigrationInfo {
  name: string;
  file: string;
  timestamp: string | null;
  hasSql: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Look for migration directories
  const migrationDirs = [
    `${root}/drizzle`,
    `${root}/migrations`,
    `${root}/src/migrations`,
  ];

  let migrationDir: string | null = null;
  for (const dir of migrationDirs) {
    const glob = new Bun.Glob("*.sql");
    for await (const _ of glob.scan({ cwd: dir })) {
      migrationDir = dir;
      break;
    }
    if (migrationDir) break;
  }

  if (!migrationDir) {
    if (jsonOutput) {
      console.log(JSON.stringify({ migrations: [], migrationDir: null }, null, 2));
    } else {
      console.log("No migration directory found.");
      console.log("Expected: drizzle/, migrations/, or src/migrations/ with .sql files");
    }
    process.exit(0);
  }

  const migrations: MigrationInfo[] = [];

  // Scan for SQL migration files
  const sqlGlob = new Bun.Glob("**/*.sql");
  for await (const file of sqlGlob.scan({ cwd: migrationDir })) {
    const name = file.replace(/\.sql$/, "");

    // Try to extract timestamp from name (drizzle-kit format: 0000_name.sql or timestamp_name)
    let timestamp: string | null = null;
    const tsMatch = name.match(/^(\d{4,})_/);
    if (tsMatch) {
      const num = parseInt(tsMatch[1], 10);
      if (num > 1000000) {
        // Likely a unix timestamp
        timestamp = new Date(num).toISOString();
      }
    }

    // Check if file has actual SQL content
    const content = await Bun.file(`${migrationDir}/${file}`).text();
    const hasSql = content.trim().length > 0 && !content.trim().startsWith("--");

    migrations.push({ name, file, timestamp, hasSql });
  }

  // Sort by file name (which typically sorts by creation order)
  migrations.sort((a, b) => a.name.localeCompare(b.name));

  // Check for journal file (drizzle-kit tracks applied migrations)
  let journalEntries: string[] = [];
  const journalPath = `${migrationDir}/meta/_journal.json`;
  const journalFile = Bun.file(journalPath);
  if (await journalFile.exists()) {
    try {
      const journal = await journalFile.json();
      journalEntries = (journal.entries || []).map((e: { tag: string }) => e.tag);
    } catch {
      // Invalid journal
    }
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          migrationDir,
          total: migrations.length,
          journalTracked: journalEntries.length,
          migrations: migrations.map((m) => ({
            ...m,
            inJournal: journalEntries.includes(m.name),
          })),
        },
        null,
        2
      )
    );
  } else {
    console.log(`Migration directory: ${migrationDir}`);
    console.log(`Total migrations: ${migrations.length}\n`);

    if (migrations.length === 0) {
      console.log("No migration files found.");
      console.log("Run `bunx drizzle-kit generate` to create a migration.");
      return;
    }

    for (const m of migrations) {
      const inJournal = journalEntries.includes(m.name);
      const icon = inJournal ? "+" : "?";
      const tsStr = m.timestamp ? ` (${m.timestamp})` : "";
      const emptyWarning = !m.hasSql ? " [empty]" : "";

      console.log(`  [${icon}] ${m.name}${tsStr}${emptyWarning}`);
    }

    if (journalEntries.length > 0) {
      console.log(`\n[+] = tracked in journal, [?] = not in journal`);
    } else {
      console.log(`\nNo journal file found at ${journalPath}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
