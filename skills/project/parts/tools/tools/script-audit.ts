const args = Bun.argv.slice(2);

const HELP = `
script-audit — Check that all scripts follow conventions (--help, --json, --dry-run)

Usage:
  bun run tools/script-audit.ts [path] [options]

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

interface AuditEntry {
  file: string;
  name: string;
  issues: string[];
  writesFiles: boolean;
  outputsData: boolean;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const entries: AuditEntry[] = [];
  let totalIssues = 0;

  const glob = new Bun.Glob("src/**/*.ts");
  for await (const file of glob.scan({ cwd: root })) {
    if (file.includes("/lib/") || file.endsWith("index.ts") || file.endsWith(".d.ts")) continue;

    const content = await Bun.file(`${root}/${file}`).text();

    // Only audit runnable scripts
    if (!content.includes("Bun.argv") && !content.includes("process.argv")) continue;

    const name = file.split("/").pop()!.replace(".ts", "");
    const issues: string[] = [];

    // Check for --help
    const hasHelp = content.includes("--help");
    if (!hasHelp) {
      issues.push("Missing --help flag");
    }

    // Check for HELP string
    const hasHelpText = content.includes("const HELP") || content.includes("let HELP");
    if (!hasHelpText && hasHelp) {
      issues.push("Has --help flag but no HELP text constant");
    }

    // Check for --json when script outputs data
    const outputsData =
      content.includes("console.log") && !content.includes("HELP");
    const hasJson = content.includes("--json");
    if (outputsData && !hasJson) {
      issues.push("Outputs data but missing --json flag");
    }

    // Check for --dry-run when script writes files
    const writesFiles =
      content.includes("Bun.write") ||
      content.includes("writeFile") ||
      content.includes("fs.write");
    const hasDryRun = content.includes("--dry-run");
    if (writesFiles && !hasDryRun) {
      issues.push("Writes files but missing --dry-run flag");
    }

    // Check for error handling
    const hasErrorHandler =
      content.includes(".catch(") || content.includes("try {");
    if (!hasErrorHandler) {
      issues.push("No error handling (missing .catch() or try/catch)");
    }

    // Check for process.exit on error
    const hasErrorExit = content.includes("process.exit(1)");
    if (!hasErrorExit) {
      issues.push("No process.exit(1) for error cases");
    }

    totalIssues += issues.length;
    entries.push({ file, name, issues, writesFiles, outputsData });
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify({ scripts: entries, totalIssues }, null, 2)
    );
  } else {
    if (entries.length === 0) {
      console.log("No scripts found to audit.");
      return;
    }

    console.log("Script audit:\n");

    for (const entry of entries) {
      const icon = entry.issues.length === 0 ? "+" : "!";
      console.log(`  [${icon}] ${entry.name} (${entry.file})`);
      for (const issue of entry.issues) {
        console.log(`      - ${issue}`);
      }
    }

    const passing = entries.filter((e) => e.issues.length === 0).length;
    console.log(
      `\n${entries.length} script(s), ${passing} passing, ${totalIssues} issue(s).`
    );
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
