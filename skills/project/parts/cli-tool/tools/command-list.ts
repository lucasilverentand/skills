const args = Bun.argv.slice(2);

const HELP = `
command-list — List all subcommands in a Bun or Rust CLI project

Usage:
  bun run tools/command-list.ts [path] [options]

Arguments:
  path    Path to the CLI project (default: current directory)

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

interface CommandInfo {
  name: string;
  description: string;
  source: string;
  type: "bun" | "rust";
}

async function scanBunCommands(root: string): Promise<CommandInfo[]> {
  const commands: CommandInfo[] = [];

  // Check for citty defineCommand calls
  const glob = new Bun.Glob("src/commands/**/*.ts");
  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Extract command name and description from defineCommand
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    const descMatch = content.match(/description:\s*["']([^"']+)["']/);

    if (nameMatch) {
      commands.push({
        name: nameMatch[1],
        description: descMatch?.[1] || "(no description)",
        source: file,
        type: "bun",
      });
    }
  }

  // Also check main entry for inline subcommands
  for (const entry of ["src/index.ts", "src/cli.ts", "src/main.ts"]) {
    const file = Bun.file(`${root}/${entry}`);
    if (await file.exists()) {
      const content = await file.text();
      const subCmdMatches = content.matchAll(/subCommands:\s*\{([^}]+)\}/g);
      for (const match of subCmdMatches) {
        const names = match[1].match(/\w+/g) || [];
        for (const name of names) {
          if (!commands.some((c) => c.name === name)) {
            commands.push({
              name,
              description: "(defined in entry)",
              source: entry,
              type: "bun",
            });
          }
        }
      }
    }
  }

  return commands;
}

async function scanRustCommands(root: string): Promise<CommandInfo[]> {
  const commands: CommandInfo[] = [];

  const glob = new Bun.Glob("**/*.rs");
  for await (const file of glob.scan({ cwd: root })) {
    const content = await Bun.file(`${root}/${file}`).text();

    // Find clap Subcommand enum variants with doc comments
    const enumMatch = content.match(
      /#\[derive\([^)]*Subcommand[^)]*\)\]\s*enum\s+\w+\s*\{([^}]+)\}/s
    );
    if (!enumMatch) continue;

    const body = enumMatch[1];
    const variantRegex = /(?:\/\/\/\s*(.+)\n\s*)?(\w+)\s*(?:\{[^}]*\})?/g;
    let match;
    while ((match = variantRegex.exec(body)) !== null) {
      const description = match[1]?.trim() || "(no description)";
      const name = match[2].toLowerCase();
      if (name === "enum" || name === "pub") continue;
      commands.push({ name, description, source: file, type: "rust" });
    }
  }

  return commands;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();

  // Detect project type
  const hasCargoToml = await Bun.file(`${root}/Cargo.toml`).exists();
  const hasPackageJson = await Bun.file(`${root}/package.json`).exists();

  let commands: CommandInfo[] = [];

  if (hasCargoToml) {
    commands.push(...(await scanRustCommands(root)));
  }

  if (hasPackageJson) {
    commands.push(...(await scanBunCommands(root)));
  }

  if (!hasCargoToml && !hasPackageJson) {
    console.error("Error: no Cargo.toml or package.json found in " + root);
    process.exit(1);
  }

  commands.sort((a, b) => a.name.localeCompare(b.name));

  if (jsonOutput) {
    console.log(JSON.stringify(commands, null, 2));
  } else {
    if (commands.length === 0) {
      console.log("No subcommands found.");
      return;
    }

    const type = commands[0].type === "rust" ? "Rust (clap)" : "Bun (citty)";
    console.log(`Commands (${type}):\n`);

    const maxName = Math.max(...commands.map((c) => c.name.length));
    for (const cmd of commands) {
      console.log(`  ${cmd.name.padEnd(maxName + 2)} ${cmd.description}`);
      console.log(`  ${"".padEnd(maxName + 2)} → ${cmd.source}`);
    }

    console.log(`\n${commands.length} command(s) found.`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
