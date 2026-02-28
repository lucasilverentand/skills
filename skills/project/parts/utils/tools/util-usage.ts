const args = Bun.argv.slice(2);

const HELP = `
util-usage — Find all import sites for a given utility across the monorepo

Usage:
  bun run tools/util-usage.ts <function-name> [path] [options]

Arguments:
  function-name    Name of the utility function to search for
  path             Path to monorepo root (default: current directory)

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
}

async function main() {
  const funcName = filteredArgs[0];
  if (!funcName) {
    console.error("Error: missing required function-name argument");
    process.exit(1);
  }

  const root = filteredArgs[1] || process.cwd();
  const usages: UsageSite[] = [];

  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

  for await (const file of glob.scan({ cwd: root })) {
    if (file.includes("node_modules")) continue;

    const content = await Bun.file(`${root}/${file}`).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match import statements containing the function name
      if (line.includes("import") && line.includes(funcName)) {
        usages.push({
          file,
          line: i + 1,
          context: line.trim(),
        });
        continue;
      }

      // Match function calls (not in definition)
      const callPattern = new RegExp(`\\b${funcName}\\s*\\(`);
      if (
        callPattern.test(line) &&
        !line.includes("export") &&
        !line.includes("function " + funcName) &&
        !line.trimStart().startsWith("//")
      ) {
        usages.push({
          file,
          line: i + 1,
          context: line.trim().substring(0, 120),
        });
      }
    }
  }

  usages.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const uniqueFiles = new Set(usages.map((u) => u.file));

  if (jsonOutput) {
    console.log(JSON.stringify({ functionName: funcName, usages, fileCount: uniqueFiles.size }, null, 2));
  } else {
    if (usages.length === 0) {
      console.log(`No usages of '${funcName}' found.`);
      return;
    }

    console.log(`Usages of '${funcName}' (${usages.length} in ${uniqueFiles.size} file(s)):\n`);

    let currentFile = "";
    for (const u of usages) {
      if (u.file !== currentFile) {
        currentFile = u.file;
        console.log(`  ${u.file}:`);
      }
      console.log(`    L${u.line}: ${u.context}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
