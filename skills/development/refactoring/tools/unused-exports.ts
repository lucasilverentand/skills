const args = Bun.argv.slice(2);

const HELP = `
unused-exports — Find exported symbols with zero imports across the project

Usage:
  bun run tools/unused-exports.ts <project-dir> [options]

Options:
  --ignore <pattern>   Glob pattern for files to exclude (e.g., "**/*.test.ts")
  --json               Output as JSON instead of plain text
  --help               Show this help message

Scans all TypeScript/JavaScript files for exported symbols, then searches the
entire project for imports of those symbols. Reports exports with zero references.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const ignoreIdx = args.indexOf("--ignore");
const ignorePattern = ignoreIdx !== -1 ? args[ignoreIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (ignoreIdx === -1 || i !== ignoreIdx + 1)
);

interface ExportedSymbol {
  name: string;
  file: string;
  line: number;
  type: "named" | "default" | "re-export";
}

interface UnusedExport extends ExportedSymbol {
  importCount: number;
}

async function findExports(filePath: string): Promise<ExportedSymbol[]> {
  const exports: ExportedSymbol[] = [];
  const file = Bun.file(filePath);
  const content = await file.text();
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // export default
    if (/^\s*export\s+default\s+/.test(line)) {
      exports.push({ name: "default", file: filePath, line: lineNum, type: "default" });
      continue;
    }

    // export const/let/var/function/class/type/interface/enum
    const namedMatch = line.match(
      /^\s*export\s+(?:const|let|var|function\*?|class|type|interface|enum|abstract\s+class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
    );
    if (namedMatch) {
      exports.push({ name: namedMatch[1], file: filePath, line: lineNum, type: "named" });
      continue;
    }

    // export { ... }
    const braceMatch = line.match(/^\s*export\s*\{([^}]+)\}/);
    if (braceMatch) {
      const symbols = braceMatch[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop()!.trim());
      for (const sym of symbols) {
        if (sym) {
          exports.push({ name: sym, file: filePath, line: lineNum, type: "re-export" });
        }
      }
      continue;
    }

    // export async function
    const asyncMatch = line.match(/^\s*export\s+async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (asyncMatch) {
      exports.push({ name: asyncMatch[1], file: filePath, line: lineNum, type: "named" });
    }
  }

  return exports;
}

async function countImports(
  symbol: string,
  sourceFile: string,
  allFiles: string[]
): Promise<number> {
  let count = 0;

  for (const file of allFiles) {
    if (file === sourceFile) continue;

    const content = await Bun.file(file).text();

    // Check for named imports: import { symbol } from '...'
    // Also handles: import { other, symbol, another } from '...'
    const importRegex = new RegExp(
      `import\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}\\s*from`,
      "g"
    );
    const matches = content.match(importRegex);
    if (matches) count += matches.length;

    // Check for default import if symbol is 'default'
    if (symbol === "default") {
      const defaultImportRegex = /import\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+from/g;
      const defaultMatches = content.match(defaultImportRegex);
      if (defaultMatches) {
        // Check that at least one default import comes from the source file
        const { basename, dirname } = await import("node:path");
        const sourceBase = basename(sourceFile).replace(/\.[^.]+$/, "");
        if (content.includes(sourceBase)) count += defaultMatches.length;
      }
    }

    // Check for dynamic imports
    const dynamicRegex = new RegExp(`import\\([^)]*\\).*\\.${symbol}\\b`, "g");
    const dynamicMatches = content.match(dynamicRegex);
    if (dynamicMatches) count += dynamicMatches.length;
  }

  return count;
}

async function collectFiles(target: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");
  const files: string[] = [];

  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules")) continue;
    if (path.includes(".d.ts")) continue;
    if (ignorePattern) {
      const ignoreGlob = new Bun.Glob(ignorePattern);
      if (ignoreGlob.match(path)) continue;
    }
    files.push(path);
  }

  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required project directory argument");
    process.exit(1);
  }

  const { resolve } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No TypeScript/JavaScript files found");
    process.exit(1);
  }

  // Gather all exports
  const allExports: ExportedSymbol[] = [];
  for (const file of files) {
    const exports = await findExports(file);
    allExports.push(...exports);
  }

  // Check import counts
  const unused: UnusedExport[] = [];
  for (const exp of allExports) {
    const count = await countImports(exp.name, exp.file, files);
    if (count === 0) {
      unused.push({ ...exp, importCount: 0 });
    }
  }

  // Sort by file
  unused.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          totalExports: allExports.length,
          unusedExports: unused.length,
          unused,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Unused Exports: ${unused.length} of ${allExports.length} exports have zero imports\n`
    );

    if (unused.length === 0) {
      console.log("All exports are imported somewhere.");
    } else {
      let currentFile = "";
      for (const exp of unused) {
        if (exp.file !== currentFile) {
          currentFile = exp.file;
          console.log(`\n${currentFile}:`);
        }
        console.log(
          `  line ${exp.line}: export ${exp.type === "default" ? "default" : `"${exp.name}"`} — zero imports`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
