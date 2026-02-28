const args = Bun.argv.slice(2);

const HELP = `
alias-audit — List all shell aliases and flag duplicates or shadowed commands

Usage:
  bun run tools/alias-audit.ts [options]

Options:
  --file <path>   Scan a specific file instead of the running shell
  --json          Output as JSON instead of plain text
  --help          Show this help message

Examples:
  bun run tools/alias-audit.ts
  bun run tools/alias-audit.ts --file ~/.zshrc
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const fileIdx = args.indexOf("--file");
const scanFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

interface AliasEntry {
  name: string;
  value: string;
  source: string;
  line?: number;
}

interface AuditResult {
  aliases: AliasEntry[];
  duplicates: { name: string; definitions: AliasEntry[] }[];
  shadows: { alias: string; systemCommand: string }[];
  unused: string[];
  totalCount: number;
}

async function getShellAliases(): Promise<AliasEntry[]> {
  const proc = Bun.spawnSync(["zsh", "-i", "-c", "alias"], {
    timeout: 10_000,
    env: { ...process.env },
  });

  const output = proc.stdout.toString();
  const aliases: AliasEntry[] = [];

  for (const line of output.split("\n")) {
    // Format: name=value or name='value'
    const match = line.match(/^(\S+?)=(.+)$/);
    if (match) {
      let value = match[2];
      // Remove surrounding quotes
      if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      aliases.push({
        name: match[1],
        value,
        source: "shell",
      });
    }
  }

  return aliases;
}

async function getFileAliases(filePath: string): Promise<AliasEntry[]> {
  const homeDir = process.env.HOME || "~";
  const resolved = filePath.replace(/^~/, homeDir);
  const content = await Bun.file(resolved).text();
  const aliases: AliasEntry[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match: alias name='value' or alias name="value" or alias name=value
    const match = line.match(/^alias\s+(\S+?)=(.+)$/);
    if (match) {
      let value = match[2];
      if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      aliases.push({
        name: match[1],
        value,
        source: resolved,
        line: i + 1,
      });
    }
  }

  // Also check sourced files
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const sourceMatch = line.match(/^(?:source|\.)[\s]+(.+)/);
    if (sourceMatch) {
      let sourcePath = sourceMatch[1].trim();
      // Remove quotes
      sourcePath = sourcePath.replace(/["']/g, "");
      // Expand variables
      sourcePath = sourcePath.replace(/\$HOME/g, homeDir).replace(/^~/, homeDir);
      // Expand $ZDOTDIR etc
      sourcePath = sourcePath.replace(/\$\w+/g, "");

      if (sourcePath && !sourcePath.includes("$")) {
        try {
          const subAliases = await getFileAliases(sourcePath);
          aliases.push(...subAliases);
        } catch {
          // Sourced file doesn't exist
        }
      }
    }
  }

  return aliases;
}

async function checkShadowing(aliases: AliasEntry[]): Promise<AuditResult["shadows"]> {
  const shadows: AuditResult["shadows"] = [];

  // Common system commands that aliases might shadow
  const systemCommands = [
    "ls", "cat", "grep", "find", "rm", "cp", "mv", "cd", "pwd",
    "git", "vim", "nvim", "python", "node", "bun", "npm", "yarn",
    "docker", "kubectl", "ssh", "curl", "wget", "tar", "zip",
    "make", "diff", "sort", "head", "tail", "less", "more",
  ];

  for (const alias of aliases) {
    if (systemCommands.includes(alias.name)) {
      // Verify the system command exists
      const proc = Bun.spawnSync(["which", "-a", alias.name], {
        timeout: 5_000,
      });
      const output = proc.stdout.toString().trim();
      const paths = output.split("\n").filter((p) => p.startsWith("/"));
      if (paths.length > 0) {
        shadows.push({
          alias: alias.name,
          systemCommand: paths[0],
        });
      }
    }
  }

  return shadows;
}

async function main() {
  let aliases: AliasEntry[];

  if (scanFile) {
    aliases = await getFileAliases(scanFile);
  } else {
    aliases = await getShellAliases();
  }

  // Find duplicates
  const byName = new Map<string, AliasEntry[]>();
  for (const alias of aliases) {
    const existing = byName.get(alias.name) || [];
    existing.push(alias);
    byName.set(alias.name, existing);
  }

  const duplicates: AuditResult["duplicates"] = [];
  for (const [name, defs] of byName) {
    if (defs.length > 1) {
      duplicates.push({ name, definitions: defs });
    }
  }

  // Check for shadowing
  const shadows = await checkShadowing(aliases);

  // Deduplicate for clean output
  const uniqueAliases = [...byName.entries()].map(([, defs]) => defs[0]);

  const result: AuditResult = {
    aliases: uniqueAliases,
    duplicates,
    shadows,
    unused: [], // Can't detect unused without shell history analysis
    totalCount: uniqueAliases.length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Shell Alias Audit`);
    console.log(`Total aliases: ${result.totalCount}\n`);

    console.log("Aliases:");
    for (const a of uniqueAliases.sort((a, b) => a.name.localeCompare(b.name))) {
      const src = a.line ? ` (${a.source}:${a.line})` : "";
      console.log(`  ${a.name.padEnd(20)} → ${a.value}${src}`);
    }

    if (duplicates.length > 0) {
      console.log(`\nDuplicates (${duplicates.length}):`);
      for (const d of duplicates) {
        console.log(`  ${d.name}:`);
        for (const def of d.definitions) {
          const src = def.line ? `${def.source}:${def.line}` : def.source;
          console.log(`    = ${def.value} (${src})`);
        }
      }
    }

    if (shadows.length > 0) {
      console.log(`\nShadowed system commands (${shadows.length}):`);
      for (const s of shadows) {
        console.log(`  ${s.alias} shadows ${s.systemCommand}`);
      }
    }

    if (duplicates.length === 0 && shadows.length === 0) {
      console.log("\nNo issues found.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
