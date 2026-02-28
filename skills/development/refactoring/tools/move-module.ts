const args = Bun.argv.slice(2);

const HELP = `
move-module — Relocate a module and rewrite all dependent imports

Usage:
  bun run tools/move-module.ts <old-path> <new-path> [options]
  bun run tools/move-module.ts --find <path>

Options:
  --find <path>   Preview mode: show all importers without moving
  --json          Output as JSON instead of plain text
  --help          Show this help message

Moves a TypeScript/JavaScript file to a new location and updates all
import statements that reference it across the codebase.
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
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--find")
);

import { readdir, stat, rename, mkdir } from "node:fs/promises";
import { join, resolve, relative, dirname, basename, extname } from "node:path";

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx|js|jsx|mts|mjs)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function getRelativePath(from: string, to: string): string {
  let rel = relative(dirname(from), to);
  // Remove extension for imports
  rel = rel.replace(/\.(ts|tsx|js|jsx|mts|mjs)$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

async function findImporters(
  files: string[],
  targetPath: string
): Promise<{ file: string; line: number; importPath: string }[]> {
  const targetName = basename(targetPath).replace(/\.(ts|tsx|js|jsx|mts|mjs)$/, "");
  const importers: { file: string; line: number; importPath: string }[] = [];

  for (const file of files) {
    if (resolve(file) === resolve(targetPath)) continue;
    const content = await Bun.file(file).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (!importMatch) continue;

      const importPath = importMatch[1];
      if (!importPath.startsWith(".")) continue;

      // Resolve the import to see if it points to our target
      const resolvedImport = resolve(dirname(file), importPath);
      const resolvedTarget = resolve(targetPath).replace(
        /\.(ts|tsx|js|jsx|mts|mjs)$/,
        ""
      );

      if (
        resolvedImport === resolvedTarget ||
        resolvedImport === resolve(targetPath) ||
        resolvedImport + "/index" === resolvedTarget
      ) {
        importers.push({ file, line: i + 1, importPath });
      }
    }
  }

  return importers;
}

async function main() {
  const projectRoot = resolve(".");
  const files = await collectFiles(projectRoot);

  if (findOnly) {
    const importers = await findImporters(files, resolve(findOnly));

    const result = {
      module: findOnly,
      importers: importers.map((imp) => ({
        ...imp,
        file: relative(projectRoot, imp.file),
      })),
      count: importers.length,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Module: ${findOnly}`);
      console.log(`  ${importers.length} files import this module\n`);
      for (const imp of importers) {
        console.log(`  ${relative(projectRoot, imp.file)}:${imp.line}`);
        console.log(`    import from '${imp.importPath}'`);
      }
    }
    return;
  }

  // Move mode
  const oldPath = filteredArgs[0];
  const newPath = filteredArgs[1];

  if (!oldPath || !newPath) {
    console.error("Error: both <old-path> and <new-path> required");
    process.exit(1);
  }

  const resolvedOld = resolve(oldPath);
  const resolvedNew = resolve(newPath);

  try {
    await stat(resolvedOld);
  } catch {
    console.error(`Error: source file not found: ${oldPath}`);
    process.exit(1);
  }

  // Find all importers before moving
  const importers = await findImporters(files, resolvedOld);

  // Create target directory if needed
  await mkdir(dirname(resolvedNew), { recursive: true });

  // Move the file
  await rename(resolvedOld, resolvedNew);

  // Update imports in all files that referenced the old path
  for (const imp of importers) {
    const content = await Bun.file(imp.file).text();
    const newRelPath = getRelativePath(imp.file, resolvedNew);
    const updated = content.replace(
      new RegExp(`(from\\s+['"])${imp.importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"])`, "g"),
      `$1${newRelPath}$2`
    );
    await Bun.write(imp.file, updated);
  }

  // Also update the moved file's own imports (they're relative and the base changed)
  const movedContent = await Bun.file(resolvedNew).text();
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  let updatedContent = movedContent;
  let match;
  while ((match = importRegex.exec(movedContent)) !== null) {
    const oldImport = match[1];
    const resolvedImport = resolve(dirname(resolvedOld), oldImport);
    const newRelImport = getRelativePath(resolvedNew, resolvedImport + extname(resolvedOld));
    updatedContent = updatedContent.replace(
      new RegExp(`(from\\s+['"])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(['"])`, "g"),
      `$1${newRelImport}$2`
    );
  }
  await Bun.write(resolvedNew, updatedContent);

  const result = {
    from: relative(projectRoot, resolvedOld),
    to: relative(projectRoot, resolvedNew),
    importersUpdated: importers.length,
    files: importers.map((i) => relative(projectRoot, i.file)),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Moved: ${result.from} → ${result.to}`);
    console.log(`  Updated ${importers.length} import statements\n`);

    for (const f of result.files) {
      console.log(`  ${f}`);
    }

    console.log("\nRun tests and check for:");
    console.log("  - Barrel file exports (index.ts)");
    console.log("  - Config references (tsconfig paths, build config)");
    console.log("  - Circular dependencies");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
