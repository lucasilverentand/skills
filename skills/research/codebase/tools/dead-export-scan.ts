const args = Bun.argv.slice(2);

const HELP = `
dead-export-scan — Find exported symbols that are never imported elsewhere

Usage:
  bun run tools/dead-export-scan.ts <directory> [options]

Options:
  --ignore <pattern>  Glob pattern of files to ignore (e.g. "*.test.ts")
  --json              Output as JSON instead of plain text
  --help              Show this help message

Scans TypeScript/JavaScript files for exported symbols (named exports,
default exports) and checks whether each is imported by any other file
in the directory tree.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (args[i - 1] !== "--ignore")
);

let ignorePattern = "";
const ignoreIdx = args.indexOf("--ignore");
if (ignoreIdx !== -1 && args[ignoreIdx + 1]) {
  ignorePattern = args[ignoreIdx + 1];
}

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);

// Patterns to extract exported symbol names
const NAMED_EXPORT_RE = /export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/g;
const EXPORT_LIST_RE = /export\s*\{([^}]+)\}/g;
const DEFAULT_EXPORT_RE = /export\s+default\s+(?:async\s+)?(?:function|class)\s+(\w+)/g;
const REEXPORT_RE = /export\s*(?:\{[^}]*\}|\*)\s*from\s+['"][^'"]+['"]/g;

// Patterns to find imports of specific symbols
const IMPORT_NAMED_RE = /import\s*\{([^}]+)\}\s*from\s+['"][^'"]+['"]/g;
const IMPORT_DEFAULT_RE = /import\s+(\w+)\s+from\s+['"][^'"]+['"]/g;

interface ExportInfo {
  file: string;
  symbol: string;
  type: "named" | "default" | "reexport";
}

interface DeadExport {
  file: string;
  symbol: string;
  type: string;
  confidence: "high" | "medium";
  reason: string;
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
        continue;
      }
      files.push(...(await collectFiles(full)));
    } else if (EXTENSIONS.has(extname(entry.name))) {
      if (ignorePattern && new RegExp(ignorePattern.replace(/\*/g, ".*")).test(entry.name)) {
        continue;
      }
      files.push(full);
    }
  }
  return files;
}

function extractExports(content: string, file: string): ExportInfo[] {
  const exports: ExportInfo[] = [];

  // Named exports
  let match;
  NAMED_EXPORT_RE.lastIndex = 0;
  while ((match = NAMED_EXPORT_RE.exec(content)) !== null) {
    exports.push({ file, symbol: match[1], type: "named" });
  }

  // Export lists: export { a, b, c }
  EXPORT_LIST_RE.lastIndex = 0;
  while ((match = EXPORT_LIST_RE.exec(content)) !== null) {
    const symbols = match[1].split(",").map((s) => {
      const parts = s.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const sym of symbols) {
      if (sym && !sym.includes("'") && !sym.includes('"')) {
        exports.push({ file, symbol: sym, type: "named" });
      }
    }
  }

  // Default exports with names
  DEFAULT_EXPORT_RE.lastIndex = 0;
  while ((match = DEFAULT_EXPORT_RE.exec(content)) !== null) {
    exports.push({ file, symbol: match[1], type: "default" });
  }

  return exports;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required directory argument");
    process.exit(1);
  }

  const rootDir = resolve(target);
  const files = await collectFiles(rootDir);

  // Phase 1: Collect all exports
  const allExports: ExportInfo[] = [];
  const fileContents = new Map<string, string>();

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    fileContents.set(file, content);
    const exports = extractExports(content, relative(rootDir, file));
    allExports.push(...exports);
  }

  // Phase 2: Build a set of all imported symbols across all files
  const importedSymbols = new Set<string>();

  for (const content of fileContents.values()) {
    // Named imports
    IMPORT_NAMED_RE.lastIndex = 0;
    let match;
    while ((match = IMPORT_NAMED_RE.exec(content)) !== null) {
      const symbols = match[1].split(",").map((s) => {
        const parts = s.trim().split(/\s+as\s+/);
        return parts[0].trim(); // Use the original name (before 'as')
      });
      for (const sym of symbols) {
        if (sym) importedSymbols.add(sym);
      }
    }

    // Also check for usage by name in the content
    // (catches dynamic references, re-exports, etc.)
  }

  // Phase 3: Cross-reference — find exports with no matching import
  const deadExports: DeadExport[] = [];

  for (const exp of allExports) {
    const isImported = importedSymbols.has(exp.symbol);

    // Also do a broader search: is this symbol name mentioned in any other file?
    let mentionedElsewhere = false;
    const expFullPath = resolve(rootDir, exp.file);
    for (const [file, content] of fileContents) {
      if (file === expFullPath) continue;
      // Word boundary check
      const re = new RegExp(`\\b${exp.symbol}\\b`);
      if (re.test(content)) {
        mentionedElsewhere = true;
        break;
      }
    }

    if (!isImported && !mentionedElsewhere) {
      // Check if file is an entry point (index.ts, main.ts, etc.)
      const isEntryFile =
        exp.file.includes("index.") || exp.file.includes("main.") || exp.file.includes("server.");
      const isTestFile = exp.file.includes(".test.") || exp.file.includes(".spec.");

      deadExports.push({
        file: exp.file,
        symbol: exp.symbol,
        type: exp.type,
        confidence: isEntryFile || isTestFile ? "medium" : "high",
        reason: isEntryFile
          ? "Entry point export — may be used externally"
          : isTestFile
            ? "Test file export — may be intentional"
            : "No import or reference found in any other file",
      });
    }
  }

  // Sort: high confidence first
  deadExports.sort((a, b) => (a.confidence === "high" ? -1 : 1));

  const result = {
    root: rootDir,
    totalFiles: files.length,
    totalExports: allExports.length,
    deadExports,
    deadCount: deadExports.length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Dead Export Scan: ${rootDir}\n`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total exports found: ${allExports.length}`);
  console.log(`Potentially dead exports: ${deadExports.length}\n`);

  if (deadExports.length === 0) {
    console.log("No dead exports found.");
    return;
  }

  const highConf = deadExports.filter((e) => e.confidence === "high");
  const medConf = deadExports.filter((e) => e.confidence === "medium");

  if (highConf.length > 0) {
    console.log(`## High Confidence (${highConf.length})\n`);
    for (const e of highConf) {
      console.log(`  ${e.file}: \`${e.symbol}\` (${e.type})`);
    }
  }

  if (medConf.length > 0) {
    console.log(`\n## Medium Confidence — needs verification (${medConf.length})\n`);
    for (const e of medConf) {
      console.log(`  ${e.file}: \`${e.symbol}\` (${e.type}) — ${e.reason}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
