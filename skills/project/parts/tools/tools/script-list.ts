const args = Bun.argv.slice(2);

const HELP = `
script-list — List all scripts in a tools package with descriptions

Usage:
  bun run tools/script-list.ts [path] [options]

Arguments:
  path    Path to the tools package (default: current directory)

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

interface ScriptInfo {
  file: string;
  name: string;
  description: string;
  category: string;
  hasHelp: boolean;
  hasJson: boolean;
  hasDryRun: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const scripts: ScriptInfo[] = [];

  const glob = new Bun.Glob("src/**/*.ts");
  for await (const file of glob.scan({ cwd: root })) {
    // Skip non-script files (lib/, types, index)
    if (file.includes("/lib/") || file.endsWith("index.ts") || file.endsWith(".d.ts")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    // Only include files that look like runnable scripts
    if (!content.includes("Bun.argv") && !content.includes("process.argv")) continue;

    // Extract name from filename
    const name = file
      .split("/")
      .pop()!
      .replace(".ts", "");

    // Extract category from directory
    const parts = file.split("/");
    const category = parts.length > 2 ? parts[1] : "root";

    // Extract description from HELP string
    let description = "(no description)";
    const helpMatch = content.match(/(?:const\s+HELP\s*=\s*`\s*\n?\s*)(\S[^\n]*)/);
    if (helpMatch) {
      // Format: "script-name — description"
      const line = helpMatch[1].trim();
      const dashIdx = line.indexOf("—");
      if (dashIdx !== -1) {
        description = line.substring(dashIdx + 1).trim();
      } else {
        description = line;
      }
    }

    const hasHelp = content.includes("--help");
    const hasJson = content.includes("--json");
    const hasDryRun = content.includes("--dry-run");

    scripts.push({ file, name, description, category, hasHelp, hasJson, hasDryRun });
  }

  scripts.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  if (jsonOutput) {
    console.log(JSON.stringify(scripts, null, 2));
  } else {
    if (scripts.length === 0) {
      console.log("No scripts found.");
      return;
    }

    let currentCategory = "";
    for (const s of scripts) {
      if (s.category !== currentCategory) {
        currentCategory = s.category;
        console.log(`\n  ${currentCategory}/`);
      }

      const flags = [
        s.hasHelp ? "help" : null,
        s.hasJson ? "json" : null,
        s.hasDryRun ? "dry-run" : null,
      ]
        .filter(Boolean)
        .join(", ");

      console.log(`    ${s.name.padEnd(24)} ${s.description}`);
      if (flags) console.log(`    ${"".padEnd(24)} flags: ${flags}`);
    }

    console.log(`\n${scripts.length} script(s) found.`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
