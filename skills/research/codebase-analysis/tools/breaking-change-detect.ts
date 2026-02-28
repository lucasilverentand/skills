const args = Bun.argv.slice(2);

const HELP = `
breaking-change-detect — Detect breaking changes in exported APIs

Usage:
  bun run tools/breaking-change-detect.ts <file> [options]

Options:
  --root <dir>   Project root directory (default: cwd)
  --json         Output as JSON instead of plain text
  --help         Show this help message

Analyzes a TypeScript/JavaScript file to extract all exports and their
signatures, then finds every file that imports those exports and checks
for potential breaking changes (removed exports, changed signatures).
Uses git diff to compare current state vs. staged/unstaged changes.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

let rootDir = process.cwd();
const rootIdx = args.indexOf("--root");
if (rootIdx !== -1 && args[rootIdx + 1]) {
  rootDir = args[rootIdx + 1];
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    (rootIdx === -1 || (i !== rootIdx && i !== rootIdx + 1))
);

import { readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { execSync } from "node:child_process";

interface ExportedSymbol {
  name: string;
  kind: string; // function, class, const, type, interface, enum
  signature: string;
}

interface BreakingChange {
  symbol: string;
  changeType: "removed" | "signature_changed" | "type_changed";
  before: string;
  after: string;
  affectedFiles: string[];
}

function extractExports(content: string): ExportedSymbol[] {
  const exports: ExportedSymbol[] = [];

  // Named exports: export function/class/const/type/interface/enum
  const namedRe =
    /export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)([^{]*(?:\{[^}]*\})?)/g;
  let m;
  while ((m = namedRe.exec(content)) !== null) {
    const name = m[1];
    // Determine kind
    const prefix = content.slice(Math.max(0, m.index), m.index + m[0].length);
    let kind = "const";
    if (prefix.includes("function")) kind = "function";
    else if (prefix.includes("class")) kind = "class";
    else if (prefix.includes("type ")) kind = "type";
    else if (prefix.includes("interface")) kind = "interface";
    else if (prefix.includes("enum")) kind = "enum";

    // Extract a simplified signature (first line or up to certain chars)
    const sigStart = m.index;
    let sigEnd = content.indexOf("\n", sigStart);
    if (sigEnd === -1) sigEnd = content.length;
    const signature = content.slice(sigStart, Math.min(sigEnd, sigStart + 200)).trim();

    exports.push({ name, kind, signature });
  }

  return exports;
}

function findImporters(
  symbolName: string,
  targetFile: string,
  root: string
): string[] {
  try {
    const relTarget = relative(root, targetFile);
    // Search for import statements that reference this file and symbol
    const result = execSync(
      `grep -rl --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' '${symbolName}' "${root}" 2>/dev/null || true`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
    );

    return result
      .split("\n")
      .filter((f) => f.trim() && !f.includes("node_modules") && f !== resolve(root, relTarget))
      .map((f) => relative(root, f));
  } catch {
    return [];
  }
}

async function main() {
  const targetFile = resolve(filteredArgs[0]);
  const root = resolve(rootDir);

  // Get current file content
  let currentContent: string;
  try {
    currentContent = await readFile(targetFile, "utf-8");
  } catch {
    console.error(`Error: cannot read file "${filteredArgs[0]}"`);
    process.exit(1);
  }

  // Get previous version from git (HEAD version)
  let previousContent = "";
  const relPath = relative(root, targetFile);
  try {
    previousContent = execSync(`git show HEAD:"${relPath}" 2>/dev/null`, {
      encoding: "utf-8",
      cwd: root,
    });
  } catch {
    // File may be new (no git history)
    previousContent = "";
  }

  const currentExports = extractExports(currentContent);
  const previousExports = extractExports(previousContent);

  const breakingChanges: BreakingChange[] = [];

  // Check for removed exports
  for (const prev of previousExports) {
    const current = currentExports.find((e) => e.name === prev.name);
    if (!current) {
      const affectedFiles = findImporters(prev.name, targetFile, root);
      breakingChanges.push({
        symbol: prev.name,
        changeType: "removed",
        before: prev.signature,
        after: "(removed)",
        affectedFiles,
      });
    }
  }

  // Check for changed signatures
  for (const prev of previousExports) {
    const current = currentExports.find((e) => e.name === prev.name);
    if (current && current.signature !== prev.signature) {
      const affectedFiles = findImporters(prev.name, targetFile, root);

      // Determine if it's a type change or signature change
      const changeType =
        current.kind !== prev.kind ? "type_changed" : "signature_changed";

      breakingChanges.push({
        symbol: prev.name,
        changeType,
        before: prev.signature,
        after: current.signature,
        affectedFiles,
      });
    }
  }

  const result = {
    file: relPath,
    previousExportCount: previousExports.length,
    currentExportCount: currentExports.length,
    breakingChanges,
    newExports: currentExports
      .filter((e) => !previousExports.find((p) => p.name === e.name))
      .map((e) => e.name),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Breaking Change Detection: ${relPath}\n`);
  console.log(`Previous exports: ${previousExports.length}`);
  console.log(`Current exports: ${currentExports.length}\n`);

  if (result.newExports.length > 0) {
    console.log(`## New Exports (${result.newExports.length})\n`);
    for (const name of result.newExports) console.log(`  + ${name}`);
    console.log();
  }

  if (breakingChanges.length === 0) {
    console.log("No breaking changes detected.");
    if (previousContent === "") {
      console.log("(No git history for this file — it may be new)");
    }
    return;
  }

  console.log(`## Breaking Changes (${breakingChanges.length})\n`);

  for (const bc of breakingChanges) {
    console.log(`### ${bc.symbol} — ${bc.changeType}\n`);
    console.log(`  Before: ${bc.before}`);
    console.log(`  After:  ${bc.after}`);
    if (bc.affectedFiles.length > 0) {
      console.log(`  Affected files (${bc.affectedFiles.length}):`);
      for (const f of bc.affectedFiles.slice(0, 20)) {
        console.log(`    - ${f}`);
      }
      if (bc.affectedFiles.length > 20) {
        console.log(`    ... and ${bc.affectedFiles.length - 20} more`);
      }
    } else {
      console.log("  No files found importing this symbol.");
    }
    console.log();
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
