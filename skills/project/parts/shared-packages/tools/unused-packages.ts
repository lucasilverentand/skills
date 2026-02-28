const args = Bun.argv.slice(2);

const HELP = `
unused-packages — Detect workspace packages not imported by any app or other package

Usage:
  bun run tools/unused-packages.ts [path] [options]

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

interface PackageUsage {
  name: string;
  path: string;
  usedBy: string[];
  unused: boolean;
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

  // Collect all workspace packages
  const packages = new Map<string, { path: string; deps: Set<string> }>();

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkg = await Bun.file(match).json();
      if (!pkg.name) continue;

      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const allDeps = new Set([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ]);

      packages.set(pkg.name, { path: relPath, deps: allDeps });
    }
  }

  // Find which packages are used by which other packages
  const pkgNames = new Set(packages.keys());
  const results: PackageUsage[] = [];

  for (const [name, info] of packages) {
    const usedBy: string[] = [];

    for (const [otherName, otherInfo] of packages) {
      if (otherName === name) continue;
      if (otherInfo.deps.has(name)) {
        usedBy.push(otherName);
      }
    }

    // Also check source imports (for packages that might be imported directly)
    if (usedBy.length === 0) {
      for (const [otherName, otherInfo] of packages) {
        if (otherName === name) continue;
        const srcGlob = new Bun.Glob("src/**/*.{ts,tsx,js,jsx}");
        let found = false;
        for await (const file of srcGlob.scan({ cwd: `${root}/${otherInfo.path}` })) {
          const content = await Bun.file(`${root}/${otherInfo.path}/${file}`).text();
          if (content.includes(`from "${name}"`) || content.includes(`from '${name}'`)) {
            usedBy.push(otherName);
            found = true;
            break;
          }
        }
        if (found) break; // One usage is enough to mark as used
      }
    }

    results.push({
      name,
      path: info.path,
      usedBy,
      unused: usedBy.length === 0,
    });
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  const unused = results.filter((r) => r.unused);

  if (jsonOutput) {
    console.log(JSON.stringify({ packages: results, unused: unused.map((u) => u.name) }, null, 2));
  } else {
    console.log(`Workspace packages (${results.length}):\n`);

    for (const r of results) {
      const icon = r.unused ? "!" : "+";
      console.log(`  [${icon}] ${r.name}`);
      if (r.usedBy.length > 0) {
        console.log(`      used by: ${r.usedBy.join(", ")}`);
      } else {
        console.log(`      NOT used by any other package`);
      }
    }

    if (unused.length > 0) {
      console.log(`\n${unused.length} unused package(s) detected.`);
      console.log("These packages may be safe to remove or may be entry points (apps).");
    } else {
      console.log("\nAll packages are used by at least one other package.");
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
