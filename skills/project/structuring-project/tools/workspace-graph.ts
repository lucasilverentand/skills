const args = Bun.argv.slice(2);

const HELP = `
workspace-graph — Display bun workspace dependency graph as a tree

Usage:
  bun run tools/workspace-graph.ts [path] [options]

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

interface PackageNode {
  name: string;
  path: string;
  dependsOn: string[];
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

  const packages = new Map<string, PackageNode>();

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkgFile = Bun.file(match);
      if (!(await pkgFile.exists())) continue;

      const pkg = await pkgFile.json();
      if (!pkg.name) continue;

      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const allDeps = Object.keys({
        ...pkg.dependencies,
        ...pkg.devDependencies,
      });

      packages.set(pkg.name, {
        name: pkg.name,
        path: relPath,
        dependsOn: allDeps,
      });
    }
  }

  // Filter to only internal deps
  const pkgNames = new Set(packages.keys());
  for (const [, node] of packages) {
    node.dependsOn = node.dependsOn.filter((d) => pkgNames.has(d));
  }

  // Find roots (packages not depended on by others)
  const depTargets = new Set<string>();
  for (const [, node] of packages) {
    for (const dep of node.dependsOn) {
      depTargets.add(dep);
    }
  }
  const roots = [...packages.keys()].filter((n) => !depTargets.has(n));

  if (jsonOutput) {
    const graph: Record<string, string[]> = {};
    for (const [name, node] of packages) {
      graph[name] = node.dependsOn;
    }
    console.log(JSON.stringify({ roots, graph }, null, 2));
  } else {
    if (packages.size === 0) {
      console.log("No workspace packages found.");
      return;
    }

    console.log(`Workspace dependency tree (${packages.size} packages):\n`);

    const printed = new Set<string>();

    function printTree(name: string, prefix: string, isLast: boolean): void {
      const connector = isLast ? "└── " : "├── ";
      const node = packages.get(name);
      const suffix = printed.has(name) ? " (circular ref)" : "";
      console.log(`${prefix}${connector}${name}${suffix}`);

      if (printed.has(name) || !node) return;
      printed.add(name);

      const deps = node.dependsOn;
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      for (let i = 0; i < deps.length; i++) {
        printTree(deps[i], childPrefix, i === deps.length - 1);
      }
    }

    if (roots.length === 0) {
      // All packages depend on each other somehow — just list them
      for (const [name] of packages) {
        printTree(name, "", true);
      }
    } else {
      for (let i = 0; i < roots.length; i++) {
        printTree(roots[i], "", i === roots.length - 1);
      }

      // Print orphans (leaf packages not in tree)
      const unprinted = [...packages.keys()].filter((n) => !printed.has(n));
      if (unprinted.length > 0) {
        console.log("\nStandalone packages (no dependents):");
        for (const name of unprinted) {
          console.log(`  ${name}`);
        }
      }
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
