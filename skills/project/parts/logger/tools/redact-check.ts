const args = Bun.argv.slice(2);

const HELP = `
redact-check — Scan logger calls for fields that should be redacted but are not

Usage:
  bun run tools/redact-check.ts [path] [options]

Arguments:
  path    Path to search for log calls (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Searches for log statements that pass sensitive field names without
verifying they are in the redact list.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

const SENSITIVE_PATTERNS = [
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apiKey",
  "api_key",
  "accessToken",
  "access_token",
  "refreshToken",
  "refresh_token",
  "credential",
  "private_key",
  "privateKey",
  "ssn",
  "credit_card",
  "creditCard",
];

interface Violation {
  file: string;
  line: number;
  field: string;
  context: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const violations: Violation[] = [];

  // First, find what's in the redact list
  const redacted = new Set<string>();
  const loggerGlob = new Bun.Glob("**/logger*.{ts,js}");

  for await (const file of loggerGlob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const redactMatch = content.match(/redact\s*:\s*\[([^\]]+)\]/);
    if (redactMatch) {
      const fields = redactMatch[1].matchAll(/['"]([^'"]+)['"]/g);
      for (const f of fields) {
        redacted.add(f[1].replace(/\*\./g, ""));
      }
    }
  }

  // Scan all source files for log calls with sensitive fields
  const srcGlob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  for await (const file of srcGlob.scan({ cwd: root })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match log calls: log.info({...}), log.error({...}), etc.
      const isLogCall =
        /\blog\.(trace|debug|info|warn|error|fatal)\s*\(/.test(line) ||
        /\blogger\.(trace|debug|info|warn|error|fatal)\s*\(/.test(line) ||
        /console\.(log|warn|error)\s*\(/.test(line);

      if (!isLogCall) continue;

      // Check for sensitive field names in the log object
      for (const pattern of SENSITIVE_PATTERNS) {
        const lowerPattern = pattern.toLowerCase();
        const lowerLine = line.toLowerCase();

        if (
          lowerLine.includes(lowerPattern) &&
          !redacted.has(pattern) &&
          !redacted.has(lowerPattern)
        ) {
          violations.push({
            file,
            line: i + 1,
            field: pattern,
            context: line.trim().substring(0, 120),
          });
        }
      }
    }
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          redactedFields: [...redacted],
          violations,
          clean: violations.length === 0,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Redact list: ${redacted.size > 0 ? [...redacted].join(", ") : "(none found)"}\n`);

    if (violations.length === 0) {
      console.log("No sensitive fields found in log calls.");
    } else {
      console.log(`Potential sensitive data in logs (${violations.length}):\n`);
      for (const v of violations) {
        console.log(`  ${v.file}:${v.line}`);
        console.log(`    field: ${v.field}`);
        console.log(`    ${v.context}`);
      }
      console.log(
        `\nAdd missing fields to the redact list in your logger config.`
      );
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
