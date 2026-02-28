const args = Bun.argv.slice(2);

const HELP = `
rotation-check — Report secrets that exceed their maximum age policy

Usage:
  bun run tools/rotation-check.ts [config-file] [options]

Arguments:
  [config-file]  Path to a JSON config listing secrets and their last rotation dates.
                 Format: [{ "name": "...", "lastRotated": "YYYY-MM-DD", "maxAgeDays": 90, "environment": "..." }]
                 If not provided, scans for common secret files and env vars.

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

interface SecretEntry {
  name: string;
  lastRotated: string;
  maxAgeDays: number;
  environment: string;
}

interface RotationStatus extends SecretEntry {
  ageDays: number;
  expired: boolean;
  expiresIn: number;
}

// Default rotation policies
const DEFAULT_POLICIES: Record<string, number> = {
  api_key: 90,
  api_secret: 90,
  secret_key: 90,
  access_key: 90,
  database_url: 180,
  db_password: 180,
  jwt_secret: 90,
  signing_key: 90,
  token: 90,
  password: 180,
};

async function main() {
  const configPath = filteredArgs[0];
  let secrets: SecretEntry[] = [];

  if (configPath) {
    const file = Bun.file(configPath);
    if (!(await file.exists())) {
      console.error(`Error: config file not found: ${configPath}`);
      process.exit(1);
    }
    secrets = JSON.parse(await file.text());
  } else {
    // Scan .env.example for secret names and check git log for last modification
    const envExampleFile = Bun.file(".env.example");
    if (await envExampleFile.exists()) {
      const content = await envExampleFile.text();
      for (const line of content.split("\n")) {
        if (!line.trim() || line.startsWith("#")) continue;
        const [key] = line.split("=");
        if (!key) continue;

        const keyLower = key.trim().toLowerCase();
        // Check if this looks like a secret
        const matchedPolicy = Object.entries(DEFAULT_POLICIES).find(([pattern]) =>
          keyLower.includes(pattern)
        );

        if (matchedPolicy) {
          // Get last modification date from git
          const proc = Bun.spawn(["git", "log", "-1", "--format=%ai", "--", ".env.example"], {
            stdout: "pipe",
            stderr: "pipe",
          });
          const dateStr = (await new Response(proc.stdout).text()).trim();
          await proc.exited;

          secrets.push({
            name: key.trim(),
            lastRotated: dateStr ? dateStr.split(" ")[0] : "unknown",
            maxAgeDays: matchedPolicy[1],
            environment: "from .env.example",
          });
        }
      }
    }

    if (secrets.length === 0) {
      if (jsonOutput) {
        console.log(JSON.stringify({ message: "No secrets config found. Provide a config file or add .env.example.", statuses: [] }));
      } else {
        console.log("No secrets config found.");
        console.log("Provide a JSON config file or create .env.example with secret variable names.");
        console.log(`\nExpected format: [{ "name": "API_KEY", "lastRotated": "2025-01-01", "maxAgeDays": 90, "environment": "production" }]`);
      }
      process.exit(0);
    }
  }

  const now = Date.now();
  const statuses: RotationStatus[] = secrets.map((s) => {
    const lastRotatedDate = new Date(s.lastRotated);
    const ageDays = s.lastRotated === "unknown" ? 999 : Math.floor((now - lastRotatedDate.getTime()) / (1000 * 60 * 60 * 24));
    const expired = ageDays > s.maxAgeDays;

    return {
      ...s,
      ageDays,
      expired,
      expiresIn: s.maxAgeDays - ageDays,
    };
  });

  statuses.sort((a, b) => b.ageDays - a.ageDays);

  const expiredCount = statuses.filter((s) => s.expired).length;
  const warningCount = statuses.filter((s) => !s.expired && s.expiresIn <= 14).length;

  if (jsonOutput) {
    console.log(JSON.stringify({
      total: statuses.length,
      expired: expiredCount,
      warningsSoon: warningCount,
      statuses,
    }, null, 2));
  } else {
    console.log(`Secret rotation check: ${statuses.length} secret(s)\n`);

    if (expiredCount > 0) {
      console.log(`EXPIRED (${expiredCount}):`);
      for (const s of statuses.filter((s) => s.expired)) {
        console.log(`  ${s.name} (${s.environment})`);
        console.log(`    Last rotated: ${s.lastRotated} (${s.ageDays} days ago, max: ${s.maxAgeDays})`);
      }
      console.log();
    }

    if (warningCount > 0) {
      console.log(`EXPIRING SOON (${warningCount}):`);
      for (const s of statuses.filter((s) => !s.expired && s.expiresIn <= 14)) {
        console.log(`  ${s.name} (${s.environment})`);
        console.log(`    Expires in ${s.expiresIn} day(s)`);
      }
      console.log();
    }

    const okCount = statuses.filter((s) => !s.expired && s.expiresIn > 14).length;
    if (okCount > 0) {
      console.log(`OK (${okCount}):`);
      for (const s of statuses.filter((s) => !s.expired && s.expiresIn > 14)) {
        console.log(`  ${s.name} — ${s.expiresIn} days until rotation needed`);
      }
    }
  }

  if (expiredCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
