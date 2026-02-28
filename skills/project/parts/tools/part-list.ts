const args = Bun.argv.slice(2);

const HELP = `
part-list — List all workspace packages with their type and dependencies

Usage:
  bun run tools/part-list.ts [path] [options]

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

interface PartInfo {
  name: string;
  path: string;
  version: string;
  dependencies: string[];
  devDependencies: string[];
  type: string;
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

  const parts: PartInfo[] = [];

  for (const pattern of workspaceGlobs) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const match of glob.scan({ cwd: root, absolute: true })) {
      const pkgFile = Bun.file(match);
      if (!(await pkgFile.exists())) continue;

      const pkg = await pkgFile.json();
      const dir = match.replace("/package.json", "");
      const relPath = dir.replace(root + "/", "");

      const internalDeps = Object.keys(pkg.dependencies || {}).filter((d) =>
        d.startsWith("@")
      );
      const internalDevDeps = Object.keys(pkg.devDependencies || {}).filter(
        (d) => d.startsWith("@")
      );

      let type = "library";
      if (pkg.scripts?.dev?.includes("astro")) type = "astro-site";
      else if (pkg.scripts?.dev?.includes("expo")) type = "expo-app";
      else if (pkg.scripts?.dev?.includes("--hot") || pkg.scripts?.start?.includes("src/index.ts"))
        type = "api-service";
      else if (relPath.startsWith("apps/")) type = "app";

      parts.push({
        name: pkg.name || relPath,
        path: relPath,
        version: pkg.version || "0.0.0",
        dependencies: internalDeps,
        devDependencies: internalDevDeps,
        type,
      });
    }
  }

  parts.sort((a, b) => a.name.localeCompare(b.name));

  if (jsonOutput) {
    console.log(JSON.stringify(parts, null, 2));
  } else {
    if (parts.length === 0) {
      console.log("No workspace packages found.");
      return;
    }

    console.log(`Found ${parts.length} workspace package(s):\n`);
    for (const part of parts) {
      console.log(`  ${part.name} (${part.type})`);
      console.log(`    path: ${part.path}`);
      if (part.dependencies.length > 0) {
        console.log(`    deps: ${part.dependencies.join(", ")}`);
      }
      if (part.devDependencies.length > 0) {
        console.log(`    devDeps: ${part.devDependencies.join(", ")}`);
      }
      console.log();
    }
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
