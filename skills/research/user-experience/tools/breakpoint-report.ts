const args = Bun.argv.slice(2);

const HELP = `
breakpoint-report — Analyze responsive breakpoint usage across layout files

Usage:
  bun run tools/breakpoint-report.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TSX/JSX files for Tailwind responsive prefix usage (sm:, md:, lg:,
xl:, 2xl:) and CSS media queries. Reports coverage per breakpoint and
identifies files with missing responsive handling.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const SCAN_EXTENSIONS = new Set([".tsx", ".jsx", ".css", ".scss"]);
const TAILWIND_BREAKPOINTS = ["sm", "md", "lg", "xl", "2xl"];

interface FileBreakpointUsage {
  file: string;
  breakpoints: Record<string, number>;
  totalResponsiveClasses: number;
  totalClasses: number;
  responsiveRatio: number;
  hasMediaQueries: boolean;
  issues: string[];
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (SCAN_EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function analyzeFile(content: string, file: string, root: string): FileBreakpointUsage {
  const rel = relative(root, file);
  const breakpoints: Record<string, number> = {};

  for (const bp of TAILWIND_BREAKPOINTS) {
    breakpoints[bp] = 0;
  }

  // Count Tailwind responsive prefixes
  let totalResponsiveClasses = 0;
  for (const bp of TAILWIND_BREAKPOINTS) {
    const re = new RegExp(`\\b${bp.replace("2xl", "2xl")}:`, "g");
    const matches = content.match(re) ?? [];
    breakpoints[bp] = matches.length;
    totalResponsiveClasses += matches.length;
  }

  // Count total Tailwind-like class usage (rough estimate)
  const classNameMatches = content.match(/className\s*=\s*["'`{]/g) ?? [];
  const totalClasses = classNameMatches.length;

  // Check for CSS media queries
  const hasMediaQueries = /@media\s*\(/.test(content);

  // Detect issues
  const issues: string[] = [];

  if (totalClasses > 3 && totalResponsiveClasses === 0 && !hasMediaQueries) {
    issues.push("No responsive classes or media queries found despite having layout classes");
  }

  // Check for fixed widths
  if (/\bw-\[\d+px\]|\bwidth:\s*\d+px/i.test(content)) {
    issues.push("Fixed pixel widths detected — may overflow on small screens");
  }

  // Check for sm: without md: or lg:
  if (breakpoints["sm"] > 0 && breakpoints["md"] === 0 && breakpoints["lg"] === 0) {
    issues.push("Has sm: breakpoint but no md: or lg: — may look wrong on larger screens");
  }

  // Check for large screens without small screen handling
  if (breakpoints["lg"] > 0 && breakpoints["sm"] === 0 && breakpoints["md"] === 0) {
    issues.push("Has lg: breakpoint but no sm: or md: — not mobile-first");
  }

  const responsiveRatio =
    totalClasses > 0 ? totalResponsiveClasses / totalClasses : 0;

  return {
    file: rel,
    breakpoints,
    totalResponsiveClasses,
    totalClasses,
    responsiveRatio: Math.round(responsiveRatio * 100) / 100,
    hasMediaQueries,
    issues,
  };
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const results: FileBreakpointUsage[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const analysis = analyzeFile(content, file, target);
    // Only include files that have some layout classes
    if (analysis.totalClasses > 0 || analysis.hasMediaQueries) {
      results.push(analysis);
    }
  }

  // Aggregate breakpoint usage
  const totals: Record<string, number> = {};
  for (const bp of TAILWIND_BREAKPOINTS) {
    totals[bp] = results.reduce((sum, r) => sum + r.breakpoints[bp], 0);
  }

  const filesWithIssues = results.filter((r) => r.issues.length > 0);
  const filesWithNoResponsive = results.filter(
    (r) => r.totalResponsiveClasses === 0 && !r.hasMediaQueries && r.totalClasses > 3
  );

  const result = {
    root: relative(process.cwd(), target),
    filesScanned: files.length,
    filesWithLayout: results.length,
    breakpointTotals: totals,
    filesWithIssues: filesWithIssues.length,
    filesWithNoResponsive: filesWithNoResponsive.length,
    files: results,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Responsive Breakpoint Report: ${result.root}\n`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files with layout classes: ${results.length}`);
  console.log(`Files with issues: ${filesWithIssues.length}`);
  console.log(`Files with no responsive handling: ${filesWithNoResponsive.length}\n`);

  // Breakpoint coverage
  console.log("## Breakpoint Usage\n");
  console.log("  | Breakpoint | Min Width | Total Uses |");
  console.log("  | --- | --- | --- |");
  const minWidths: Record<string, string> = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };
  for (const bp of TAILWIND_BREAKPOINTS) {
    const bar = totals[bp] > 0 ? " ".repeat(0) + "#".repeat(Math.min(20, Math.round(totals[bp] / 5))) : "-";
    console.log(`  | ${bp}: | ${minWidths[bp]} | ${totals[bp]} ${bar} |`);
  }

  // Issues
  if (filesWithIssues.length > 0) {
    console.log("\n## Issues\n");
    for (const f of filesWithIssues) {
      console.log(`  ${f.file}`);
      for (const issue of f.issues) {
        console.log(`    - ${issue}`);
      }
    }
  }

  // Files with no responsive handling
  if (filesWithNoResponsive.length > 0) {
    console.log(`\n## Files Without Responsive Handling (${filesWithNoResponsive.length})\n`);
    for (const f of filesWithNoResponsive.slice(0, 20)) {
      console.log(`  ${f.file} (${f.totalClasses} class names)`);
    }
    if (filesWithNoResponsive.length > 20) {
      console.log(`  ... and ${filesWithNoResponsive.length - 20} more`);
    }
  }

  // Top responsive files
  const topResponsive = results
    .filter((r) => r.totalResponsiveClasses > 0)
    .sort((a, b) => b.totalResponsiveClasses - a.totalResponsiveClasses)
    .slice(0, 10);

  if (topResponsive.length > 0) {
    console.log("\n## Most Responsive Files\n");
    for (const f of topResponsive) {
      const bps = TAILWIND_BREAKPOINTS.filter((bp) => f.breakpoints[bp] > 0)
        .map((bp) => `${bp}:${f.breakpoints[bp]}`)
        .join(", ");
      console.log(`  ${f.file} — ${f.totalResponsiveClasses} responsive classes (${bps})`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
