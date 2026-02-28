const args = Bun.argv.slice(2);

const HELP = `
util-index — List all exported utility functions grouped by category

Usage:
  bun run tools/util-index.ts [path] [options]

Arguments:
  path    Path to the utils package (default: current directory)

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

interface UtilFunction {
  name: string;
  file: string;
  line: number;
  signature: string;
  category: string;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const utils: UtilFunction[] = [];

  const glob = new Bun.Glob("src/**/*.{ts,tsx}");

  for await (const file of glob.scan({ cwd: root })) {
    // Skip test files
    if (file.includes(".test.") || file.includes(".spec.")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    // Category from filename
    const fileName = file.split("/").pop()?.replace(/\.(ts|tsx)$/, "") || "misc";
    const category = fileName === "index" ? "general" : fileName;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match exported functions
      const funcMatch = line.match(
        /export\s+function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?/
      );
      if (funcMatch) {
        const name = funcMatch[1];
        const generics = funcMatch[2] || "";
        const params = funcMatch[3].trim();
        const returnType = funcMatch[4] || "void";

        utils.push({
          name,
          file,
          line: i + 1,
          signature: `${name}${generics}(${params}): ${returnType}`,
          category,
        });
        continue;
      }

      // Match exported arrow functions
      const arrowMatch = line.match(
        /export\s+const\s+(\w+)\s*=\s*(?:<[^>]+>\s*)?\(([^)]*)\)(?:\s*:\s*([^\s=>]+))?\s*=>/
      );
      if (arrowMatch) {
        const name = arrowMatch[1];
        const params = arrowMatch[2].trim();
        const returnType = arrowMatch[3] || "unknown";

        utils.push({
          name,
          file,
          line: i + 1,
          signature: `${name}(${params}): ${returnType}`,
          category,
        });
      }
    }
  }

  // Group by category
  const grouped = new Map<string, UtilFunction[]>();
  for (const util of utils) {
    const list = grouped.get(util.category) || [];
    list.push(util);
    grouped.set(util.category, list);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(utils, null, 2));
  } else {
    if (utils.length === 0) {
      console.log("No exported utility functions found in src/");
      return;
    }

    console.log(`Utility functions (${utils.length}):\n`);

    for (const [category, items] of [...grouped].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  ${category} (${items.length}):`);
      for (const u of items.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`    ${u.signature}`);
        console.log(`      ${u.file}:${u.line}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
