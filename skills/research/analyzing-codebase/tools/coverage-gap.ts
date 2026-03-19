const args = Bun.argv.slice(2);

const HELP = `
coverage-gap — Find test coverage gaps for specific files

Usage:
  bun run tools/coverage-gap.ts <file1> [file2...] [options]

Options:
  --root <dir>   Project root directory (default: cwd)
  --json         Output as JSON instead of plain text
  --help         Show this help message

For each specified file, checks whether corresponding test files exist,
scans for test references, and reports coverage gaps. Does not run tests —
it performs static analysis of test file presence and coverage patterns.
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

import { readFile, stat, readdir } from "node:fs/promises";
import { resolve, relative, dirname, basename, extname, join } from "node:path";

interface FileCoverage {
  file: string;
  testFiles: string[];
  hasDirectTest: boolean;
  testReferences: number;
  exportedFunctions: string[];
  testedFunctions: string[];
  untestedFunctions: string[];
  classification: "adequate" | "partial" | "critical";
  reason: string;
}

async function findTestFiles(
  filePath: string,
  root: string
): Promise<string[]> {
  const dir = dirname(filePath);
  const name = basename(filePath, extname(filePath));
  const testFiles: string[] = [];

  // Check common test file patterns
  const patterns = [
    join(dir, `${name}.test${extname(filePath)}`),
    join(dir, `${name}.spec${extname(filePath)}`),
    join(dir, `${name}.test.ts`),
    join(dir, `${name}.spec.ts`),
    join(dir, `${name}.test.tsx`),
    join(dir, `${name}.spec.tsx`),
    join(dir, "__tests__", `${name}.test.ts`),
    join(dir, "__tests__", `${name}.spec.ts`),
    join(dir, "__tests__", `${name}.test.tsx`),
    join(dir, "__tests__", `${name}.test${extname(filePath)}`),
  ];

  // Also check a top-level test directory mirroring the structure
  const relDir = relative(root, dir);
  const testDirPatterns = [
    join(root, "test", relDir, `${name}.test.ts`),
    join(root, "tests", relDir, `${name}.test.ts`),
    join(root, "test", relDir, `${name}.spec.ts`),
    join(root, "tests", relDir, `${name}.spec.ts`),
  ];

  for (const p of [...patterns, ...testDirPatterns]) {
    const s = await stat(p).catch(() => null);
    if (s?.isFile()) {
      testFiles.push(relative(root, p));
    }
  }

  return testFiles;
}

function extractFunctionNames(content: string): string[] {
  const functions: string[] = [];
  // Exported functions
  const funcRe = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let m;
  while ((m = funcRe.exec(content)) !== null) functions.push(m[1]);

  // Exported const arrow functions
  const constRe = /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
  while ((m = constRe.exec(content)) !== null) functions.push(m[1]);

  return functions;
}

function findTestedFunctions(
  testContent: string,
  functionNames: string[]
): string[] {
  const tested: string[] = [];
  for (const name of functionNames) {
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(testContent)) {
      tested.push(name);
    }
  }
  return tested;
}

async function main() {
  if (filteredArgs.length === 0) {
    console.error("Error: provide at least one file to check");
    process.exit(1);
  }

  const root = resolve(rootDir);
  const results: FileCoverage[] = [];

  for (const arg of filteredArgs) {
    const filePath = resolve(arg);
    const rel = relative(root, filePath);

    // Skip test files themselves
    if (
      rel.includes(".test.") ||
      rel.includes(".spec.") ||
      rel.includes("__tests__")
    ) {
      continue;
    }

    let content: string;
    try {
      content = await readFile(filePath, "utf-8");
    } catch {
      results.push({
        file: rel,
        testFiles: [],
        hasDirectTest: false,
        testReferences: 0,
        exportedFunctions: [],
        testedFunctions: [],
        untestedFunctions: [],
        classification: "critical",
        reason: "File not found",
      });
      continue;
    }

    const testFiles = await findTestFiles(filePath, root);
    const exportedFunctions = extractFunctionNames(content);

    // Read test files and check which functions are tested
    let allTestContent = "";
    for (const tf of testFiles) {
      try {
        allTestContent += await readFile(join(root, tf), "utf-8");
      } catch {
        // Test file couldn't be read
      }
    }

    const testedFunctions = findTestedFunctions(
      allTestContent,
      exportedFunctions
    );
    const untestedFunctions = exportedFunctions.filter(
      (f) => !testedFunctions.includes(f)
    );

    // Count references in any test file
    let testReferences = 0;
    if (allTestContent) {
      const fileNameNoExt = basename(filePath, extname(filePath));
      const re = new RegExp(`\\b${fileNameNoExt}\\b`, "g");
      testReferences = (allTestContent.match(re) || []).length;
    }

    // Classify
    let classification: FileCoverage["classification"];
    let reason: string;

    if (testFiles.length === 0) {
      classification = "critical";
      reason = "No test file found";
    } else if (untestedFunctions.length === 0 && exportedFunctions.length > 0) {
      classification = "adequate";
      reason = "All exported functions appear in tests";
    } else if (testedFunctions.length > 0) {
      classification = "partial";
      reason = `${untestedFunctions.length} of ${exportedFunctions.length} exported functions not found in tests`;
    } else if (exportedFunctions.length === 0) {
      classification = testFiles.length > 0 ? "adequate" : "critical";
      reason =
        testFiles.length > 0
          ? "Test file exists but no exported functions to check"
          : "No exports and no tests";
    } else {
      classification = "critical";
      reason = "Test file exists but none of the exported functions appear in it";
    }

    results.push({
      file: rel,
      testFiles,
      hasDirectTest: testFiles.length > 0,
      testReferences,
      exportedFunctions,
      testedFunctions,
      untestedFunctions,
      classification,
      reason,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Human-readable
  console.log("# Coverage Gap Assessment\n");

  const critical = results.filter((r) => r.classification === "critical");
  const partial = results.filter((r) => r.classification === "partial");
  const adequate = results.filter((r) => r.classification === "adequate");

  console.log(`Files checked: ${results.length}`);
  console.log(`Critical gaps: ${critical.length}`);
  console.log(`Partial coverage: ${partial.length}`);
  console.log(`Adequate coverage: ${adequate.length}\n`);

  if (critical.length > 0) {
    console.log("## Critical — write tests before changing\n");
    for (const r of critical) {
      console.log(`  ${r.file}`);
      console.log(`    Reason: ${r.reason}`);
      if (r.exportedFunctions.length > 0) {
        console.log(`    Untested: ${r.untestedFunctions.join(", ")}`);
      }
    }
    console.log();
  }

  if (partial.length > 0) {
    console.log("## Partial — add targeted tests\n");
    for (const r of partial) {
      console.log(`  ${r.file}`);
      console.log(`    Test files: ${r.testFiles.join(", ")}`);
      console.log(`    Untested functions: ${r.untestedFunctions.join(", ")}`);
    }
    console.log();
  }

  if (adequate.length > 0) {
    console.log("## Adequate — existing tests cover exports\n");
    for (const r of adequate) {
      console.log(`  ${r.file} — ${r.testFiles.join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
