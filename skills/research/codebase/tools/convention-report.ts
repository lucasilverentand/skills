const args = Bun.argv.slice(2);

const HELP = `
convention-report — Analyze naming conventions, file structure, and code style

Usage:
  bun run tools/convention-report.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans a codebase directory and reports on file naming patterns,
export styles, error handling patterns, and structural conventions.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname, basename } from "node:path";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);

interface ConventionReport {
  root: string;
  totalFiles: number;
  fileNaming: {
    kebabCase: number;
    camelCase: number;
    PascalCase: number;
    snake_case: number;
    other: number;
    examples: Record<string, string[]>;
  };
  exportStyle: {
    namedExports: number;
    defaultExports: number;
    barrelFiles: number;
  };
  patterns: {
    asyncAwait: number;
    thenCatch: number;
    tryInCatch: number;
    resultTypes: number;
    throwStatements: number;
  };
  structure: {
    maxDepth: number;
    topLevelDirs: string[];
    hasTests: boolean;
    testPattern: string;
    hasBarrelExports: boolean;
  };
}

async function collectFiles(
  dir: string
): Promise<{ path: string; depth: number }[]> {
  const files: { path: string; depth: number }[] = [];

  async function walk(d: string, depth: number) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "dist"
        ) {
          continue;
        }
        await walk(full, depth + 1);
      } else if (EXTENSIONS.has(extname(entry.name))) {
        files.push({ path: full, depth });
      }
    }
  }

  await walk(dir, 0);
  return files;
}

function classifyNaming(name: string): string {
  const stem = name.replace(extname(name), "");
  if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(stem)) return "kebabCase";
  if (/^[A-Z][a-zA-Z0-9]*$/.test(stem)) return "PascalCase";
  if (/^[a-z][a-zA-Z0-9]*$/.test(stem)) return "camelCase";
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(stem)) return "snake_case";
  return "other";
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required directory argument");
    process.exit(1);
  }

  const rootDir = resolve(target);
  const files = await collectFiles(rootDir);

  const report: ConventionReport = {
    root: rootDir,
    totalFiles: files.length,
    fileNaming: {
      kebabCase: 0,
      camelCase: 0,
      PascalCase: 0,
      snake_case: 0,
      other: 0,
      examples: {},
    },
    exportStyle: {
      namedExports: 0,
      defaultExports: 0,
      barrelFiles: 0,
    },
    patterns: {
      asyncAwait: 0,
      thenCatch: 0,
      tryInCatch: 0,
      resultTypes: 0,
      throwStatements: 0,
    },
    structure: {
      maxDepth: 0,
      topLevelDirs: [],
      hasTests: false,
      testPattern: "",
      hasBarrelExports: false,
    },
  };

  // Top-level dirs
  const topEntries = await readdir(rootDir, { withFileTypes: true });
  report.structure.topLevelDirs = topEntries
    .filter(
      (e) =>
        e.isDirectory() &&
        !e.name.startsWith(".") &&
        e.name !== "node_modules" &&
        e.name !== "dist"
    )
    .map((e) => e.name);

  // Analyze each file
  for (const { path: filePath, depth } of files) {
    const name = basename(filePath);
    const rel = relative(rootDir, filePath);
    const content = await readFile(filePath, "utf-8");

    // Max depth
    if (depth > report.structure.maxDepth) {
      report.structure.maxDepth = depth;
    }

    // File naming
    const naming = classifyNaming(name);
    report.fileNaming[naming as keyof typeof report.fileNaming]++;
    if (!report.fileNaming.examples[naming]) {
      report.fileNaming.examples[naming] = [];
    }
    if (report.fileNaming.examples[naming].length < 3) {
      report.fileNaming.examples[naming].push(rel);
    }

    // Export style
    const namedExportCount = (content.match(/export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/g) || []).length;
    const defaultExportCount = (content.match(/export\s+default\s+/g) || []).length;
    report.exportStyle.namedExports += namedExportCount;
    report.exportStyle.defaultExports += defaultExportCount;

    // Barrel file detection (index.ts with mostly re-exports)
    if (name.startsWith("index.")) {
      const reexports = (content.match(/export\s+.*from\s+/g) || []).length;
      if (reexports > 0) {
        report.exportStyle.barrelFiles++;
        report.structure.hasBarrelExports = true;
      }
    }

    // Async patterns
    report.patterns.asyncAwait += (content.match(/\bawait\s+/g) || []).length;
    report.patterns.thenCatch += (content.match(/\.then\s*\(/g) || []).length;
    report.patterns.tryInCatch += (content.match(/try\s*\{/g) || []).length;
    report.patterns.throwStatements += (content.match(/\bthrow\s+/g) || []).length;

    // Result type pattern
    report.patterns.resultTypes += (
      content.match(/\{\s*ok\s*[,:]/g) || []
    ).length;

    // Test detection
    if (
      name.includes(".test.") ||
      name.includes(".spec.") ||
      rel.includes("__tests__")
    ) {
      report.structure.hasTests = true;
      if (name.includes(".test.")) report.structure.testPattern = "*.test.*";
      else if (name.includes(".spec."))
        report.structure.testPattern = "*.spec.*";
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Convention Report: ${rootDir}\n`);
  console.log(`Files scanned: ${files.length}\n`);

  // File naming
  console.log("## File Naming\n");
  const namingEntries = [
    ["kebab-case", report.fileNaming.kebabCase, report.fileNaming.examples.kebabCase],
    ["PascalCase", report.fileNaming.PascalCase, report.fileNaming.examples.PascalCase],
    ["camelCase", report.fileNaming.camelCase, report.fileNaming.examples.camelCase],
    ["snake_case", report.fileNaming.snake_case, report.fileNaming.examples.snake_case],
    ["other", report.fileNaming.other, report.fileNaming.examples.other],
  ].filter(([, count]) => (count as number) > 0);

  const dominant = namingEntries.sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  console.log(`  Dominant pattern: ${dominant[0]} (${dominant[1]} files)\n`);

  for (const [style, count, examples] of namingEntries) {
    const exList = (examples as string[] | undefined) ?? [];
    console.log(`  ${style}: ${count} files (e.g. ${exList.slice(0, 2).join(", ")})`);
  }

  // Export style
  console.log("\n## Export Style\n");
  console.log(`  Named exports: ${report.exportStyle.namedExports}`);
  console.log(`  Default exports: ${report.exportStyle.defaultExports}`);
  console.log(`  Barrel files (index re-exports): ${report.exportStyle.barrelFiles}`);
  const exportPref =
    report.exportStyle.namedExports > report.exportStyle.defaultExports * 2
      ? "Strongly prefers named exports"
      : report.exportStyle.defaultExports > report.exportStyle.namedExports * 2
        ? "Strongly prefers default exports"
        : "Mixed named and default exports";
  console.log(`  Assessment: ${exportPref}`);

  // Error handling
  console.log("\n## Error Handling & Async Patterns\n");
  console.log(`  await usage: ${report.patterns.asyncAwait}`);
  console.log(`  .then() usage: ${report.patterns.thenCatch}`);
  console.log(`  try/catch blocks: ${report.patterns.tryInCatch}`);
  console.log(`  throw statements: ${report.patterns.throwStatements}`);
  console.log(`  Result type ({ ok, ... }) patterns: ${report.patterns.resultTypes}`);

  const asyncPref =
    report.patterns.asyncAwait > report.patterns.thenCatch * 3
      ? "async/await"
      : report.patterns.thenCatch > report.patterns.asyncAwait * 3
        ? ".then() chains"
        : "mixed";
  const errorPref =
    report.patterns.resultTypes > report.patterns.throwStatements
      ? "result types over throwing"
      : "throwing exceptions";
  console.log(`  Async style: ${asyncPref}`);
  console.log(`  Error style: ${errorPref}`);

  // Structure
  console.log("\n## Structure\n");
  console.log(`  Max directory depth: ${report.structure.maxDepth}`);
  console.log(`  Top-level directories: ${report.structure.topLevelDirs.join(", ")}`);
  console.log(`  Has tests: ${report.structure.hasTests ? `yes (${report.structure.testPattern})` : "no"}`);
  console.log(`  Has barrel exports: ${report.structure.hasBarrelExports ? "yes" : "no"}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
