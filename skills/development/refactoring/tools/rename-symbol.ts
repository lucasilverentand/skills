const args = Bun.argv.slice(2);

const HELP = `
rename-symbol — Rename a symbol across the codebase with import path updates

Usage:
  bun run tools/rename-symbol.ts <old-name> <new-name> [options]
  bun run tools/rename-symbol.ts --find <name>

Options:
  --find <name>   Preview mode: show all usages without renaming
  --dir <path>    Root directory to search (default: current directory)
  --json          Output as JSON instead of plain text
  --help          Show this help message

Finds all occurrences of a symbol (function, type, variable, class) and
renames them, updating imports and references across the codebase.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const findOnly = getFlag("--find");
const searchDir = getFlag("--dir") || ".";
const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    !(args[i - 1] === "--find") &&
    !(args[i - 1] === "--dir")
);

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface Usage {
  file: string;
  line: number;
  column: number;
  context: string;
  type: "declaration" | "import" | "reference" | "export";
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx|js|jsx|mts|mjs)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function classifyUsage(line: string, name: string): Usage["type"] {
  if (/^import\s/.test(line)) return "import";
  if (/^export\s/.test(line)) return "export";
  if (new RegExp(`(?:function|class|const|let|var|type|interface)\\s+${name}\\b`).test(line)) {
    return "declaration";
  }
  return "reference";
}

async function findUsages(files: string[], name: string): Promise<Usage[]> {
  const usages: Usage[] = [];
  const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");

  for (const file of files) {
    const content = await Bun.file(file).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        // Skip occurrences inside strings and comments
        const before = line.slice(0, match.index);
        if (/\/\//.test(before) || /['"]/.test(before)) continue;

        usages.push({
          file,
          line: i + 1,
          column: match.index + 1,
          context: line.trim(),
          type: classifyUsage(line, name),
        });
      }
    }
  }

  return usages;
}

async function main() {
  const dir = resolve(searchDir);
  const files = await collectFiles(dir);

  if (findOnly) {
    // Preview mode
    const usages = await findUsages(files, findOnly);

    const result = {
      symbol: findOnly,
      usages: usages.length,
      byType: {
        declarations: usages.filter((u) => u.type === "declaration").length,
        imports: usages.filter((u) => u.type === "import").length,
        exports: usages.filter((u) => u.type === "export").length,
        references: usages.filter((u) => u.type === "reference").length,
      },
      details: usages.map((u) => ({
        ...u,
        file: relative(dir, u.file),
      })),
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Symbol: ${findOnly}`);
      console.log(`  ${usages.length} usages across ${new Set(usages.map((u) => u.file)).size} files\n`);

      for (const u of usages) {
        console.log(`  [${u.type}] ${relative(dir, u.file)}:${u.line}`);
        console.log(`    ${u.context}`);
      }
    }
    return;
  }

  // Rename mode
  const oldName = filteredArgs[0];
  const newName = filteredArgs[1];

  if (!oldName || !newName) {
    console.error("Error: both <old-name> and <new-name> required");
    process.exit(1);
  }

  if (oldName === newName) {
    console.error("Error: old and new names are the same");
    process.exit(1);
  }

  const usages = await findUsages(files, oldName);
  if (usages.length === 0) {
    console.log(`No usages of '${oldName}' found.`);
    return;
  }

  // Group by file and do replacement
  const fileUsages = new Map<string, Usage[]>();
  for (const u of usages) {
    const list = fileUsages.get(u.file) || [];
    list.push(u);
    fileUsages.set(u.file, list);
  }

  const regex = new RegExp(
    `\\b${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "g"
  );

  let totalReplacements = 0;
  for (const [filePath] of fileUsages) {
    const content = await Bun.file(filePath).text();
    const newContent = content.replace(regex, newName);
    const replacements = (content.match(regex) || []).length;
    totalReplacements += replacements;
    await Bun.write(filePath, newContent);
  }

  const result = {
    oldName,
    newName,
    filesModified: fileUsages.size,
    totalReplacements,
    files: [...fileUsages.keys()].map((f) => relative(dir, f)),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Renamed '${oldName}' → '${newName}'`);
    console.log(`  ${totalReplacements} replacements in ${fileUsages.size} files\n`);

    for (const f of result.files) {
      console.log(`  ${f}`);
    }

    console.log("\nRun tests to verify the rename didn't break anything.");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
