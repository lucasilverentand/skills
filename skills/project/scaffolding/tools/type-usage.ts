const args = Bun.argv.slice(2);

const HELP = `
type-usage — Find all import sites for a given type across the monorepo

Usage:
  bun run tools/type-usage.ts <type-name> [path] [options]

Arguments:
  type-name    Name of the type, interface, or schema to search for
  path         Path to monorepo root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface UsageSite {
  file: string;
  line: number;
  context: string;
  kind: "import" | "reference";
}

async function main() {
  const typeName = filteredArgs[0];
  if (!typeName) {
    console.error("Error: missing required type-name argument");
    process.exit(1);
  }

  const root = filteredArgs[1] || process.cwd();
  const usages: UsageSite[] = [];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  for await (const file of glob.scan({ cwd: root })) {
    if (file.includes("node_modules")) continue;
    if (file.includes(".d.ts")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for imports containing the type name
      if (
        line.includes("import") &&
        line.includes(typeName)
      ) {
        usages.push({
          file,
          line: i + 1,
          context: line.trim(),
          kind: "import",
        });
        continue;
      }

      // Check for usage references (not just imports)
      // Match as whole word
      const wordPattern = new RegExp(`\\b${typeName}\\b`);
      if (
        wordPattern.test(line) &&
        !line.includes("export") &&
        !line.trimStart().startsWith("//") &&
        !line.trimStart().startsWith("*")
      ) {
        usages.push({
          file,
          line: i + 1,
          context: line.trim().substring(0, 120),
          kind: "reference",
        });
      }
    }
  }

  // Deduplicate and sort
  const unique = usages.filter((u, i) =>
    usages.findIndex((o) => o.file === u.file && o.line === u.line) === i
  );
  unique.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  const imports = unique.filter((u) => u.kind === "import");
  const references = unique.filter((u) => u.kind === "reference");

  if (jsonOutput) {
    console.log(JSON.stringify({ typeName, imports, references, totalUsages: unique.length }, null, 2));
  } else {
    if (unique.length === 0) {
      console.log(`No usages of '${typeName}' found.`);
      return;
    }

    if (imports.length > 0) {
      console.log(`Imports of '${typeName}' (${imports.length}):\n`);
      for (const u of imports) {
        console.log(`  ${u.file}:${u.line}`);
        console.log(`    ${u.context}`);
      }
    }

    if (references.length > 0) {
      console.log(`\nReferences to '${typeName}' (${references.length}):\n`);
      for (const u of references) {
        console.log(`  ${u.file}:${u.line}`);
        console.log(`    ${u.context}`);
      }
    }

    console.log(`\nTotal: ${unique.length} usage(s) across ${new Set(unique.map((u) => u.file)).size} file(s)`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
