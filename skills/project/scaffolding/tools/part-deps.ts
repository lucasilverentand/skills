const args = Bun.argv.slice(2);

const HELP = `
part-deps — Show internal dependency graph between workspace packages

Usage:
  bun run tools/part-deps.ts [path] [options]

Arguments:
  path    Path to monorepo root (default: current directory)

Options:
  --json    Output as JSON instead of plain text
  --help    Show this help message
`.trim();

if (args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const jsonOutput = args.includes("--json");
const filteredArgs = args.filter((a) => !a.startsWith("--"));

interface DepGraph {
  [packageName: string]: {
    path: string;
    dependsOn: string[];
    dependedOnBy: string[];
  };
}

async function main() {
  const root = filteredArgs[0] || process.cwd();
  const rootPkgPath = `${root}/package.json`;

  const rootPkgFile = Bun.file(rootPkgPath);
  if (!(await rootPkgFile.exists())) {
    console.error(`Error: no package.json found at ${rootPkgPath}`);
    process.exit(1);
  }

  const rootPkg = await rootPkgFile.json();
  const workspaceGlobs: string[] = rootPkg.workspaces || [];

  if (workspaceGlobs.length === 0) {
    console.error("Error: no workspaces defined in package.json");
    process.exit(1);
  }

  // Collect all workspace package names
  const packages = new Map<string, { path: string; deps: string[] }>();

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkgFile = Bun.file(match);
      if (!(await pkgFile.exists())) continue;

      const pkg = await pkgFile.json();
      if (!pkg.name) continue;

      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      packages.set(pkg.name, { path: relPath, deps: Object.keys(allDeps) });
    }
  }

  // Build the dependency graph (only internal deps)
  const packageNames = new Set(packages.keys());
  const graph: DepGraph = {};

  for (const [name, info] of packages) {
    const internalDeps = info.deps.filter((d) => packageNames.has(d));
    graph[name] = {
      path: info.path,
      dependsOn: internalDeps,
      dependedOnBy: [],
    };
  }

  // Fill reverse dependencies
  for (const [name, info] of Object.entries(graph)) {
    for (const dep of info.dependsOn) {
      if (graph[dep]) {
        graph[dep].dependedOnBy.push(name);
      }
    }
  }

  // Detect circular dependencies
  const circulars: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      circulars.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);
    path.push(node);

    for (const dep of graph[node]?.dependsOn || []) {
      dfs(dep, [...path]);
    }

    stack.delete(node);
  }

  for (const name of Object.keys(graph)) {
    dfs(name, []);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ graph, circulars }, null, 2));
  } else {
    const sorted = Object.entries(graph).sort(([a], [b]) => a.localeCompare(b));

    if (sorted.length === 0) {
      console.log("No workspace packages found.");
      return;
    }

    console.log(`Dependency graph (${sorted.length} packages):\n`);

    // Find leaf packages (no internal deps)
    const leaves = sorted.filter(([, v]) => v.dependsOn.length === 0);
    const nonLeaves = sorted.filter(([, v]) => v.dependsOn.length > 0);

    if (leaves.length > 0) {
      console.log("Leaf packages (no internal dependencies):");
      for (const [name, info] of leaves) {
        const usedBy =
          info.dependedOnBy.length > 0
            ? ` <- ${info.dependedOnBy.join(", ")}`
            : "";
        console.log(`  ${name}${usedBy}`);
      }
      console.log();
    }

    if (nonLeaves.length > 0) {
      console.log("Packages with internal dependencies:");
      for (const [name, info] of nonLeaves) {
        console.log(`  ${name}`);
        console.log(`    -> ${info.dependsOn.join(", ")}`);
        if (info.dependedOnBy.length > 0) {
          console.log(`    <- ${info.dependedOnBy.join(", ")}`);
        }
      }
      console.log();
    }

    if (circulars.length > 0) {
      console.log("CIRCULAR DEPENDENCIES DETECTED:");
      for (const cycle of circulars) {
        console.log(`  ${cycle.join(" -> ")}`);
      }
      process.exit(1);
    } else {
      console.log("No circular dependencies detected.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
