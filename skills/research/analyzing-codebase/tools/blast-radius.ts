const args = Bun.argv.slice(2);

const HELP = `
blast-radius — Trace imports to find all files affected by a change

Usage:
  bun run tools/blast-radius.ts <file> [options]

Options:
  --root <dir>   Project root directory (default: cwd)
  --json         Output as JSON instead of plain text
  --help         Show this help message

Given a file path, traces the reverse import graph to find all files
that transitively depend on it. Groups results by depth (direct importers,
indirect consumers, entry points reached).
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

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve, dirname, extname } from "node:path";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]);
const IMPORT_RE = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const ENTRY_PATTERNS = [
  /^(?:index|main|server|app|cli|worker)\./,
  /\.routes?\./,
  /^route\./,
];

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".next", ".output"].includes(entry.name)) continue;
      files.push(...(await collectFiles(full)));
    } else if (EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  for (const re of [IMPORT_RE, REQUIRE_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(content)) !== null) {
      if (match[1].startsWith(".")) imports.push(match[1]);
    }
  }
  return imports;
}

async function resolveImport(
  spec: string,
  fromFile: string,
  fileSet: Set<string>
): Promise<string | null> {
  const dir = dirname(fromFile);
  const base = resolve(dir, spec);
  for (const ext of ["", ...EXTENSIONS]) {
    if (fileSet.has(base + ext)) return base + ext;
  }
  for (const ext of EXTENSIONS) {
    const idx = join(base, `index${ext}`);
    if (fileSet.has(idx)) return idx;
  }
  return null;
}

function isEntryPoint(filePath: string): boolean {
  const name = filePath.split("/").pop() ?? "";
  return ENTRY_PATTERNS.some((p) => p.test(name));
}

async function main() {
  const targetFile = resolve(filteredArgs[0]);
  const s = await stat(targetFile).catch(() => null);
  if (!s?.isFile()) {
    console.error(`Error: "${filteredArgs[0]}" is not a file`);
    process.exit(1);
  }

  const root = resolve(rootDir);
  const files = await collectFiles(root);
  const fileSet = new Set(files);

  // Build reverse graph: file -> files that import it
  const reverseGraph = new Map<string, Set<string>>();
  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const imports = extractImports(content);
    for (const imp of imports) {
      const resolved = await resolveImport(imp, file, fileSet);
      if (resolved) {
        if (!reverseGraph.has(resolved)) reverseGraph.set(resolved, new Set());
        reverseGraph.get(resolved)!.add(file);
      }
    }
  }

  // BFS from target file through reverse graph
  const visited = new Set<string>();
  const layers: Map<string, number> = new Map(); // file -> depth
  const queue: { file: string; depth: number }[] = [{ file: targetFile, depth: 0 }];
  visited.add(targetFile);

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;
    const importers = reverseGraph.get(file);
    if (!importers) continue;
    for (const imp of importers) {
      if (!visited.has(imp)) {
        visited.add(imp);
        layers.set(imp, depth + 1);
        queue.push({ file: imp, depth: depth + 1 });
      }
    }
  }

  // Classify
  const directImporters = [...layers.entries()]
    .filter(([, d]) => d === 1)
    .map(([f]) => relative(root, f));
  const indirectConsumers = [...layers.entries()]
    .filter(([, d]) => d > 1)
    .map(([f]) => relative(root, f));
  const entryPointsReached = [...layers.keys()]
    .filter((f) => isEntryPoint(f))
    .map((f) => relative(root, f));

  const totalAffected = layers.size;
  let classification: string;
  if (totalAffected <= 5 && entryPointsReached.length === 0) {
    classification = "narrow";
  } else if (totalAffected <= 20) {
    classification = "medium";
  } else {
    classification = "wide";
  }

  const result = {
    target: relative(root, targetFile),
    totalAffected,
    classification,
    directImporters,
    indirectConsumers,
    entryPointsReached,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Human-readable
  console.log(`# Blast Radius: ${result.target}\n`);
  console.log(`Total files affected: ${totalAffected}`);
  console.log(`Classification: ${classification.toUpperCase()}\n`);

  if (directImporters.length > 0) {
    console.log(`## Direct Importers (${directImporters.length})\n`);
    for (const f of directImporters) console.log(`  ${f}`);
  }

  if (indirectConsumers.length > 0) {
    console.log(`\n## Indirect Consumers (${indirectConsumers.length})\n`);
    for (const f of indirectConsumers) console.log(`  ${f}`);
  }

  if (entryPointsReached.length > 0) {
    console.log(`\n## Entry Points Reached (${entryPointsReached.length})\n`);
    for (const f of entryPointsReached) console.log(`  ${f}`);
  }

  if (totalAffected === 0) {
    console.log("No other files import this file.");
  }

  // Risk guidance
  console.log("\n## Risk Guidance\n");
  switch (classification) {
    case "narrow":
      console.log("  Low risk — few files affected, no entry points. Proceed with care.");
      break;
    case "medium":
      console.log("  Medium risk — test all affected paths before merging.");
      break;
    case "wide":
      console.log("  High risk — consider incremental rollout. Many files depend on this module.");
      break;
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
