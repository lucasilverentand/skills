const args = Bun.argv.slice(2);

const HELP = `
transport-list — List configured log transports with target and filter settings

Usage:
  bun run tools/transport-list.ts [path] [options]

Arguments:
  path    Path to the logger package or project root (default: current directory)

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

interface TransportInfo {
  target: string;
  level: string | null;
  condition: string | null;
  file: string;
  line: number;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const transports: TransportInfo[] = [];

  const glob = new Bun.Glob("**/*.{ts,js}");

  for await (const file of glob.scan({ cwd: root })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match pino transport patterns
      const transportMatch = line.match(
        /target\s*:\s*['"]([^'"]+)['"]/
      );
      if (transportMatch) {
        // Look for surrounding context
        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 3)).join("\n");

        let level: string | null = null;
        const levelMatch = context.match(/level\s*:\s*['"](\w+)['"]/);
        if (levelMatch) level = levelMatch[1];

        let condition: string | null = null;
        const condMatch = context.match(
          /(?:process\.env\.NODE_ENV|NODE_ENV)\s*===?\s*['"](\w+)['"]/
        );
        if (condMatch) condition = `NODE_ENV === "${condMatch[1]}"`;

        transports.push({
          target: transportMatch[1],
          level,
          condition,
          file,
          line: i + 1,
        });
      }

      // Match console.log/error transport fallback
      if (
        line.match(/transport\s*:.*undefined/) ||
        line.match(/transport\s*:.*process\.env/)
      ) {
        const condMatch = line.match(
          /(?:process\.env\.NODE_ENV|NODE_ENV)\s*!==?\s*['"](\w+)['"]/
        );
        transports.push({
          target: "stdout (raw JSON)",
          level: null,
          condition: condMatch ? `NODE_ENV !== "${condMatch[1]}"` : "default",
          file,
          line: i + 1,
        });
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(transports, null, 2));
  } else {
    if (transports.length === 0) {
      console.log("No transport configurations found.");
      console.log("Tip: configure pino transports in your logger setup file.");
      return;
    }

    console.log(`Log transports (${transports.length}):\n`);

    for (const t of transports) {
      console.log(`  ${t.target}`);
      if (t.level) console.log(`    level: ${t.level}`);
      if (t.condition) console.log(`    when: ${t.condition}`);
      console.log(`    source: ${t.file}:${t.line}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
