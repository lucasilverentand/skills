const args = Bun.argv.slice(2);

const HELP = `
dependency-graph — Generate a dependency graph of internal modules

Usage:
  bun run tools/dependency-graph.ts <directory> [options]

Options:
  --depth <n>    Max depth to traverse (default: unlimited)
  --format mermaid  Output as Mermaid diagram (default: list)
  --json         Output as JSON instead of plain text
  --help         Show this help message

Scans TypeScript/JavaScript files in the given directory, parses import
statements, and builds a graph of internal module dependencies.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const mermaidOutput = args.includes("mermaid");

let maxDepth = Infinity;
const depthIdx = args.indexOf("--depth");
if (depthIdx !== -1 && args[depthIdx + 1]) {
  maxDepth = parseInt(args[depthIdx + 1], 10);
}

const filteredArgs = args.filter(
  (a, i) =>
    !a.startsWith("--") &&
    a !== "mermaid" &&
    (depthIdx === -1 || (i !== depthIdx && i !== depthIdx + 1))
);

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve, dirname, extname } from "node:path";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);
const IMPORT_RE = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

interface Graph {
  [file: string]: string[];
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".next") {
        continue;
      }
      files.push(...(await collectFiles(full)));
    } else if (EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  for (const re of [IMPORT_RE, REQUIRE_RE, DYNAMIC_IMPORT_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  return imports;
}

function isRelativeImport(spec: string): boolean {
  return spec.startsWith("./") || spec.startsWith("../");
}

async function resolveImport(
  spec: string,
  fromFile: string,
  allFiles: Set<string>
): Promise<string | null> {
  if (!isRelativeImport(spec)) return null;

  const dir = dirname(fromFile);
  const base = resolve(dir, spec);

  // Try exact match, then with extensions, then /index
  for (const ext of ["", ...EXTENSIONS]) {
    const candidate = base + ext;
    if (allFiles.has(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = join(base, `index${ext}`);
    if (allFiles.has(candidate)) return candidate;
  }
  return null;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required directory argument");
    process.exit(1);
  }

  const rootDir = resolve(target);
  const s = await stat(rootDir).catch(() => null);
  if (!s?.isDirectory()) {
    console.error(`Error: "${target}" is not a directory`);
    process.exit(1);
  }

  const files = await collectFiles(rootDir);
  const fileSet = new Set(files);
  const graph: Graph = {};
  const reverseGraph: Graph = {};

  for (const file of files) {
    const rel = relative(rootDir, file);
    graph[rel] = [];
    if (!reverseGraph[rel]) reverseGraph[rel] = [];
  }

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const imports = extractImports(content);
    const rel = relative(rootDir, file);

    for (const imp of imports) {
      const resolved = await resolveImport(imp, file, fileSet);
      if (resolved) {
        const resolvedRel = relative(rootDir, resolved);
        if (!graph[rel].includes(resolvedRel)) {
          graph[rel].push(resolvedRel);
        }
        if (!reverseGraph[resolvedRel]) reverseGraph[resolvedRel] = [];
        if (!reverseGraph[resolvedRel].includes(rel)) {
          reverseGraph[resolvedRel].push(rel);
        }
      }
    }
  }

  // Detect cycles
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]) {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const dep of graph[node] ?? []) {
      dfs(dep, [...path, dep]);
    }
    stack.delete(node);
  }

  for (const file of Object.keys(graph)) {
    dfs(file, [file]);
  }

  // Find highly connected modules (most importers)
  const importerCounts = Object.entries(reverseGraph)
    .map(([file, importers]) => ({ file, importers: importers.length }))
    .filter((e) => e.importers > 0)
    .sort((a, b) => b.importers - a.importers);

  const result = {
    root: rootDir,
    totalFiles: files.length,
    graph,
    reverseGraph,
    cycles,
    hotspots: importerCounts.slice(0, 10),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mermaidOutput) {
    console.log("```mermaid");
    console.log("graph TD");
    for (const [file, deps] of Object.entries(graph)) {
      const fromId = file.replace(/[/.]/g, "_");
      for (const dep of deps) {
        const toId = dep.replace(/[/.]/g, "_");
        console.log(`  ${fromId}["${file}"] --> ${toId}["${dep}"]`);
      }
    }
    console.log("```");
    return;
  }

  // Human-readable
  console.log(`# Dependency Graph: ${rootDir}\n`);
  console.log(`Total files scanned: ${files.length}\n`);

  if (importerCounts.length > 0) {
    console.log("## Most-Imported Modules (hotspots)\n");
    for (const { file, importers } of importerCounts.slice(0, 10)) {
      console.log(`  ${file} — ${importers} importer(s)`);
    }
  }

  if (cycles.length > 0) {
    console.log(`\n## Circular Dependencies (${cycles.length} found)\n`);
    for (const cycle of cycles.slice(0, 10)) {
      console.log(`  ${cycle.join(" -> ")} -> ${cycle[0]}`);
    }
    if (cycles.length > 10) {
      console.log(`  ... and ${cycles.length - 10} more`);
    }
  } else {
    console.log("\n## Circular Dependencies\n\n  None found.");
  }

  console.log("\n## Full Graph\n");
  for (const [file, deps] of Object.entries(graph)) {
    if (deps.length > 0) {
      console.log(`  ${file}`);
      for (const dep of deps) {
        console.log(`    -> ${dep}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
