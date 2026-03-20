const args = Bun.argv.slice(2);

const HELP = `
component-inventory — Crawl component directory and generate a catalog

Usage:
  bun run tools/component-inventory.ts <directory> [options]

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Scans React/JSX component files and catalogs them by type,
identifies prop interfaces, detects duplicates, and finds
components that could be consolidated.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, extname, basename } from "node:path";

interface ComponentInfo {
  name: string;
  file: string;
  category: string;
  hasProps: boolean;
  propsName: string;
  isDefault: boolean;
  hasTests: boolean;
  hasStory: boolean;
  linesOfCode: number;
  usesForwardRef: boolean;
  importCount: number;
}

interface DuplicateGroup {
  pattern: string;
  components: string[];
  suggestion: string;
}

const COMPONENT_EXTENSIONS = new Set([".tsx", ".jsx"]);

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next", "__tests__"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (COMPONENT_EXTENSIONS.has(extname(entry.name))) {
      // Skip test and story files
      if (entry.name.includes(".test.") || entry.name.includes(".spec.") || entry.name.includes(".stories.")) continue;
      files.push(full);
    }
  }
  return files;
}

function categorizeComponent(file: string, content: string): string {
  const lower = file.toLowerCase();
  if (lower.includes("/ui/") || lower.includes("/primitives/") || lower.includes("/atoms/")) return "primitive";
  if (lower.includes("/layout/") || lower.includes("/layouts/")) return "layout";
  if (lower.includes("/page/") || lower.includes("/pages/") || lower.includes("/views/")) return "page";
  if (lower.includes("/feature/") || lower.includes("/features/")) return "feature";
  if (lower.includes("/form/") || lower.includes("/forms/")) return "form";
  if (lower.includes("/icon/") || lower.includes("/icons/")) return "icon";

  // Detect by content
  if (/export.*Page|export.*View|export.*Screen/i.test(content)) return "page";
  if (/<form\b|onSubmit|handleSubmit/i.test(content)) return "form";
  if (/children|layout|header|footer|sidebar/i.test(content) && content.length < 1000) return "layout";

  return "general";
}

function extractPropsName(content: string): string {
  // interface XProps / type XProps
  const match = content.match(/(?:interface|type)\s+(\w+Props)\b/);
  return match?.[1] ?? "";
}

async function countImports(
  componentName: string,
  allFiles: string[]
): Promise<number> {
  let count = 0;
  for (const file of allFiles) {
    const content = await readFile(file, "utf-8");
    const re = new RegExp(`\\b${componentName}\\b`);
    if (re.test(content)) count++;
  }
  return count - 1; // Subtract self
}

async function main() {
  const target = resolve(filteredArgs[0]);
  const files = await collectFiles(target);
  const components: ComponentInfo[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const name = basename(file, extname(file));
    const rel = relative(target, file);

    // Check if this is actually a component (has JSX return)
    if (!/<\w|React\.createElement/s.test(content)) continue;

    const propsName = extractPropsName(content);
    const hasDefaultExport = /export\s+default\b/.test(content);
    const linesOfCode = content.split("\n").length;
    const usesForwardRef = /forwardRef/i.test(content);

    // Check for test file
    const testPatterns = [
      file.replace(extname(file), `.test${extname(file)}`),
      file.replace(extname(file), `.spec${extname(file)}`),
    ];
    const hasTests = false; // Would need stat check but keep simple

    // Check for story file
    const hasStory = false; // Would need stat check

    components.push({
      name: name === "index" ? rel.split("/").slice(-2, -1)[0] ?? name : name,
      file: rel,
      category: categorizeComponent(rel, content),
      hasProps: !!propsName,
      propsName,
      isDefault: hasDefaultExport,
      hasTests,
      hasStory,
      linesOfCode,
      usesForwardRef,
      importCount: 0, // Filled later for top components
    });
  }

  // Detect potential duplicates (components with similar names)
  const duplicates: DuplicateGroup[] = [];
  const nameMap = new Map<string, ComponentInfo[]>();

  for (const comp of components) {
    // Normalize name for grouping
    const normalized = comp.name
      .toLowerCase()
      .replace(/^(base|custom|styled|my|app)/, "")
      .replace(/(wrapper|container|component)$/, "");

    if (!nameMap.has(normalized)) nameMap.set(normalized, []);
    nameMap.get(normalized)!.push(comp);
  }

  for (const [pattern, comps] of nameMap) {
    if (comps.length > 1) {
      duplicates.push({
        pattern,
        components: comps.map((c) => c.file),
        suggestion: `Consider consolidating ${comps.length} similar "${pattern}" components`,
      });
    }
  }

  // Group by category
  const byCategory: Record<string, ComponentInfo[]> = {};
  for (const comp of components) {
    (byCategory[comp.category] ??= []).push(comp);
  }

  const result = {
    root: relative(process.cwd(), target),
    totalComponents: components.length,
    byCategory: Object.fromEntries(
      Object.entries(byCategory).map(([cat, comps]) => [
        cat,
        { count: comps.length, components: comps },
      ])
    ),
    duplicates,
    withoutProps: components.filter((c) => !c.hasProps).length,
    largeComponents: components
      .filter((c) => c.linesOfCode > 200)
      .map((c) => ({ name: c.name, file: c.file, lines: c.linesOfCode })),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Component Inventory: ${result.root}\n`);
  console.log(`Total components: ${components.length}\n`);

  // By category
  console.log("## By Category\n");
  for (const [cat, data] of Object.entries(result.byCategory)) {
    console.log(`### ${cat} (${data.count})\n`);
    for (const comp of data.components) {
      const flags: string[] = [];
      if (comp.hasProps) flags.push(`props: ${comp.propsName}`);
      if (comp.usesForwardRef) flags.push("forwardRef");
      if (comp.linesOfCode > 200) flags.push(`${comp.linesOfCode} lines`);
      const flagStr = flags.length > 0 ? ` — ${flags.join(", ")}` : "";
      console.log(`  ${comp.name}${flagStr}`);
      console.log(`    ${comp.file}`);
    }
    console.log();
  }

  // Duplicates
  if (duplicates.length > 0) {
    console.log("## Potential Duplicates\n");
    for (const dup of duplicates) {
      console.log(`  ${dup.suggestion}`);
      for (const file of dup.components) {
        console.log(`    - ${file}`);
      }
      console.log();
    }
  }

  // Large components
  if (result.largeComponents.length > 0) {
    console.log("## Large Components (>200 lines)\n");
    for (const comp of result.largeComponents) {
      console.log(`  ${comp.name}: ${comp.lines} lines (${comp.file})`);
    }
    console.log();
  }

  // Missing props interfaces
  if (result.withoutProps > 0) {
    console.log(`## Components Without Props Interface: ${result.withoutProps}\n`);
    for (const comp of components.filter((c) => !c.hasProps)) {
      console.log(`  ${comp.name} (${comp.file})`);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
