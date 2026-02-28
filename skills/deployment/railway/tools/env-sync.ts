const args = Bun.argv.slice(2);

const HELP = `
env-sync — Compare environment variables across Railway environments and flag drift

Usage:
  bun run tools/env-sync.ts [options]

Options:
  --envs <list>       Comma-separated environments to compare (default: staging,production)
  --service <name>    Railway service name (uses linked service if not specified)
  --ignore <keys>     Comma-separated keys to ignore in comparison
  --json              Output as JSON instead of plain text
  --help              Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getArg(flag: string, defaultVal: string): string {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const envs = getArg("--envs", "staging,production").split(",");
const service = getArg("--service", "");
const ignoreKeys = new Set(getArg("--ignore", "").split(",").filter(Boolean));

interface EnvVar {
  key: string;
  values: Record<string, string>;
  status: "in-sync" | "drift" | "missing";
  missingFrom: string[];
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

async function getEnvVars(environment: string): Promise<Record<string, string>> {
  const railwayArgs = ["railway", "variables", "--environment", environment];
  if (service) railwayArgs.push("--service", service);

  const result = await run(railwayArgs);
  if (result.exitCode !== 0) {
    console.error(`Warning: could not fetch variables for ${environment}: ${result.stderr}`);
    return {};
  }

  const vars: Record<string, string> = {};
  for (const line of result.stdout.split("\n")) {
    const match = line.match(/^(\S+)\s*=\s*(.*)$/);
    if (match) {
      vars[match[1]] = match[2];
    }
  }
  return vars;
}

function redactValue(val: string): string {
  if (val.length <= 6) return "***";
  return val.slice(0, 3) + "***" + val.slice(-3);
}

async function main() {
  if (envs.length < 2) {
    console.error("Error: need at least 2 environments to compare");
    process.exit(1);
  }

  // Fetch variables from each environment
  const envData: Record<string, Record<string, string>> = {};
  for (const env of envs) {
    envData[env] = await getEnvVars(env);
  }

  // Collect all keys
  const allKeys = new Set<string>();
  for (const vars of Object.values(envData)) {
    for (const key of Object.keys(vars)) {
      if (!ignoreKeys.has(key)) allKeys.add(key);
    }
  }

  // Compare
  const results: EnvVar[] = [];
  for (const key of [...allKeys].sort()) {
    const values: Record<string, string> = {};
    const missingFrom: string[] = [];

    for (const env of envs) {
      if (key in envData[env]) {
        values[env] = envData[env][key];
      } else {
        missingFrom.push(env);
      }
    }

    const uniqueValues = new Set(Object.values(values));
    let status: "in-sync" | "drift" | "missing" = "in-sync";
    if (missingFrom.length > 0) status = "missing";
    else if (uniqueValues.size > 1) status = "drift";

    results.push({ key, values, status, missingFrom });
  }

  const driftCount = results.filter((r) => r.status === "drift").length;
  const missingCount = results.filter((r) => r.status === "missing").length;
  const syncCount = results.filter((r) => r.status === "in-sync").length;

  if (jsonOutput) {
    // Redact values in JSON output
    const redacted = results.map((r) => ({
      ...r,
      values: Object.fromEntries(Object.entries(r.values).map(([env, val]) => [env, redactValue(val)])),
    }));
    console.log(JSON.stringify({
      environments: envs,
      total: results.length,
      inSync: syncCount,
      drift: driftCount,
      missing: missingCount,
      variables: redacted,
    }, null, 2));
  } else {
    console.log(`Environment sync: ${envs.join(" vs ")}\n`);
    console.log(`  Total: ${results.length} | In sync: ${syncCount} | Drift: ${driftCount} | Missing: ${missingCount}\n`);

    if (driftCount > 0) {
      console.log("DRIFTED (different values across environments):");
      for (const r of results.filter((r) => r.status === "drift")) {
        console.log(`\n  ${r.key}:`);
        for (const [env, val] of Object.entries(r.values)) {
          console.log(`    ${env.padEnd(12)} = ${redactValue(val)}`);
        }
      }
      console.log();
    }

    if (missingCount > 0) {
      console.log("MISSING (not set in all environments):");
      for (const r of results.filter((r) => r.status === "missing")) {
        console.log(`  ${r.key} — missing from: ${r.missingFrom.join(", ")}`);
      }
      console.log();
    }

    if (driftCount === 0 && missingCount === 0) {
      console.log("All variables are in sync across environments.");
    }
  }

  if (driftCount > 0 || missingCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
