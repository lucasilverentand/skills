const args = Bun.argv.slice(2);

const HELP = `
type-coverage — Measure the percentage of typed vs untyped symbols per module

Usage:
  bun run tools/type-coverage.ts <path> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TypeScript files and reports the ratio of explicitly typed symbols
to untyped or 'any'-typed symbols.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";

interface FileCoverage {
  file: string;
  typed: number;
  untyped: number;
  anyCount: number;
  coverage: number;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "build"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

async function analyzeCoverage(filePath: string): Promise<FileCoverage> {
  const content = await Bun.file(filePath).text();
  const lines = content.split("\n");

  let typed = 0;
  let untyped = 0;
  let anyCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || !trimmed) continue;

    // Count variable declarations
    const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*([=:])/);
    if (varMatch) {
      if (varMatch[2] === ":") {
        // Has type annotation
        if (/:\s*any\b/.test(trimmed)) {
          anyCount++;
          untyped++;
        } else {
          typed++;
        }
      } else {
        // No explicit type (may be inferred)
        // Count as typed if it has an obvious literal or constructor
        if (/=\s*(?:new\s|\{|\[|"|'|`|\d|true|false|null)/.test(trimmed)) {
          typed++; // TypeScript infers these
        } else {
          untyped++;
        }
      }
    }

    // Count function parameters
    const paramMatch = trimmed.match(/(?:function|\()\s*([^)]*)\)/);
    if (paramMatch) {
      const params = paramMatch[1].split(",").filter((p) => p.trim());
      for (const param of params) {
        if (param.includes(":")) {
          if (/:\s*any\b/.test(param)) {
            anyCount++;
            untyped++;
          } else {
            typed++;
          }
        } else if (param.trim() && !param.trim().startsWith("...")) {
          untyped++;
        }
      }
    }

    // Count function return types
    const returnMatch = trimmed.match(/\)\s*:\s*(\w+)/);
    if (returnMatch) {
      if (returnMatch[1] === "any") {
        anyCount++;
        untyped++;
      } else {
        typed++;
      }
    }

    // Count 'as any' casts
    const castCount = (trimmed.match(/as\s+any\b/g) || []).length;
    anyCount += castCount;
    untyped += castCount;
  }

  const total = typed + untyped;
  const coverage = total > 0 ? Math.round((typed / total) * 100) : 100;

  return { file: filePath, typed, untyped, anyCount, coverage };
}

async function main() {
  const target = resolve(filteredArgs[0]);
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

  const results: FileCoverage[] = [];
  for (const file of files) {
    results.push(await analyzeCoverage(file));
  }

  // Sort by coverage (worst first)
  results.sort((a, b) => a.coverage - b.coverage);

  const totalTyped = results.reduce((s, r) => s + r.typed, 0);
  const totalUntyped = results.reduce((s, r) => s + r.untyped, 0);
  const totalAny = results.reduce((s, r) => s + r.anyCount, 0);
  const total = totalTyped + totalUntyped;
  const overallCoverage = total > 0 ? Math.round((totalTyped / total) * 100) : 100;

  const root = resolve(".");

  const result = {
    scanned: files.length,
    overallCoverage,
    totalSymbols: total,
    typed: totalTyped,
    untyped: totalUntyped,
    anyUsages: totalAny,
    files: results.map((r) => ({
      ...r,
      file: relative(root, r.file),
    })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Type Coverage: ${files.length} files`);
    console.log(`  Overall: ${overallCoverage}% (${totalTyped}/${total} symbols typed)`);
    console.log(`  'any' usages: ${totalAny}\n`);

    if (results.length > 0) {
      const worstFiles = results.filter((r) => r.coverage < 100);
      if (worstFiles.length > 0) {
        console.log("Files needing attention (lowest coverage first):");
        for (const r of worstFiles.slice(0, 15)) {
          const bar = "=".repeat(Math.round(r.coverage / 10));
          const empty = "-".repeat(10 - Math.round(r.coverage / 10));
          console.log(
            `  [${bar}${empty}] ${r.coverage}%  ${relative(root, r.file)}`
          );
          if (r.anyCount > 0) {
            console.log(`    ${r.anyCount} 'any' usage(s)`);
          }
        }
      } else {
        console.log("All files have 100% type coverage.");
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
