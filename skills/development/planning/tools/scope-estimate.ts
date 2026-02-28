const args = Bun.argv.slice(2);

const HELP = `
scope-estimate — Estimate the number of files and lines affected by a planned change

Usage:
  bun run tools/scope-estimate.ts <file-or-dir> [...more-paths] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Analyzes the given files/directories to estimate the scope of a change:
counts files, lines, imports, and dependents to quantify the blast radius.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative, basename } from "node:path";

interface FileInfo {
  path: string;
  lines: number;
  imports: string[];
  exports: string[];
}

async function collectTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      files.push(...(await collectTsFiles(full)));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

async function analyzeFile(filePath: string): Promise<FileInfo> {
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");
  const imports: string[] = [];
  const exports: string[] = [];

  for (const line of lines) {
    const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) imports.push(importMatch[1]);

    if (/^export\s/.test(line)) {
      const nameMatch = line.match(
        /export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface)\s+(\w+)/
      );
      if (nameMatch) exports.push(nameMatch[1]);
    }
  }

  return { path: filePath, lines: lines.length, imports, exports };
}

async function main() {
  if (filteredArgs.length === 0) {
    console.error("Error: at least one file or directory path required");
    process.exit(1);
  }

  const targetFiles: string[] = [];
  for (const arg of filteredArgs) {
    const resolved = resolve(arg);
    try {
      const s = await stat(resolved);
      if (s.isDirectory()) {
        targetFiles.push(...(await collectTsFiles(resolved)));
      } else {
        targetFiles.push(resolved);
      }
    } catch {
      console.error(`Warning: path not found: ${arg}`);
    }
  }

  if (targetFiles.length === 0) {
    console.error("Error: no files found at the given paths");
    process.exit(1);
  }

  // Analyze target files
  const fileInfos: FileInfo[] = [];
  for (const f of targetFiles) {
    fileInfos.push(await analyzeFile(f));
  }

  // Find all project files that import from the target files
  const projectRoot = resolve(".");
  let allProjectFiles: string[] = [];
  try {
    allProjectFiles = await collectTsFiles(projectRoot);
  } catch {
    // If we can't scan project, just report on the target files
  }

  const targetBasenames = new Set(
    targetFiles.map((f) => basename(f).replace(/\.(ts|tsx|js|jsx)$/, ""))
  );

  const dependents: string[] = [];
  for (const pf of allProjectFiles) {
    if (targetFiles.includes(pf)) continue;
    const content = await Bun.file(pf).text();
    for (const tb of targetBasenames) {
      if (content.includes(tb)) {
        dependents.push(pf);
        break;
      }
    }
  }

  const totalLines = fileInfos.reduce((s, f) => s + f.lines, 0);
  const totalImports = fileInfos.reduce((s, f) => s + f.imports.length, 0);
  const totalExports = fileInfos.reduce((s, f) => s + f.exports.length, 0);

  const result = {
    targetFiles: targetFiles.map((f) => relative(projectRoot, f)),
    fileCount: targetFiles.length,
    totalLines,
    totalImports,
    totalExports,
    dependentFiles: dependents.map((f) => relative(projectRoot, f)),
    dependentCount: dependents.length,
    blastRadius: targetFiles.length + dependents.length,
    risk:
      dependents.length > 20
        ? "high"
        : dependents.length > 5
          ? "medium"
          : "low",
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Scope Estimate`);
    console.log(`  Target files: ${targetFiles.length}`);
    console.log(`  Total lines: ${totalLines}`);
    console.log(`  Imports: ${totalImports}`);
    console.log(`  Exports: ${totalExports}`);
    console.log(`  Dependent files: ${dependents.length}`);
    console.log(`  Blast radius: ${result.blastRadius} files`);
    console.log(`  Risk: ${result.risk}\n`);

    if (dependents.length > 0) {
      console.log("Files that depend on the target:");
      for (const dep of dependents.slice(0, 20)) {
        console.log(`  ${relative(projectRoot, dep)}`);
      }
      if (dependents.length > 20) {
        console.log(`  ... and ${dependents.length - 20} more`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
