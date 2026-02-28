const args = Bun.argv.slice(2);

const HELP = `
migration-gen — Generate a Drizzle migration and report what changed

Usage:
  bun run tools/migration-gen.ts [path] [options]

Arguments:
  path    Path to the database package (default: current directory)

Options:
  --name <name>    Name for the migration (default: auto-generated)
  --dry-run        Show what would change without generating files
  --json           Output as JSON instead of plain text
  --help           Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const dryRun = args.includes("--dry-run");
const nameIdx = args.indexOf("--name");
const migrationName = nameIdx !== -1 ? args[nameIdx + 1] : undefined;
const filteredArgs = args.filter((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--name");

interface MigrationReport {
  success: boolean;
  migrationsDir: string;
  newFiles: string[];
  output: string;
  error?: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const report: MigrationReport = {
    success: false,
    migrationsDir: `${root}/drizzle`,
    newFiles: [],
    output: "",
  };

  // Check for drizzle config
  const configFile = Bun.file(`${root}/drizzle.config.ts`);
  if (!(await configFile.exists())) {
    report.error = "No drizzle.config.ts found. Create one before generating migrations.";
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error(`Error: ${report.error}`);
    }
    process.exit(1);
  }

  // Get existing migration files before generation
  const existingFiles = new Set<string>();
  const migrationGlob = new Bun.Glob("drizzle/*.sql");
  try {
    for await (const file of migrationGlob.scan({ cwd: root })) {
      existingFiles.add(file);
    }
  } catch {
    // No migrations directory yet
  }

  if (dryRun) {
    // In dry-run mode, just check for schema changes
    const proc = Bun.spawn(["bun", "drizzle-kit", "generate", "--custom"], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    report.output = stdout || stderr;
    report.success = true;

    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log("Dry run — checking for schema changes:\n");
      console.log(report.output || "  No output from drizzle-kit.");
    }
    return;
  }

  // Run drizzle-kit generate
  const command = ["bun", "drizzle-kit", "generate"];
  if (migrationName) {
    command.push("--name", migrationName);
  }

  const proc = Bun.spawn(command, {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  report.output = stdout || stderr;
  report.success = exitCode === 0;

  if (!report.success) {
    report.error = stderr || "drizzle-kit generate failed";
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error(`Error: ${report.error}`);
      if (stdout) console.log(stdout);
    }
    process.exit(1);
  }

  // Find new migration files
  try {
    for await (const file of migrationGlob.scan({ cwd: root })) {
      if (!existingFiles.has(file)) {
        report.newFiles.push(file);
      }
    }
  } catch {
    // ignore
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Migration generated:\n");
    console.log(report.output);

    if (report.newFiles.length > 0) {
      console.log("\nNew files:");
      for (const file of report.newFiles) {
        console.log(`  ${file}`);
      }
    }

    console.log("\nRun 'bun run db:migrate' to apply.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
