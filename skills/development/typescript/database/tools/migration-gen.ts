const args = Bun.argv.slice(2);

const HELP = `
migration-gen — Generate a Drizzle migration from current schema changes

Usage:
  bun run tools/migration-gen.ts [options]

Options:
  --name <name>   Custom migration name (default: auto-generated from timestamp)
  --config <path> Path to drizzle config (default: drizzle.config.ts)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Detects the project's Drizzle config and runs drizzle-kit generate
to create a migration file from the current schema state.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

import { stat } from "node:fs/promises";

async function findConfig(): Promise<string | null> {
  const candidates = [
    "drizzle.config.ts",
    "drizzle.config.js",
    "packages/db/drizzle.config.ts",
    "apps/api/drizzle.config.ts",
  ];
  for (const candidate of candidates) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  return null;
}

async function main() {
  const customName = getFlag("--name");
  const customConfig = getFlag("--config");

  const config = customConfig || (await findConfig());
  if (!config) {
    console.error(
      "Error: No drizzle.config.ts found. Specify --config or run from the project root."
    );
    process.exit(1);
  }

  // Build the drizzle-kit generate command
  const generateArgs = ["bunx", "drizzle-kit", "generate"];
  if (customName) {
    generateArgs.push("--name", customName);
  }
  generateArgs.push("--config", config);

  console.error(`Running: ${generateArgs.join(" ")}`);

  const proc = Bun.spawn(generateArgs, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error(`drizzle-kit generate failed (exit ${exitCode}):`);
    console.error(stderr || stdout);
    process.exit(1);
  }

  // Find the generated migration file from output
  const migrationMatch = stdout.match(
    /(?:Created|Generated).*?(\S+\.sql)/i
  ) || stderr.match(/(?:Created|Generated).*?(\S+\.sql)/i);

  const result = {
    config,
    customName: customName || null,
    output: stdout.trim(),
    migrationFile: migrationMatch?.[1] || null,
    exitCode,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(stdout);
    if (migrationMatch) {
      console.log(`\nMigration generated: ${migrationMatch[1]}`);
    }
    console.log("\nRemember: review the migration before committing.");
    console.log("Commit schema changes and migration together in one commit.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
