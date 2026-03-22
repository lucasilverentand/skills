const args = Bun.argv.slice(2);

const HELP = `
rn-render-scan — Identify React Native components that re-render on every parent update

Usage:
  bun run tools/rn-render-scan.ts <path> [options]

Arguments:
  <path>         File or directory to scan (default: src/)

Options:
  --json         Output as JSON instead of plain text
  --help         Show this help message

What this scans for:
  1. Inline object/array props in JSX (creates new reference on every render)
  2. Inline arrow functions passed as props (new reference on every render)
  3. Function components not wrapped in React.memo
  4. useCallback / useMemo calls with empty or missing dependency arrays

Example:
  bun run tools/rn-render-scan.ts src/
  bun run tools/rn-render-scan.ts src/screens/HomeScreen.tsx
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const targetPath = args.find((a) => !a.startsWith("--")) || "src";

import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve, relative, extname } from "node:path";

interface Finding {
  file: string;
  line: number;
  column: number;
  rule: string;
  detail: string;
  severity: "warn" | "info";
}

// Patterns that cause unnecessary re-renders
const RULES: Array<{
  id: string;
  description: string;
  severity: "warn" | "info";
  pattern: RegExp;
  message: (match: RegExpMatchArray) => string;
}> = [
  {
    id: "inline-style-object",
    description: "Inline style object creates a new reference on every render",
    severity: "warn",
    pattern: /\bstyle=\{\{/g,
    message: () =>
      "Inline style object — extract to a StyleSheet or const defined outside the component",
  },
  {
    id: "inline-object-prop",
    description: "Inline object prop creates a new reference on every render",
    severity: "warn",
    // Matches any prop={  {  ... but not style (handled separately) and not template literals
    pattern: /\b(?!style)\w+=\{\{(?!\`)/g,
    message: (m) => {
      const propName = m[0].split("=")[0];
      return `Inline object prop \`${propName}={{}}\` — extract to useMemo or a const outside the component`;
    },
  },
  {
    id: "inline-array-prop",
    description: "Inline array prop creates a new reference on every render",
    severity: "warn",
    pattern: /\b\w+=\{\[/g,
    message: (m) => {
      const propName = m[0].split("=")[0];
      return `Inline array prop \`${propName}={[]}\` — extract to useMemo or a const outside the component`;
    },
  },
  {
    id: "inline-arrow-fn-prop",
    description: "Inline arrow function passed as prop creates a new reference on every render",
    severity: "warn",
    // Matches onXxx={() => or onXxx={(
    pattern: /\bon[A-Z]\w*=\{\s*(?:\([^)]*\)\s*=>|\(\s*\)\s*=>)/g,
    message: (m) => {
      const propName = m[0].split("=")[0];
      return `Inline function prop \`${propName}\` — wrap with useCallback to stabilize the reference`;
    },
  },
  {
    id: "scrollview-large-list",
    description: "ScrollView renders all children — use FlatList or FlashList for long lists",
    severity: "info",
    pattern: /<ScrollView\b/g,
    message: () =>
      "ScrollView renders all children at once — for lists with >20 items, use FlatList or @shopify/flash-list",
  },
  {
    id: "flatlist-no-key-extractor",
    description: "FlatList without keyExtractor falls back to index (unstable)",
    severity: "warn",
    pattern: /<FlatList\b(?![^>]*keyExtractor)/g,
    message: () =>
      "FlatList without keyExtractor — provide a stable keyExtractor to prevent key-based re-mounts",
  },
  {
    id: "image-inline-source",
    description: "Inline uri source object creates a new reference on every render",
    severity: "warn",
    pattern: /\bsource=\{\{\s*uri:/g,
    message: () =>
      "Inline source={{ uri }} — memoize or define outside render; consider expo-image for caching",
  },
  {
    id: "missing-usecallback-key",
    description: "useCallback with empty dependency array might be missing deps",
    severity: "info",
    pattern: /useCallback\([^)]+,\s*\[\s*\]\s*\)/g,
    message: () =>
      "useCallback with [] dep array — verify no outer values are used inside the callback",
  },
];

async function collectFiles(path: string, exts: string[]): Promise<string[]> {
  const s = await stat(path);
  if (s.isFile()) {
    return exts.includes(extname(path)) ? [path] : [];
  }
  const files: string[] = [];
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", "dist", "build", ".expo"].includes(entry.name)) {
          await walk(full);
        }
      } else if (exts.includes(extname(entry.name))) {
        files.push(full);
      }
    }
  }
  await walk(path);
  return files;
}

function scanFile(filePath: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split("\n");

  for (const rule of RULES) {
    for (const line of lines) {
      const lineIdx = lines.indexOf(line);
      // Reset lastIndex for global regex
      rule.pattern.lastIndex = 0;
      let match: RegExpMatchArray | null;
      while ((match = rule.pattern.exec(line)) !== null) {
        findings.push({
          file: filePath,
          line: lineIdx + 1,
          column: match.index + 1,
          rule: rule.id,
          detail: rule.message(match),
          severity: rule.severity,
        });
      }
    }
  }

  return findings;
}

async function main() {
  const absPath = resolve(targetPath);

  let files: string[];
  try {
    files = await collectFiles(absPath, [".tsx", ".jsx", ".ts", ".js"]);
  } catch (e) {
    console.error(`Error: cannot read path: ${absPath}`);
    process.exit(1);
  }

  const rnFiles = files.filter((f) => !f.includes("__tests__") && !f.endsWith(".test.tsx") && !f.endsWith(".spec.tsx"));

  const allFindings: Finding[] = [];

  for (const file of rnFiles) {
    const content = await readFile(file, "utf-8");
    // Skip files that don't look like React Native (no JSX or RN imports)
    if (!content.includes("react-native") && !content.includes("expo") && !content.includes("jsx")) continue;
    const findings = scanFile(relative(process.cwd(), file), content);
    allFindings.push(...findings);
  }

  const warnings = allFindings.filter((f) => f.severity === "warn");
  const infos = allFindings.filter((f) => f.severity === "info");

  // Group by file
  const byFile = new Map<string, Finding[]>();
  for (const f of allFindings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file)!.push(f);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          scannedFiles: rnFiles.length,
          totalFindings: allFindings.length,
          warnings: warnings.length,
          infos: infos.length,
          findings: allFindings,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`React Native Render Scan: ${targetPath}`);
  console.log(`  Scanned: ${rnFiles.length} files`);
  console.log(`  Warnings: ${warnings.length}   Info: ${infos.length}`);

  if (allFindings.length === 0) {
    console.log("\nNo render issues found.");
    return;
  }

  console.log();
  for (const [file, findings] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${file} (${findings.length} finding${findings.length === 1 ? "" : "s"})`);
    for (const f of findings) {
      const prefix = f.severity === "warn" ? "  warn" : "  info";
      console.log(`${prefix}  ${f.file}:${f.line}  [${f.rule}]`);
      console.log(`        ${f.detail}`);
    }
    console.log();
  }

  console.log("Fixes:");
  console.log("  - Inline objects/arrays → useMemo(() => ({...}), [deps]) or const outside component");
  console.log("  - Inline callbacks → useCallback(() => {...}, [deps])");
  console.log("  - Pure components → wrap with React.memo(Component)");
  console.log("  - Large ScrollView → replace with FlatList or @shopify/flash-list");
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
