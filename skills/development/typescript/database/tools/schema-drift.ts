const args = Bun.argv.slice(2);

const HELP = `
schema-drift — Compare Drizzle schema definitions against the current database state

Usage:
  bun run tools/schema-drift.ts [options]

Options:
  --config <path>   Path to drizzle config (default: auto-detect)
  --json            Output as JSON instead of plain text
  --help            Show this help message

Uses drizzle-kit to check for differences between the schema definitions
in code and the actual database state. Reports drift direction and details.
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
  const customConfig = getFlag("--config");
  const config = customConfig || (await findConfig());

  if (!config) {
    console.error(
      "Error: No drizzle.config.ts found. Specify --config or run from the project root."
    );
    process.exit(1);
  }

  // Run drizzle-kit check to detect drift
  const checkArgs = ["bunx", "drizzle-kit", "check", "--config", config];

  console.error(`Running: ${checkArgs.join(" ")}`);

  const proc = Bun.spawn(checkArgs, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  // Parse the output to determine drift status
  const output = stdout + "\n" + stderr;
  const hasDrift = exitCode !== 0 || /differ|drift|mismatch|changes/i.test(output);

  // Also run drizzle-kit generate --dry-run equivalent to see what would be generated
  const introspectArgs = ["bunx", "drizzle-kit", "introspect", "--config", config];
  const introspectProc = Bun.spawn(introspectArgs, {
    stdout: "pipe",
    stderr: "pipe",
  });
  const introspectStdout = await new Response(introspectProc.stdout).text();
  const introspectStderr = await new Response(introspectProc.stderr).text();
  await introspectProc.exited;

  const result = {
    config,
    hasDrift,
    checkOutput: output.trim(),
    introspectOutput: (introspectStdout + introspectStderr).trim(),
    exitCode,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Config: ${config}`);
    console.log(`Drift detected: ${hasDrift ? "YES" : "no"}\n`);

    if (output.trim()) {
      console.log("Check output:");
      console.log(output.trim());
    }

    if (hasDrift) {
      console.log("\nRecommendations:");
      console.log("  - If schema is ahead of DB: run pending migrations");
      console.log("  - If DB is ahead of schema: capture changes in a new migration");
      console.log("  - Never manually alter the database to resolve drift");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
