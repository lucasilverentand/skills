const args = Bun.argv.slice(2);

const HELP = `
coverage-gaps — Find modules and functions lacking test coverage

Usage:
  bun run tools/coverage-gaps.ts [source-dir] [options]

Options:
  --tests <dir>    Test directory to scan (default: auto-detect)
  --json           Output as JSON instead of plain text
  --help           Show this help message

Scans source files and cross-references with test files to find
modules and exported functions that have no corresponding tests.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

function getFlag(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--tests")
);

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative, basename } from "node:path";

interface SourceFile {
  path: string;
  exports: string[];
  hasTest: boolean;
  testedExports: string[];
}

async function collectFiles(
  dir: string,
  isTest: boolean
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full, isTest)));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name);
      if (isTest ? isTestFile : !isTestFile) {
        files.push(full);
      }
    }
  }
  return files;
}

function extractExports(content: string): string[] {
  const exports: string[] = [];
  const patterns = [
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    /export\s+(?:const|let|var)\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
  }

  return exports;
}

function findTestedSymbols(content: string): string[] {
  const symbols: string[] = [];

  // Look for import statements to understand what's being tested
  const importRegex = /import\s*\{([^}]+)\}\s*from/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1].split(",").map((n) => n.trim().split(" as ")[0].trim());
    symbols.push(...names);
  }

  // Look for function calls and property accesses in test blocks
  const testBlockRegex = /(?:it|test|describe)\s*\(\s*["'](.+?)["']/g;
  while ((match = testBlockRegex.exec(content)) !== null) {
    // Extract function names mentioned in test descriptions
    const words = match[1].match(/\b[a-zA-Z]\w+\b/g) || [];
    symbols.push(...words);
  }

  return [...new Set(symbols)];
}

async function main() {
  const sourceDir = resolve(filteredArgs[0] || "src");
  const testDir = getFlag("--tests");

  let sourceDirExists = false;
  try {
    await stat(sourceDir);
    sourceDirExists = true;
  } catch {
    // Try common source directories
    for (const alt of ["src", "lib", "app", "packages"]) {
      try {
        await stat(alt);
        break;
      } catch {
        // continue
      }
    }
  }

  if (!sourceDirExists) {
    console.error(`Error: source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const sourceFiles = await collectFiles(sourceDir, false);

  // Find test files — either in test dir or co-located
  const searchDir = testDir ? resolve(testDir) : sourceDir;
  let testFiles: string[];
  try {
    testFiles = await collectFiles(searchDir, true);
    // Also check common test dirs
    for (const extra of ["tests", "test", "__tests__"]) {
      try {
        testFiles.push(...(await collectFiles(resolve(extra), true)));
      } catch {
        // continue
      }
    }
  } catch {
    testFiles = [];
  }

  // Build a map of what's tested
  const testContent = new Map<string, string>();
  for (const tf of testFiles) {
    testContent.set(tf, await Bun.file(tf).text());
  }

  // Match source files to tests
  const results: SourceFile[] = [];
  for (const sf of sourceFiles) {
    const content = await Bun.file(sf).text();
    const exports = extractExports(content);
    const sfBase = basename(sf).replace(/\.(ts|tsx|js|jsx)$/, "");

    // Find matching test file
    const matchingTests = testFiles.filter((tf) => {
      const tfBase = basename(tf)
        .replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, "");
      return tfBase === sfBase;
    });

    const hasTest = matchingTests.length > 0;
    const testedExports: string[] = [];

    if (hasTest) {
      for (const tf of matchingTests) {
        const tContent = testContent.get(tf) || "";
        const tested = findTestedSymbols(tContent);
        for (const exp of exports) {
          if (tested.some((t) => t.toLowerCase() === exp.toLowerCase())) {
            testedExports.push(exp);
          }
        }
      }
    }

    results.push({
      path: relative(resolve("."), sf),
      exports,
      hasTest,
      testedExports,
    });
  }

  const untestedFiles = results.filter((r) => !r.hasTest && r.exports.length > 0);
  const partiallyTested = results.filter(
    (r) => r.hasTest && r.testedExports.length < r.exports.length && r.exports.length > 0
  );
  const totalExports = results.reduce((s, r) => s + r.exports.length, 0);
  const testedExports = results.reduce((s, r) => s + r.testedExports.length, 0);
  const coverage = totalExports > 0 ? Math.round((testedExports / totalExports) * 100) : 100;

  const result = {
    sourceFiles: sourceFiles.length,
    testFiles: testFiles.length,
    totalExports,
    testedExports,
    exportCoverage: coverage,
    untestedFiles: untestedFiles.map((r) => ({
      path: r.path,
      exports: r.exports,
    })),
    partiallyTested: partiallyTested.map((r) => ({
      path: r.path,
      untestedExports: r.exports.filter((e) => !r.testedExports.includes(e)),
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Coverage Gaps: ${sourceFiles.length} source files, ${testFiles.length} test files`);
    console.log(`  Export coverage: ${coverage}% (${testedExports}/${totalExports})\n`);

    if (untestedFiles.length > 0) {
      console.log(`Untested files (${untestedFiles.length}):`);
      for (const f of untestedFiles.slice(0, 15)) {
        console.log(`  ${f.path} (${f.exports.length} exports)`);
        for (const e of f.exports.slice(0, 5)) {
          console.log(`    - ${e}`);
        }
      }
      console.log();
    }

    if (partiallyTested.length > 0) {
      console.log(`Partially tested (${partiallyTested.length}):`);
      for (const f of partiallyTested.slice(0, 10)) {
        const untested = f.exports.filter((e) => !f.testedExports.includes(e));
        console.log(`  ${f.path}`);
        for (const e of untested.slice(0, 5)) {
          console.log(`    - ${e} (not tested)`);
        }
      }
    }

    if (untestedFiles.length === 0 && partiallyTested.length === 0) {
      console.log("All exported functions have corresponding tests.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
