const args = Bun.argv.slice(2);

const HELP = `
token-audit — Scan for design token deviations and hardcoded values

Usage:
  bun run tools/token-audit.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans TSX/JSX/CSS files for hardcoded color values, arbitrary Tailwind
values, inconsistent spacing, and other design token deviations.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname } from "node:path";

const SCAN_EXTENSIONS = new Set([".tsx", ".jsx", ".css", ".scss", ".ts", ".js"]);

interface TokenDeviation {
  file: string;
  line: number;
  type: "color" | "spacing" | "typography" | "border-radius" | "shadow" | "arbitrary-value";
  value: string;
  context: string;
  severity: "high" | "medium" | "low";
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

const HEX_COLOR_RE = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const RGB_COLOR_RE = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
const HSL_COLOR_RE = /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?/g;

// Tailwind arbitrary values like text-[#3B82F6] or p-[13px]
const ARBITRARY_VALUE_RE = /(?:text|bg|border|ring|shadow|p|m|w|h|gap|space|rounded|font|leading|tracking)-\[([^\]]+)\]/g;

// Hardcoded px values in inline styles
const INLINE_PX_RE = /:\s*(\d+)px/g;

function scanForDeviations(
  content: string,
  file: string,
  root: string
): TokenDeviation[] {
  const deviations: TokenDeviation[] = [];
  const rel = relative(root, file);
  const lines = content.split("\n");
  const isCSS = file.endsWith(".css") || file.endsWith(".scss");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;

    // Hex colors
    HEX_COLOR_RE.lastIndex = 0;
    let match;
    while ((match = HEX_COLOR_RE.exec(line)) !== null) {
      // Skip known Tailwind config or CSS variable declarations
      if (line.includes("--") && line.includes(":")) continue;
      // Skip import statements
      if (line.includes("import ") || line.includes("require(")) continue;

      deviations.push({
        file: rel,
        line: lineNum,
        type: "color",
        value: match[0],
        context: line.trim().slice(0, 100),
        severity: isCSS ? "medium" : "high",
      });
    }

    // RGB/HSL colors in non-CSS files
    if (!isCSS) {
      RGB_COLOR_RE.lastIndex = 0;
      while ((match = RGB_COLOR_RE.exec(line)) !== null) {
        deviations.push({
          file: rel,
          line: lineNum,
          type: "color",
          value: match[0],
          context: line.trim().slice(0, 100),
          severity: "high",
        });
      }
    }

    // Tailwind arbitrary values
    ARBITRARY_VALUE_RE.lastIndex = 0;
    while ((match = ARBITRARY_VALUE_RE.exec(line)) !== null) {
      const value = match[1];
      let type: TokenDeviation["type"] = "arbitrary-value";
      if (value.includes("#") || value.includes("rgb") || value.includes("hsl")) {
        type = "color";
      } else if (value.includes("px") || value.includes("rem") || value.includes("em")) {
        type = "spacing";
      }

      deviations.push({
        file: rel,
        line: lineNum,
        type,
        value: match[0],
        context: line.trim().slice(0, 100),
        severity: type === "color" ? "high" : "medium",
      });
    }
  }

  return deviations;
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const allDeviations: TokenDeviation[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    allDeviations.push(...scanForDeviations(content, file, target));
  }

  // Group by type
  const byType: Record<string, TokenDeviation[]> = {};
  for (const d of allDeviations) {
    (byType[d.type] ??= []).push(d);
  }

  // Count unique values per type
  const uniqueValues: Record<string, Set<string>> = {};
  for (const d of allDeviations) {
    (uniqueValues[d.type] ??= new Set()).add(d.value);
  }

  const result = {
    root: relative(process.cwd(), target),
    filesScanned: files.length,
    totalDeviations: allDeviations.length,
    byType: Object.fromEntries(
      Object.entries(byType).map(([type, devs]) => [
        type,
        { count: devs.length, uniqueValues: [...(uniqueValues[type] ?? [])], deviations: devs },
      ])
    ),
    summary: {
      high: allDeviations.filter((d) => d.severity === "high").length,
      medium: allDeviations.filter((d) => d.severity === "medium").length,
      low: allDeviations.filter((d) => d.severity === "low").length,
    },
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Token Audit: ${result.root}\n`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Total deviations: ${allDeviations.length}\n`);

  console.log("## Summary\n");
  console.log(`  High severity: ${result.summary.high}`);
  console.log(`  Medium severity: ${result.summary.medium}`);
  console.log(`  Low severity: ${result.summary.low}\n`);

  for (const [type, data] of Object.entries(result.byType)) {
    console.log(`## ${type} (${data.count} deviation${data.count !== 1 ? "s" : ""})\n`);
    console.log(`  Unique values: ${data.uniqueValues.slice(0, 20).join(", ")}`);
    if (data.uniqueValues.length > 20) {
      console.log(`  ... and ${data.uniqueValues.length - 20} more`);
    }

    console.log("\n  Locations:");
    for (const d of data.deviations.slice(0, 15)) {
      console.log(`    ${d.file}:${d.line} — ${d.value}`);
      console.log(`      ${d.context}`);
    }
    if (data.deviations.length > 15) {
      console.log(`    ... and ${data.deviations.length - 15} more`);
    }
    console.log();
  }

  console.log("## Recommendations\n");
  if ((byType["color"]?.length ?? 0) > 0) {
    console.log("  - Replace hardcoded hex/rgb colors with Tailwind utility classes or CSS variables");
  }
  if ((byType["arbitrary-value"]?.length ?? 0) > 0) {
    console.log("  - Replace Tailwind arbitrary values with design tokens in tailwind.config");
  }
  if ((byType["spacing"]?.length ?? 0) > 0) {
    console.log("  - Replace custom spacing values with Tailwind spacing scale classes");
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
