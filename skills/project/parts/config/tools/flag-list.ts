const args = Bun.argv.slice(2);

const HELP = `
flag-list — List all feature flags with their defaults and descriptions

Usage:
  bun run tools/flag-list.ts [path] [options]

Arguments:
  path    Path to the config package (default: current directory)

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

interface FlagInfo {
  name: string;
  expression: string;
  source: string;
  line: number;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Search for feature flag definitions
  const glob = new Bun.Glob("src/**/*.{ts,js}");
  const flags: FlagInfo[] = [];

  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    // Look for flags object pattern: export const flags = { ... } as const
    let inFlagsBlock = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect start of flags object
      if (line.match(/(?:export\s+)?const\s+flags\s*=\s*\{/)) {
        inFlagsBlock = true;
        braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        continue;
      }

      if (inFlagsBlock) {
        braceDepth += (line.match(/\{/g) || []).length;
        braceDepth -= (line.match(/\}/g) || []).length;

        if (braceDepth <= 0) {
          inFlagsBlock = false;
          continue;
        }

        // Parse flag definition
        const flagMatch = line.match(/^\s*(\w+)\s*:\s*(.+?),?\s*$/);
        if (flagMatch) {
          flags.push({
            name: flagMatch[1],
            expression: flagMatch[2].replace(/,\s*$/, "").trim(),
            source: file,
            line: i + 1,
          });
        }
      }

      // Also match individual flag exports: export const ENABLE_BETA = ...
      const singleMatch = line.match(
        /export\s+const\s+(ENABLE_\w+|enable\w+|FEATURE_\w+|feature\w+|FLAG_\w+|flag\w+)\s*=\s*(.+?)(?:;|\s*$)/
      );
      if (singleMatch) {
        flags.push({
          name: singleMatch[1],
          expression: singleMatch[2].trim(),
          source: file,
          line: i + 1,
        });
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(flags, null, 2));
  } else {
    if (flags.length === 0) {
      console.log("No feature flags found.");
      console.log("Tip: define flags in src/flags.ts as `export const flags = { ... } as const`");
      return;
    }

    console.log(`Feature flags (${flags.length}):\n`);
    for (const flag of flags) {
      console.log(`  ${flag.name}`);
      console.log(`    value: ${flag.expression}`);
      console.log(`    source: ${flag.source}:${flag.line}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
