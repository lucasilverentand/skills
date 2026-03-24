const args = Bun.argv.slice(2);

const HELP = `
any-finder — Locate all 'any' types in the codebase ranked by usage frequency

Usage:
  bun run tools/any-finder.ts [path] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TypeScript files for explicit 'any' types including type annotations,
casts, generic parameters, and function signatures.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface AnyUsage {
  file: string;
  line: number;
  column: number;
  context: string;
  kind: "annotation" | "cast" | "generic" | "parameter" | "return";
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function classifyAny(line: string, col: number): AnyUsage["kind"] {
  const before = line.slice(0, col);
  if (/as\s+$/.test(before)) return "cast";
  if (/<[^>]*$/.test(before)) return "generic";
  if (/:\s*$/.test(before)) {
    if (/\)\s*:\s*$/.test(before)) return "return";
    return "annotation";
  }
  if (/\(\s*\w+\s*:\s*$/.test(before) || /,\s*\w+\s*:\s*$/.test(before)) return "parameter";
  return "annotation";
}

async function findAnys(filePath: string): Promise<AnyUsage[]> {
  const usages: AnyUsage[] = [];
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");

  // Match 'any' as a type: ': any', 'as any', '<any>', 'any[]', 'any>'
  const anyRegex = /\bany\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;

    let match;
    anyRegex.lastIndex = 0;
    while ((match = anyRegex.exec(line)) !== null) {
      const col = match.index;

      // Check context to confirm it's a type usage, not a variable name
      const before = line.slice(Math.max(0, col - 5), col);
      const after = line.slice(col + 3, col + 8);

      // Must be preceded by :, <, as, or followed by >, [], |, &, ,, )
      const isType =
        /[:<]\s*$/.test(before) ||
        /^s\s/.test(before.slice(-3)) || // "as "
        /^[>\]|&,);}\s]/.test(after) ||
        /as\s+$/.test(line.slice(0, col));

      if (!isType) continue;

      // Skip if inside a string
      const lineBeforeMatch = line.slice(0, col);
      const singleQuotes = (lineBeforeMatch.match(/'/g) || []).length;
      const doubleQuotes = (lineBeforeMatch.match(/"/g) || []).length;
      const backticks = (lineBeforeMatch.match(/`/g) || []).length;
      if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) continue;

      usages.push({
        file: filePath,
        line: i + 1,
        column: col + 1,
        context: line.trim(),
        kind: classifyAny(line, col),
      });
    }
  }

  return usages;
}

async function main() {
  const target = resolve(filteredArgs[0] || ".");
  let targetStat;
  try {
    targetStat = await stat(target);
  } catch {
    console.error(`Error: path not found: ${target}`);
    process.exit(1);
  }

  const files = targetStat.isDirectory()
    ? await collectFiles(target)
    : [target];

  const allUsages: AnyUsage[] = [];
  for (const file of files) {
    allUsages.push(...(await findAnys(file)));
  }

  // Group by file
  const byFile = new Map<string, number>();
  for (const u of allUsages) {
    byFile.set(u.file, (byFile.get(u.file) || 0) + 1);
  }

  // Group by kind
  const byKind = new Map<string, number>();
  for (const u of allUsages) {
    byKind.set(u.kind, (byKind.get(u.kind) || 0) + 1);
  }

  const sortedFiles = [...byFile.entries()].sort((a, b) => b[1] - a[1]);
  const root = resolve(".");

  const result = {
    scanned: files.length,
    totalAny: allUsages.length,
    byKind: Object.fromEntries(byKind),
    byFile: sortedFiles.map(([f, count]) => ({
      file: relative(root, f),
      count,
    })),
    details: allUsages.map((u) => ({
      ...u,
      file: relative(root, u.file),
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Any Finder: ${files.length} files scanned`);
    console.log(`  Total 'any' usages: ${allUsages.length}\n`);

    if (allUsages.length === 0) {
      console.log("No explicit 'any' types found.");
      return;
    }

    console.log("By kind:");
    for (const [kind, count] of byKind) {
      console.log(`  ${kind}: ${count}`);
    }

    console.log("\nBy file (worst first):");
    for (const [file, count] of sortedFiles.slice(0, 15)) {
      console.log(`  ${count.toString().padStart(4)}  ${relative(root, file)}`);
    }

    console.log("\nDetails:");
    for (const u of allUsages.slice(0, 20)) {
      console.log(`  ${relative(root, u.file)}:${u.line} [${u.kind}]`);
      console.log(`    ${u.context}`);
    }

    if (allUsages.length > 20) {
      console.log(`\n  ... and ${allUsages.length - 20} more`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
