const args = Bun.argv.slice(2);

const HELP = `
circular-check — Detect circular type dependencies between workspace packages

Usage:
  bun run tools/circular-check.ts [path] [options]

Arguments:
  path    Path to monorepo root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message

Builds a dependency graph from package.json files and source imports,
then checks for cycles.
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface CycleResult {
  hasCycles: boolean;
  cycles: string[][];
  graph: Record<string, string[]>;
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const rootPkgFile = Bun.file(`${root}/package.json`);

  if (!(await rootPkgFile.exists())) {
    console.error("Error: no package.json found");
    process.exit(1);
  }

  const rootPkg = await rootPkgFile.json();
  const workspaceGlobs: string[] = rootPkg.workspaces || [];

  // Collect packages and their dependencies
  const packages = new Map<string, { path: string; deps: Set<string> }>();

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkg = await Bun.file(match).json();
      if (!pkg.name) continue;

      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const declaredDeps = new Set([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ]);

      packages.set(pkg.name, { path: relPath, deps: declaredDeps });
    }
  }

  // Also scan source files for direct imports between packages
  const pkgNames = new Set(packages.keys());

  for (const [name, info] of packages) {
    const srcGlob = new Bun.Glob("src/**/*.{ts,tsx}");
    try {
      for await (const file of srcGlob.scan({ cwd: `${root}/${info.path}` })) {
        const content = await Bun.file(`${root}/${info.path}/${file}`).text();

        for (const pkgName of pkgNames) {
          if (pkgName === name) continue;
          if (
            content.includes(`from "${pkgName}"`) ||
            content.includes(`from '${pkgName}'`) ||
            content.includes(`from "${pkgName}/`) ||
            content.includes(`from '${pkgName}/`)
          ) {
            info.deps.add(pkgName);
          }
        }
      }
    } catch {
      // Directory might not have src/
    }
  }

  // Build dependency graph (internal only)
  const graph: Record<string, string[]> = {};
  for (const [name, info] of packages) {
    graph[name] = [...info.deps].filter((d) => pkgNames.has(d));
  }

  // Detect cycles using DFS
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    for (const dep of graph[node] || []) {
      dfs(dep, [...path, node]);
    }

    recursionStack.delete(node);
  }

  for (const name of Object.keys(graph)) {
    visited.clear();
    recursionStack.clear();
    dfs(name, []);
  }

  // Deduplicate cycles (same cycle can be found from different starting points)
  const uniqueCycles: string[][] = [];
  const seenCycleKeys = new Set<string>();

  for (const cycle of cycles) {
    const normalized = [...cycle.slice(0, -1)].sort().join(",");
    if (!seenCycleKeys.has(normalized)) {
      seenCycleKeys.add(normalized);
      uniqueCycles.push(cycle);
    }
  }

  const result: CycleResult = {
    hasCycles: uniqueCycles.length > 0,
    cycles: uniqueCycles,
    graph,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Checked ${Object.keys(graph).length} packages for circular dependencies.\n`);

    if (uniqueCycles.length === 0) {
      console.log("No circular dependencies found.");
    } else {
      console.log(`CIRCULAR DEPENDENCIES DETECTED (${uniqueCycles.length}):\n`);
      for (const cycle of uniqueCycles) {
        console.log(`  ${cycle.join(" -> ")}`);
      }
      console.log("\nFix: restructure imports to break the cycle.");
      console.log("The @<project>/types package should never import from other project packages.");
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
