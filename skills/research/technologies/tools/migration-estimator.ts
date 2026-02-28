const args = Bun.argv.slice(2);

const HELP = `
migration-estimator — Estimate effort to migrate from one library to another

Usage:
  bun run tools/migration-estimator.ts <source-package> <target-package> [options]

Options:
  --root <dir>   Project root to scan (default: cwd)
  --json         Output as JSON instead of plain text
  --help         Show this help message

Scans the codebase for all imports of the source package, categorizes
usage patterns, and estimates migration effort to the target package.
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

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);

interface ImportUsage {
  file: string;
  line: number;
  importedSymbols: string[];
  usageType: "direct" | "re-export" | "type-only" | "dynamic";
}

interface MigrationReport {
  source: string;
  target: string;
  root: string;
  totalFiles: number;
  filesUsingSource: number;
  usages: ImportUsage[];
  importedSymbols: Record<string, number>;
  effortEstimate: "low" | "medium" | "high";
  effortReason: string;
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function findUsages(
  content: string,
  packageName: string,
  filePath: string
): ImportUsage[] {
  const usages: ImportUsage[] = [];
  const lines = content.split("\n");
  const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Standard imports: import { X } from 'package'
    const namedImportRe = new RegExp(
      `import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]`
    );
    const namedMatch = namedImportRe.exec(line);
    if (namedMatch) {
      const symbols = namedMatch[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim());
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: symbols,
        usageType: line.includes("import type") ? "type-only" : "direct",
      });
      continue;
    }

    // Default import: import X from 'package'
    const defaultRe = new RegExp(
      `import\\s+(\\w+)\\s+from\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]`
    );
    const defaultMatch = defaultRe.exec(line);
    if (defaultMatch) {
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: [defaultMatch[1]],
        usageType: line.includes("import type") ? "type-only" : "direct",
      });
      continue;
    }

    // Namespace import: import * as X from 'package'
    const nsRe = new RegExp(
      `import\\s*\\*\\s*as\\s+(\\w+)\\s+from\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]`
    );
    const nsMatch = nsRe.exec(line);
    if (nsMatch) {
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: [`* as ${nsMatch[1]}`],
        usageType: "direct",
      });
      continue;
    }

    // Re-export: export { X } from 'package'
    const reExportRe = new RegExp(
      `export\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]`
    );
    const reExportMatch = reExportRe.exec(line);
    if (reExportMatch) {
      const symbols = reExportMatch[1].split(",").map((s) => s.trim());
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: symbols,
        usageType: "re-export",
      });
      continue;
    }

    // Dynamic import: import('package')
    const dynamicRe = new RegExp(`import\\s*\\(\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]\\s*\\)`);
    if (dynamicRe.test(line)) {
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: ["(dynamic)"],
        usageType: "dynamic",
      });
      continue;
    }

    // require: require('package')
    const requireRe = new RegExp(`require\\s*\\(\\s*['"]${escapedName}(?:\\/[^'"]*)?['"]\\s*\\)`);
    if (requireRe.test(line)) {
      usages.push({
        file: filePath,
        line: i + 1,
        importedSymbols: ["(require)"],
        usageType: "direct",
      });
    }
  }

  return usages;
}

async function main() {
  const source = filteredArgs[0];
  const target = filteredArgs[1];
  if (!source || !target) {
    console.error("Error: provide both source and target package names");
    process.exit(1);
  }

  const root = resolve(rootDir);
  const files = await collectFiles(root);

  const allUsages: ImportUsage[] = [];
  const symbolCounts: Record<string, number> = {};

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const usages = findUsages(content, source, relative(root, file));
    allUsages.push(...usages);

    for (const usage of usages) {
      for (const sym of usage.importedSymbols) {
        symbolCounts[sym] = (symbolCounts[sym] ?? 0) + 1;
      }
    }
  }

  const uniqueFiles = new Set(allUsages.map((u) => u.file));

  // Estimate effort
  let effortEstimate: MigrationReport["effortEstimate"];
  let effortReason: string;

  const fileCount = uniqueFiles.size;
  const hasNamespaceImports = allUsages.some((u) =>
    u.importedSymbols.some((s) => s.startsWith("* as"))
  );
  const hasDynamicImports = allUsages.some((u) => u.usageType === "dynamic");
  const hasReExports = allUsages.some((u) => u.usageType === "re-export");
  const uniqueSymbols = Object.keys(symbolCounts).length;

  if (fileCount <= 3 && uniqueSymbols <= 5 && !hasNamespaceImports) {
    effortEstimate = "low";
    effortReason = `Only ${fileCount} file(s) and ${uniqueSymbols} unique symbol(s) — straightforward find-and-replace`;
  } else if (fileCount <= 15 && !hasNamespaceImports) {
    effortEstimate = "medium";
    effortReason = `${fileCount} files use ${source} with ${uniqueSymbols} unique symbols — requires API mapping`;
  } else {
    effortEstimate = "high";
    const reasons = [`${fileCount} files affected`, `${uniqueSymbols} unique symbols`];
    if (hasNamespaceImports) reasons.push("namespace imports require full API audit");
    if (hasDynamicImports) reasons.push("dynamic imports need special handling");
    if (hasReExports) reasons.push("re-exports propagate the change to consumers");
    effortReason = reasons.join("; ");
  }

  const result: MigrationReport = {
    source,
    target,
    root,
    totalFiles: files.length,
    filesUsingSource: fileCount,
    usages: allUsages,
    importedSymbols: symbolCounts,
    effortEstimate,
    effortReason,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Migration Estimate: ${source} -> ${target}\n`);
  console.log(`Project root: ${root}`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files using ${source}: ${fileCount}`);
  console.log(`Effort estimate: ${effortEstimate.toUpperCase()}`);
  console.log(`Reason: ${effortReason}\n`);

  if (allUsages.length === 0) {
    console.log(`No imports of "${source}" found in the codebase.`);
    return;
  }

  // Symbol usage
  console.log("## Imported Symbols\n");
  const sorted = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1]);
  for (const [sym, count] of sorted) {
    console.log(`  ${sym}: ${count} usage(s)`);
  }

  // File-by-file breakdown
  console.log("\n## Files\n");
  for (const file of [...uniqueFiles].sort()) {
    const fileUsages = allUsages.filter((u) => u.file === file);
    const symbols = fileUsages.flatMap((u) => u.importedSymbols);
    const types = [...new Set(fileUsages.map((u) => u.usageType))];
    console.log(`  ${file}`);
    console.log(`    Symbols: ${symbols.join(", ")}`);
    console.log(`    Types: ${types.join(", ")}`);
  }

  // Migration checklist
  console.log("\n## Migration Checklist\n");
  console.log(`  1. Install ${target}: bun add ${target}`);
  console.log(`  2. Update ${fileCount} file(s) to import from ${target}`);
  if (hasReExports) {
    console.log("  3. Update re-exports — consumers will also need changes");
  }
  if (hasDynamicImports) {
    console.log("  4. Update dynamic imports");
  }
  console.log(`  ${hasReExports || hasDynamicImports ? "5" : "3"}. Remove ${source}: bun remove ${source}`);
  console.log(`  ${hasReExports || hasDynamicImports ? "6" : "4"}. Run tests to verify`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
