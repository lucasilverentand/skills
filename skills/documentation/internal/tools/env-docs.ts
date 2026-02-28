const args = Bun.argv.slice(2);

const HELP = `
env-docs — Scan source for environment variable usage and generate .env.example

Usage:
  bun run tools/env-docs.ts <src-dir> [options]

Arguments:
  src-dir   Directory to scan for env var usage

Options:
  --output <path>   Write .env.example to a specific path (default: .env.example in cwd)
  --existing <path> Path to existing .env or .env.example to preserve comments
  --json            Output as JSON instead of writing the file
  --help            Show this help message

Examples:
  bun run tools/env-docs.ts src/
  bun run tools/env-docs.ts src/ --output .env.example
  bun run tools/env-docs.ts src/ --json
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const existingIdx = args.indexOf("--existing");
const existingPath = existingIdx !== -1 ? args[existingIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    i !== outputIdx + 1 &&
    i !== existingIdx + 1
);

interface EnvVar {
  name: string;
  files: string[];
  required: boolean;
  defaultValue?: string;
  description?: string;
  isSecret: boolean;
}

const SECRET_PATTERNS = [
  /key/i, /secret/i, /token/i, /password/i, /credential/i,
  /api.?key/i, /auth/i, /private/i,
];

function isLikelySecret(name: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(name));
}

function inferDescription(name: string): string {
  const parts = name.split("_");
  const lower = parts.map((p) => p.toLowerCase()).join(" ");

  // Common patterns
  if (/database.?url/i.test(name)) return "Database connection string";
  if (/redis.?url/i.test(name)) return "Redis connection URL";
  if (/api.?key/i.test(name)) return "API key for external service";
  if (/api.?url/i.test(name) || /api.?base/i.test(name)) return "Base URL for API";
  if (/port/i.test(name)) return "Server port number";
  if (/host/i.test(name)) return "Server hostname";
  if (/node.?env/i.test(name)) return "Runtime environment (development, production, test)";
  if (/log.?level/i.test(name)) return "Logging verbosity level";
  if (/jwt/i.test(name)) return "JWT signing secret";
  if (/smtp/i.test(name) || /mail/i.test(name)) return "Email service configuration";
  if (/s3/i.test(name) || /bucket/i.test(name)) return "S3/storage configuration";
  if (/sentry/i.test(name)) return "Sentry error tracking DSN";

  return `${lower}`;
}

function inferDefaultValue(name: string): string {
  if (/port/i.test(name)) return "3000";
  if (/node.?env/i.test(name)) return "development";
  if (/log.?level/i.test(name)) return "info";
  if (/host/i.test(name)) return "localhost";
  if (isLikelySecret(name)) return "";
  return "";
}

async function scanForEnvVars(srcDir: string): Promise<Map<string, EnvVar>> {
  const envVars = new Map<string, EnvVar>();
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mjs,cjs}");

  // Patterns to match:
  // process.env.VAR_NAME
  // process.env["VAR_NAME"]
  // Bun.env.VAR_NAME
  // Bun.env["VAR_NAME"]
  // Env.get("VAR_NAME")
  // import.meta.env.VAR_NAME
  const patterns = [
    /(?:process|Bun)\.env\.([A-Z][A-Z0-9_]+)/g,
    /(?:process|Bun)\.env\[\s*["']([A-Z][A-Z0-9_]+)["']\s*\]/g,
    /import\.meta\.env\.([A-Z][A-Z0-9_]+)/g,
    /Env\.get\(\s*["']([A-Z][A-Z0-9_]+)["']\s*\)/g,
  ];

  for await (const filePath of glob.scan({ cwd: srcDir, absolute: false })) {
    // Skip node_modules and dist
    if (filePath.includes("node_modules") || filePath.includes("dist/")) continue;

    const fullPath = `${srcDir}/${filePath}`;
    const content = await Bun.file(fullPath).text();

    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];

        // Skip common non-env patterns
        if (varName === "NODE_ENV" && envVars.has(varName)) {
          envVars.get(varName)!.files.push(filePath);
          continue;
        }

        if (envVars.has(varName)) {
          const existing = envVars.get(varName)!;
          if (!existing.files.includes(filePath)) {
            existing.files.push(filePath);
          }
        } else {
          // Check if there's a default/fallback
          const contextAfter = content.slice(match.index, match.index + 200);
          const defaultMatch = contextAfter.match(/(?:\|\||\?\?)\s*["']([^"']*)["']/);
          const isRequired = !defaultMatch && !/\?\?|default|\|\|/.test(contextAfter.slice(0, 80));

          envVars.set(varName, {
            name: varName,
            files: [filePath],
            required: isRequired,
            defaultValue: defaultMatch?.[1] ?? inferDefaultValue(varName),
            description: inferDescription(varName),
            isSecret: isLikelySecret(varName),
          });
        }
      }
    }
  }

  return envVars;
}

async function parseExistingEnv(path: string): Promise<Map<string, string>> {
  const comments = new Map<string, string>();
  try {
    const content = await Bun.file(path).text();
    const lines = content.split("\n");
    let lastComment = "";

    for (const line of lines) {
      if (line.startsWith("#")) {
        lastComment = line.replace(/^#\s*/, "");
      } else if (line.includes("=")) {
        const varName = line.split("=")[0].trim();
        if (lastComment && varName) {
          comments.set(varName, lastComment);
        }
        lastComment = "";
      } else {
        lastComment = "";
      }
    }
  } catch {
    // File doesn't exist
  }
  return comments;
}

function generateEnvExample(envVars: EnvVar[], existingComments: Map<string, string>): string {
  const lines: string[] = [];
  lines.push("# Environment Variables");
  lines.push("# Copy this file to .env and fill in the values");
  lines.push("");

  // Group by category
  const required = envVars.filter((v) => v.required);
  const optional = envVars.filter((v) => !v.required);

  if (required.length > 0) {
    lines.push("# === Required ===");
    lines.push("");
    for (const v of required) {
      const comment = existingComments.get(v.name) || v.description;
      const secretNote = v.isSecret ? " (secret — do not commit)" : "";
      lines.push(`# ${comment}${secretNote}`);
      lines.push(`${v.name}=${v.defaultValue || ""}`);
      lines.push("");
    }
  }

  if (optional.length > 0) {
    lines.push("# === Optional ===");
    lines.push("");
    for (const v of optional) {
      const comment = existingComments.get(v.name) || v.description;
      const defaultNote = v.defaultValue ? ` (default: ${v.defaultValue})` : "";
      lines.push(`# ${comment}${defaultNote}`);
      lines.push(`${v.name}=${v.defaultValue || ""}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

async function main() {
  const srcDir = filteredArgs[0];
  if (!srcDir) {
    console.error("Error: missing required argument <src-dir>");
    process.exit(1);
  }

  const resolvedDir = Bun.resolveSync(srcDir, process.cwd());
  const envVarsMap = await scanForEnvVars(resolvedDir);
  const envVars = [...envVarsMap.values()].sort((a, b) => {
    // Required first, then alphabetical
    if (a.required !== b.required) return a.required ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (envVars.length === 0) {
    console.error("No environment variables found in source files");
    process.exit(1);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({
      count: envVars.length,
      required: envVars.filter((v) => v.required).length,
      optional: envVars.filter((v) => !v.required).length,
      secrets: envVars.filter((v) => v.isSecret).length,
      variables: envVars,
    }, null, 2));
    return;
  }

  const existingComments = existingPath
    ? await parseExistingEnv(Bun.resolveSync(existingPath, process.cwd()))
    : new Map<string, string>();

  const content = generateEnvExample(envVars, existingComments);
  const target = outputPath
    ? Bun.resolveSync(outputPath, process.cwd())
    : `${process.cwd()}/.env.example`;

  await Bun.write(target, content);

  console.log(`Found ${envVars.length} environment variable(s)`);
  console.log(`  Required: ${envVars.filter((v) => v.required).length}`);
  console.log(`  Optional: ${envVars.filter((v) => !v.required).length}`);
  console.log(`  Secrets:  ${envVars.filter((v) => v.isSecret).length}`);
  console.log(`\nGenerated: ${target}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
