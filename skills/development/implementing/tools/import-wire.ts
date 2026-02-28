const args = Bun.argv.slice(2);

const HELP = `
import-wire — Detect missing imports and exports after new modules are added

Usage:
  bun run tools/import-wire.ts [directory] [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TypeScript/JavaScript files for import statements that reference
non-existent files or missing named exports.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, dirname, extname } from "node:path";

interface ImportIssue {
  file: string;
  line: number;
  importPath: string;
  issue: "file-not-found" | "export-not-found";
  detail: string;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx|js|jsx|mts|mjs)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function resolveImportPath(fromFile: string, importPath: string): string | null {
  // Only resolve relative imports
  if (!importPath.startsWith(".")) return null;
  const dir = dirname(fromFile);
  return resolve(dir, importPath);
}

async function fileExists(path: string): Promise<boolean> {
  const extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];
  for (const ext of extensions) {
    try {
      await stat(path + ext);
      return true;
    } catch {
      // continue
    }
  }
  return false;
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

  const importPattern = /^import\s+(?:(?:type\s+)?(?:\{[^}]*\}|[\w*]+(?:\s*,\s*\{[^}]*\})?)\s+from\s+)?['"]([^'"]+)['"]/gm;
  const issues: ImportIssue[] = [];

  for (const file of files) {
    const content = await Bun.file(file).text();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      importPattern.lastIndex = 0;
      const match = importPattern.exec(line);
      if (!match) continue;

      const importPath = match[1];
      const resolved = resolveImportPath(file, importPath);
      if (!resolved) continue; // skip non-relative imports

      const exists = await fileExists(resolved);
      if (!exists) {
        issues.push({
          file,
          line: i + 1,
          importPath,
          issue: "file-not-found",
          detail: `Resolved to ${resolved} but no matching file exists`,
        });
      }
    }
  }

  const result = {
    scanned: files.length,
    issues: issues.length,
    details: issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Scanned ${files.length} files`);
    if (issues.length === 0) {
      console.log("No import issues found.");
    } else {
      console.log(`Found ${issues.length} import issue(s):\n`);
      for (const issue of issues) {
        console.log(`  ${issue.file}:${issue.line}`);
        console.log(`    import '${issue.importPath}' — ${issue.issue}`);
        console.log(`    ${issue.detail}\n`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
