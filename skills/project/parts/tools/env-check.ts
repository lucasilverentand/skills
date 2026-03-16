const args = Bun.argv.slice(2);

const HELP = `
env-check — Validate required environment variables are set for a given target

Usage:
  bun run tools/env-check.ts [path] [options]

Arguments:
  path    Path to the config package (default: current directory)

Options:
  --env <file>    Path to .env file to check (default: .env in project root)
  --json          Output as JSON instead of plain text
  --help          Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

interface EnvVar {
  name: string;
  required: boolean;
  hasDefault: boolean;
  set: boolean;
  source: string;
}

async function parseEnvFile(filePath: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const file = Bun.file(filePath);
  if (!(await file.exists())) return map;

  const content = await file.text();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    map.set(key, value);
  }
  return map;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Find env schema definition file
  const envSchemaPatterns = [
    `${root}/src/env.ts`,
    `${root}/src/env.js`,
    `${root}/src/config.ts`,
    `${root}/src/index.ts`,
  ];

  let schemaContent = "";
  let schemaFile = "";

  for (const pattern of envSchemaPatterns) {
    const file = Bun.file(pattern);
    if (await file.exists()) {
      const content = await file.text();
      if (content.includes("z.object") || content.includes("process.env")) {
        schemaContent = content;
        schemaFile = pattern;
        break;
      }
    }
  }

  if (!schemaContent) {
    console.error("Error: could not find env schema definition (src/env.ts with z.object)");
    process.exit(1);
  }

  // Parse env vars from Zod schema
  const envVars: EnvVar[] = [];

  // Match z.object({ KEY: z.string()... }) patterns
  const objectMatch = schemaContent.match(/z\.object\(\{([\s\S]*?)\}\)/);
  if (objectMatch) {
    const inner = objectMatch[1];
    // Match individual field definitions
    const fieldMatches = inner.matchAll(
      /(\w+)\s*:\s*z\.(\w+)\(([^)]*)\)((?:\.[a-zA-Z]+\([^)]*\))*)/g
    );

    for (const m of fieldMatches) {
      const name = m[1];
      const chain = m[4] || "";
      const isOptional = chain.includes(".optional()");
      const hasDefault = chain.includes(".default(");

      envVars.push({
        name,
        required: !isOptional && !hasDefault,
        hasDefault,
        set: false,
        source: schemaFile,
      });
    }
  }

  // Also scan for direct process.env references
  const envRefMatches = schemaContent.matchAll(/process\.env\.(\w+)/g);
  const envRefNames = new Set(envVars.map((v) => v.name));
  for (const m of envRefMatches) {
    if (!envRefNames.has(m[1])) {
      envVars.push({
        name: m[1],
        required: true,
        hasDefault: false,
        set: false,
        source: schemaFile,
      });
    }
  }

  // Check env file
  const envFilePath = getFlag("--env") || `${root}/.env`;
  const envFileVars = await parseEnvFile(envFilePath);

  // Also check parent directories for .env
  let parentEnv = new Map<string, string>();
  const parentEnvPath = `${root}/../../.env`;
  const parentFile = Bun.file(parentEnvPath);
  if (await parentFile.exists()) {
    parentEnv = await parseEnvFile(parentEnvPath);
  }

  // Mark which vars are set
  for (const v of envVars) {
    v.set =
      envFileVars.has(v.name) ||
      parentEnv.has(v.name) ||
      v.name in process.env;
  }

  const missing = envVars.filter((v) => v.required && !v.set);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          envFile: envFilePath,
          schemaFile,
          vars: envVars,
          missing: missing.map((v) => v.name),
          valid: missing.length === 0,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Env schema: ${schemaFile}`);
    console.log(`Env file: ${envFilePath}\n`);

    for (const v of envVars) {
      const icon = v.set ? "+" : v.required ? "x" : " ";
      const req = v.required ? "required" : v.hasDefault ? "has default" : "optional";
      console.log(`  [${icon}] ${v.name} (${req})`);
    }

    if (missing.length > 0) {
      console.log(`\nMissing ${missing.length} required variable(s):`);
      for (const v of missing) {
        console.log(`  - ${v.name}`);
      }
      process.exit(1);
    } else {
      console.log("\nAll required environment variables are set.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
