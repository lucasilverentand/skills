const args = Bun.argv.slice(2);

const HELP = `
dep-graph — Generate a dependency graph and detect circular references

Usage:
  bun run tools/dep-graph.ts <path> [options]

Options:
  --focus <module>   Only show dependencies involving this module
  --json             Output as JSON instead of plain text
  --help             Show this help message

Scans source files to build an import dependency graph. Detects and reports
circular dependencies. Outputs the graph as a list of edges that can be
visualized with Mermaid or Graphviz.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const focusIdx = args.indexOf("--focus");
const focusModule = focusIdx !== -1 ? args[focusIdx + 1] : null;
const filteredArgs = args.filter(
  (a, i) => !a.startsWith("--") && (focusIdx === -1 || i !== focusIdx + 1)
);

interface Edge {
  from: string;
  to: string;
}

interface Cycle {
  path: string[];
}

async function extractImports(filePath: string): Promise<string[]> {
  const content = await Bun.file(filePath).text();
  const imports: string[] = [];

  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(
  importPath: string,
  sourceFile: string,
  allFiles: Set<string>
): string | null {
  if (!importPath.startsWith(".")) return null;

  const { resolve, dirname } = require("node:path") as typeof import("node:path");
  const dir = dirname(sourceFile);
  const extensions = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"];

  const exact = resolve(dir, importPath);
  if (allFiles.has(exact)) return exact;

  for (const ext of extensions) {
    const withExt = resolve(dir, importPath + ext);
    if (allFiles.has(withExt)) return withExt;
  }

  return null;
}

function findCycles(adjacency: Map<string, Set<string>>): Cycle[] {
  const cycles: Cycle[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string) {
    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adjacency.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (inStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = stack.indexOf(neighbor);
        const cyclePath = stack.slice(cycleStart);
        cyclePath.push(neighbor); // Close the cycle
        cycles.push({ path: cyclePath });
      } else if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

async function collectFiles(target: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx,mts,mjs}");
  const files: string[] = [];
  for await (const path of glob.scan({ cwd: target, absolute: true })) {
    if (path.includes("node_modules")) continue;
    files.push(path);
  }
  return files;
}

async function main() {
  const target = filteredArgs[0];
  if (!target) {
    console.error("Error: missing required path argument");
    process.exit(1);
  }

  const { resolve, relative } = await import("node:path");
  const resolvedTarget = resolve(target);

  const files = await collectFiles(resolvedTarget);
  if (files.length === 0) {
    console.error("No source files found at the specified path");
    process.exit(1);
  }

  const fileSet = new Set(files);
  const edges: Edge[] = [];
  const adjacency = new Map<string, Set<string>>();

  for (const file of files) {
    const relFile = relative(resolvedTarget, file);
    if (!adjacency.has(relFile)) adjacency.set(relFile, new Set());

    const rawImports = await extractImports(file);
    for (const importPath of rawImports) {
      const resolved = resolveImport(importPath, file, fileSet);
      if (resolved && resolved !== file) {
        const relResolved = relative(resolvedTarget, resolved);
        adjacency.get(relFile)!.add(relResolved);
        edges.push({ from: relFile, to: relResolved });
      }
    }
  }

  // Filter by focus module if specified
  let filteredEdges = edges;
  if (focusModule) {
    filteredEdges = edges.filter(
      (e) => e.from.includes(focusModule) || e.to.includes(focusModule)
    );
  }

  // Detect cycles
  const cycles = findCycles(adjacency);

  // Generate Mermaid diagram
  const mermaidLines = ["graph TD"];
  const nodes = new Set<string>();
  for (const edge of filteredEdges) {
    const fromId = edge.from.replace(/[/.\-@]/g, "_");
    const toId = edge.to.replace(/[/.\-@]/g, "_");
    nodes.add(fromId);
    nodes.add(toId);
    mermaidLines.push(`  ${fromId}["${edge.from}"] --> ${toId}["${edge.to}"]`);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          modules: files.length,
          edges: filteredEdges.length,
          cycles: cycles.length,
          cycleDetails: cycles.map((c) => c.path),
          graph: filteredEdges,
          mermaid: mermaidLines.join("\n"),
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `Dependency Graph: ${files.length} modules, ${filteredEdges.length} edges, ${cycles.length} cycles\n`
    );

    if (cycles.length > 0) {
      console.log("CIRCULAR DEPENDENCIES:\n");
      for (const cycle of cycles) {
        console.log(`  ${cycle.path.join(" -> ")}\n`);
      }
    }

    if (filteredEdges.length > 0) {
      console.log("Edges:\n");
      for (const edge of filteredEdges) {
        console.log(`  ${edge.from} -> ${edge.to}`);
      }
    }

    if (filteredEdges.length > 0) {
      console.log("\nMermaid diagram (paste into a Mermaid renderer):\n");
      console.log("```mermaid");
      for (const line of mermaidLines) {
        console.log(line);
      }
      console.log("```");
    }
  }

  if (cycles.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
